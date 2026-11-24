USE stock_db;

-- Limpiar tablas si ya existen (respetando dependencias)
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS producto_stock;

-- Crear la tabla de stock de productos
CREATE TABLE producto_stock (
    producto_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    stock INT NOT NULL,
    min_stock INT NOT NULL
);

-- Crear la tabla de ventas
CREATE TABLE ventas (
    venta_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    cantidad INT NOT NULL,
    fecha DATETIME(6),
    CONSTRAINT fk_producto_stock FOREIGN KEY (producto_id) REFERENCES producto_stock(producto_id)
);

-- Insertar productos de prueba en el stock (con IDs 101 y 102 para que coincidan con tu catálogo)
INSERT INTO producto_stock (producto_id, nombre, stock, min_stock) VALUES 
(101, 'Robot de Madera', 10, 3),
(102, 'Colección Creativa', 15, 5);

-- Insertar un registro de venta de prueba
INSERT INTO ventas (venta_id, producto_id, cantidad, fecha) VALUES 
(1, 101, 2, NOW());