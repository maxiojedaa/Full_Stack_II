package com.ms_carrito.ms_carrito.dto;

import lombok.Data;

/**
 * DTO para recibir la solicitud de agregar o actualizar un producto en el carrito.
 */
@Data
public class ItemCarritoRequestDTO {

    /**
     * Identificador del producto proveniente del catálogo.
     */
    private Long productoId;

    /**
     * Cantidad de unidades que el usuario desea agregar.
     */
    private Integer cantidad;

    /**
     * Precio unitario del producto al momento de la compra.
     */
    private Double precioUnitario;
}