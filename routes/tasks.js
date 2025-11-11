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
      SELECT id, name, status, deadline,
             COALESCE(completed, false) as completed, 
             created_at, updated_at
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
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tasks,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_tasks
      FROM tasks
    `);
    
    const recent = await pool.query(`
      SELECT name, status, created_at, deadline
      FROM tasks 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    const byStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM tasks 
      GROUP BY status
    `);
    
    res.json({
      statistics: stats.rows[0],
      recent_tasks: recent.rows,
      tasks_by_status: byStatus.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/dev/by-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Como no hay user_id en tasks, mostrar tareas por status o ID
    const result = await pool.query(`
      SELECT * FROM tasks 
      WHERE id = $1 
      ORDER BY created_at DESC
    `, [userId]);
    
    res.json({
      task_id: userId,
      found: result.rows.length > 0,
      task: result.rows[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Nuevo endpoint para buscar por status
router.get("/dev/by-status/:status", async (req, res) => {
  try {
    const { status } = req.params;
    const result = await pool.query(`
      SELECT * FROM tasks 
      WHERE status = $1 
      ORDER BY created_at DESC
    `, [status]);
    
    res.json({
      status: status,
      total: result.rows.length,
      tasks: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para tareas próximas a vencer
router.get("/dev/upcoming", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM tasks 
      WHERE deadline IS NOT NULL 
      AND deadline >= CURRENT_DATE 
      ORDER BY deadline ASC 
      LIMIT 10
    `);
    
    res.json({
      total: result.rows.length,
      upcoming_tasks: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
