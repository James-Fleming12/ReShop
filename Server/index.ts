import {Request, Response, response} from 'express';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const express = require('express');
const app = express();
const port: number = 5000;

const clientID: string = "7858be9f71vc72slic9ma3t1os"; // use when making
var cognito = new CognitoIdentityServiceProvider();

var cors = require('cors');

// middleware
app.use(cors());

// routes
app.get('/', (req: Request, res: Response) => {
    res.json({ message: "Hello from the server! "});
});

app.get('/other', (req: Request, res: Response) => {
    res.json({ message: "Other Message?" });
});

app.post('/signup', (req: Request, res: Response) => {
    
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
    console.log(`Server listening at port http:/localhost:${port} (Development Testing)`);
});