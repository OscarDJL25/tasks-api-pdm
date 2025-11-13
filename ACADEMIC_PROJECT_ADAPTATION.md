# 📚 ADAPTACIÓN API PARA PROYECTO ACADÉMICO

## 🔧 MODIFICAR ESTRUCTURA DE BASE DE DATOS

### Script SQL para actualizar tabla tasks:
```sql
-- Agregar nuevas columnas necesarias para el proyecto académico
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS fecha_asignacion DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS hora_asignacion TIME;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS fecha_entrega DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS hora_entrega TIME;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS finalizada BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS prioridad INTEGER CHECK (prioridad BETWEEN 1 AND 10);

-- Renombrar columna para coincidir con requerimientos
ALTER TABLE tasks RENAME COLUMN name TO nombre;
```

### Nueva estructura de Task para Android:
```kotlin
data class TareaAcademica(
    val id: Int = 0,
    val nombre: String,                    // Requerido - máx 100 chars
    val descripcion: String? = null,       // Opcional - texto largo
    @SerializedName("fecha_asignacion")
    val fechaAsignacion: String,           // Requerido - formato: YYYY-MM-DD
    @SerializedName("hora_asignacion") 
    val horaAsignacion: String,            // Requerido - formato: HH:mm:ss
    @SerializedName("fecha_entrega")
    val fechaEntrega: String? = null,      // Opcional - formato: YYYY-MM-DD
    @SerializedName("hora_entrega")
    val horaEntrega: String? = null,       // Opcional - formato: HH:mm:ss
    val finalizada: Boolean = false,       // Default false
    val prioridad: Int,                    // 1-10, requerido
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at") 
    val updatedAt: String? = null,
    @SerializedName("user_id")
    val userId: Int? = null
)
```

### Request models actualizados:
```kotlin
data class CreateTareaRequest(
    val nombre: String,                    // máx 100 caracteres
    val descripcion: String? = null,       // texto largo opcional
    @SerializedName("fecha_asignacion")
    val fechaAsignacion: String,           // YYYY-MM-DD
    @SerializedName("hora_asignacion")
    val horaAsignacion: String,            // HH:mm:ss
    @SerializedName("fecha_entrega") 
    val fechaEntrega: String? = null,      // YYYY-MM-DD opcional
    @SerializedName("hora_entrega")
    val horaEntrega: String? = null,       // HH:mm:ss opcional
    val finalizada: Boolean = false,
    val prioridad: Int                     // 1-10
)

data class UpdateTareaRequest(
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
```