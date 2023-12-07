const express = require('express');
const app = express();
const port: number = 5000;
const pools = require("./database");
const cors = require('cors');

// middleware
app.use(cors);

// routes
app.get('/', (req, res) => {
    res.send("Hello World");
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
    console.log('Example app listening at port http:/localhost:${port}');
});