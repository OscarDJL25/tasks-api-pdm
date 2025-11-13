import express from "express";
import { login, register } from "../controllers/authController.js";
import pool from "../config/db.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

// 🔍 Endpoint de desarrollo para ver usuarios
router.get("/dev/users", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json({
      total: result.rows.length,
      users: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
