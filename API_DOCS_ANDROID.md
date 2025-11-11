# 📱 API Documentation para Android App

## Base URL
```
https://tasks-api-pdm.vercel.app
```

## Authentication
- **Tipo**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`
- **Obtener token**: `POST /api/auth/login`

## Endpoints

### Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "username": "string",
  "password": "string"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "usuario"
  }
}
```

### Tasks (Requieren Authorization header)

#### Obtener todas las tareas del usuario
```
GET /api/tasks
Authorization: Bearer <token>

Response 200:
[
  {
    "id": 1,
    "name": "Configurar API",
    "status": "completed",
    "deadline": "2025-11-09T00:00:00.000Z",
    "completed": false,
    "created_at": "2025-11-09T21:16:43.143Z",
    "updated_at": "2025-11-09T21:16:43.143Z"
  }
]
```

#### Crear nueva tarea
```
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Nueva tarea",
  "status": "pending",
  "deadline": "2025-12-01"
}
```

#### Actualizar tarea
```
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Tarea actualizada",
  "status": "completed",
  "completed": true
}
```

#### Eliminar tarea
```
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

## Data Models para Android

### Task
```kotlin
data class Task(
    val id: Int,
    val name: String,
    val status: String, // "pending" | "completed" 
    val deadline: String?,
    val completed: Boolean,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at") 
    val updatedAt: String
)
```

### Login
```kotlin
data class LoginRequest(
    val username: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val user: User
)

data class User(
    val id: Int,
    val username: String
)
```

## Error Responses
```json
{
  "error": "string",
  "message": "string"
}
```

## Status Codes
- 200: Success
- 400: Bad Request
- 401: Unauthorized (token inválido/expirado)
- 403: Forbidden
- 404: Not Found
- 500: Server Error