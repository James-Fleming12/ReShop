import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const express = require('express');
const router = express.Router();

router.get('/get/:username', async (req: Request, res: Response) => {
    const username = req.params.username;
    if (!username || username.length > 50) return res.status(409).json({ message: "Invalid Input" });
    const user = await prisma.user.findFirst({
        where: {
            username: username
        }
    });
    if (!user) return res.status(409).json({ message: "No Users Exists" });
    return res.status(200).json({ user: user });;
});