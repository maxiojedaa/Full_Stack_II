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
 * Permite realizar operaciones de consulta, adición, actualización de cantidad,
 * eliminación de ítems y vaciado del carrito.
 */
@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    @Autowired
    private CarritoService carritoService;

    /**
     * Endpoint para obtener el carrito de compras de un usuario.
     * Ruta: GET /api/carrito/{usuarioId}
     *
     * @param usuarioId identificador del usuario
     * @return carrito actual del usuario
     */
    @GetMapping("/{usuarioId}")
    public ResponseEntity<CarritoResponseDTO> obtenerCarrito(@PathVariable Long usuarioId) {
        CarritoResponseDTO carrito = carritoService.obtenerCarritoPorUsuario(usuarioId);
        return ResponseEntity.ok(carrito);
    }

    /**
     * Endpoint para agregar un producto al carrito o incrementar su cantidad.
     * Ruta: POST /api/carrito/{usuarioId}/items
     *
     * @param usuarioId identificador del usuario
     * @param request datos del ítem a agregar
     * @return carrito actualizado o error HTTP si ocurre un fallo
     */
    @PostMapping("/{usuarioId}/items")
    public ResponseEntity<?> agregarItem(
            @PathVariable Long usuarioId,
            @RequestBody ItemCarritoRequestDTO request) {
        try {
            CarritoResponseDTO carritoActualizado = carritoService.agregarItem(usuarioId, request);
            return ResponseEntity.ok(carritoActualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al agregar item: " + e.getMessage());
        }
    }

    /**
     * Endpoint para actualizar la cantidad de un ítem existente en el carrito.
     * Permite disminuir o aumentar cantidades respetando el tope máximo de 10 unidades.
     * Ruta: PUT /api/carrito/{usuarioId}/items/{itemId}
     *
     * @param usuarioId identificador del usuario
     * @param itemId identificador del ítem en el carrito
     * @param request DTO con la nueva cantidad y precio unitario
     * @return carrito actualizado con subtotales y total recalculados
     */
    @PutMapping("/{usuarioId}/items/{itemId}")
    public ResponseEntity<?> actualizarCantidadItem(
            @PathVariable Long usuarioId,
            @PathVariable Long itemId,
            @RequestBody ItemCarritoRequestDTO request) {
        try {
            CarritoResponseDTO carritoActualizado = carritoService.actualizarCantidadItem(
                    usuarioId,
                    itemId,
                    request
            );
            return ResponseEntity.ok(carritoActualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al actualizar cantidad: " + e.getMessage());
        }
    }

    /**
     * Endpoint para eliminar un producto específico del carrito por su ID de ítem.
     * Ruta: DELETE /api/carrito/{usuarioId}/items/{itemId}
     *
     * @param usuarioId identificador del usuario
     * @param itemId identificador del ítem a eliminar
     * @return carrito actualizado
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
     *
     * @param usuarioId identificador del usuario
     * @return carrito vacío
     */
    @DeleteMapping("/{usuarioId}/vaciar")
    public ResponseEntity<CarritoResponseDTO> vaciarCarrito(
            @PathVariable Long usuarioId) {

        CarritoResponseDTO carritoVaciado = carritoService.vaciarCarrito(usuarioId);
        return ResponseEntity.ok(carritoVaciado);
    }
}