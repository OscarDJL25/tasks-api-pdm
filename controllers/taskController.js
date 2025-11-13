import pool from "../config/db.js";

// CRUD para tabla TAREAS (estructura académica)
export const getTareas = async (req, res) => {
  try {
    const userId = req.user?.id; 
    let query = 'SELECT * FROM tareas ORDER BY fecha_asignacion DESC, prioridad DESC';
    let params = [];
    
    if (userId) {
      query = 'SELECT * FROM tareas WHERE user_id = $1 ORDER BY fecha_asignacion DESC, prioridad DESC';
      params = [userId];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTarea = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tareas WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTarea = async (req, res) => {
  try {
    const { 
      nombre, 
      descripcion = null, 
      fecha_asignacion,
      hora_asignacion,
      fecha_entrega = null,
      hora_entrega = null,
      finalizada = false,
      prioridad 
    } = req.body;
    
    const userId = req.user?.id;
    
    // Validaciones
    if (!nombre || nombre.length > 100) {
      return res.status(400).json({ error: "Nombre es requerido y debe tener máximo 100 caracteres" });
    }
    
    if (!fecha_asignacion || !hora_asignacion) {
      return res.status(400).json({ error: "Fecha y hora de asignación son requeridas" });
    }
    
    if (!prioridad || prioridad < 1 || prioridad > 10) {
      return res.status(400).json({ error: "Prioridad debe estar entre 1 y 10" });
    }
    
    const result = await pool.query(`
      INSERT INTO tareas (
        nombre, descripcion, fecha_asignacion, hora_asignacion, 
        fecha_entrega, hora_entrega, finalizada, prioridad, 
        user_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [nombre, descripcion, fecha_asignacion, hora_asignacion, fecha_entrega, hora_entrega, finalizada, prioridad, userId]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTarea = async (req, res) => {
  try {
    const { 
      nombre, 
      descripcion, 
      fecha_asignacion,
      hora_asignacion,
      fecha_entrega,
      hora_entrega,
      finalizada,
      prioridad 
    } = req.body;
    
    // Validaciones si se proporcionan
    if (nombre && nombre.length > 100) {
      return res.status(400).json({ error: "Nombre debe tener máximo 100 caracteres" });
    }
    
    if (prioridad && (prioridad < 1 || prioridad > 10)) {
      return res.status(400).json({ error: "Prioridad debe estar entre 1 y 10" });
    }
    
    const result = await pool.query(`
      UPDATE tareas 
      SET 
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        fecha_asignacion = COALESCE($3, fecha_asignacion),
        hora_asignacion = COALESCE($4, hora_asignacion),
        fecha_entrega = COALESCE($5, fecha_entrega),
        hora_entrega = COALESCE($6, hora_entrega),
        finalizada = COALESCE($7, finalizada),
        prioridad = COALESCE($8, prioridad),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [nombre, descripcion, fecha_asignacion, hora_asignacion, fecha_entrega, hora_entrega, finalizada, prioridad, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTarea = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tareas WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    res.json({ message: "Tarea eliminada", tarea: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Endpoint para marcar tarea como completada/pendiente
export const toggleTareaFinalizada = async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE tareas 
      SET finalizada = NOT finalizada, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    res.json({
      message: `Tarea marcada como ${result.rows[0].finalizada ? 'finalizada' : 'pendiente'}`,
      tarea: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// MANTENER endpoints antiguos para compatibilidad
export const getTasks = getTareas;
export const getTask = getTarea;
export const createTask = createTarea;
export const updateTask = updateTarea;
export const deleteTask = deleteTarea;
