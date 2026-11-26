package com.pedido.ms_pedido.controller;

import com.pedido.ms_pedido.dto.PedidoRequestDTO;
import com.pedido.ms_pedido.dto.PedidoResponseDTO;
import com.pedido.ms_pedido.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    /**
     * Endpoint para obtener la lista completa de todos los pedidos registrados en el sistema.
     * Ruta: GET /api/pedidos
     */
    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> obtenerTodosLosPedidos() {
        List<PedidoResponseDTO> pedidos = pedidoService.obtenerTodosLosPedidos();
        return ResponseEntity.ok(pedidos);
    }

    /**
     * Endpoint para cambiar el estado de un pedido (ej. PENDIENTE -> CANCELADO).
     * Ruta: PATCH /api/pedidos/{id}/estado
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<PedidoResponseDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String nuevoEstado = body.get("estado");
        PedidoResponseDTO actualizado = pedidoService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPedido(@PathVariable Long id) {
        pedidoService.eliminarPedido(id);
        return ResponseEntity.noContent().build();
    }
}