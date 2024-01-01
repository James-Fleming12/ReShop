import { Application } from 'express';
var authenticateRouter = require("../routes/authentication");
var userRouter = require("../routes/users");

module.exports = function(app: Application) {
    app.use("/", authenticateRouter);
    app.use("/user", userRouter);
};