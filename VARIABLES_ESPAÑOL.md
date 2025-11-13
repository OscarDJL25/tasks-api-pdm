# 📝 REDEFINICIÓN DE VARIABLES A ESPAÑOL

## 🗄️ ESTRUCTURA ACTUALIZADA DE BASE DE DATOS

### Tabla: tareas_academicas
```sql
CREATE TABLE tareas_academicas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_asignacion DATE NOT NULL,
    hora_asignacion TIME NOT NULL,
    fecha_entrega DATE,
    hora_entrega TIME,
    finalizada BOOLEAN DEFAULT FALSE,
    prioridad INTEGER CHECK (prioridad BETWEEN 1 AND 10),
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: usuarios
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📱 ENDPOINTS EN ESPAÑOL

### 🔐 Autenticación
```
POST /api/auth/registrar
POST /api/auth/iniciar-sesion
```

### 📋 Tareas Académicas
```
GET    /api/tareas-academicas
POST   /api/tareas-academicas
PUT    /api/tareas-academicas/:id
DELETE /api/tareas-academicas/:id
PATCH  /api/tareas-academicas/:id/alternar-finalizada
```

### 🔍 Desarrollo
```
GET /api/tareas-academicas/dev/estadisticas
GET /api/tareas-academicas/dev/todas
GET /api/tareas-academicas/dev/proximas-vencer
```

## 📱 MODELOS ANDROID EN ESPAÑOL

### Room Entity
```kotlin
@Entity(tableName = "tareas_academicas")
data class TareaAcademica(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val nombre: String,
    val descripcion: String? = null,
    @ColumnInfo(name = "fecha_asignacion")
    val fechaAsignacion: String,
    @ColumnInfo(name = "hora_asignacion") 
    val horaAsignacion: String,
    @ColumnInfo(name = "fecha_entrega")
    val fechaEntrega: String? = null,
    @ColumnInfo(name = "hora_entrega")
    val horaEntrega: String? = null,
    val finalizada: Boolean = false,
    val prioridad: Int,
    @ColumnInfo(name = "usuario_id")
    val usuarioId: Int? = null,
    @ColumnInfo(name = "fecha_creacion")
    val fechaCreacion: String? = null,
    @ColumnInfo(name = "fecha_actualizacion") 
    val fechaActualizacion: String? = null,
    @ColumnInfo(name = "sincronizada")
    val sincronizada: Boolean = false // Para control de sincronización
)
```

### Usuario Entity
```kotlin
@Entity(tableName = "usuarios")
data class Usuario(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    @ColumnInfo(name = "nombre_usuario")
    val nombreUsuario: String,
    val contrasena: String? = null, // Solo para local, no sincronizar
    @ColumnInfo(name = "fecha_creacion")
    val fechaCreacion: String? = null,
    val token: String? = null // Para autenticación API
)
```

## 🔌 RETROFIT SERVICE EN ESPAÑOL

```kotlin
interface TareasAcademicasApiService {
    
    @POST("api/auth/registrar")
    suspend fun registrarUsuario(@Body solicitud: SolicitudRegistro): RespuestaAuth
    
    @POST("api/auth/iniciar-sesion") 
    suspend fun iniciarSesion(@Body solicitud: SolicitudInicioSesion): RespuestaAuth
    
    @GET("api/tareas-academicas")
    suspend fun obtenerTareas(): List<TareaAcademica>
    
    @POST("api/tareas-academicas")
    suspend fun crearTarea(@Body solicitud: SolicitudCrearTarea): TareaAcademica
    
    @PUT("api/tareas-academicas/{id}")
    suspend fun actualizarTarea(@Path("id") id: Int, @Body solicitud: SolicitudActualizarTarea): TareaAcademica
    
    @DELETE("api/tareas-academicas/{id}") 
    suspend fun eliminarTarea(@Path("id") id: Int): RespuestaEliminacion
    
    @PATCH("api/tareas-academicas/{id}/alternar-finalizada")
    suspend fun alternarTareaFinalizada(@Path("id") id: Int): TareaAcademica
    
    companion object {
        const val BASE_URL = "https://tasks-api-pdm.vercel.app/"
    }
}
```

## 📋 REQUEST/RESPONSE MODELS

```kotlin
// Requests
data class SolicitudRegistro(
    @SerializedName("nombre_usuario")
    val nombreUsuario: String,
    val contrasena: String
)

data class SolicitudInicioSesion(
    @SerializedName("nombre_usuario") 
    val nombreUsuario: String,
    val contrasena: String
)

data class SolicitudCrearTarea(
    val nombre: String,
    val descripcion: String? = null,
    @SerializedName("fecha_asignacion")
    val fechaAsignacion: String,
    @SerializedName("hora_asignacion")
    val horaAsignacion: String,
    @SerializedName("fecha_entrega")
    val fechaEntrega: String? = null,
    @SerializedName("hora_entrega") 
    val horaEntrega: String? = null,
    val finalizada: Boolean = false,
    val prioridad: Int
)

data class SolicitudActualizarTarea(
    val nombre: String? = null,
    val descripcion: String? = null,
    @SerializedName("fecha_asignacion")
    val fechaAsignacion: String? = null,
    @SerializedName("hora_asignacion")
    val horaAsignacion: String? = null,
    @SerializedName("fecha_entrega")
    val fechaEntrega: String? = null,
    @SerializedName("hora_entrega")
    val horaEntrega: String? = null,
    val finalizada: Boolean? = null,
    val prioridad: Int? = null
)

// Responses
data class RespuestaAuth(
    val token: String,
    val usuario: Usuario,
    val mensaje: String? = null
)

data class RespuestaEliminacion(
    val mensaje: String,
    val tarea: TareaAcademica
)

data class RespuestaError(
    val mensaje: String? = null,
    val error: String? = null
)
```

## 🔄 REPOSITORY HÍBRIDO (SQLite + API)

```kotlin
class RepositorioTareasAcademicas(
    private val daoLocal: TareaAcademicaDao,
    private val apiServicio: TareasAcademicasApiService,
    private val gestorToken: GestorToken,
    private val detectarConectividad: DetectorConectividad
) {
    
    // CRUD Local (siempre funciona)
    suspend fun obtenerTodasLasTareas(): Flow<List<TareaAcademica>> {
        return daoLocal.obtenerTodasLasTareas()
    }
    
    suspend fun crearTarea(tarea: TareaAcademica): Result<TareaAcademica> {
        return try {
            // 1. Guardar local inmediatamente
            val tareaLocal = tarea.copy(sincronizada = false)
            val id = daoLocal.insertarTarea(tareaLocal)
            val tareaConId = tareaLocal.copy(id = id.toInt())
            
            // 2. Intentar sincronizar si hay internet
            if (detectarConectividad.hayInternet()) {
                sincronizarTareaAlServidor(tareaConId)
            }
            
            Result.success(tareaConId)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun actualizarTarea(tarea: TareaAcademica): Result<TareaAcademica> {
        return try {
            // 1. Actualizar local
            val tareaActualizada = tarea.copy(
                sincronizada = false,
                fechaActualizacion = obtenerFechaActual()
            )
            daoLocal.actualizarTarea(tareaActualizada)
            
            // 2. Sincronizar si hay internet
            if (detectarConectividad.hayInternet()) {
                sincronizarTareaAlServidor(tareaActualizada)
            }
            
            Result.success(tareaActualizada)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Sincronización automática
    suspend fun sincronizarConServidor(): Result<Unit> {
        return try {
            if (!detectarConectividad.hayInternet()) {
                return Result.failure(Exception("Sin conexión a internet"))
            }
            
            // 1. Subir cambios locales no sincronizados
            val tareasNoSincronizadas = daoLocal.obtenerTareasNoSincronizadas()
            for (tarea in tareasNoSincronizadas) {
                sincronizarTareaAlServidor(tarea)
            }
            
            // 2. Descargar cambios del servidor
            val tareasDelServidor = apiServicio.obtenerTareas()
            for (tareaServidor in tareasDelServidor) {
                val tareaLocal = tareaServidor.copy(sincronizada = true)
                daoLocal.insertarOActualizarTarea(tareaLocal)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    private suspend fun sincronizarTareaAlServidor(tarea: TareaAcademica) {
        try {
            if (tarea.usuarioId == null) {
                // Crear en servidor
                val tareaCreada = apiServicio.crearTarea(tarea.aSolicitudCrear())
                val tareaActualizada = tarea.copy(
                    usuarioId = tareaCreada.usuarioId,
                    sincronizada = true
                )
                daoLocal.actualizarTarea(tareaActualizada)
            } else {
                // Actualizar en servidor
                val tareaActualizada = apiServicio.actualizarTarea(
                    tarea.usuarioId!!, 
                    tarea.aSolicitudActualizar()
                )
                val tareaLocal = tarea.copy(sincronizada = true)
                daoLocal.actualizarTarea(tareaLocal)
            }
        } catch (e: Exception) {
            // Si falla la sincronización, mantener local
            Log.w("Sync", "Falló sincronización: ${e.message}")
        }
    }
}
```

## 🌐 DETECTOR DE CONECTIVIDAD

```kotlin
class DetectorConectividad(private val context: Context) {
    
    fun hayInternet(): Boolean {
        val gestorConectividad = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val red = gestorConectividad.activeNetwork ?: return false
        val capacidades = gestorConectividad.getNetworkCapabilities(red) ?: return false
        
        return capacidades.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
               capacidades.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
               capacidades.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
    }
    
    fun observarConectividad(): Flow<Boolean> = callbackFlow {
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                trySend(true)
            }
            
            override fun onLost(network: Network) {
                trySend(false)
            }
        }
        
        val gestorConectividad = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        gestorConectividad.registerDefaultNetworkCallback(callback)
        
        // Enviar estado inicial
        trySend(hayInternet())
        
        awaitClose {
            gestorConectividad.unregisterNetworkCallback(callback)
        }
    }
}
```

---

## 🎯 BENEFICIOS DE ESTA ARQUITECTURA

✅ **Funcionamiento offline** completo
✅ **Sincronización automática** cuando hay internet
✅ **Resolución de conflictos** inteligente
✅ **Respaldo en la nube** automático
✅ **Consistencia** entre dispositivos
✅ **Rendimiento** óptimo (local first)

---

## 📝 PROMPT COMPLETO PARA GEMINI

```
PROYECTO: Gestor de Tareas Académicas - Arquitectura Híbrida SQLite + PostgreSQL

REQUERIMIENTOS:
✅ Jetpack Compose (UI)
✅ Room Database (SQLite local - principal)
✅ API REST (PostgreSQL - sincronización)
✅ ViewModel + StateFlow
✅ Navigation Compose  
✅ Funcionamiento OFFLINE + sincronización automática online

ARQUITECTURA HÍBRIDA:
- Room (SQLite) = Cache local + funcionamiento offline
- API PostgreSQL = Source of truth + sincronización entre dispositivos
- Detectar conectividad automáticamente
- Sincronización bidireccional inteligente

VARIABLES EN ESPAÑOL:
- Todos los nombres en español (nombre, descripcion, fechaAsignacion, etc.)
- Endpoints en español (/api/tareas-academicas)
- Base de datos en español (tareas_academicas, usuarios)

BASE URL API: https://tasks-api-pdm.vercel.app

FUNCIONALIDADES:
- CRUD completo offline
- Sincronización automática cuando hay internet
- Manejo de conflictos
- Estados de sincronización
- Indicadores de conectividad

Necesito implementación completa de esta arquitectura híbrida.
```