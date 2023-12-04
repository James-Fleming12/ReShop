const Pool = require("pg").Pool

const pool = new Pool()({
    user: "postgres",
    password: "idontevenknow",
    host: "localhost",
    port: 5432,
    database: "reshop"
});

module.exports = pool;