import { Request, Response, NextFunction } from 'express';

const express = require('express');
const router = express.Router();

// credential call for admin access (only informational)
router.use((req: Request, res: Response, next: NextFunction) => {
    const {pass} = req.body;
    if (pass !== process.env.ADMIN_PASS) { // add this to the .env
        console.log("Invalid Admin Credential Call");
        return res.status(409).json({ message: "Invalid Credentials" });
    }
    next();
});

router.post("/user", async (req: Request, res: Response) => {
    const data = await req.body;
    if (!data) return res.status(409).json({ message: "Error" });
    const takes = data.take;
    const search = data.search;
    if (!takes || !search) return res.status(409).json({ message: "Invalid Information" });
    
});

router.post("/listing", async (req: Request, res: Response) => {
    const data = await req.body;
});

router.post("/message", async (req: Request, res: Response) => {
    const data = await req.body;
});

module.exports = router;