import { Application } from 'express';
var authenticateRouter = require("../routes/authentication");

module.exports = function(app: Application) {
    app.use("/", authenticateRouter);
};