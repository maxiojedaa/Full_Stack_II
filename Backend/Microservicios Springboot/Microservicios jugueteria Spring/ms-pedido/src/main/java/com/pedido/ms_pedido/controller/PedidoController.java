package com.pedido.ms_pedido.controller;

import com.pedido.ms_pedido.dto.PedidoRequestDTO;
import com.pedido.ms_pedido.dto.PedidoResponseDTO;
import com.pedido.ms_pedido.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
    @Autowired
    private PedidoService pedidoService;

    /**
     * Endpoint para registrar un pedido automáticamente (HU53, HU54).
     * Ruta: POST /api/pedidos
     */
    @PostMapping
    public ResponseEntity<PedidoResponseDTO> registrarPedido(@RequestBody PedidoRequestDTO request) {
        PedidoResponseDTO nuevoPedido = pedidoService.registrarPedido(request);
        return ResponseEntity.ok(nuevoPedido);
    }

    /**
     * Endpoint para ver el historial de pedidos de un usuario (HU56).
     * Ruta: GET /api/pedidos/usuario/{usuarioId}
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<PedidoResponseDTO>> obtenerPedidosPorUsuario(@PathVariable Long usuarioId) {
        List<PedidoResponseDTO> pedidos = pedidoService.obtenerPedidosPorUsuario(usuarioId);
        return ResponseEntity.ok(pedidos);
    }

    /**
     * Endpoint para que el administrador vea los pedidos pendientes (HU29).
     * Ruta: GET /api/pedidos/pendientes
     */
    @GetMapping("/pendientes")
    public ResponseEntity<List<PedidoResponseDTO>> obtenerPedidosPendientes() {
        List<PedidoResponseDTO> pendientes = pedidoService.obtenerPedidosPendientes();
        return ResponseEntity.ok(pendientes);
    }
}
