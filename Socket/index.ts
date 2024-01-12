import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client'

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const prisma = new PrismaClient();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/send', (req: Request, res: Response) => { 
    const data = req.body;
    const serverToken = data.token;
    const username = data.username;
    const message = data.message;
    const presigned = data.urls;
    if (serverToken !== process.env.WS_SECRET) {
        console.log(`User with invalid Credentials accessing WebSocket sending, Request: ${req}`);
        return res.status(409).json({ message: "Invalid Credentials" });
    }
    if (!username || !message) return res.status(409).json({ message: "Invalid Information" });
    io.to(`user_${username}`).emit('message', { "message": message, "images": presigned && presigned.length > 0 ? presigned : undefined});
    return res.status(200).json({ message: "Update Emitted Successfully" });
});

io.use(async (socket: Socket, next: NextFunction) => {
    const token = socket.handshake.auth.token;
    const username = socket.handshake.auth.username;
    if (!token || !username) return next(new Error('Invalid Credentials'));
    const user = await prisma.user.findUnique({
        where: {
            username: username,
        }
    }).catch((e) => {
        console.log(`Database Server Error: ${e}`);
        return null;
    });
    if (!user) return next(new Error('Server Error'));
    if (jwt.decode(token, process.env.JWT_SECRET) !== user.tokenc) return next(new Error('Invalid Credentials'));
    socket.data = user;
    return next();
});

io.on('connection', (socket: Socket) => {
    const user = socket.data;
    socket.join(`user_${user.username}`); // should be safe to just use a username... should (since it requires token verification to access)
    console.log(`User ${socket.id} subscribed to their own channel: user_${user.username}`);

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`Server running on http:localhost:${port}`);
});