import { Application } from 'express';
const authenticateRouter = require("../routes/authentication");
const userRouter = require("../routes/users");
const listingRouter = require("../routes/listings");

module.exports = function(app: Application) {
    app.use("/", authenticateRouter);
    app.use("/user", userRouter);
    app.use("/listing", listingRouter);
};