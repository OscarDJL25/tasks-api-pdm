# 📱 ARQUITECTURA HÍBRIDA: SQLite + PostgreSQL para Proyecto Académico

## 🎯 OBJETIVO
Crear un gestor de tareas académicas que funcione OFFLINE con SQLite y se sincronice ONLINE con PostgreSQL en AWS cuando hay conexión a internet.

## 🏗️ ARQUITECTURA COMPLETA

```
📱 Android App (Jetpack Compose)
    ↓
🏛️ Presentation Layer (ViewModel + Compose UI)
    ↓
🔄 Domain Layer (Use Cases + Repository Interface)
    ↓
🗄️ Data Layer (Room SQLite + Remote API)
    ↕️
🌐 PostgreSQL API (https://tasks-api-pdm.vercel.app)
```

---

## 📋 ESTRUCTURA DE DATOS UNIFICADA

### Room Entity (SQLite Local)
```kotlin
@Entity(tableName = "tareas")
data class TareaEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val remoteId: Int? = null,              // ID del servidor cuando se sincroniza
    val nombre: String,                     // VARCHAR(100) NOT NULL
    val descripcion: String? = null,        // TEXT
    val fechaAsignacion: String,            // DATE NOT NULL (YYYY-MM-DD)
    val horaAsignacion: String,             // TIME NOT NULL (HH:mm:ss)
    val fechaEntrega: String? = null,       // DATE (YYYY-MM-DD)
    val horaEntrega: String? = null,        // TIME (HH:mm:ss)
    val finalizada: Boolean = false,        // BOOLEAN DEFAULT FALSE
    val prioridad: Int,                     // INTEGER 1-10
    val fechaCreacion: Long = System.currentTimeMillis(),
    val fechaActualizacion: Long = System.currentTimeMillis(),
    val sincronizado: Boolean = false,      // Si ya se subió al servidor
    val eliminada: Boolean = false          // Soft delete para sincronización
)
```

### Network Model (API PostgreSQL)
```kotlin
@Serializable
data class TareaRemota(
    val id: Int = 0,
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
    val prioridad: Int,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null,
    @SerializedName("user_id")
    val userId: Int? = null
)
```

### Domain Model (UI)
```kotlin
data class Tarea(
    val id: Int = 0,
    val remoteId: Int? = null,
    val nombre: String,
    val descripcion: String? = null,
    val fechaAsignacion: String,
    val horaAsignacion: String,
    val fechaEntrega: String? = null,
    val horaEntrega: String? = null,
    val finalizada: Boolean = false,
    val prioridad: Int,
    val sincronizado: Boolean = false
)
```

---

## 🗄️ ROOM DATABASE SETUP

### DAO (Data Access Object)
```kotlin
@Dao
interface TareaDao {
    @Query("SELECT * FROM tareas WHERE eliminada = 0 ORDER BY fechaAsignacion DESC, prioridad DESC")
    fun getAllTareas(): Flow<List<TareaEntity>>
    
    @Query("SELECT * FROM tareas WHERE id = :id AND eliminada = 0")
    suspend fun getTareaById(id: Int): TareaEntity?
    
    @Query("SELECT * FROM tareas WHERE sincronizado = 0 AND eliminada = 0")
    suspend fun getTareasNoSincronizadas(): List<TareaEntity>
    
    @Query("SELECT * FROM tareas WHERE eliminada = 1 AND sincronizado = 0")
    suspend fun getTareasEliminadasNoSincronizadas(): List<TareaEntity>
    
    @Insert
    suspend fun insertTarea(tarea: TareaEntity): Long
    
    @Update
    suspend fun updateTarea(tarea: TareaEntity)
    
    @Query("UPDATE tareas SET eliminada = 1, fechaActualizacion = :timestamp WHERE id = :id")
    suspend fun softDeleteTarea(id: Int, timestamp: Long = System.currentTimeMillis())
    
    @Query("UPDATE tareas SET sincronizado = 1, remoteId = :remoteId WHERE id = :localId")
    suspend fun marcarComoSincronizada(localId: Int, remoteId: Int)
    
    @Query("DELETE FROM tareas WHERE eliminada = 1 AND sincronizado = 1")
    suspend fun limpiarTareasEliminadas()
}
```

### Database Class
```kotlin
@Database(
    entities = [TareaEntity::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class TareaDatabase : RoomDatabase() {
    abstract fun tareaDao(): TareaDao
    
    companion object {
        @Volatile
        private var INSTANCE: TareaDatabase? = null
        
        fun getDatabase(context: Context): TareaDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    TareaDatabase::class.java,
                    "tarea_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
```

---

## 🌐 API SERVICE (Retrofit)

```kotlin
interface TareaApiService {
    
    // Auth
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse
    
    @POST("api/auth/register") 
    suspend fun register(@Body request: RegisterRequest): AuthResponse
    
    // Tareas académicas (nuevos endpoints)
    @GET("api/tasks/tareas")
    suspend fun getTareasRemotas(): List<TareaRemota>
    
    @GET("api/tasks/tareas/{id}")
    suspend fun getTareaRemota(@Path("id") id: Int): TareaRemota
    
    @POST("api/tasks/tareas")
    suspend fun crearTareaRemota(@Body tarea: CrearTareaRequest): TareaRemota
    
    @PUT("api/tasks/tareas/{id}")
    suspend fun actualizarTareaRemota(@Path("id") id: Int, @Body tarea: ActualizarTareaRequest): TareaRemota
    
    @DELETE("api/tasks/tareas/{id}")
    suspend fun eliminarTareaRemota(@Path("id") id: Int): EliminarResponse
    
    @PATCH("api/tasks/tareas/{id}/toggle")
    suspend fun toggleTareaFinalizada(@Path("id") id: Int): TareaRemota
}
```

---

## 🔄 REPOSITORY HÍBRIDO

```kotlin
class TareaRepository(
    private val localDao: TareaDao,
    private val remoteApi: TareaApiService,
    private val connectivityManager: ConnectivityManager
) {
    
    // Obtener todas las tareas (siempre desde local)
    fun getAllTareas(): Flow<List<Tarea>> = localDao.getAllTareas()
        .map { entities -> entities.map { it.toDomain() } }
    
    // Crear tarea (local + sync automático)
    suspend fun crearTarea(tarea: Tarea): Result<Tarea> {
        return try {
            // 1. Guardar en local
            val entity = tarea.toEntity().copy(
                sincronizado = false,
                fechaActualizacion = System.currentTimeMillis()
            )
            val localId = localDao.insertTarea(entity).toInt()
            
            // 2. Intentar sincronizar si hay internet
            if (isOnline()) {
                try {
                    val request = tarea.toCreateRequest()
                    val remotaTarea = remoteApi.crearTareaRemota(request)
                    localDao.marcarComoSincronizada(localId, remotaTarea.id)
                } catch (e: Exception) {
                    // No importa si falla la sincronización, ya está guardada localmente
                    Log.w("TareaRepository", "Sync failed, will retry later", e)
                }
            }
            
            Result.success(entity.copy(id = localId).toDomain())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Actualizar tarea
    suspend fun actualizarTarea(tarea: Tarea): Result<Tarea> {
        return try {
            // 1. Actualizar en local
            val entity = tarea.toEntity().copy(
                sincronizado = false,
                fechaActualizacion = System.currentTimeMillis()
            )
            localDao.updateTarea(entity)
            
            // 2. Sincronizar si hay internet y tiene remoteId
            if (isOnline() && tarea.remoteId != null) {
                try {
                    val request = tarea.toUpdateRequest()
                    remoteApi.actualizarTareaRemota(tarea.remoteId, request)
                    localDao.marcarComoSincronizada(tarea.id, tarea.remoteId)
                } catch (e: Exception) {
                    Log.w("TareaRepository", "Sync failed, will retry later", e)
                }
            }
            
            Result.success(tarea)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Eliminar tarea (soft delete)
    suspend fun eliminarTarea(id: Int): Result<Unit> {
        return try {
            localDao.softDeleteTarea(id)
            
            // Intentar eliminar del servidor si hay internet
            val tarea = localDao.getTareaById(id)
            if (isOnline() && tarea?.remoteId != null) {
                try {
                    remoteApi.eliminarTareaRemota(tarea.remoteId!!)
                    localDao.limpiarTareasEliminadas()
                } catch (e: Exception) {
                    Log.w("TareaRepository", "Delete sync failed, will retry later", e)
                }
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Sincronización completa (llamar cuando se detecta conexión)
    suspend fun sincronizarConServidor(): Result<Unit> {
        return try {
            if (!isOnline()) return Result.failure(Exception("Sin conexión"))
            
            // 1. Subir tareas locales no sincronizadas
            val tareasLocales = localDao.getTareasNoSincronizadas()
            for (tareaLocal in tareasLocales) {
                try {
                    val request = tareaLocal.toCreateRequest()
                    val tareaRemota = remoteApi.crearTareaRemota(request)
                    localDao.marcarComoSincronizada(tareaLocal.id, tareaRemota.id)
                } catch (e: Exception) {
                    Log.e("TareaRepository", "Error al subir tarea ${tareaLocal.id}", e)
                }
            }
            
            // 2. Sincronizar eliminaciones
            val tareasEliminadas = localDao.getTareasEliminadasNoSincronizadas()
            for (tareaEliminada in tareasEliminadas) {
                tareaEliminada.remoteId?.let { remoteId ->
                    try {
                        remoteApi.eliminarTareaRemota(remoteId)
                    } catch (e: Exception) {
                        Log.e("TareaRepository", "Error al eliminar tarea remota $remoteId", e)
                    }
                }
            }
            localDao.limpiarTareasEliminadas()
            
            // 3. Descargar tareas del servidor y actualizar local
            val tareasRemotas = remoteApi.getTareasRemotas()
            for (tareaRemota in tareasRemotas) {
                val tareaLocal = tareaRemota.toEntity().copy(
                    sincronizado = true,
                    remoteId = tareaRemota.id
                )
                // Aquí podrías implementar lógica de merge más compleja
                localDao.insertTarea(tareaLocal)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    private fun isOnline(): Boolean {
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
}
```

---

## 🎯 USE CASES (Domain Layer)

```kotlin
class CrearTareaUseCase(private val repository: TareaRepository) {
    suspend operator fun invoke(
        nombre: String,
        descripcion: String?,
        fechaAsignacion: String,
        horaAsignacion: String,
        fechaEntrega: String?,
        horaEntrega: String?,
        prioridad: Int
    ): Result<Tarea> {
        // Validaciones de negocio
        if (nombre.isBlank() || nombre.length > 100) {
            return Result.failure(Exception("Nombre inválido"))
        }
        
        if (prioridad !in 1..10) {
            return Result.failure(Exception("Prioridad debe estar entre 1 y 10"))
        }
        
        val tarea = Tarea(
            nombre = nombre.trim(),
            descripcion = descripcion?.trim(),
            fechaAsignacion = fechaAsignacion,
            horaAsignacion = horaAsignacion,
            fechaEntrega = fechaEntrega,
            horaEntrega = horaEntrega,
            prioridad = prioridad
        )
        
        return repository.crearTarea(tarea)
    }
}

class SincronizarTareasUseCase(
    private val repository: TareaRepository,
    private val connectivityManager: ConnectivityManager
) {
    suspend operator fun invoke(): Result<Unit> {
        return if (isOnline()) {
            repository.sincronizarConServidor()
        } else {
            Result.failure(Exception("Sin conexión a internet"))
        }
    }
    
    private fun isOnline(): Boolean {
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
}
```

---

## 📱 VIEWMODEL CON ESTADO

```kotlin
@HiltViewModel
class TareaViewModel @Inject constructor(
    private val crearTareaUseCase: CrearTareaUseCase,
    private val obtenerTareasUseCase: ObtenerTareasUseCase,
    private val actualizarTareaUseCase: ActualizarTareaUseCase,
    private val eliminarTareaUseCase: EliminarTareaUseCase,
    private val sincronizarTareasUseCase: SincronizarTareasUseCase
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(TareaUiState())
    val uiState: StateFlow<TareaUiState> = _uiState.asStateFlow()
    
    val tareas: StateFlow<List<Tarea>> = obtenerTareasUseCase()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )
    
    fun crearTarea(
        nombre: String,
        descripcion: String?,
        fechaAsignacion: String,
        horaAsignacion: String,
        fechaEntrega: String?,
        horaEntrega: String?,
        prioridad: Int
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(loading = true)
            
            crearTareaUseCase(nombre, descripcion, fechaAsignacion, horaAsignacion, fechaEntrega, horaEntrega, prioridad)
                .onSuccess {
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        mensaje = "Tarea creada exitosamente"
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        error = error.message
                    )
                }
        }
    }
    
    fun toggleTareaFinalizada(tarea: Tarea) {
        viewModelScope.launch {
            val tareaActualizada = tarea.copy(finalizada = !tarea.finalizada)
            actualizarTareaUseCase(tareaActualizada)
        }
    }
    
    fun sincronizarConServidor() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(sincronizando = true)
            
            sincronizarTareasUseCase()
                .onSuccess {
                    _uiState.value = _uiState.value.copy(
                        sincronizando = false,
                        mensaje = "Sincronización completada"
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        sincronizando = false,
                        error = "Error de sincronización: ${error.message}"
                    )
                }
        }
    }
    
    fun limpiarMensajes() {
        _uiState.value = _uiState.value.copy(error = null, mensaje = null)
    }
}

data class TareaUiState(
    val loading: Boolean = false,
    val sincronizando: Boolean = false,
    val error: String? = null,
    val mensaje: String? = null
)
```

---

## 🔄 MONITOR DE CONECTIVIDAD

```kotlin
@Singleton
class ConnectivityMonitor @Inject constructor(
    @ApplicationContext context: Context
) {
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    
    private val _isOnline = MutableStateFlow(false)
    val isOnline: StateFlow<Boolean> = _isOnline.asStateFlow()
    
    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            _isOnline.value = true
        }
        
        override fun onLost(network: Network) {
            _isOnline.value = false
        }
    }
    
    init {
        val networkRequest = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        connectivityManager.registerNetworkCallback(networkRequest, networkCallback)
    }
}
```

---

## 📋 DEPENDENCIAS (build.gradle.kts)

```kotlin
dependencies {
    // Room
    implementation("androidx.room:room-runtime:2.6.0")
    implementation("androidx.room:room-ktx:2.6.0")
    kapt("androidx.room:room-compiler:2.6.0")
    
    // Retrofit + Network
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // ViewModel + Compose
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.compose.runtime:runtime-livedata:1.5.4")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.5")
    
    // Hilt (DI)
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    
    // Work Manager (para sync en background)
    implementation("androidx.work:work-runtime-ktx:2.8.1")
    implementation("androidx.hilt:hilt-work:1.1.0")
}
```

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Offline-First
- **Funciona sin internet**
- **CRUD completo en SQLite**
- **UI responsive**

### ✅ Sincronización Automática
- **Detecta conexión automáticamente**
- **Sube cambios locales**
- **Descarga cambios remotos**
- **Resuelve conflictos**

### ✅ Arquitectura en Capas
- **Presentation**: Compose + ViewModel
- **Domain**: Use Cases + Entities
- **Data**: Room + Retrofit

### ✅ Gestión de Estado
- **StateFlow para UI**
- **Loading/Error states**
- **Offline indicators**

---

## 🚀 FLUJO DE TRABAJO

1. **Desarrollo**: Implementar Room + UI primero
2. **Testing**: Validar funcionamiento offline
3. **API Integration**: Agregar sincronización
4. **Polish**: Indicators de sync, manejo de errores

¡Esta arquitectura te da lo mejor de ambos mundos: funcionamiento offline completo + sincronización cloud robusta! 🎯📱