# 🛡️ VARIABLES EN ESPAÑOL SEGURAS PARA PRODUCCIÓN

## ✅ REGLAS PARA VARIABLES SEGURAS

### 🚫 EVITAR:
- Acentos: á, é, í, ó, ú
- Ñ/ñ  
- Espacios en URLs
- Caracteres especiales: @, #, $, %

### ✅ USAR:
- Solo letras ASCII (a-z, A-Z)
- Números (0-9)
- Guión bajo (_) para separar palabras
- Guión medio (-) para URLs

---

## 📋 VARIABLES RECOMENDADAS (ESPAÑOL SEGURO)

### 🗄️ Base de Datos
```sql
-- TABLA: tareas_academicas (sin acentos)
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

-- TABLA: usuarios (sin acentos)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🌐 Endpoints (URLs seguras)
```
POST /api/auth/registrar
POST /api/auth/iniciar-sesion

GET    /api/tareas-academicas
POST   /api/tareas-academicas  
PUT    /api/tareas-academicas/:id
DELETE /api/tareas-academicas/:id
PATCH  /api/tareas-academicas/:id/alternar-finalizada
```

### 📱 Modelos Android
```kotlin
@Entity(tableName = "tareas_academicas")
data class TareaAcademica(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val nombre: String,                    // Sin "título"
    val descripcion: String? = null,       // Sin "descripción"  
    @ColumnInfo(name = "fecha_asignacion")
    val fechaAsignacion: String,           // Sin "asignación"
    @ColumnInfo(name = "hora_asignacion")
    val horaAsignacion: String,
    @ColumnInfo(name = "fecha_entrega")
    val fechaEntrega: String? = null,
    @ColumnInfo(name = "hora_entrega") 
    val horaEntrega: String? = null,
    val finalizada: Boolean = false,
    val prioridad: Int,
    @ColumnInfo(name = "usuario_id")
    val usuarioId: Int? = null
)
```

### 📡 Request/Response JSON
```json
{
  "nombre": "Completar proyecto Android",
  "descripcion": "Implementar CRUD completo con Room",
  "fecha_asignacion": "2025-11-13",
  "hora_asignacion": "14:30:00",
  "fecha_entrega": "2025-11-20", 
  "hora_entrega": "23:59:00",
  "finalizada": false,
  "prioridad": 8
}
```

---

## 🧪 PRUEBA DE COMPATIBILIDAD

### ✅ COMPATIBLES:
```javascript
// Variables que funcionan perfectamente en Vercel/PostgreSQL
const campos_seguros = {
    nombre: "string",
    descripcion: "string", 
    fecha_asignacion: "date",
    hora_asignacion: "time",
    fecha_entrega: "date",
    hora_entrega: "time", 
    finalizada: "boolean",
    prioridad: "integer",
    usuario_id: "integer"
};
```

### ⚠️ PROBLEMÁTICOS (evitar):
```javascript
// Variables que pueden causar problemas
const campos_problematicos = {
    descripción: "string",    // ó
    asignación: "string",     // ó  
    creación: "string",       // ó
    usuario_niño: "string"    // ñ
};
```

---

## 🔧 CONFIGURACIÓN VERCEL SEGURA

### package.json
```json
{
  "name": "tasks-api-pdm",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Headers para UTF-8
```javascript
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

---

## 🗄️ CONFIGURACIÓN POSTGRESQL SEGURA

### Charset/Collation
```sql
-- Verificar encoding de la base de datos
SELECT pg_encoding_to_char(encoding) FROM pg_database WHERE datname = 'Proyecto1PDM';

-- Debería retornar: UTF8

-- Configurar collation si es necesario
ALTER DATABASE "Proyecto1PDM" SET lc_collate = 'C';
ALTER DATABASE "Proyecto1PDM" SET lc_ctype = 'C';
```

---

## ✅ VENTAJAS DEL ESPAÑOL SEGURO

1. **🌐 Compatible**: Funciona en todos los servidores
2. **📱 Claro**: Variables entendibles para el equipo  
3. **🔄 Consistente**: Entre frontend y backend
4. **🛡️ Robusto**: Sin problemas de encoding
5. **🚀 Escalable**: Funciona en cualquier plataforma

---

## 📝 EJEMPLO COMPLETO FUNCIONANDO

### Controller actualizado:
```javascript
export const crearTarea = async (req, res) => {
  try {
    const { 
      nombre, 
      descripcion = null,
      fecha_asignacion,
      hora_asignacion,
      fecha_entrega = null,
      hora_entrega = null,
      finalizada = false,
      prioridad 
    } = req.body;
    
    const usuario_id = req.user?.id;
    
    const resultado = await pool.query(`
      INSERT INTO tareas_academicas (
        nombre, descripcion, fecha_asignacion, hora_asignacion,
        fecha_entrega, hora_entrega, finalizada, prioridad, 
        usuario_id, fecha_creacion, fecha_actualizacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [nombre, descripcion, fecha_asignacion, hora_asignacion, 
        fecha_entrega, hora_entrega, finalizada, prioridad, usuario_id]);
    
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## 🎯 RECOMENDACIÓN FINAL

✅ **USA ESPAÑOL SIN ACENTOS**:
- `descripcion` en lugar de `descripción`
- `creacion` en lugar de `creación` 
- `asignacion` en lugar de `asignación`

✅ **BENEFICIOS**:
- **100% compatible** con Vercel/PostgreSQL
- **Claro** para el equipo mexicano
- **Sin problemas** de encoding
- **Consistente** con la app Android

¿Te parece bien este enfoque de español sin acentos para evitar problemas de compatibilidad?