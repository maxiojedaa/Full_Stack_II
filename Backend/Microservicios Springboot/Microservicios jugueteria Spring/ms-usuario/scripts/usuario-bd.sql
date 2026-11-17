-- Base de datos para ms-usuario
CREATE DATABASE IF NOT EXISTS usuario_db;
USE usuario_db;-- Limpiar tablas si ya existen
DROP TABLE IF EXISTS usuario_favoritos;
DROP TABLE IF EXISTS usuarios;-- Crear la tabla principal de usuarios
CREATE TABLE usuarios (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
email VARCHAR(254) NOT NULL,
password_hash VARCHAR(100) NOT NULL,
rol VARCHAR(20) DEFAULT 'USUARIO',
fecha_creacion DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
CONSTRAINT uk_usuario_email UNIQUE (email)
);-- Crear tabla secundaria para la relación ElementCollection / Favoritos
CREATE TABLE usuario_favoritos (
usuario_id BIGINT NOT NULL,
producto_id BIGINT NOT NULL,
PRIMARY KEY (usuario_id, producto_id),
CONSTRAINT fk_usuario_favoritos FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);-- Insertar datos de prueba
-- Contraseña genérica hash de prueba ($2a$10$... o texto plano según tu encoder)
INSERT INTO usuarios (id, nombre, email, password_hash, rol) VALUES
(1, 'Juan Pérez', 'juan.perez@example.com', 'Juan12345', 'USUARIO'),
(2, 'Administrador Juguetería', 'admin@jugueteria.com', '1234567', 'ADMIN');-- Favoritos de prueba para el usuario 1
INSERT INTO usuario_favoritos (usuario_id, producto_id) VALUES
(1, 101),
(1, 102);