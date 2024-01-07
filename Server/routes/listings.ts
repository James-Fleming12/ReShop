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
const bcrypt = require('bcrypt');
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

router.post('/search', async (req: Request, res: Response) => {
    const data = req.body;
    let serverErr: boolean = false;
    if (!data) return res.status(409).json({ message: "Invalid Request" });
    const skips = data.skip ? parseInt(data.skip) : 0;
    // make a way to get customize how many posts can be queried (data.wanted)
    const posts = await prisma.post.findMany({
        orderBy: {
            created: "desc"
        },
        take: 10,
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
    }
    
});

// takes in a post id and returns the object (with presigned urls)
router.get('/get/:id', async (req: Request, res: Response) => {
    const postId = req.params.id;
    const post = await prisma.post.findFirst({
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
    let index: number = 1;
    const uploadFile = async(key: string, file: any) => {
        const generated = username + "-" + index.toString() + "-" + Date.now().toString(); // might not be the best way to do this
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
        index++;
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