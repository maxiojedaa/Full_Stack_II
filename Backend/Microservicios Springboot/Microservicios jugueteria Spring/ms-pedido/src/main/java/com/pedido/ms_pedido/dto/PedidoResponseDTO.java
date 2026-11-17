package com.pedido.ms_pedido.dto;


import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para retornar la información detallada de un pedido al cliente (HU55, HU56).
 */
@Data
public class PedidoResponseDTO {
    private Long id;
    private Long usuarioId;
    private Double total;
    private String estado;
    private LocalDateTime fechaCreacion;
    private List<ItemPedidoRequestDTO> items;
}
