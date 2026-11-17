package com.ms_carrito.ms_carrito.dto;

import lombok.Data;
import java.util.List;

/**
 * DTO que encapsula la respuesta completa del carrito de compras de un usuario.
 */
@Data
public class CarritoResponseDTO {

    /**
     * Identificador del carrito.
     */
    private Long id;

    /**
     * Identificador del usuario propietario.
     */
    private Long usuarioId;

    /**
     * Lista de productos o ítems que contiene el carrito.
     */
    private List<ItemCarritoResponseDTO> items;

    /**
     * Monto total acumulado de todos los ítems en el carrito.
     */
    private Double total;
}