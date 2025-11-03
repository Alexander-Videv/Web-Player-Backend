// db.js
import mysql from "mysql2/promise";

// Create a pool of reusable connections
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "pass",
    database: "web-player",
    connectionLimit: 10, // limits open connections (helps performance)
});

export default pool;
