import express from "express";
import {
  obtenerTareas,
  obtenerTarea,
  crearTarea,
  actualizarTarea,
  eliminarTarea,
  alternarTareaFinalizada,
  // Mantener compatibilidad
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/tareasController.js";
import { verifyToken } from "../middleware/auth.js";
import pool from "../config/db.js";

const router = express.Router();

// ===== RUTAS EN ESPAÑOL (PRINCIPAL) =====
router.get("/tareas-academicas", verifyToken, obtenerTareas);
router.get("/tareas-academicas/:id", verifyToken, obtenerTarea);
router.post("/tareas-academicas", verifyToken, crearTarea);
router.put("/tareas-academicas/:id", verifyToken, actualizarTarea);
router.delete("/tareas-academicas/:id", verifyToken, eliminarTarea);
router.patch("/tareas-academicas/:id/alternar-finalizada", verifyToken, alternarTareaFinalizada);

// ===== RUTAS ANTERIORES (COMPATIBILIDAD) =====
router.get("/", verifyToken, getTasks);
router.get("/:id", verifyToken, getTask);
router.post("/", verifyToken, createTask);
router.put("/:id", verifyToken, updateTask);
router.delete("/:id", verifyToken, deleteTask);

// ===== ENDPOINTS DE DESARROLLO EN ESPAÑOL =====

// Endpoint para verificar estructura de base de datos
router.get("/dev/esquema", async (req, res) => {
  try {
    const tablas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const columnasTareas = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tareas_academicas'
    `);
    
    const columnasUsuarios = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios'
    `);
    
    res.json({
      tablas: tablas.rows,
      columnas_tareas_academicas: columnasTareas.rows,
      columnas_usuarios: columnasUsuarios.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para configurar base de datos en español
router.post("/dev/configurar-bd", async (req, res) => {
  try {
    // Crear tabla usuarios si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
        contrasena VARCHAR(255) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla tareas_academicas según especificaciones del proyecto
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tareas_academicas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        fecha_asignacion DATE NOT NULL,
        hora_asignacion TIME NOT NULL,
        fecha_entrega DATE,
        hora_entrega TIME,
        finalizada BOOLEAN DEFAULT FALSE,
        prioridad INTEGER CHECK (prioridad BETWEEN 1 AND 10),
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    res.json({ 
      mensaje: "Base de datos configurada correctamente para proyecto academico",
      tablas_creadas: ["usuarios", "tareas_academicas"],
      estructura_tareas_academicas: {
        "id": "SERIAL PRIMARY KEY",
        "nombre": "VARCHAR(100) NOT NULL",
        "descripcion": "TEXT",
        "fecha_asignacion": "DATE NOT NULL",
        "hora_asignacion": "TIME NOT NULL", 
        "fecha_entrega": "DATE",
        "hora_entrega": "TIME",
        "finalizada": "BOOLEAN DEFAULT FALSE",
        "prioridad": "INTEGER CHECK (prioridad BETWEEN 1 AND 10)",
        "usuario_id": "INTEGER REFERENCES usuarios(id)",
        "fecha_creacion": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "fecha_actualizacion": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Estadísticas en español
router.get("/dev/estadisticas", async (req, res) => {
  try {
    const estadisticas = await pool.query(`
      SELECT 
        COUNT(*) as total_tareas,
        COUNT(CASE WHEN finalizada = true THEN 1 END) as tareas_finalizadas,
        COUNT(CASE WHEN finalizada = false THEN 1 END) as tareas_pendientes,
        COUNT(DISTINCT usuario_id) as total_usuarios,
        AVG(prioridad) as prioridad_promedio
      FROM tareas_academicas
    `);
    
    const recientes = await pool.query(`
      SELECT nombre, finalizada, fecha_asignacion, prioridad
      FROM tareas_academicas 
      ORDER BY fecha_creacion DESC 
      LIMIT 5
    `);
    
    const porPrioridad = await pool.query(`
      SELECT prioridad, COUNT(*) as cantidad
      FROM tareas_academicas 
      GROUP BY prioridad 
      ORDER BY prioridad DESC
    `);
    
    res.json({
      estadisticas: estadisticas.rows[0],
      tareas_recientes: recientes.rows,
      tareas_por_prioridad: porPrioridad.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ver todas las tareas (desarrollo)
router.get("/dev/todas", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT id, nombre, descripcion,
             fecha_asignacion, hora_asignacion,
             fecha_entrega, hora_entrega,
             finalizada, prioridad, usuario_id,
             fecha_creacion, fecha_actualizacion
      FROM tareas_academicas 
      ORDER BY fecha_asignacion DESC, prioridad DESC
    `);
    res.json({
      total: resultado.rows.length,
      tareas: resultado.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tareas próximas a vencer
router.get("/dev/proximas-vencer", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT * FROM tareas_academicas 
      WHERE fecha_entrega IS NOT NULL 
      AND fecha_entrega >= CURRENT_DATE 
      AND finalizada = false
      ORDER BY fecha_entrega ASC 
      LIMIT 10
    `);
    
    res.json({
      total: resultado.rows.length,
      tareas_proximas_vencer: resultado.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tareas por prioridad
router.get("/dev/por-prioridad/:prioridad", async (req, res) => {
  try {
    const { prioridad } = req.params;
    const resultado = await pool.query(`
      SELECT * FROM tareas_academicas 
      WHERE prioridad = $1 
      ORDER BY fecha_asignacion DESC
    `, [prioridad]);
    
    res.json({
      prioridad: parseInt(prioridad),
      total: resultado.rows.length,
      tareas: resultado.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;