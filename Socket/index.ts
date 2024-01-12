import { Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client'

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const prisma = new PrismaClient();

const port = process.env.PORT || 3000;

io.use(async (socket: Socket, next) => {
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
    socket.data = user;
    return next();
});

io.on('connection', (socket: Socket) => {
    const user = socket.data;
    socket.join(`user_${user.username}`); // should be safe, should (since )
    console.log(`User ${socket.id} subscribed to their own channel: user_${user.username}`);

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`Server running on http:localhost:${port}`);
});