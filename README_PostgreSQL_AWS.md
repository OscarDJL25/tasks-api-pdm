# 🚀 API REST + PostgreSQL AWS + App Móvil

## 🎯 **Tu Proyecto Real**

**📱 Arquitectura:**
```
App Móvil (React Native/Flutter)
         ↕️ HTTPS
API REST (Node.js + Express)
         ↕️ SSL
PostgreSQL en AWS RDS
```

## 🔧 **Configuración PostgreSQL AWS**

### **✅ Lo que ya tienes configurado:**
- ✅ **Express API** con estructura MVC
- ✅ **JWT Authentication** para seguridad
- ✅ **PostgreSQL driver** (pg) instalado
- ✅ **Middleware** de autenticación
- ✅ **Variables de entorno** configuradas

### **🔗 Conexión a AWS RDS:**
```javascript
// config/db.js - CONFIGURADO ✅
const pool = new Pool({
  host: process.env.DB_HOST,        // tu-rds.amazonaws.com
  user: process.env.DB_USER,        // postgres
  password: process.env.DB_PASSWORD, // tu-password
  database: process.env.DB_NAME,    // tasks_db
  port: 5432,
  ssl: { rejectUnauthorized: false } // Para AWS RDS
});
```

## 📊 **Esquema de Base de Datos (PostgreSQL)**

```sql
-- Tabla: tasks
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,           -- Auto-increment
    name VARCHAR(255) NOT NULL,      -- Nombre de la tarea
    status VARCHAR(50) DEFAULT 'pending', -- pending, in-progress, completed
    deadline DATE,                   -- Fecha límite
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 **Endpoints de tu API**

### **🔐 Autenticación**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "1234"
}

# Respuesta:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Login exitoso"
}
```

### **📋 Gestión de Tareas**
```http
# Obtener todas las tareas
GET /api/tasks
Authorization: Bearer {token}

# Crear nueva tarea
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Conectar app móvil",
  "status": "pending",
  "deadline": "2025-11-15"
}

# Obtener tarea por ID
GET /api/tasks/1
Authorization: Bearer {token}

# Actualizar tarea
PUT /api/tasks/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "App móvil conectada",
  "status": "completed",
  "deadline": "2025-11-15"
}

# Eliminar tarea
DELETE /api/tasks/1
Authorization: Bearer {token}
```

## 🧪 **Testing con Thunder Client**

### **Configurar Environments:**

**🏠 Development (Local):**
```json
{
  "baseUrl": "http://localhost:3000",
  "token": ""
}
```

**☁️ Production (Vercel/Railway):**
```json
{
  "baseUrl": "https://tu-api.vercel.app",
  "token": ""
}
```

### **Flujo de Testing:**
1. **🔐 Login** → Copiar token
2. **📝 Actualizar** variable `token` en environment
3. **🧪 Probar** todos los endpoints
4. **✅ Validar** responses y status codes

## 📱 **Integración con App Móvil**

### **Headers requeridos:**
```javascript
// En tu app móvil (React Native/Flutter)
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

### **Ejemplo React Native:**
```javascript
// Login
const login = async (username, password) => {
  const response = await fetch('https://tu-api.vercel.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  return data.token;
};

// Get Tasks
const getTasks = async (token) => {
  const response = await fetch('https://tu-api.vercel.app/api/tasks', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

## 🚀 **Despliegue en Vercel**

### **Ventajas para tu proyecto:**
- ✅ **HTTPS automático** - Requerido para apps móviles
- ✅ **Deploy desde Git** - Actualización automática
- ✅ **Variables de entorno** - Credenciales AWS seguras
- ✅ **Escalabilidad** - Crece con tu app
- ✅ **$0 costo inicial** - Perfecto para desarrollo

### **Variables en Vercel:**
```
DB_HOST=tu-rds-endpoint.amazonaws.com
DB_USER=postgres
DB_PASSWORD=tu-password-aws
DB_NAME=tasks_db
DB_PORT=5432
JWT_SECRET=tu-jwt-secret-seguro
```

## 🔧 **Pasos para Deploy**

### **Opción 1: Vercel (Recomendado)**
1. **📁 Reestructurar** para funciones serverless
2. **🌐 Deploy** en Vercel
3. **🔐 HTTPS** automático

### **Opción 2: Railway (Más fácil)**
1. **📤 Push** código actual a GitHub
2. **🔗 Conectar** Railway con GitHub
3. **⚙️ Configurar** variables de entorno
4. **🚀 Deploy** automático

### **Opción 3: Render**
1. **📂 Subir** proyecto a GitHub
2. **🌐 Crear** Web Service en Render
3. **📝 Configurar** build command: `npm install`
4. **▶️ Configurar** start command: `npm start`

## ✅ **Checklist de Implementación**

- ✅ **PostgreSQL** configurado (HECHO)
- ✅ **AWS RDS** conexión preparada
- ✅ **JWT** autenticación funcionando
- ✅ **Modelo Task** adaptado para PostgreSQL
- ✅ **Thunder Client** listo para testing
- 🔄 **Deploy** en plataforma cloud
- 🔄 **Variables** de entorno configuradas
- 🔄 **App móvil** conectada
- 🔄 **Testing** end-to-end

## 📞 **Próximos Pasos**

1. **🗄️ Crear** base de datos en AWS RDS
2. **🔧 Configurar** archivo `.env` con credenciales reales
3. **🧪 Probar** conexión local con Thunder Client
4. **🚀 Elegir** plataforma de deploy (Vercel/Railway/Render)
5. **📱 Integrar** con tu app móvil

¿En qué paso específico necesitas ayuda?