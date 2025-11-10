-- Script SQL para crear la tabla tasks en PostgreSQL (AWS RDS)

-- Crear la base de datos (si no existe)
-- CREATE DATABASE tasks_db;

-- Usar la base de datos
-- \c tasks_db;

-- Crear la tabla tasks
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

-- Insertar datos de ejemplo
INSERT INTO tasks (name, status, deadline) VALUES 
    ('Configurar API', 'completed', '2025-11-09'),
    ('Conectar con AWS', 'in-progress', '2025-11-10'),
    ('Probar con Thunder Client', 'pending', '2025-11-11'),
    ('Conectar app móvil', 'pending', '2025-11-12');

-- Verificar que se creó correctamente
SELECT * FROM tasks;

-- Mostrar información de la tabla
\d tasks;