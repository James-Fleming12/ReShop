import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const express = require('express');
const bcrypt = require('bcrypt');
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
    const { token } = req.body; // transform token into a string
    const mytoken = token.toString().replace('Bearer ', '')
    console.log(mytoken);
    const decoded = jwt.decode(mytoken, process.env.JWT_SECRET)
    console.log(decoded);
    const user = await prisma.user.findUnique({
        where: {
            username: decoded
        }
    })
    if (!user) return res.status(409).json({ message: "Broken Token" });
    if(mytoken in user.tokens){ // so users can eliminate previous tokens (security reasons)
        return res.status(200).json({ user: user.username });
    }else{
        return res.status(409).json({ message: "Invalid Token" });
    }
})

app.post('/signin', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (!user) return res.status(409).json({ message: "User doesn't exist" });

    // bcrypt check with password
    console.log("hashing started");

    const compared = await bcrypt.compare(password, user.password);

    if (!compared) return res.status(409).json({ message: "Invalid Password "});

    // bcrypt.compare(password, user.password, function(err: Error, rese: boolean){
    //     if (err) res.status(500).json({ message: "Server Error "});
    //     if (!rese) return res.status(409).json({ message: "Invalid Password" });
    // });

    const token = await jwt.sign(user.username, process.env.JWT_SECRET);
    const updatedUser = await prisma.user.update({
        where: {
            email: req.body.email
        },
        data: {
            tokens: [...user.tokens, token]
        }
    });

    res.status(200).json({ token: token });
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

    const created = await prisma.user.create({
        data: {
            email: email,
            username: username,
            password: hash,
        }
    })
    
    // bcrypt.hash(password, 10, function(err: Error, hash: string) {
    //     if(err){
    //         res.status(500);
    //     }
    //     const created = prisma.user.create({
    //         data: {
    //             email: email,
    //             username: username,
    //             password: hash,
    //         }
    //     })
    // })

    res.status(200).json({ message: "User Created" });
});

/*
Routes for
- Users
    - Creating Users (Also login/signout)
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