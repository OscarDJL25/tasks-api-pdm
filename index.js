import dotenv from "dotenv";
import express from "express";
import taskRoutes from "./routes/tasks.js";
import tareasRoutes from "./routes/tareas.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

// CORS middleware para permitir conexiones desde apps móviles
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// ===== RUTAS EN ESPAÑOL (PRINCIPAL) =====
app.use("/api/tareas", tareasRoutes);
app.use("/api/auth", authRoutes);

// ===== RUTAS ANTERIORES (COMPATIBILIDAD) =====
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => res.send("API Tareas Académicas funcionando ✅ | Proyecto Dispositivos Móviles"));

// Para Vercel serverless functions
export default app;

// Solo para desarrollo local (comentar en producción)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
}