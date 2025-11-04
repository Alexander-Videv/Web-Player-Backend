// db.js
import mysql from "mysql2/promise";
import fs from "fs"
import dotenv from "dotenv"

dotenv.config();

// Create a pool of reusable connections

const pool = mysql.createPool({
    host: process.env.DB_HOST || "mysql-yourproject.aivencloud.com",
    user: process.env.DB_USER || "avnadmin",
    password: process.env.DB_PASS || "supersecret",
    database: process.env.DB_NAME || "defaultdb",
    port: process.env.DB_PORT || 12345,
    ssl: {
        ca: fs.readFileSync("./ca.pem"),
        rejectUnauthorized: true,
    },
});


export default pool;
