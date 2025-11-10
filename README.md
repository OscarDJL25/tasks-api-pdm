# 📋 Tasks API - Proyecto PDM

API REST para gestión de tareas desarrollada con Node.js, Express y PostgreSQL en AWS RDS.

## 🚀 Características

- ✅ **API REST** completa con operaciones CRUD
- ✅ **Autenticación JWT** para seguridad
- ✅ **PostgreSQL** en AWS RDS como base de datos
- ✅ **Middleware** de autenticación
- ✅ **CORS** configurado para apps móviles
- ✅ **SSL/TLS** ready para deploy en producción

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **JWT** - JSON Web Tokens para autenticación
- **bcryptjs** - Encriptación de contraseñas
- **pg** - Driver PostgreSQL para Node.js
- **dotenv** - Manejo de variables de entorno

## 📊 Estructura del Proyecto

```
📁 tasks-api-pdm/
├── 📁 config/
│   └── db.js              # Configuración de base de datos
├── 📁 controllers/
│   ├── authController.js  # Lógica de autenticación
│   └── taskController.js  # Lógica de tareas
├── 📁 middleware/
│   └── auth.js           # Middleware de autenticación JWT
├── 📁 model/
│   └── Task.js           # Modelo de datos Task
├── 📁 routes/
│   ├── auth.js           # Rutas de autenticación
│   └── tasks.js          # Rutas de tareas
├── 📁 database/
│   └── setup.sql         # Script de creación de tablas
├── index.js              # Servidor principal
├── package.json          # Dependencias y scripts
└── .env.example          # Ejemplo de variables de entorno
```

## 🔧 Instalación y Configuración

### 1. Clonar repositorio
```bash
git clone <url-del-repositorio>
cd tasks-api-pdm
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales de AWS RDS
```

### 4. Configurar base de datos
```sql
-- Ejecutar script en PostgreSQL
-- database/setup.sql
```

### 5. Ejecutar servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🌐 Endpoints de la API

### 🔐 Autenticación

#### POST /api/auth/login
```json
// Request
{
  "username": "admin",
  "password": "1234"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 📋 Gestión de Tareas

#### GET /api/tasks
```bash
Authorization: Bearer <token>
```

#### POST /api/tasks
```json
// Request
{
  "name": "Nueva tarea",
  "status": "pending",
  "deadline": "2025-12-31"
}
```

#### PUT /api/tasks/:id
```json
// Request
{
  "name": "Tarea actualizada",
  "status": "completed",
  "deadline": "2025-12-31"
}
```

#### DELETE /api/tasks/:id
```bash
Authorization: Bearer <token>
```

## 🧪 Testing con Thunder Client

1. **Instalar Thunder Client** en VS Code
2. **Importar collection** desde `Thunder_Client_Guide.md`
3. **Ejecutar requests** en orden:
   - Login → Copiar token
   - GET tasks → Usar token
   - POST/PUT/DELETE → Usar token

## 🚀 Deploy en Vercel

1. **Preparar para deploy:**
   ```bash
   # Estructura requerida para Vercel (funciones serverless)
   ```

2. **Variables de entorno en Vercel:**
   ```
   DB_HOST=tu-rds-endpoint.amazonaws.com
   DB_USER=postgres
   DB_PASSWORD=tu-password
   DB_NAME=Proyecto1PDM
   DB_PORT=5432
   JWT_SECRET=tu-jwt-secret
   ```

## 📱 Conexión con Android

### URLs para Android:
- **Local:** `http://10.0.2.2:3000` (emulador)
- **Producción:** `https://tu-api.vercel.app`

### Headers requeridos:
```java
// Para requests autenticados
Authorization: Bearer <token>
Content-Type: application/json
```

## 🔒 Seguridad

- ✅ **JWT tokens** con expiración
- ✅ **Contraseñas hasheadas** con bcrypt
- ✅ **SSL/TLS** en producción
- ✅ **Variables de entorno** para credenciales
- ✅ **CORS** configurado para domínios específicos

## 📋 Esquema de Base de Datos

### Tabla: tasks
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'Add nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Estudiante PDM** - Proyecto de Programación de Dispositivos Móviles

---

🚀 **¡API lista para conectar con tu app móvil!**