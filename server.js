import express from 'express'
import cors from 'cors'
import fs from "fs";

import playlistRoute from './routes/playlists.js'
import loginRouter from './routes/login.js'
import uploadRouter from './routes/uploads.js'
import currentPlaylist from './routes/current-playlist.js'
import songsRouter from './routes/songs.js'
import registerRouter from './routes/register.js'

import pool from './db.js';

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

app.get('/', (req, res) => {
    return res.json("From Backend");
})

app.get("/users", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB error" });
    }
});

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
