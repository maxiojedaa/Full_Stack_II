package com.pedido.ms_pedido.dto;


import lombok.Data;
import java.util.List;

/**
 * DTO para registrar un pedido nuevo en el sistema.
 */
@Data
public class PedidoRequestDTO {
    private Long usuarioId; // Identificador del usuario que realiza la compra.
    private List<ItemPedidoRequestDTO> items; // Lista de productos seleccionados
}
