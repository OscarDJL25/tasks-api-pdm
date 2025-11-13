import pool from "../config/db.js";

export const getTasks = async (req, res) => {
  try {
    const userId = req.user?.id; // Del token JWT
    let query = 'SELECT * FROM tasks ORDER BY created_at DESC';
    let params = [];
    
    if (userId) {
      query = 'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC';
      params = [userId];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { name, status = 'pending', deadline } = req.body;
    const userId = req.user?.id; // Del token JWT
    
    const result = await pool.query(`
      INSERT INTO tasks (name, status, deadline, completed, created_at, updated_at, user_id)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $5)
      RETURNING *
    `, [name, status, deadline, status === 'completed', userId]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { name, status, deadline, completed } = req.body;
    const result = await pool.query(`
      UPDATE tasks 
      SET name = $1, status = $2, deadline = $3, completed = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [name, status, deadline, completed, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    res.json({ message: "Tarea eliminada", task: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
