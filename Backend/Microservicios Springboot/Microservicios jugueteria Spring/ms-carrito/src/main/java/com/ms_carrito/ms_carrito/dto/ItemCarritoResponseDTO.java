package com.ms_carrito.ms_carrito.dto;

import lombok.Data;

/**
 * DTO que representa la respuesta detallada de un ítem dentro del carrito.
 */
@Data
public class ItemCarritoResponseDTO {

    /**
     * Identificador único del ítem en el carrito.
     */
    private Long id;

    /**
     * Identificador del producto.
     */
    private Long productoId;

    /**
     * Cantidad de unidades seleccionadas.
     */
    private Integer cantidad;

    /**
     * Precio unitario del producto.
     */
    private Double precioUnitario;

    /**
     * Subtotal calculado (cantidad * precio unitario).
     */
    private Double subtotal;
}
