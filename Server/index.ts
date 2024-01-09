import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const express = require('express');

const app = express();
const port: number = 5000;

const cors = require('cors');
const fileup = require("express-fileupload");

app.use(cors());
app.use(fileup());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require('./startup/routes')(app);

// routes
app.get('/', (req: Request, res: Response) => {
    res.json({ message: "Hello from the server! "});
});

app.get('/other', (req: Request, res: Response) => {
    res.json({ message: "Other Message?" });
});

/*
Routes for
- Users
    - Changing User Info (username, password)
- Posts
    - Responding to Posts
*/

app.listen(port, () => {
    console.log(`Server listening at port http://localhost:${port} (Development Testing)`);
});