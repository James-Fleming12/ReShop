import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
// const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port: number = 5000;

var cors = require('cors');

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.get('/', (req: Request, res: Response) => {
    res.json({ message: "Hello from the server! "});
});

app.get('/other', (req: Request, res: Response) => {
    res.json({ message: "Other Message?" });
});

app.post('/validate', async (req: Request, res: Response) => {
    console.log("called");
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

app.post('/signin', async (req: Request, res: Response) => {
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

app.post('/register', async (req: Request, res: Response) => {
    const { email, username, password } = req.body;
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
        tokeng = crypto.randomBytes(15).toString('hex');
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
    });

    res.status(200).json({ message: "User Created" });
});

/*
Routes for
- Users
    - Returning User Info (bio, region, etc.)
    - Changing User Info (bio, region, etc.)
- Posts
    - Viewing Post Info
    - Creating Posts
    - Deleting Posts
    - Responding to Posts
    - Editing Posts
*/

app.listen(port, () => {
    console.log(`Server listening at port http://localhost:${port} (Development Testing)`);
});