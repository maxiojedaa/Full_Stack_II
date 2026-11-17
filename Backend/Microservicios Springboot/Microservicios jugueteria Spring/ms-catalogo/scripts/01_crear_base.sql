USE catalogo_db2;

-- Limpiar tabla si ya existe
DROP TABLE IF EXISTS productos;

-- Crear tabla productos con los tipos correctos que espera Hibernate
CREATE TABLE productos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DOUBLE NOT NULL,
    stock INT NOT NULL,
    descripcion VARCHAR(255)
);

-- Insertar los 2 productos de prueba (con IDs 101 y 102 para el carrito)
INSERT INTO productos (id, nombre, precio, stock, descripcion) VALUES 
(101, 'Robot de Madera', 15990, 10, 'Robot de madera diseñado para estimular la creatividad, imaginación y coordinación de los niños.'),
(102, 'Colección Creativa', 19990, 15, 'Set creativo con materiales para pintar, decorar y desarrollar habilidades artísticas.');
(103, 'Juguetes', 'Kit de manualidades didáctico y creativo.', 'Pinta tu Juguete', 12990, 10),
(104, 'Juguetes', 'Figuras de madera 3D en 1 kit educativo.', 'Kit de Dinosaurios para Armar', 18990, 10),
(105, 'Juguetes', 'Juego de vagones con conexión magnética segura.', 'Tren de Madera Magnético', 21990, 10),
(106, 'Juguetes', 'Experimentos divertidos y seguros para niños.', 'Mini Laboratorio de Ciencias', 24990, 10);