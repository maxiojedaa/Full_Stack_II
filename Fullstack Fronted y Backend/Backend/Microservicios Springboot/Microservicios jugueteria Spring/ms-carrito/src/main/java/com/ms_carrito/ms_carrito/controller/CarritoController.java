package com.ms_carrito.ms_carrito.controller;

import com.ms_carrito.ms_carrito.dto.CarritoResponseDTO;
import com.ms_carrito.ms_carrito.dto.ItemCarritoRequestDTO;
import com.ms_carrito.ms_carrito.service.CarritoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST que expone los endpoints HTTP para la gestión del carrito de
 * compras.
 * Permite realizar operaciones de consulta, adición, eliminación y vaciado del
 * carrito.
 */
@RestController
@RequestMapping("/api/carrito")
@CrossOrigin(origins = "*")
public class CarritoController {
    @Autowired
    private CarritoService carritoService;

    /**
     * Endpoint para obtener el carrito de compras de un usuario.
     * Ruta: GET /api/carrito/{usuarioId}
     */
    @GetMapping("/{usuarioId}")
    public ResponseEntity<CarritoResponseDTO> obtenerCarrito(@PathVariable Long usuarioId) {
        CarritoResponseDTO carrito = carritoService.obtenerCarritoPorUsuario(usuarioId);
        return ResponseEntity.ok(carrito);
    }

    /**
     * Endpoint para agregar un producto al carrito.
     * Ruta: POST /api/carrito/{usuarioId}/items
     */
    @PostMapping("/{usuarioId}/items")
    public ResponseEntity<?> agregarItem(
            @PathVariable Long usuarioId,
            @RequestBody ItemCarritoRequestDTO request) {
        try {
            CarritoResponseDTO carritoActualizado = carritoService.agregarItem(usuarioId, request);
            return ResponseEntity.ok(carritoActualizado);
        } catch (Exception e) {
            e.printStackTrace(); // Esto obliga a imprimir la traza completa del error en tu terminal
            return ResponseEntity.status(500).body("Error al agregar item: " + e.getMessage());
        }
    }

    /**
     * Endpoint para eliminar un producto específico del carrito por su ID de ítem.
     * Ruta: DELETE /api/carrito/{usuarioId}/items/{itemId}
     */
    @DeleteMapping("/{usuarioId}/items/{itemId}")
    public ResponseEntity<CarritoResponseDTO> eliminarItem(
            @PathVariable Long usuarioId,
            @PathVariable Long itemId) {

        CarritoResponseDTO carritoActualizado = carritoService.eliminarItem(usuarioId, itemId);
        return ResponseEntity.ok(carritoActualizado);
    }

    /**
     * Endpoint para vaciar por completo el carrito de compras.
     * Ruta: DELETE /api/carrito/{usuarioId}/vaciar
     */
    @DeleteMapping("/{usuarioId}/vaciar")
    public ResponseEntity<CarritoResponseDTO> vaciarCarrito(
            @PathVariable Long usuarioId) {

        CarritoResponseDTO carritoVaciado = carritoService.vaciarCarrito(usuarioId);
        return ResponseEntity.ok(carritoVaciado);
    }

}
