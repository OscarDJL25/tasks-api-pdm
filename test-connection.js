import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

console.log('=== Configuración de conexión ===');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('Port:', process.env.DB_PORT);
console.log('Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'undefined');

// Prueba con SSL
const poolSSL = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

// Prueba sin SSL (para comparar)
const poolNoSSL = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: false
});

async function testConnection() {
  console.log('\n=== Probando conexión con SSL ===');
  try {
    const client = await poolSSL.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Conexión SSL exitosa:', result.rows[0]);
    client.release();
  } catch (error) {
    console.log('❌ Error con SSL:', error.message);
  }

  console.log('\n=== Probando conexión sin SSL ===');
  try {
    const client = await poolNoSSL.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Conexión sin SSL exitosa:', result.rows[0]);
    client.release();
  } catch (error) {
    console.log('❌ Error sin SSL:', error.message);
  }

  console.log('\n=== Probando con different SSL config ===');
  const poolRequireSSL = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  });

  try {
    const client = await poolRequireSSL.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Conexión SSL require exitosa:', result.rows[0]);
    client.release();
  } catch (error) {
    console.log('❌ Error SSL require:', error.message);
  }

  process.exit(0);
}

testConnection();