import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface messaged {
    username: string,
    pfp: string,
}

interface FileRequest extends Request { 
    files: any; // solely for typescript linting
}

interface presignedUser {
    username: string,
    pfp: string,
}

const allowed_files = ['image/png', 'image/jpeg', 'image/jpg']; // check these later

const prisma = new PrismaClient();

const s3Config = {
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS!,
        secretAccessKey: process.env.AWS_SECRET!,
    }
};

const client = new S3Client(s3Config);

const jwt = require('jsonwebtoken');

const express = require('express');
const router = express.Router();

// takes the token, sender username, send to username, message, and optionally any images
router.post("/send", async (req: Request, res: Response) => {
    const data = req.body;
    // user validation
    const token = data.token;
    const username = data.username;
    if (!token || !username) return res.status(409).json({ message: "Invalid Credentials" });
    const user = await prisma.user.findUnique({
        where:{
            username: username,
        }
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    if (!user) return res.status(404).json({ message: "Server Error" });
    if (jwt.decode(token, process.env.JWT_SECRET) !== user.tokenc) return res.status(409).json({ message: "Invalid Credentials"});
    // second user validation
    const sendto = data.send;
    const senduser = await prisma.user.findUnique({
        where: {
            username: sendto
        }
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    if (!senduser) return res.status(404).json({ message: "Server Error" });
    if (senduser.blocked.includes(username)) return res.status(409).json({ messsage: "This user has blocked you" });
    // validating message
    const message = data.message;
    if (message.length > 500) return res.status(409).json({ message: "Messages must be under 500 characters" });
    // file validation
    const files = (req as FileRequest).files;
    const urls: string[] = [];
    if (files && [].concat(files).length > 0){
        const fileKeys = Object.keys(files);
        fileKeys.forEach((key) => {
            const file = files[key];
            if (!allowed_files.includes(file.mimetype)) return res.status(409).json({ message: "Invalid File Type" });
        if (file.size > 2000000) return res.status(409).json({ message: `${file.name} is Too Large` });
        });
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
        const uploadsRes = await Promise.all(fileKeys.map((key) => uploadFile(key, files[key]))).catch(() => null);
        console.log(uploadsRes); // only for testing purposes
    }
    const created = await prisma.message.create({
        data: {
            sender: username,
            receiver: sendto,
            message: message,
            images: urls && urls.length > 0 ? urls : undefined,
        },
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    if (!created) return res.status(404).json({ message: "Server Error" });
    // websocket update
    const wsupdate = await fetch(process.env.WS_URL + "/send", {
        method: "POST",
        mode: "cors",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: process.env.WS_SECRET,
            username: sendto,
            from: username,
            message: message,
            images: urls,
        }),
    }).catch((e) => {
        console.log(`WebSocket Server Error: ${e}`);
        return null;
    });
    if (!wsupdate) return res.status(404).json({ message: "Message Couldn't Be Sent Live" });
    return res.status(200).json({ sentmessage: created });
});

// for searching for users
router.get("/search/:search", async (req: Request, res: Response) => {
    const changeToPresigned = async (user: presignedUser) => {
        const presigned = await getSignedUrl(client, new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: user.pfp,
        }), { expiresIn: 2000 }).catch((e) => {
            console.log("AWS Server Error: ", e);
            return null;
        });
        if (!presigned) throw new Error("AWS Server Error");
        user.pfp = presigned;
    }
    const search = req.params.search;
    const users = await prisma.user.findMany({
        where: {
            username: {
                contains: search,
                mode: "insensitive",
            }
        },
        select: {
            username: true,
            pfp: true,
        },
        orderBy: { // to order by the most posts (might not work how it should)
            posts: "desc",
        }
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    if (!users || users.length < 0) return res.status(409).json({ message: "No Users" });
    const updateAll = await Promise.all(users.map(changeToPresigned)).catch((e) => { // figure out crash testing for this
        console.log(`Server Error: ${e}`);
        return null;
    });
    if (updateAll === null) return res.status(404).json({ message: "AWS Server Error" });
    return res.status(200).json({ users: users });
});

router.post("/getuser/:username", async (req: Request, res: Response) => {
    const otheruser = req.params.username;
    const { token, username, skips } = req.body;
    if (!token || !username) return res.status(409).json({ message: "Invalid Credentials" });
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { receiver: otheruser, sender: username },
                { receiver: username,sender: otheruser },
            ]
        },
        take: 10, // should be 50 or more once testing is done
        skip: skips,
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    if (!messages) return res.status(404).json({ message: "Server Error" });
    return res.status(200).json({ messages: messages });
});

// currently the only thing going through the body is a token, might want to move it to an authentication header instead?
router.post("/get/:username", async (req: Request, res: Response) => {
    const username = req.params.username;
    const { token } = req.body;
    if (!token) return res.status(409).json({ message: "Invalid Credentials" });
    const user = await prisma.user.findUnique({
        where: {
            username: username,
        }
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    if (!user) return res.status(409).json({ message: "Invalid Server Response" });
    if (jwt.decode(token, process.env.JWT_SECRET) !== user.tokenc) return res.status(409).json({ message: "Invalid Credentials"});
    let users: messaged[] = [];
    for (let userm of user.messagers){ // might be able to switch this to a Promise.all to improve runtimes
        const adduser = await prisma.user.findUnique({ // only issue being keeping them in order
            where: {
                username: userm
            }
        }).catch((e) => {
            console.log(`Database Server Error: ${e}`);
            return null;
        });
        if (!adduser) return res.status(404).json({ message: "Internal Server Error" });
        const presigned = await getSignedUrl(client, new GetObjectCommand({ 
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: adduser.pfp,
        }), { expiresIn: 2000 }).catch((e) => {
            console.log("AWS Server Error: ", e);
            return null;
        });
        if (!presigned) return res.status(404).json({ message: "AWS Server Error" });
        users.push({
            username: userm,
            pfp: presigned,
        });
    }
    return res.status(200).json({ users: users });
});

module.exports = router;