package com.pedido.ms_pedido.service;

import com.pedido.ms_pedido.dto.ItemPedidoRequestDTO;
import com.pedido.ms_pedido.dto.PedidoRequestDTO;
import com.pedido.ms_pedido.dto.PedidoResponseDTO;
import com.pedido.ms_pedido.model.ItemPedidoModel;
import com.pedido.ms_pedido.model.PedidoModel;
import com.pedido.ms_pedido.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service

public class PedidoService {
    @Autowired
    private PedidoRepository pedidoRepository;

    /**
     * Registra un nuevo pedido automáticamente al confirmar la compra (HU53, HU54).
     * 
     * @param request Datos del pedido enviado por el usuario.
     * @return El pedido guardado convertido en DTO.
     */
    public PedidoResponseDTO registrarPedido(PedidoRequestDTO request) {
        PedidoModel pedido = new PedidoModel();
        pedido.setUsuarioId(request.getUsuarioId());
        pedido.setEstado("PENDIENTE");
        pedido.setFechaCreacion(LocalDateTime.now());

        // Calcular el total
        double totalCalculado = 0.0;
        for (ItemPedidoRequestDTO dto : request.getItems()) {
            totalCalculado += dto.getPrecioUnitario() * dto.getCantidad();
        }
        pedido.setTotal(totalCalculado);

        // Mapear los ítems
        List<ItemPedidoModel> itemsModel = new ArrayList<>();
        for (ItemPedidoRequestDTO dto : request.getItems()) {
            ItemPedidoModel item = new ItemPedidoModel();
            item.setProductoId(dto.getProductoId());
            item.setNombreProducto(dto.getNombreProducto());
            item.setPrecioUnitario(dto.getPrecioUnitario());
            item.setCantidad(dto.getCantidad());

            // Ahora sí compilará perfecto y le pasará el ID del pedido
            item.setPedido(pedido);

            itemsModel.add(item);
        }

        pedido.setItems(itemsModel);

        PedidoModel pedidoGuardado = pedidoRepository.save(pedido);
        return mapearADTO(pedidoGuardado);
    }

    /**
     * Obtiene el historial de pedidos de un usuario específico (HU56).
     */
    public List<PedidoResponseDTO> obtenerPedidosPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(this::mapearADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene los pedidos pendientes para la gestión del administrador (HU29).
     */
    public List<PedidoResponseDTO> obtenerPedidosPendientes() {
        return pedidoRepository.findByEstado("PENDIENTE")
                .stream()
                .map(this::mapearADTO)
                .collect(Collectors.toList());
    }

    /**
     * Método auxiliar para transformar Entidad a DTO.
     */
    private PedidoResponseDTO mapearADTO(PedidoModel pedido) {
        PedidoResponseDTO dto = new PedidoResponseDTO();
        dto.setId(pedido.getId());
        dto.setUsuarioId(pedido.getUsuarioId());
        dto.setTotal(pedido.getTotal());
        dto.setEstado(pedido.getEstado());
        dto.setFechaCreacion(pedido.getFechaCreacion());

        List<ItemPedidoRequestDTO> itemsDto = pedido.getItems().stream().map(item -> {
            ItemPedidoRequestDTO itemDto = new ItemPedidoRequestDTO();
            itemDto.setProductoId(item.getProductoId());
            itemDto.setNombreProducto(item.getNombreProducto());
            itemDto.setPrecioUnitario(item.getPrecioUnitario());
            itemDto.setCantidad(item.getCantidad());
            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(itemsDto);
        return dto;
    }
}
