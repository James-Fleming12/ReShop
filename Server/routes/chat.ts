import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const express = require('express');
const router = express.Router();

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
    let users = [];
    for (let messenger of user.messagers){
            
    }
});

router.get("/", (req: Request, res: Response) => {
    return res.status(200).json({ message: "Works" });
});

module.exports = router;