import express from 'express'
import cors from 'cors'
import mysql from 'mysql2'
import fs from "fs";

import playlistRoute from './routes/playlists.js'
import loginRouter from './routes/login.js'
import uploadRouter from './routes/uploads.js'
import currentPlaylist from './routes/current-playlist.js'
import songsRouter from './routes/songs.js'
import registerRouter from './routes/register.js'

import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({
    origin: [
        "http://localhost:3000",                 // for local testing
        "https://alexander-videv.github.io",        // your GitHub Pages URL
        "https://alexander-videv.github.io/web-player" // sometimes needed depending on repo name
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));


const db = mysql.createConnection({
    host: process.env.DB_HOST || "mysql-yourproject.aivencloud.com",
    user: process.env.DB_USER || "avnadmin",
    password: process.env.DB_PASS || "supersecret",
    database: process.env.DB_NAME || "defaultdb",
    port: process.env.DB_PORT || 12345,
    ssl: {
        rejectUnauthorized: true, // Required for Aiven's SSL
    },
});



if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
    console.log("Created uploads folder");
}


app.use(express.json())
app.use('/uploads', express.static('uploads'));
app.use("/", uploadRouter)
app.use("/", playlistRoute)
app.use("/", currentPlaylist)
app.use("/", songsRouter)
app.use("/", loginRouter)
app.use("/", registerRouter)


const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});


app.get('/', (req, res) => {
    return res.json("From Backend");
})

app.get('/users', (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    })
})