import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const express = require('express');
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    return res.status(200).json({ message: "Works" });
});

module.exports = router;