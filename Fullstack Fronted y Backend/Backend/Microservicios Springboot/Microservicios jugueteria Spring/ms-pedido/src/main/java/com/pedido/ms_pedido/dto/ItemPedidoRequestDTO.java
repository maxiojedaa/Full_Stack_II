package com.pedido.ms_pedido.dto;

import lombok.Data;

/**
 * DTO para recibir los datos de cada ítem al momento de crear un pedido.
 */
@Data
public class ItemPedidoRequestDTO {
    private Long productoId;
    private String nombreProducto;
    private Double precioUnitario;
    private Integer cantidad;
}
