import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

console.log("🚀 Configuración rápida para pgAdmin");
console.log("====================================");
console.log("");
console.log("📋 Copia esta configuración exacta en pgAdmin:");
console.log("");
console.log("General Tab:");
console.log(`  Name: AWS-${Date.now()}`);
console.log("");
console.log("Connection Tab:");
console.log(`  Host: ${process.env.DB_HOST}`);
console.log(`  Port: ${process.env.DB_PORT}`);
console.log(`  Database: ${process.env.DB_NAME}`);
console.log(`  Username: ${process.env.DB_USER}`);
console.log(`  Password: ${process.env.DB_PASSWORD}`);
console.log("");
console.log("SSL Tab:");
console.log("  SSL mode: Require");
console.log("");
console.log("💡 Tip: Guarda esta configuración como plantilla");

// Probar la conexión
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
});

try {
  const client = await pool.connect();
  const result = await client.query('SELECT COUNT(*) as total_tasks FROM tasks');
  console.log(`✅ Conexión verificada - Total de tareas: ${result.rows[0].total_tasks}`);
  client.release();
  pool.end();
} catch (error) {
  console.error("❌ Error:", error.message);
  pool.end();
}