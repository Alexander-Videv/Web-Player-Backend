import express from 'express'
import pool from '../db.js'

const router = express();

router.get('/songs', async (req, res) => {

    try {
        // Get the user’s ID 
        const [songs] = await pool.query("SELECT * FROM songs");
        res.json(songs);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }


});

router.get("/recent", async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT s.id, s.title, s.artist, s.file_path, s.cover_art, u.username
      FROM songs s
      JOIN users u ON s.userid = u.id
      ORDER BY s.id DESC
      LIMIT 5
    `);

        res.json(rows);
    } catch (err) {
        console.error("Error fetching recent songs:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;