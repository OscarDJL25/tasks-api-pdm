# 🧪 GUÍA THUNDER CLIENT - API TASKS

## 📋 **Collection: API Tasks - PostgreSQL AWS**

### **⚙️ Environment Variables**

**Local Development:**
```json
{
  "baseUrl": "http://localhost:3000",
  "token": ""
}
```

**Production (cuando despliegues):**
```json
{
  "baseUrl": "https://tu-api.vercel.app",
  "token": ""
}
```

---

## 🔐 **1. LOGIN - Obtener JWT Token**

**Request:**
```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "1234"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login exitoso"
}
```

**✅ Pasos:**
1. Ejecutar este request
2. **Copiar el token** de la respuesta
3. **Actualizar variable `token`** en environment
4. Usar ese token en todos los requests siguientes

---

## 📋 **2. GET ALL TASKS - Obtener todas las tareas**

**Request:**
```http
GET {{baseUrl}}/api/tasks
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Configurar API",
    "status": "completed",
    "deadline": "2025-11-09T06:00:00.000Z",
    "created_at": "2025-11-10T03:16:43.143Z",
    "updated_at": "2025-11-10T03:16:43.143Z"
  },
  {
    "id": 2,
    "name": "Conectar con AWS",
    "status": "completed",
    "deadline": "2025-11-09T06:00:00.000Z",
    "created_at": "2025-11-10T03:16:43.143Z",
    "updated_at": "2025-11-10T03:16:43.143Z"
  }
]
```

---

## ➕ **3. CREATE TASK - Crear nueva tarea**

**Request:**
```http
POST {{baseUrl}}/api/tasks
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Probar Thunder Client",
  "status": "pending",
  "deadline": "2025-11-12"
}
```

**Expected Response:**
```json
{
  "id": 5,
  "name": "Probar Thunder Client",
  "status": "pending",
  "deadline": "2025-11-12T06:00:00.000Z",
  "created_at": "2025-11-10T03:20:00.000Z",
  "updated_at": "2025-11-10T03:20:00.000Z"
}
```

---

## 🔍 **4. GET TASK BY ID - Obtener tarea específica**

**Request:**
```http
GET {{baseUrl}}/api/tasks/1
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Configurar API",
  "status": "completed",
  "deadline": "2025-11-09T06:00:00.000Z",
  "created_at": "2025-11-10T03:16:43.143Z",
  "updated_at": "2025-11-10T03:16:43.143Z"
}
```

---

## ✏️ **5. UPDATE TASK - Actualizar tarea**

**Request:**
```http
PUT {{baseUrl}}/api/tasks/3
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Thunder Client probado",
  "status": "completed",
  "deadline": "2025-11-10"
}
```

**Expected Response:**
```json
{
  "id": 3,
  "name": "Thunder Client probado",
  "status": "completed",
  "deadline": "2025-11-10T06:00:00.000Z",
  "created_at": "2025-11-10T03:16:43.143Z",
  "updated_at": "2025-11-10T03:25:00.000Z"
}
```

---

## 🗑️ **6. DELETE TASK - Eliminar tarea**

**Request:**
```http
DELETE {{baseUrl}}/api/tasks/4
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "id": 4,
  "name": "Conectar app móvil",
  "status": "pending",
  "deadline": "2025-11-11T06:00:00.000Z",
  "created_at": "2025-11-10T03:16:43.143Z",
  "updated_at": "2025-11-10T03:16:43.143Z"
}
```

---

## ❌ **7. ERROR CASES - Casos de error**

### **Sin token:**
```http
GET {{baseUrl}}/api/tasks
# SIN Authorization header
```
**Response:** `401 Unauthorized`

### **Token inválido:**
```http
GET {{baseUrl}}/api/tasks
Authorization: Bearer token-invalido
```
**Response:** `403 Forbidden`

### **Tarea no encontrada:**
```http
GET {{baseUrl}}/api/tasks/999
Authorization: Bearer {{token}}
```
**Response:** `404 Not Found`

---

## 📊 **8. VALIDATION TESTS**

### **Status Codes esperados:**
- ✅ `200` - GET exitoso
- ✅ `201` - POST exitoso (creación)
- ✅ `401` - Sin token
- ✅ `403` - Token inválido
- ✅ `404` - Recurso no encontrado
- ✅ `500` - Error del servidor

### **Headers a verificar:**
- ✅ `Content-Type: application/json`
- ✅ `Authorization: Bearer <token>`

### **Estructura JSON:**
- ✅ Todos los campos requeridos presentes
- ✅ Tipos de datos correctos (string, number, date)
- ✅ IDs como números enteros
- ✅ Fechas en formato ISO

---

## 🚀 **9. PASOS PARA TESTING COMPLETO**

1. **🔐 Login** → Obtener token
2. **📝 Actualizar** variable `token` en environment
3. **📋 GET all** → Verificar datos existentes
4. **➕ CREATE** → Crear nueva tarea
5. **🔍 GET by ID** → Verificar tarea creada
6. **✏️ UPDATE** → Modificar tarea
7. **📋 GET all** → Verificar cambios
8. **🗑️ DELETE** → Eliminar tarea
9. **📋 GET all** → Confirmar eliminación

## ✅ **Todo funcionando = API lista para app móvil!**