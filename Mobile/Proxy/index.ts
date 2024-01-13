import { Request, Response } from 'express';

const express = require("express");
const cors = require('cors');

const app = express();
const port: number = 3421;

app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Works" });
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});