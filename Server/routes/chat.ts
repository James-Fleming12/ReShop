import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface messaged {
    username: string,
    pfp: string,
}

interface presignedUser {
    username: string,
    pfp: string,
}

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
    })
    console.log(users); // for testing purposes only
    if (updateAll === null) return res.status(404).json({ message: "AWS Server Error" });
    return res.status(200).json({ users: users });
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