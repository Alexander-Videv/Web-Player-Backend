import express from "express";
import pool from "../db.js"; // your MySQL connection pool

const router = express.Router();

router.get("/users/:username/playlists/:playlist_name", async (req, res) => {
    const username = req.params.username;
    const playlist_name = req.params.playlist_name;

    try {
        // Get the user’s ID 
        const [users] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
        if (users.length === 0) return res.status(404).json({ error: "User not found" });

        const userId = users[0].id;


        //Fetch playlists belonging to this user
        const [playlists] = await pool.query(
            "SELECT * FROM playlists WHERE userid = ? AND name = ?",
            [userId, playlist_name]);

        const playlistId = playlists[0].id;

        const [songs] = await pool.query(
            `SELECT s.id, s.title,s.artist, s.file_path
            FROM songs s
            JOIN playlist_songs ps ON s.id = ps.songid
            WHERE ps.playlistid = ?`,
            [playlistId]
        );
        res.json(songs);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }

});

export default router