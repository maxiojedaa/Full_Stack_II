-- Pixel & Toys
-- Microservicio: ms-sistema-pagos

CREATE DATABASE IF NOT EXISTS pagos_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE pagos_db;

CREATE TABLE IF NOT EXISTS pagos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    pedido_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    metodo_pago VARCHAR(255) NOT NULL,
    estado VARCHAR(255) NOT NULL DEFAULT 'PENDIENTE',
    fecha_creacion DATETIME(6),

    PRIMARY KEY (id),
    CONSTRAINT uk_pagos_pedido_id UNIQUE (pedido_id)
);
