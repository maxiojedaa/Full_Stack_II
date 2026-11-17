-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS pedidos_db2;
USE pedidos_db;

-- Tabla principal de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    total DOUBLE NOT NULL,
    estado VARCHAR(50) NOT NULL,
    fecha_creacion DATETIME NOT NULL
);

-- Tabla de los ítems del pedido (con la llave foránea hacia pedidos)
CREATE TABLE IF NOT EXISTS item_pedido (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    nombre_producto VARCHAR(255) NOT NULL,
    precio_unitario DOUBLE NOT NULL,
    cantidad INT NOT NULL,
    pedido_id BIGINT NOT NULL,
    CONSTRAINT fk_pedido_item FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);