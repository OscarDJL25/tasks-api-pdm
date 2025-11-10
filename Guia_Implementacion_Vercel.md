# 🚀 GUÍA PRÁCTICA: IMPLEMENTAR EN VERCEL

## **PASO 1: Preparar el Proyecto**

### Estructura Actual vs Estructura Vercel

**📁 Tu estructura actual:**
```
APIRest/
├── index.js
├── config/db.js
├── controllers/
├── middleware/
├── model/
└── routes/
```

**📁 Estructura requerida para Vercel:**
```
APIRest/
├── api/                    # ← Carpeta obligatoria
│   ├── auth/
│   │   └── login.js       # ← Función serverless
│   └── tasks/
│       ├── index.js       # ← GET /api/tasks
│       ├── create.js      # ← POST /api/tasks  
│       └── [id].js        # ← GET/PUT/DELETE /api/tasks/:id
├── lib/                   # ← Utilities compartidas
│   ├── db.js             # ← Tu config/db.js
│   ├── auth.js           # ← Tu middleware/auth.js
│   └── Task.js           # ← Tu model/Task.js
├── vercel.json           # ← Configuración
└── package.json
```

## **PASO 2: Crear Cuenta en Vercel**

1. **🌐 Ir a vercel.com**
2. **📧 Sign up** con GitHub (recomendado)
3. **🔗 Conectar** tu repositorio de GitHub
4. **✅ Autorizar** Vercel para acceder a tus repos

## **PASO 3: Migrar el Código**

### 3.1 Crear vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

### 3.2 Migrar config/db.js → lib/db.js
```javascript
// lib/db.js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false  // Para DB remotas
  }
});

export default pool;
```

### 3.3 Migrar middleware/auth.js → lib/auth.js
```javascript
// lib/auth.js
import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}
```

### 3.4 Migrar model/Task.js → lib/Task.js
```javascript
// lib/Task.js (sin cambios, solo mover)
import pool from "./db.js";

export class Task {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM Task");
    return rows;
  }
  // ... resto del código igual
}
```

## **PASO 4: Crear Funciones Serverless**

### 4.1 Función de Login
```javascript
// api/auth/login.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const USER = {
  username: "admin",
  passwordHash: await bcrypt.hash("1234", 10),
};

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { username, password } = req.body;

  if (username !== USER.username) {
    return res.status(401).json({ message: "Usuario incorrecto" });
  }

  const valid = await bcrypt.compare(password, USER.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Contraseña incorrecta" });
  }

  const token = jwt.sign(
    { username: USER.username }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );

  res.json({ token, message: "Login exitoso" });
}
```

### 4.2 Función para GET todas las tareas
```javascript
// api/tasks/index.js
import { Task } from "../../lib/Task.js";
import { authenticateToken } from "../../lib/auth.js";

export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  // Aplicar middleware de autenticación
  try {
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch (error) {
    return; // authenticateToken ya envió la respuesta
  }

  try {
    const tasks = await Task.getAll();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
}
```

### 4.3 Función para POST nueva tarea
```javascript
// api/tasks/create.js
import { Task } from "../../lib/Task.js";
import { authenticateToken } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  // Autenticación
  try {
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch (error) {
    return;
  }

  try {
    const newTask = await Task.create(req.body);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error al crear tarea" });
  }
}
```

### 4.4 Función para operaciones por ID
```javascript
// api/tasks/[id].js
import { Task } from "../../lib/Task.js";
import { authenticateToken } from "../../lib/auth.js";

export default async function handler(req, res) {
  const { id } = req.query;

  // Autenticación para todos los métodos
  try {
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch (error) {
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        const task = await Task.getById(id);
        if (!task) {
          return res.status(404).json({ message: "Tarea no encontrada" });
        }
        res.json(task);
        break;

      case 'PUT':
        await Task.update(id, req.body);
        res.json({ message: "Tarea actualizada" });
        break;

      case 'DELETE':
        await Task.delete(id);
        res.json({ message: "Tarea eliminada" });
        break;

      default:
        res.status(405).json({ message: 'Método no permitido' });
    }
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
}
```

## **PASO 5: Configurar Variables de Entorno**

En el dashboard de Vercel:
1. **⚙️ Settings** → **Environment Variables**
2. **➕ Add** las siguientes variables:

```
DB_HOST=tu-host-mysql
DB_USER=tu-usuario  
DB_PASSWORD=tu-password
DB_NAME=tu-database
JWT_SECRET=tu-secreto-super-seguro
```

## **PASO 6: Deploy**

### Opción A: Desde Dashboard
1. **📤 Import Project** en dashboard de Vercel
2. **🔗 Conectar** repositorio de GitHub
3. **🚀 Deploy** automático

### Opción B: Desde CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

## **PASO 7: Probar con Thunder Client**

URLs que obtienes:
```
🌐 Production: https://tu-proyecto-abc123.vercel.app
🧪 Preview: https://tu-proyecto-git-branch-abc123.vercel.app
```

### Requests de prueba:
```http
# 1. Login
POST https://tu-proyecto.vercel.app/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "1234"
}

# 2. Get Tasks
GET https://tu-proyecto.vercel.app/api/tasks
Authorization: Bearer tu_token_aqui

# 3. Create Task
POST https://tu-proyecto.vercel.app/api/tasks/create
Authorization: Bearer tu_token_aqui
Content-Type: application/json

{
  "name": "Tarea desde Vercel",
  "status": "pending",
  "deadline": "2025-11-15"
}
```

## **🎯 Próximos Pasos**

1. **✅ Migrar** código siguiendo esta estructura
2. **🔧 Configurar** variables de entorno
3. **🚀 Hacer** primer deploy
4. **🧪 Probar** con Thunder Client
5. **📱 Conectar** tu app móvil

¿Quieres que te ayude con algún paso específico o tienes dudas sobre la migración?