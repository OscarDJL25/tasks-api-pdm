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

// Endpoint para verificar estructura de tablas
router.get("/dev/schema", async (req, res) => {
  try {
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tasksColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tasks'
    `);
    
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    
    res.json({
      tables: tables.rows,
      tasks_columns: tasksColumns.rows,
      users_columns: usersColumns.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para crear/verificar estructura de base de datos
router.post("/dev/setup-db", async (req, res) => {
  try {
    // Crear tabla users si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla tasks si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Si la tabla tasks ya existe pero no tiene la columna completed, agregarla
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false
    `);
    
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    
    res.json({ 
      message: "Base de datos configurada correctamente",
      tables_created: ["users", "tasks"],
      columns_added: ["completed", "updated_at"]
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/dev/all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, 
             COALESCE(completed, false) as completed, 
             created_at, user_id 
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
        COUNT(CASE WHEN COALESCE(completed, false) = true THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN COALESCE(completed, false) = false THEN 1 END) as pending_tasks,
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
