import express from 'express';
import pool from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

// Endpoint para ejecutar consultas SQL directamente (SOLO PARA DESARROLLO)
app.post('/dev/sql', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Validar que sea una consulta SELECT para seguridad
    if (!query.trim().toLowerCase().startsWith('select')) {
      return res.status(400).json({ 
        error: 'Solo se permiten consultas SELECT por seguridad' 
      });
    }
    
    const result = await pool.query(query);
    res.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields?.map(f => f.name) || []
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      detail: error.detail 
    });
  }
});

// Endpoint para ver todas las tareas
app.get('/dev/all-tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;