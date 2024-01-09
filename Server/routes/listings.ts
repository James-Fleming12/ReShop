import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const prisma = new PrismaClient();

interface FileRequest extends Request { 
    files: any; // solely for typescript linting
}

const express = require('express');
const router = express.Router();
router.use(express.json());

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const s3Config = {
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS!,
        secretAccessKey: process.env.AWS_SECRET!,
    }
};
const client = new S3Client(s3Config);

const allowed_files = ['image/png', 'image/jpeg', 'image/jpg']; // check these later

const validateListingInfo = (title: string, bio: string, value: number): string =>{
    if (!title) return "Invalid Title";
    if (!bio) return "Invalid Bio";
    if (!value) return "Invalid Value";
    if (title.length < 5) return "Title Too Short";
    if (bio.length < 3) return "Bio Too Short";
    if (title.length > 50) return "Title Too Long";
    if (bio.length > 150) return "Bio Too Long";
    return "Success";
}

// sends back the 10 most recent made posts
router.get('/search', async (req: Request, res: Response) => {
    const posts = await prisma.post.findMany({
        orderBy: {
            created: "desc"
        },
        take: 10,
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    if (!posts) return res.status(404).json({ message: "Database Server Error" });
    for (let post of posts){
        const urls = post.pictures;
        if (!urls || urls.length < 1) return res.status(409).json({ message: "Invalid Picture Information for Listing" });
        const presigned = await getSignedUrl(client, new GetObjectCommand({ 
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: urls[0],
        }), { expiresIn: 2000 }).catch((e) => {
            console.log("AWS Server Error: ", e);
            return null;
        });
        if (!presigned) return res.status(404).json({ message: "AWS Server Error" });
        post.pictures = [presigned]; // has to be an array cause of typing
    }
    return res.status(200).json({ listings: posts });
});

router.post('/search', async (req: Request, res: Response) => {
    const data = await req.body;
    let serverErr: boolean = false;
    if (!data) return res.status(409).json({ message: "Invalid Request" });
    const skips = data.skip ? parseInt(data.skip) : 0;
    const takes = data.take ? parseInt(data.take) : 10;
    const posts = await prisma.post.findMany({
        where: {
            title: {
                contains: data.search && data.search.length > 1 ? data.search : undefined,
                mode: "insensitive",
            },
            value: {
                gte: data.minval ? parseInt(data.minval) : undefined,
                lte: data.maxval ? parseInt(data.maxval) : undefined,
            },
            created: {
                gt: (data.querDate as Date) // might not work properly as intended
            }
        },
        orderBy: {
            created: "desc"
        },
        take: takes,
        skip: skips,
    }).catch(() => {
        serverErr = true;
        return null;
    });
    if (!posts){
        if(serverErr){
            return res.status(404).json({ message: "Server Error" });
        }else{
            return res.status(409).json({ message: "No Listings Match" });
        }
    }    for (let post of posts){
        const urls = post.pictures;
        if (!urls || urls.length < 1) return res.status(409).json({ message: "Invalid Picture Information for Listing" });
        const presigned = await getSignedUrl(client, new GetObjectCommand({ 
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: urls[0],
        }), { expiresIn: 2000 }).catch((e) => {
            console.log("AWS Server Error: ", e);
            return null;
        });
        if (!presigned) return res.status(404).json({ message: "AWS Server Error" });
        post.pictures = [presigned]; // has to be an array cause of typing
    }
    return res.status(200).json({ listings: posts });
});

// might be better to delete the post first, then the AWS images (less chance for bugs from no images)
router.post('/edit/:id', async (req: Request, res: Response) => {
    const postId = req.params.id;
    const post = await prisma.post.findUnique({
        where: {
            postId: postId,
        }
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    if (!post) return res.status(409).json({ message: "Invalid Post ID" });
    const data = await req.body; // username, token, and the changes that need to be made (title, bio, value)
    if (!data) return res.status(409).json({ message: "Invalid Request" });
    const username = data.username;
    const token = data.token;
    if (post.madeBy !== username) return res.status(409).json({ message: "Invalid Credentials" });
    const checking = validateListingInfo(data.title ?? post.title, data.bio ?? post.bio, data.value ?? post.value);
    if (checking !== "Success") return res.status(409).json({ message: checking });
    const user = await prisma.user.findUnique({
        where: {
            username: post.madeBy,
        }
    }).catch((e) => {
        console.log(e);
        return null;
    });
    if (!user) return res.status(409).json({ message: "Invalid User" });
    if (jwt.decode(token, process.env.JWT_SECRET) !== user.tokenc) return res.status(409).json({ message: "Invalid Credentials"});
    const files = (req as FileRequest).files;
    let newurl: string[] = []
    // resetting the uploaded pictures
    if (files && [].concat(files).length > 0) {
        const fileKeys = Object.keys(files);
        fileKeys.forEach((key) => {
            const file = files[key];
            if (!allowed_files.includes(file.mimetype)) return res.status(409).json({ message: "Invalid File Type" });
            if (file.size > 2000000) return res.status(409).json({ message: `${file.name} is Too Large` });
        });
        for (let key of post.pictures){
            const delRes = await client.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
            })).catch((e) => {
                console.log(`AWS Server Error: ${e}`);
                return null;
            });
            if (!delRes) return res.status(404).json({ message: "Invalid AWS Response" });
        }
        const uploadFile = async(key: string, file: any) => {
            const generated = username + "-" + key + "-" + Date.now().toString();
            // there has to be a better way to do this, this just shouldn't work
            const response = await client.send(new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: generated,
                Body: file.data,
            })).catch((e) => {
                console.log(`AWS Server Error: ${e}`);
                return null;
            });
            if (!response) return res.status(404).json({ message: "AWS Server Error" });
            newurl.push(generated);
        };
        await Promise.all(fileKeys.map((key) => uploadFile(key, files[key]))).catch(() => null);
        if (newurl.length < 1) return res.status(409).json({ message: "Invalid File Map" });
    }
    const data2 = { 
        title: data.title ?? post.title,
        bio: data.bio ?? post.bio,
        value: data.value ?? post.value,
        pictures: newurl.length > 0 ? newurl : post.pictures,
    }
    // might be a better way to do this
    const updated = await prisma.post.update({
        where: {
            postId: postId,
        },
        data: { // check if making these undefined applies the changes or not
            title: data.title ? data.title : post.title,
            bio: data.bio ? data.bio : post.bio,
            value: data.value ? parseInt(data.value) : post.value,
            pictures: newurl.length > 0 ? newurl : post.pictures,
        }
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    if (!updated) return res.status(404).json({ message: "Database Server Error" });
    return res.status(200).json({ message: "Listing Information Updated" });
});

// again might be better to delete the post first, then the AWS images (less chance for bugs from no images)
router.post('/delete/:id', async (req: Request, res: Response) => {
    const postId = req.params.id;
    const post = await prisma.post.findUnique({
        where: {
            postId: postId,
        }
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    const { username, token, postname } = req.body;
    if (!post) return res.status(404).json({ message: "Database Server Error" });
    if (post.title !== postname) return res.status(409).json({ message: "Listing Name Don't Match" });
    if (!username || !token || username !== post.madeBy) return res.status(409).json({ message: "Invalid Credentials" });
    const user = await prisma.user.findUnique({
        where: {
            username: post.madeBy,
        }
    }).catch(() => null);
    if (!user) return res.status(404).json({ message: "Server Error" });
    if (jwt.decode(token, process.env.JWT_SECRET) !== user.tokenc) return res.status(409).json({ message: "Invalid Credentials"});
    for (let key of post.pictures){
        const delRes = await client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        })).catch((e) => {
            console.log(`AWS Server Error: ${e}`);
            return null;
        });
        if (!delRes) return res.status(404).json({ message: "AWS Server Error" });
    }
    const deleted = await prisma.post.delete({
        where: {
            postId: postId,
        }
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    if (!deleted) return res.status(404).json({ message: "Database Server Error" });
    return res.status(200).json({ message: "Listing Deleted" });
});

// takes in a post id and returns the object (with presigned urls)
router.get('/get/:id', async (req: Request, res: Response) => {
    const postId = req.params.id;
    const post = await prisma.post.findUnique({
        where: {
            postId: postId,
        }
    }).catch((e) => {
        console.log("Database Server Error: ", e);
        return null;
    });
    if (!post) return res.status(409).json({ message: "Invalid Post" });
    
    // generated presigned urls
    let urls: string[] = []
    for (let key of post.pictures){
        const presigned = await getSignedUrl(client, new GetObjectCommand({ 
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        }), { expiresIn: 2000 }).catch((e) => {
            console.log("AWS Server Error: ", e);
            return null;
        });
        if (!presigned) return res.status(404).json({ message: "AWS Server Error" });
        urls.push(presigned);
    }
    return res.status(200).json({ listing: post, urls: urls });
});

// returns all the posts for a given username (to be filtered and organized in the proxy servers)
// the only logic provided is the generated the presigned url for the first image of each post
router.get('/getuser/:username', async (req: Request, res: Response) => {
    const username = req.params.username;
    let posts = await prisma.post.findMany({
        where: {
            madeBy: username,
        }
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    if (!posts) return res.status(404).json({ message: "Database Server Error" });
    for (let post of posts){
        const urls = post.pictures;
        if (!urls || urls.length < 1) return res.status(409).json({ message: "Invalid Picture Information for Listing" });
        const presigned = await getSignedUrl(client, new GetObjectCommand({ 
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: urls[0],
        }), { expiresIn: 2000 }).catch((e) => {
            console.log("AWS Server Error: ", e);
            return null;
        });
        if (!presigned) return res.status(404).json({ message: "AWS Server Error" });
        post.pictures = [presigned]; // has to be an array cause of typing
    }
    return res.status(200).json({ posts: posts });
});

// takes in a username parameter, and formData including the token
// returns the link to the created listing
router.post('/create/:username', async (req: Request, res: Response) => {
    const files = (req as FileRequest).files;
    if (!files) return res.status(409).json({ message: "No Files Included" });
    if (files.length > 5) return res.status(409).json({ message: "Too Many Files" });
    const fileKeys = Object.keys((req as FileRequest).files);
    fileKeys.forEach((key) => {
        const file = files[key];
        if (!allowed_files.includes(file.mimetype)) return res.status(409).json({ message: "Invalid File Type" });
        if (file.size > 2000000) return res.status(409).json({ message: `${file.name} is Too Large` });
    });
    const username = req.params.username;
    if (!req.body) return res.status(409).json({ message: "Invalid Request" });
    const { title, bio, value, token } = req.body;
    if (!title || !bio || !value) return res.status(409).json({ message: "Invalid Form Information" });
    if (!token) return res.status(409).json({ message: "Invalid Verification" });
    const user = await prisma.user.findUnique({
        where: {
            username: username,
        },
    }).catch(() => {
        console.log("Database Error");
        return null;
    });
    if (!user) return res.status(409).json({ message: "Invalid Username" });
    if (jwt.decode(token, process.env.JWT_SECRET) !== user.tokenc) return res.status(409).json({ message: "Invalid Credentials"});

    let urls: string[] = []
    const uploadFile = async(key: string, file: any) => {
        const generated = username + "-" + key + "-" + Date.now().toString(); 
        // again, there has to be a better way to do this
        const response = await client.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: generated,
            Body: file.data,
        })).catch((e) => {
            console.log(`AWS Server Error: ${e}`);
            return null;
        });
        if (!response) return res.status(404).json({ message: "AWS Server Error" });
        urls.push(generated);
    };
    await Promise.all(fileKeys.map((key) => uploadFile(key, files[key]))).catch(() => null);

    if (urls.length < 1) return res.status(409).json({ message: "Invalid File Map" });

    // might want to implement later a system that uses something like the date (confirms each is unique)
    // currently this works though (the brute force only compares against the user's posts)
    let valid: boolean = false;
    let generated: string;
    while (!valid){
        const added = await crypto.randomBytes(5).toString('hex');
        if (!added) return res.status(404).json({ message: "Server Error" });
        generated = username + added;
        if (!user.posts.includes(generated)){
            valid = true;
        }
    }
    if (!generated!) return res.status(404).json({ message: "Server Error" }); // safety precaution
    const created = prisma.post.create({
        data: {
            postId: generated!,
            title: title,
            bio: bio,
            value: parseInt(value),
            pictures: urls,
            madeBy: username,
        }
    }).catch((e) => {
        console.log("Database Server Error: ", e);
        return null;
    });
    if (!created) return res.status(404).json({ message: "Database Server" });
    return res.status(200).json({ message: "Listing Created", id: generated });
});

module.exports = router;