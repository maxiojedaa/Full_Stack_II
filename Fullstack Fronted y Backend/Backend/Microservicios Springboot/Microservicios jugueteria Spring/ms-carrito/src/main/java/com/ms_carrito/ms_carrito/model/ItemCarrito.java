package com.ms_carrito.ms_carrito.model;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Entidad que representa un producto individual agregado dentro del carrito de compras.
 * Relaciona el producto del catálogo con su cantidad y precio actual (HU9, HU27).
 */
@Entity
@Table(name = "items_carrito")
@Data
public class ItemCarrito {

    /**
     * Identificador único del ítem dentro del carrito.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Identificador del producto (vinculado con el microservicio de catálogos).
     */
    @Column(name = "producto_id")
    private Long idProducto;

    /**
     * Cantidad de unidades seleccionadas de este producto.
     */
    private Integer cantidad;

    /**
     * Precio unitario del producto al momento de agregarlo al carrito.
     */
    private Double precioUnitario;
}