import { Request, Response, NextFunction } from 'express';

const express = require('express');
const router = express.Router();

router.use((req: Request, res: Response, next: NextFunction) => {
    
});

router.get("/", (req: Request, res: Response) => {

});

module.exports = router;