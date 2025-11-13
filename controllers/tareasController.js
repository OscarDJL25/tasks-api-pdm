import pool from "../config/db.js";

// CRUD para tabla tareas_academicas (estructura en español)
export const obtenerTareas = async (req, res) => {
  try {
    const usuarioId = req.user?.id; 
    let consulta = 'SELECT * FROM tareas_academicas ORDER BY fecha_asignacion DESC, prioridad DESC';
    let parametros = [];
    
    if (usuarioId) {
      consulta = 'SELECT * FROM tareas_academicas WHERE usuario_id = $1 ORDER BY fecha_asignacion DESC, prioridad DESC';
      parametros = [usuarioId];
    }
    
    const resultado = await pool.query(consulta, parametros);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerTarea = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM tareas_academicas WHERE id = $1', [req.params.id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const crearTarea = async (req, res) => {
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
    
    const usuarioId = req.user?.id;
    
    // Validaciones
    if (!nombre || nombre.length > 100) {
      return res.status(400).json({ error: "Nombre es requerido y debe tener maximo 100 caracteres" });
    }
    
    if (!fecha_asignacion || !hora_asignacion) {
      return res.status(400).json({ error: "Fecha y hora de asignacion son requeridas" });
    }
    
    if (!prioridad || prioridad < 1 || prioridad > 10) {
      return res.status(400).json({ error: "Prioridad debe estar entre 1 y 10" });
    }
    
    const resultado = await pool.query(`
      INSERT INTO tareas_academicas (
        nombre, descripcion, fecha_asignacion, hora_asignacion, 
        fecha_entrega, hora_entrega, finalizada, prioridad, 
        usuario_id, fecha_creacion, fecha_actualizacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [nombre, descripcion, fecha_asignacion, hora_asignacion, fecha_entrega, hora_entrega, finalizada, prioridad, usuarioId]);
    
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const actualizarTarea = async (req, res) => {
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
      return res.status(400).json({ error: "Nombre debe tener maximo 100 caracteres" });
    }
    
    if (prioridad && (prioridad < 1 || prioridad > 10)) {
      return res.status(400).json({ error: "Prioridad debe estar entre 1 y 10" });
    }
    
    const resultado = await pool.query(`
      UPDATE tareas_academicas 
      SET 
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        fecha_asignacion = COALESCE($3, fecha_asignacion),
        hora_asignacion = COALESCE($4, hora_asignacion),
        fecha_entrega = COALESCE($5, fecha_entrega),
        hora_entrega = COALESCE($6, hora_entrega),
        finalizada = COALESCE($7, finalizada),
        prioridad = COALESCE($8, prioridad),
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [nombre, descripcion, fecha_asignacion, hora_asignacion, fecha_entrega, hora_entrega, finalizada, prioridad, req.params.id]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }
    
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const eliminarTarea = async (req, res) => {
  try {
    const resultado = await pool.query('DELETE FROM tareas_academicas WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }
    
    res.json({ mensaje: "Tarea eliminada", tarea: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Endpoint para alternar estado finalizada
export const alternarTareaFinalizada = async (req, res) => {
  try {
    const resultado = await pool.query(`
      UPDATE tareas_academicas 
      SET finalizada = NOT finalizada, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }
    
    res.json({
      mensaje: `Tarea marcada como ${resultado.rows[0].finalizada ? 'finalizada' : 'pendiente'}`,
      tarea: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// MANTENER endpoints anteriores para compatibilidad
export const getTasks = obtenerTareas;
export const getTask = obtenerTarea;
export const createTask = crearTarea;
export const updateTask = actualizarTarea;
export const deleteTask = eliminarTarea;
export const getTareas = obtenerTareas;
export const getTarea = obtenerTarea;
export const createTarea = crearTarea;
export const updateTarea = actualizarTarea;
export const deleteTarea = eliminarTarea;
export const toggleTareaFinalizada = alternarTareaFinalizada;