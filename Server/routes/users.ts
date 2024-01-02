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

// takes in a username in the params of the link
// returns a presigned url to the image (with a lifetime of 2000 milliseconds?)
router.get('/pfp/:username', async (req: Request, res: Response) => {
    const user = await prisma.user.findFirst({
        where: {
            username: req.params.username,
        }
    }).catch((e) => {
        console.log(e);
        return null;
    });
    if (!user) return res.status(409).json({ message: "Invalid Input" });
    const filename = user.pfp;
    const presigned = await getSignedUrl(client, new GetObjectCommand({ 
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
    }), { expiresIn: 2000 }).catch((e) => {
        console.log(e);
        return null;
    });
    if (!presigned) return res.status(500).json({ message: "AWS Server Error" });
    return res.status(200).json({ url: presigned });
});

router.post('/pfp/:username', async (req: FileRequest, res: Response) => {
    const file = req.files.image;

    // check if its an image (either magic file signatures, mime types, or being lazy and checking name)
    if (!allowed_files.includes(file.mimetype)) return res.status(409).json({ message: "Invalid File Type" });

    // size is given in kbs
    if (file.size > 200000) return res.status(409).json({ message: "Image Too Large" });

    if (!file) return res.status(409).json({ message: "Invalid File" });
    const user = await prisma.user.findFirst({
        where: {
            username: req.params.username,
        }
    }).catch(() => null);
    console.log(req.params.username);
    if (!user) return res.status(409).json({ message: "Invalid Input" });

    if (user.pfp !== "defaultpfp"){ // deleting old images
        const deleted = await client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: user.pfp,
        })).catch((e) => {
            console.log(e);
            return null;
        });
        if (!deleted) return res.status(404).json({ message: "AWS Server Error" });
    }
    const generated = user.username + "-" + crypto.randomBytes(5).toString('hex');
    const response = await client.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: generated,
        Body: file.data,
    })).catch((e) => {
        console.log(e);
        return null;
    });
    if (!response) return res.status(404).json({ message: "AWS Server Error" });
    const updated = await prisma.user.update({
        where: {
            username: user.username,
        },
        data: {
            pfp: generated,
        }
    }).catch(() => null);
    if (!updated) return res.status(404).json({ message: "Database Server Error" });
    return res.status(200).json({ message: "Profile Picture Updated" });
});

// returns the user object for the URL parameterized username
router.get('/get/:username', async (req: Request, res: Response) => {
    const username = req.params.username;
    if (!username || username.length > 50) return res.status(409).json({ message: "Invalid Input" });
    const user = await prisma.user.findFirst({
        where: {
            username: username
        }
    });
    if (!user) return res.status(409).json({ message: "No Users Exists" });
    return res.status(200).json({ user: user });
});

// Receives an HTTP request to the link with the old username
// the HTTP body will hold the new username and the user's password
router.post('/changeusername/:username', async (req: Request, res: Response) => {
    const username = req.params.username;
    const formData = await req.body.json();
    if (!formData) return res.status(409).json({ message: "Invalid Form" });
    const newname = formData.username;
    const password = formData.password;
    if (!newname || !password || newname.length > 50 || password.length > 50) return res.status(409).json({ message: "Invalid Form Information" });
    const user = await prisma.user.findFirst({
        where: { username: username }
    });
    if (!user) return res.status(409).json({ message: "Invalid User" });
    if (!bcrypt.compare(password, user.password)) return res.status(409).json({ message: "Invalid Password" });
    const updated = await prisma.user.update({
        where: {
            username: username,
        },
        data: {
            username: newname,
        }
    });
    if (!updated) return res.status(404).json({ message: "Invalid Server Response" });
    return res.status(200).json({ message: "Username Changed" });
});

router.post('/changeinfo/:username', async (req: Request, res: Response) => {
    const username = req.params.username;
    const { name, bio, token } = req.body;
    if (!token) return res.status(409).json({ message: "Invalid Token" });
    if (!name && !bio) return res.status(409).json({ message: "No Updates to be Made" });
    const user = await prisma.user.findFirst({
        where: {
            username: username
        }
    });
    if (!user) return res.status(409).json({ message: "Invalid User" });
    if (jwt.decode(token, process.env.JWT_SECRET) !== user.tokenc) return res.status(409).json({ message: "Invalid Token" });
    var dict = {
        name: user.name,
        bio: user.bio,
    }
    if (bio) dict.bio = bio;
    if (name) dict.name = name;
    const updated = await prisma.user.update({
        where: {
            username: username,
        },
        data: dict
    });
    if (!updated) return res.status(404).json({ message: "Invalid Server Response" });
    return res.status(200).json({ message: "Information Changed" });
});

module.exports = router;