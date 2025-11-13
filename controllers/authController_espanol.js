import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pool from "../config/db.js";
dotenv.config();

export const iniciarSesion = async (req, res) => {
  try {
    const { nombre_usuario, contrasena } = req.body;

    // Buscar usuario en la base de datos
    const resultado = await pool.query(
      'SELECT id, nombre_usuario, contrasena FROM usuarios WHERE nombre_usuario = $1', 
      [nombre_usuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ mensaje: "Usuario no encontrado" });
    }

    const usuario = resultado.rows[0];

    // Verificar contraseña
    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) {
      return res.status(401).json({ mensaje: "Contrasena incorrecta" });
    }

    // Generar token JWT (duración: 1 año)
    const token = jwt.sign(
      { id: usuario.id, nombre_usuario: usuario.nombre_usuario }, 
      process.env.JWT_SECRET, 
      { expiresIn: "365d" } // 1 año
    );
    
    res.json({ 
      token,
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario
      }
    });

  } catch (error) {
    console.error('Error en iniciar sesion:', error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Endpoint para registrar nuevos usuarios
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre_usuario, contrasena } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await pool.query(
      'SELECT nombre_usuario FROM usuarios WHERE nombre_usuario = $1', 
      [nombre_usuario]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ mensaje: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const rondas = 10;
    const contrasenaEncriptada = await bcrypt.hash(contrasena, rondas);

    // Crear usuario en la base de datos
    const resultado = await pool.query(
      'INSERT INTO usuarios (nombre_usuario, contrasena, fecha_creacion) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id, nombre_usuario, fecha_creacion',
      [nombre_usuario, contrasenaEncriptada]
    );

    const nuevoUsuario = resultado.rows[0];

    // Generar token para el usuario recién registrado (duración: 1 año)
    const token = jwt.sign(
      { id: nuevoUsuario.id, nombre_usuario: nuevoUsuario.nombre_usuario }, 
      process.env.JWT_SECRET, 
      { expiresIn: "365d" } // 1 año
    );

    res.status(201).json({
      mensaje: "Usuario creado exitosamente",
      token,
      usuario: {
        id: nuevoUsuario.id,
        nombre_usuario: nuevoUsuario.nombre_usuario,
        fecha_creacion: nuevoUsuario.fecha_creacion
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// ===== FUNCIÓN ADICIONAL: OBTENER PERFIL =====
export const obtenerPerfil = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    
    const resultado = await pool.query(`
      SELECT id, nombre_usuario, fecha_creacion
      FROM usuarios 
      WHERE id = $1
    `, [usuarioId]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    const estadisticas = await pool.query(`
      SELECT 
        COUNT(*) as total_tareas,
        COUNT(CASE WHEN finalizada = true THEN 1 END) as tareas_finalizadas,
        COUNT(CASE WHEN finalizada = false THEN 1 END) as tareas_pendientes,
        AVG(prioridad) as prioridad_promedio
      FROM tareas_academicas 
      WHERE usuario_id = $1
    `, [usuarioId]);
    
    res.json({
      usuario: resultado.rows[0],
      estadisticas: estadisticas.rows[0] || {
        total_tareas: 0,
        tareas_finalizadas: 0,
        tareas_pendientes: 0,
        prioridad_promedio: null
      }
    });
    
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ===== EXPORTACIONES DE COMPATIBILIDAD =====
export const login = iniciarSesion;
export const register = registrarUsuario;