import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pool from "../config/db.js";
dotenv.config();

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario en la base de datos
    const result = await pool.query(
      'SELECT id, username, password FROM users WHERE username = $1', 
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" }
    );
    
    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Endpoint para registrar nuevos usuarios
export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT username FROM users WHERE username = $1', 
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario en la base de datos
    const result = await pool.query(
      'INSERT INTO users (username, password, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id, username, created_at',
      [username, passwordHash]
    );

    const newUser = result.rows[0];

    // Generar token para el usuario recién registrado
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Usuario creado exitosamente",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
