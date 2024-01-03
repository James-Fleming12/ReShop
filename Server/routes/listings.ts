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
router.post('/create/:username', async (req: FileRequest, res: Response) => {
    const files = req.files;
    console.log(files);
    if (!files) return res.status(409).json({ message: "No Files Included" });
    if (files.length > 5) return res.status(409).json({ message: "Too Many Files" });
    for (let file of files){
        if(!allowed_files.includes(file.mimetype)) return res.status(409).json({ message: "Invalid File Type" });
        if(file.size > 200000) return res.status(409).json({ message: "File Too Large" }); // might want to change the allowed size
    }
    const username = req.params.username;
    const formData = await req.body.json().catch(() => null);
    if (!formData) return res.status(409).json({ message: "Invalid Request" });
    const title = formData.title;
    const bio = formData.bio;
    const val = formData.value;
    const token = formData.token;
    console.log(val, typeof(val)); // checking if its a string or number 
    if (!title || !bio || !val) return res.status(409).json({ message: "Invalid Form Information" });
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
    for (let [index, file] of files.entries()){
        const generated = username + "-" + index.toString() + "-" + Date.now(); // i dont know if this is the best way to do this yet
        const response = await client.send(new PutObjectCommand({ // but it works
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: generated,
            Body: file.data,
        })).catch((e) => {
            console.log(e);
            return null;
        });
        if (!response) return res.status(404).json({ message: "AWS Server Error" });
        urls.push(generated);
    }
    console.log(urls); // only for testing purposes

    // implement a id generation feature (the username of the poster and some random string)
    let valid: boolean = false;
    let generated: string;
    while (!valid){
        const added = await crypto.randomBytes(15).toString('hex').catch(() => null);
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
            value: val,
            pictures: urls,
        }
    }).catch((e) => {
        console.log("Database Server Error: ", e);
        return null;
    });
    if (!created) return res.status(404).json({ message: "Database Server" });
    return res.status(200).json({ message: "created", id: generated });
});

module.exports = router;