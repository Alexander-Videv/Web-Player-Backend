import express from "express";
import pool from "../db.js";
import bcrypt from 'bcrypt'

const router = express.Router();

// POST /api/login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Missing username or password" });

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0)
            return res.status(400).json({ error: "Invalid username or password" });

        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid)
            return res.status(401).json({ error: "Invalid username or password" });

        res.status(200).json({ message: "Login successful", username });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
