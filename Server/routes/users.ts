import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
    return res.status(200).json({ message: "Name Changed" });
});

module.exports = router;