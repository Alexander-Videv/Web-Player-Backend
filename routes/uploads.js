import express from "express";
import multer from "multer";
import path from "path";
import pool from "../db.js";
import supabase from "../supabase.js";
import fs from "fs"

const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName = `${req.body.username}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
    const username = req.body.username;
    const title = req.body.title || req.file.originalname;
    const artist = req.body.artist || null;
    const cover_art = req.body.cover_art || null;

    const file = req.file;

    if (!username || !file) {
        return res.status(400).json({ error: "Missing username or file" });
    }

    const filePath = file.path; // e.g. uploads/sasho-12345.mp3
    const supabasePath = `songs/${file.filename}`;

    try {

        const fileBuffer = fs.readFileSync(filePath);

        const { data, error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET)
            .upload(supabasePath, fileBuffer, {
                contentType: file.mimetype,
                cacheControl: "3600",
                upsert: false,
            });

        if (error) throw error;

        fs.unlinkSync(filePath);

        const { data: publicUrlData } = supabase.storage
            .from(process.env.SUPABASE_BUCKET)
            .getPublicUrl(supabasePath);

        const publicUrl = publicUrlData?.publicUrl || null;

        // Find the user
        const [userRows] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
        if (userRows.length === 0) return res.status(404).json({ error: "User not found" });
        const userid = userRows[0].id;

        // Insert the song
        const [songResult] = await pool.query(
            "INSERT INTO songs (userid, title, file_path, artist, cover_art) VALUES (?, ?, ?, ?,?)",
            [userid, title, supabasePath, artist, cover_art]
        );
        const songid = songResult.insertId;

        // Check for "My Songs" playlist
        const [playlistRows] = await pool.query(
            "SELECT id FROM playlists WHERE userid = ? AND name = 'My Songs'",
            [userid]
        );

        let playlistid;
        if (playlistRows.length === 0) {
            const [newPlaylist] = await pool.query(
                "INSERT INTO playlists (userid, name) VALUES (?, 'My Songs')",
                [userid]
            );
            playlistid = newPlaylist.insertId;
        } else {
            playlistid = playlistRows[0].id;
        }

        // Add song to "My Songs"
        await pool.query(
            "INSERT INTO playlist_songs (playlistid, songid) VALUES (?, ?)",
            [playlistid, songid]
        );

        res.json({
            message: "Song uploaded successfully!",
            file: publicUrl,
            songid,
            playlistid,
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
