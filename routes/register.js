import express from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Missing username or password" });

    try {
        // Check if user exists
        const [existing] = await pool.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Insert user
        await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [
            username,
            hashed,
        ]);

        // Optionally create their default playlist
        const [user] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
        await pool.query("INSERT INTO playlists (userid, name) VALUES (?, ?)", [user[0].id, "My Songs"]);

        console.log("User created", username);
        res.status(201).json({ message: "User created successfully" });

    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
