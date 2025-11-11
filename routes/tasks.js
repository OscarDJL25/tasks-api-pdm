import express from "express";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { verifyToken } from "../middleware/auth.js";
import pool from "../config/db.js";

const router = express.Router();

// Rutas principales
router.get("/", verifyToken, getTasks);
router.get("/:id", verifyToken, getTask);
router.post("/", verifyToken, createTask);
router.put("/:id", verifyToken, updateTask);
router.delete("/:id", verifyToken, deleteTask);

// 🔍 Endpoints de desarrollo (sin autenticación para consultas rápidas)
router.get("/dev/all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, completed, created_at, user_id 
      FROM tasks 
      ORDER BY created_at DESC
    `);
    res.json({
      total: result.rows.length,
      tasks: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/dev/stats", async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN completed = false THEN 1 END) as pending_tasks,
        COUNT(DISTINCT user_id) as total_users
      FROM tasks
    `);
    
    const recent = await pool.query(`
      SELECT title, created_at 
      FROM tasks 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    res.json({
      statistics: stats.rows[0],
      recent_tasks: recent.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/dev/by-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT * FROM tasks 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [userId]);
    
    res.json({
      user_id: userId,
      total: result.rows.length,
      tasks: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
