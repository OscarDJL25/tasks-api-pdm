import express from "express";
import {
  iniciarSesion,
  registrarUsuario,
  obtenerPerfil,
  // Mantener compatibilidad
  login,
  register
} from "../controllers/authController_espanol.js";
import { verifyToken } from "../middleware/auth.js";
import pool from "../config/db.js";

const router = express.Router();

// ===== RUTAS EN ESPAÑOL (PRINCIPAL) =====
router.post("/iniciar-sesion", iniciarSesion);
router.post("/registrar", registrarUsuario);
router.get("/perfil", verifyToken, obtenerPerfil);

// ===== RUTAS ANTERIORES (COMPATIBILIDAD) =====
router.post("/login", login);
router.post("/register", register);

// ===== ENDPOINTS DE DESARROLLO =====

// Verificar estado de autenticación
router.get("/dev/verificar", verifyToken, (req, res) => {
  res.json({
    mensaje: "Token válido",
    usuario_id: req.user.id,
    nombre_usuario: req.user.username,
    token_valido: true
  });
});

// Ver todos los usuarios (desarrollo)
router.get("/dev/usuarios", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        id, 
        nombre_usuario, 
        fecha_creacion,
        (SELECT COUNT(*) FROM tareas_academicas WHERE usuario_id = usuarios.id) as total_tareas
      FROM usuarios 
      ORDER BY fecha_creacion DESC
    `);
    
    res.json({
      total_usuarios: resultado.rows.length,
      usuarios: resultado.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Estadísticas de usuario específico
router.get("/dev/usuarios/:id/estadisticas", async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await pool.query(`
      SELECT id, nombre_usuario, fecha_creacion 
      FROM usuarios 
      WHERE id = $1
    `, [id]);
    
    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    const estadisticas = await pool.query(`
      SELECT 
        COUNT(*) as total_tareas,
        COUNT(CASE WHEN finalizada = true THEN 1 END) as tareas_finalizadas,
        COUNT(CASE WHEN finalizada = false THEN 1 END) as tareas_pendientes,
        AVG(prioridad) as prioridad_promedio,
        MIN(fecha_asignacion) as primera_tarea,
        MAX(fecha_asignacion) as ultima_tarea
      FROM tareas_academicas 
      WHERE usuario_id = $1
    `, [id]);
    
    res.json({
      usuario: usuario.rows[0],
      estadisticas: estadisticas.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear usuarios de prueba
router.post("/dev/crear-usuarios-prueba", async (req, res) => {
  try {
    const usuariosPrueba = [
      { nombre: "estudiante1", contrasena: "academico123" },
      { nombre: "estudiante2", contrasena: "academico456" },
      { nombre: "profesor1", contrasena: "profesor123" }
    ];
    
    const resultados = [];
    
    for (const usuario of usuariosPrueba) {
      try {
        const request = {
          body: {
            nombre_usuario: usuario.nombre,
            contrasena: usuario.contrasena
          }
        };
        
        // Simular respuesta
        let responseData = null;
        const response = {
          status: (code) => ({ json: (data) => { responseData = data; } }),
          json: (data) => { responseData = data; }
        };
        
        await registrarUsuario(request, response);
        resultados.push({
          nombre_usuario: usuario.nombre,
          estado: "creado",
          datos: responseData
        });
      } catch (error) {
        resultados.push({
          nombre_usuario: usuario.nombre,
          estado: "error",
          error: error.message
        });
      }
    }
    
    res.json({
      mensaje: "Creación de usuarios de prueba completada",
      resultados: resultados
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
