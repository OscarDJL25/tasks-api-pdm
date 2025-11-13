# 📱 DOCUMENTACIÓN COMPLETA API PARA ANDROID STUDIO + GEMINI

## 🌐 INFORMACIÓN DE LA API

### Base URL
```
https://tasks-api-pdm.vercel.app
```

### Autenticación
- **Tipo**: JWT Bearer Token
- **Duración**: 365 días (1 año)
- **Header**: `Authorization: Bearer <token>`

---

## 📋 ENDPOINTS PRINCIPALES

### 🔐 AUTENTICACIÓN

#### 1. Registrar Usuario
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "username": "string",
  "password": "string"
}

Success Response (201):
{
  "message": "Usuario creado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "mi_usuario",
    "created_at": "2025-11-13T..."
  }
}

Error Responses:
400: {"message": "El usuario ya existe"}
500: {"message": "Error interno del servidor"}
```

#### 2. Login
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "username": "string",
  "password": "string"
}

Success Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "mi_usuario"
  }
}

Error Responses:
401: {"message": "Usuario no encontrado"}
401: {"message": "Contraseña incorrecta"}
500: {"message": "Error interno del servidor"}
```

### 📋 TAREAS (Requieren Authorization Header)

#### 3. Obtener Todas las Tareas del Usuario
```
GET /api/tasks
Authorization: Bearer <token>

Success Response (200):
[
  {
    "id": 1,
    "name": "Configurar API",
    "status": "completed",
    "deadline": "2025-11-09T00:00:00.000Z",
    "completed": false,
    "created_at": "2025-11-09T21:16:43.143Z",
    "updated_at": "2025-11-09T21:16:43.143Z",
    "user_id": 1
  }
]

Error Responses:
401: {"message": "Token requerido"}
403: {"message": "Token inválido o expirado"}
500: {"error": "mensaje de error"}
```

#### 4. Obtener Tarea Específica
```
GET /api/tasks/:id
Authorization: Bearer <token>

Success Response (200):
{
  "id": 1,
  "name": "Configurar API",
  "status": "completed",
  "deadline": "2025-11-09T00:00:00.000Z",
  "completed": false,
  "created_at": "2025-11-09T21:16:43.143Z",
  "updated_at": "2025-11-09T21:16:43.143Z",
  "user_id": 1
}

Error Responses:
404: {"message": "Tarea no encontrada"}
401: {"message": "Token requerido"}
500: {"error": "mensaje de error"}
```

#### 5. Crear Nueva Tarea
```
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "string (requerido)",
  "status": "string (opcional, default: 'pending')",
  "deadline": "string (opcional, formato: YYYY-MM-DD)"
}

Ejemplo:
{
  "name": "Completar proyecto Android",
  "status": "pending",
  "deadline": "2025-12-01"
}

Success Response (201):
{
  "id": 7,
  "name": "Completar proyecto Android",
  "status": "pending",
  "deadline": "2025-12-01T00:00:00.000Z",
  "completed": false,
  "created_at": "2025-11-13T...",
  "updated_at": "2025-11-13T...",
  "user_id": 1
}

Error Responses:
401: {"message": "Token requerido"}
500: {"error": "mensaje de error"}
```

#### 6. Actualizar Tarea
```
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body (todos los campos son opcionales):
{
  "name": "string",
  "status": "string",
  "deadline": "string",
  "completed": "boolean"
}

Ejemplo:
{
  "name": "Tarea actualizada",
  "status": "completed",
  "completed": true
}

Success Response (200):
{
  "id": 1,
  "name": "Tarea actualizada",
  "status": "completed",
  "deadline": "2025-12-01T00:00:00.000Z",
  "completed": true,
  "created_at": "2025-11-09T21:16:43.143Z",
  "updated_at": "2025-11-13T...",
  "user_id": 1
}

Error Responses:
404: {"message": "Tarea no encontrada"}
401: {"message": "Token requerido"}
500: {"error": "mensaje de error"}
```

#### 7. Eliminar Tarea
```
DELETE /api/tasks/:id
Authorization: Bearer <token>

Success Response (200):
{
  "message": "Tarea eliminada",
  "task": {
    "id": 1,
    "name": "Tarea eliminada",
    ...
  }
}

Error Responses:
404: {"message": "Tarea no encontrada"}
401: {"message": "Token requerido"}
500: {"error": "mensaje de error"}
```

---

## 📱 MODELOS DE DATOS PARA ANDROID

### User
```kotlin
data class User(
    val id: Int,
    val username: String,
    @SerializedName("created_at")
    val createdAt: String? = null
)
```

### Task
```kotlin
data class Task(
    val id: Int,
    val name: String,
    val status: String, // "pending" | "completed"
    val deadline: String?, // ISO 8601 format o null
    val completed: Boolean,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at") 
    val updatedAt: String,
    @SerializedName("user_id")
    val userId: Int
)
```

### Auth Models
```kotlin
// Request models
data class LoginRequest(
    val username: String,
    val password: String
)

data class RegisterRequest(
    val username: String,
    val password: String
)

data class CreateTaskRequest(
    val name: String,
    val status: String = "pending",
    val deadline: String? = null
)

data class UpdateTaskRequest(
    val name: String? = null,
    val status: String? = null,
    val deadline: String? = null,
    val completed: Boolean? = null
)

// Response models
data class AuthResponse(
    val token: String,
    val user: User,
    val message: String? = null
)

data class ErrorResponse(
    val message: String? = null,
    val error: String? = null
)
```

---

## 🔌 RETROFIT SERVICE INTERFACE

```kotlin
interface TaskApiService {
    
    // Auth endpoints
    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse
    
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse
    
    // Task endpoints (requieren token automático)
    @GET("api/tasks")
    suspend fun getTasks(): List<Task>
    
    @GET("api/tasks/{id}")
    suspend fun getTask(@Path("id") id: Int): Task
    
    @POST("api/tasks")
    suspend fun createTask(@Body request: CreateTaskRequest): Task
    
    @PUT("api/tasks/{id}")
    suspend fun updateTask(@Path("id") id: Int, @Body request: UpdateTaskRequest): Task
    
    @DELETE("api/tasks/{id}")
    suspend fun deleteTask(@Path("id") id: Int): DeleteResponse
    
    companion object {
        const val BASE_URL = "https://tasks-api-pdm.vercel.app/"
    }
}

data class DeleteResponse(
    val message: String,
    val task: Task
)
```

---

## 🔧 CONFIGURACIÓN RETROFIT + INTERCEPTOR

```kotlin
// Auth Interceptor
class AuthInterceptor(private val tokenManager: TokenManager) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenManager.getToken()
        val request = if (token != null) {
            chain.request().newBuilder()
                .header("Authorization", "Bearer $token")
                .header("Content-Type", "application/json")
                .build()
        } else {
            chain.request().newBuilder()
                .header("Content-Type", "application/json")
                .build()
        }
        return chain.proceed(request)
    }
}

// Token Manager
class TokenManager(private val sharedPreferences: SharedPreferences) {
    
    fun saveToken(token: String) {
        sharedPreferences.edit()
            .putString("auth_token", token)
            .apply()
    }
    
    fun getToken(): String? {
        return sharedPreferences.getString("auth_token", null)
    }
    
    fun clearToken() {
        sharedPreferences.edit()
            .remove("auth_token")
            .apply()
    }
    
    fun hasToken(): Boolean {
        return getToken() != null
    }
}

// Retrofit Configuration
object RetrofitClient {
    
    fun create(context: Context): TaskApiService {
        val sharedPrefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        val tokenManager = TokenManager(sharedPrefs)
        
        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(tokenManager))
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .build()
            
        val retrofit = Retrofit.Builder()
            .baseUrl(TaskApiService.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            
        return retrofit.create(TaskApiService::class.java)
    }
}
```

---

## 📋 REPOSITORY PATTERN

```kotlin
class TaskRepository(
    private val apiService: TaskApiService,
    private val tokenManager: TokenManager
) {
    
    suspend fun login(username: String, password: String): Result<AuthResponse> {
        return try {
            val response = apiService.login(LoginRequest(username, password))
            tokenManager.saveToken(response.token)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun register(username: String, password: String): Result<AuthResponse> {
        return try {
            val response = apiService.register(RegisterRequest(username, password))
            tokenManager.saveToken(response.token)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getTasks(): Result<List<Task>> {
        return try {
            val tasks = apiService.getTasks()
            Result.success(tasks)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createTask(name: String, status: String = "pending", deadline: String? = null): Result<Task> {
        return try {
            val task = apiService.createTask(CreateTaskRequest(name, status, deadline))
            Result.success(task)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateTask(id: Int, name: String?, status: String?, deadline: String?, completed: Boolean?): Result<Task> {
        return try {
            val task = apiService.updateTask(id, UpdateTaskRequest(name, status, deadline, completed))
            Result.success(task)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteTask(id: Int): Result<Unit> {
        return try {
            apiService.deleteTask(id)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun logout() {
        tokenManager.clearToken()
    }
    
    fun isLoggedIn(): Boolean {
        return tokenManager.hasToken()
    }
}
```

---

## 🎯 DEPENDENCIAS NECESARIAS (build.gradle.kts)

```kotlin
dependencies {
    // Retrofit
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.7.0")
    
    // JSON
    implementation("com.google.code.gson:gson:2.10.1")
}
```

---

## 🚀 FLUJO DE USO RECOMENDADO

### 1. Inicialización
```kotlin
// En Application o MainActivity
val apiService = RetrofitClient.create(context)
val tokenManager = TokenManager(sharedPreferences)
val repository = TaskRepository(apiService, tokenManager)
```

### 2. Login/Register
```kotlin
// Login
viewModel.login(username, password) { success ->
    if (success) {
        // Navegar a pantalla principal
    } else {
        // Mostrar error
    }
}
```

### 3. Operaciones CRUD
```kotlin
// Crear tarea
viewModel.createTask("Mi nueva tarea", "pending", "2025-12-01")

// Listar tareas
viewModel.getTasks() // Actualiza LiveData automáticamente

// Actualizar tarea
viewModel.updateTask(taskId, completed = true, status = "completed")
```

---

## ⚠️ MANEJO DE ERRORES

```kotlin
sealed class ApiResult<T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class Error<T>(val message: String) : ApiResult<T>()
    data class Loading<T>(val isLoading: Boolean = true) : ApiResult<T>()
}

// En el ViewModel
fun getTasks() {
    viewModelScope.launch {
        _tasksState.value = ApiResult.Loading()
        repository.getTasks()
            .onSuccess { tasks ->
                _tasksState.value = ApiResult.Success(tasks)
            }
            .onFailure { error ->
                _tasksState.value = ApiResult.Error(error.message ?: "Error desconocido")
            }
    }
}
```

---

## 📝 NOTAS IMPORTANTES

1. **Token Duration**: El token dura 1 año, no necesitas renovarlo frecuentemente
2. **Auto-Auth**: El interceptor agrega automáticamente el token a todas las requests
3. **Error Handling**: Maneja siempre los casos 401 (token expirado) redirigiendo al login
4. **Dates**: Las fechas vienen en formato ISO 8601, úsala para parsing
5. **Status Values**: Los estados válidos son "pending" y "completed"

---

¡Esta documentación incluye TODO lo necesario para implementar el consumo de tu API en Android! 🚀📱