import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const express = require('express');
const router = express.Router();

router.post('/validate', async (req: Request, res: Response) => {
    const { token } = req.body;
    const mytoken = token.toString().trim().replace('Bearer ', '');
    const decoded = jwt.decode(mytoken, process.env.JWT_SECRET)
    const user = await prisma.user.findFirst({
        where: {
            tokenc: decoded
        }
    })
    if (!user) return res.status(409).json({ message: "Broken or Invalid Token" });
    return res.status(200).json({ user: user.username });
})

router.post('/signin', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (!user) return res.status(409).json({ message: "User doesn't exist" });

    const compared = await bcrypt.compare(password, user.password);
    if (!compared) return res.status(409).json({ message: "Invalid Password "});

    const token = await jwt.sign(user.tokenc, process.env.JWT_SECRET); // might not be necessary since tokenc is generated anyways
    res.status(200).json({ token: token }); // just an extra precaution I guess
});

router.post('/register', async (req: Request, res: Response) => {
    const { email, username, password } = req.body;
    if (email.includes(" ")) return res.status(409).json({ message: "Email Can't Contain Space" });
    if (username.includes(" ")) return res.status(409).json({ message: "Username Can't Contain Spaces" });
    if (username.includes("/")) return res.status(409).json({ message: "Username can't contain /s" });
    if (username.length < 3) return res.status(409).json({ message: "" })
    // add extra username and password checks (length, symbols, etc.)
    
    const check = await prisma.user.findFirst({
        where: {
            OR: [
                { username: username },
                { email: email },
            ]
        }
    });

    if (check) return res.status(409).json({ message: "User credentials already used" });
    const hash = await bcrypt.hash(password, 10);

    let valid: boolean = false;
    let tokeng: string = "";
    while(!valid){
        tokeng = await crypto.randomBytes(15).toString('hex');
        const tokencheck = await prisma.user.findFirst({
            where: {
                tokenc: tokeng
            }
        })
        if(!tokencheck){
            valid = true;
        }
    }
    
    const created = await prisma.user.create({
        data: {
            email: email,
            username: username,
            password: hash,
            tokenc: tokeng,
        }
    }).catch(() => null);
    if (!created) return res.status(404).json({ message: "Database Error" });
    return res.status(200).json({ message: "User Created" });
});

module.exports = router;