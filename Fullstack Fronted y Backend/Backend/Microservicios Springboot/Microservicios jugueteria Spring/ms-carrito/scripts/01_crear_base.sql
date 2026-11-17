USE carrito_db2;

-- Limpiar tablas en orden de restricciones (foreign keys)
DROP TABLE IF EXISTS items_carrito;
DROP TABLE IF EXISTS carritos;

-- Crear tabla carritos
CREATE TABLE carritos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL
);

-- Crear tabla items_carrito relacionada al carrito
CREATE TABLE items_carrito (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    cantidad INT NOT NULL,
    carrito_id BIGINT NOT NULL,
    CONSTRAINT fk_carrito_item FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE
);

-- Insertar el carrito de prueba para el usuario 1
INSERT INTO carritos (id, usuario_id) 
VALUES (1, 1);

-- Insertar los 2 ítems que enlazan con los productos 101 y 102 del catálogo
INSERT INTO items_carrito (producto_id, cantidad, carrito_id) 
VALUES 
(101, 2, 1),
(102, 1, 1);