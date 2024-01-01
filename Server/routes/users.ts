import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface FileRequest extends Request {
    files: any;
}

const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { S3CLient, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Config = {
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_REGION,
};

const s3 = new S3CLient(s3Config);

// returns a presigned url for the image
router.get('/pfp/:username', async (req: Request, res: Response) => {
    let message = "";
    const username = req.params.username;
    const user = await prisma.user.findFirst({
        where: {
            username: username,
        }
    }).catch(() => { message = "Database Error"; return null });
    if (!user) return res.status(409).json(!message ? { message: "Invalid Username" } : {message: "Database Error"});
    const pfpCode = user.pfp;
    const url = s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: pfpCode,
        Expires: 60*5,
    }).catch((e) => { console.log(e); return null });
    if (!url) return res.status(404).json({ message: "AWS Server Error" });
    return res.status(200).json({ image: url });
});

// takes in an image input
router.post('/pfp/:username', async (req: FileRequest, res: Response) => {
    // add image checks for file extension type and file size (10 mb or more not permitted)
    const file = req.files.file;
    if (!file) return res.status(409).json({ message: "Invalid Form" });
    const username = req.params.username;
    if (!username || username.length < 1) return res.status(409).json({ message: "Invalid Username" });
    const filename = crypto.randomBytes(15).toString('hex');
    if (!filename) return res.status(409).json({ message: "Server Error" });
    let prismaerror = false
    const user = prisma.user.findFirst({
        where: {
            username: username,
        }
    }).catch((e) => { prismaerror = true; return null })
    if (!user) return prismaerror ? res.status(404).json({message: "Server Error"}) : res.status(409).json({message: "Invalid Username"});
    const updated = prisma.user.update({
        where: {
            username: username,
        }, 
        data: {
            pfp: filename,
        }
    }).catch(() => null);
    if (!updated) return res.status(404).json({ message: "Database Server Error" });
    const data = await s3.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: file.data,
    })).catch(() => null);
    if(!data) {
        const updated = prisma.user.update({
            where: {
                username: username,
            }, 
            data: {
                pfp: "defaultpfp",
            }
        }).catch(() => null);
        if (!updated) return res.status(404).json({ message: "AWS and Database Server Down" });
        return res.status(404).json({ message: "AWS Server Error. Profile Picture Reverted" });
    }
    return res.status(200).json({ message: "Profile Picture Changed" });
});

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
router.post('/change/username/:username', async (req: Request, res: Response) => {
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

router.post('/change/info/:username', async (req: Request, res: Response) => {
    const username = req.params.username;
    const formData = await req.body.json();
    if (!formData) return res.status(409).json({ message: "Invalid Form" });
    const newname = formData.username;
    const bio = formData.bio;
    const token = formData.token;
    if (!token) return res.status(409).json({ message: "Invalid Form Information" });
    if (!newname && !bio) return res.status(409).json({ message: "No Updates to be Made" });
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
    if (newname) dict.name = newname;
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