// routes/playlists.js
import express from "express";
import pool from "../db.js"; // your MySQL connection pool
import { error } from "console";

const router = express.Router();



router.get("/users/:username/playlists", async (req, res) => {
    const { username } = req.params;

    try {
        // Get the user’s ID 
        const [users] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
        if (users.length === 0) return res.status(404).json({ error: "User not found" });

        const userId = users[0].id;

        //Fetch playlists belonging to this user
        const [playlists] = await pool.query(
            "SELECT * FROM playlists WHERE userid = ?",
            [userId]
        );

        res.json(playlists);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/createplaylist", async (req, res) => {
    const username = req.body.username;
    const playlistName = req.body.playlistName;


    try {
        if (!username) {
            return res.status(400).json({ error: "Missing username or file" });
        }

        if (!playlistName) {
            return res.status(400).json({ error: "Missing playlist name" });
        }

        const [users] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
        if (users.length === 0) return res.status(404).json({ error: "User not found" });

        const userId = users[0].id;

        await pool.query("INSERT INTO playlists (userid, name) VALUES (?,?)", [userId, playlistName]);

        res.status(200).json({ message: "Playlist created successfully" });

    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Server error" });
    }
})


router.post("/addtoplaylist", async (req, res) => {
    const songId = req.body.songId;
    const playlistId = req.body.playlistId;

    try {
        await pool.query("INSERT INTO playlist_songs (playlistid, songid) VALUES (?,?)", [playlistId, songId]);

        res.status(200).json({ message: "Added song to playlist successfully" });

    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            // Ignore duplicate errors and return success anyway
            return res.json({ message: "Song already in playlist (ignored)" });
        }
        console.error("Upload error:", err);
        res.status(500).json({ error: "Server error" });
    }
})

router.delete("/playlists/:playlistid/songs/:songid", async (req, res) => {
    const { playlistid, songid } = req.params;

    try {
        // Check if it exists first (optional)
        const [existing] = await pool.query(
            "SELECT * FROM playlist_songs WHERE playlistid = ? AND songid = ?",
            [playlistid, songid]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: "Song not found in this playlist" });
        }

        // Remove the song from the playlist
        await pool.query("DELETE FROM playlist_songs WHERE playlistid = ? AND songid = ?", [
            playlistid,
            songid,
        ]);

        res.json({ message: "Song removed from playlist" });
    } catch (err) {
        console.error("Error removing song:", err);
        res.status(500).json({ error: "Database error" });
    }
});

router.delete("/deleteplaylist/:playlistid", async (req, res) => {

    const { playlistid } = req.params

    try {
        await pool.query("DELETE FROM playlists WHERE id = ?", [playlistid]);
        res.json("Playlist removed");
    } catch (err) {
        console.error("Error removing song:", err);
        res.status(500).json({ error: "Database error" });
    }
})

router.post("/rename/:playlistid", async (req, res) => {
    const { playlistid } = req.params;
    const { newName } = req.body

    try {
        await pool.query(
            "UPDATE playlists SET name = ? WHERE id = ?",
            [newName, playlistid]
        );
        res.status(200).json({ message: "Playlist renamed successfully" });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Server error" });
    }
})

export default router;
