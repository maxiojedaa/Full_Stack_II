package com.ms_carrito.ms_carrito.service;

import com.ms_carrito.ms_carrito.dto.CarritoResponseDTO;
import com.ms_carrito.ms_carrito.dto.ItemCarritoRequestDTO;
import com.ms_carrito.ms_carrito.dto.ItemCarritoResponseDTO;
import com.ms_carrito.ms_carrito.model.Carrito;
import com.ms_carrito.ms_carrito.model.ItemCarrito;
import com.ms_carrito.ms_carrito.repository.CarritoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

/**
 * Servicio que encapsula la lógica de negocio para la gestión del carrito de
 * compras.
 * Implementa las reglas asociadas a las historias de usuario de la épica de
 * carrito, incluyendo el límite máximo de 10 unidades por producto.
 */
@Service
public class CarritoService {

    private static final int MAX_CANTIDAD_POR_PRODUCTO = 10;

    @Autowired
    private CarritoRepository carritoRepository;

    /**
     * Obtiene el carrito de compras asociado a un usuario.
     * Si no existe, crea uno nuevo para garantizar la persistencia de sesión.
     *
     * @param usuarioId identificador del usuario
     * @return DTO con los ítems y el total actual del carrito
     */
    public CarritoResponseDTO obtenerCarritoPorUsuario(Long usuarioId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    Carrito nuevo = new Carrito();
                    nuevo.setUsuarioId(usuarioId);
                    return carritoRepository.save(nuevo);
                });
        return mapearADTO(carrito);
    }

    /**
     * Agrega un producto al carrito del usuario o incrementa su cantidad.
     * Si el producto ya existe, suma la cantidad solicitada sin superar las 10 unidades.
     *
     * @param usuarioId identificador del usuario
     * @param request DTO con productoId, cantidad y precioUnitario
     * @return DTO del carrito actualizado
     */
    public CarritoResponseDTO agregarItem(Long usuarioId, ItemCarritoRequestDTO request) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    Carrito nuevo = new Carrito();
                    nuevo.setUsuarioId(usuarioId);
                    return carritoRepository.save(nuevo);
                });

        int cantidadSolicitada = request.getCantidad() != null ? request.getCantidad() : 1;
        if (cantidadSolicitada <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0.");
        }

        // Buscar si el ítem ya existe en el carrito usando getIdProducto()
        ItemCarrito itemExistente = carrito.getItems().stream()
                .filter(i -> i.getIdProducto() != null && i.getIdProducto().equals(request.getProductoId()))
                .findFirst()
                .orElse(null);

        if (itemExistente != null) {
            int nuevaCantidad = itemExistente.getCantidad() + cantidadSolicitada;
            if (nuevaCantidad > MAX_CANTIDAD_POR_PRODUCTO) {
                throw new IllegalArgumentException(
                        "No se pueden agregar más de " + MAX_CANTIDAD_POR_PRODUCTO + " unidades por producto."
                );
            }
            itemExistente.setCantidad(nuevaCantidad);
            if (request.getPrecioUnitario() != null) {
                itemExistente.setPrecioUnitario(request.getPrecioUnitario());
            }
        } else {
            if (cantidadSolicitada > MAX_CANTIDAD_POR_PRODUCTO) {
                throw new IllegalArgumentException(
                        "No se pueden agregar más de " + MAX_CANTIDAD_POR_PRODUCTO + " unidades por producto."
                );
            }
            ItemCarrito nuevoItem = new ItemCarrito();
            nuevoItem.setIdProducto(request.getProductoId());
            nuevoItem.setCantidad(cantidadSolicitada);
            nuevoItem.setPrecioUnitario(request.getPrecioUnitario() != null ? request.getPrecioUnitario() : 0.0);
            carrito.getItems().add(nuevoItem);
        }

        Carrito carritoGuardado = carritoRepository.save(carrito);
        return mapearADTO(carritoGuardado);
    }

    /**
     * Actualiza la cantidad exacta de un ítem existente en el carrito.
     * Si la cantidad es menor o igual a 0, elimina el ítem; si supera 10, lanza excepción.
     *
     * @param usuarioId identificador del usuario
     * @param itemId identificador del ítem dentro del carrito
     * @param request DTO con la nueva cantidad y precio unitario opcional
     * @return DTO del carrito actualizado
     */
    public CarritoResponseDTO actualizarCantidadItem(Long usuarioId, Long itemId, ItemCarritoRequestDTO request) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado para el usuario: " + usuarioId));

        ItemCarrito itemExistente = carrito.getItems().stream()
                .filter(i -> i.getId() != null && i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Ítem no encontrado en el carrito: " + itemId));

        int nuevaCantidad = request.getCantidad() != null ? request.getCantidad() : itemExistente.getCantidad();

        if (nuevaCantidad > MAX_CANTIDAD_POR_PRODUCTO) {
            throw new IllegalArgumentException(
                    "No se pueden agregar más de " + MAX_CANTIDAD_POR_PRODUCTO + " unidades por producto."
            );
        }

        if (nuevaCantidad <= 0) {
            carrito.getItems().removeIf(i -> i.getId() != null && i.getId().equals(itemId));
        } else {
            itemExistente.setCantidad(nuevaCantidad);
            if (request.getPrecioUnitario() != null) {
                itemExistente.setPrecioUnitario(request.getPrecioUnitario());
            }
        }

        Carrito carritoGuardado = carritoRepository.save(carrito);
        return mapearADTO(carritoGuardado);
    }

    /**
     * Elimina un producto específico del carrito por su ID de ítem.
     *
     * @param usuarioId identificador del usuario
     * @param itemId identificador del ítem a eliminar
     * @return DTO del carrito actualizado
     */
    public CarritoResponseDTO eliminarItem(Long usuarioId, Long itemId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado para el usuario: " + usuarioId));

        carrito.getItems().removeIf(item -> item.getId().equals(itemId));
        Carrito carritoGuardado = carritoRepository.save(carrito);
        return mapearADTO(carritoGuardado);
    }

    /**
     * Vacía por completo el contenido del carrito de compras.
     *
     * @param usuarioId identificador del usuario
     * @return DTO del carrito vacío
     */
    public CarritoResponseDTO vaciarCarrito(Long usuarioId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado para el usuario: " + usuarioId));

        carrito.getItems().clear();
        Carrito carritoGuardado = carritoRepository.save(carrito);
        return mapearADTO(carritoGuardado);
    }

    /**
     * Método auxiliar privado para transformar la entidad Carrito en un
     * CarritoResponseDTO recalculando subtotales y total general.
     *
     * @param carrito entidad persistida del carrito
     * @return DTO de respuesta del carrito
     */
    private CarritoResponseDTO mapearADTO(Carrito carrito) {
        CarritoResponseDTO dto = new CarritoResponseDTO();
        dto.setId(carrito.getId());
        dto.setUsuarioId(carrito.getUsuarioId());

        var itemsDto = carrito.getItems().stream().map(item -> {
            ItemCarritoResponseDTO itemDto = new ItemCarritoResponseDTO();
            itemDto.setId(item.getId());
            itemDto.setProductoId(item.getIdProducto());
            itemDto.setCantidad(item.getCantidad());
            itemDto.setPrecioUnitario(item.getPrecioUnitario());
            itemDto.setSubtotal(item.getCantidad() * item.getPrecioUnitario());
            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(itemsDto);
        double totalGeneral = itemsDto.stream().mapToDouble(ItemCarritoResponseDTO::getSubtotal).sum();
        dto.setTotal(totalGeneral);

        return dto;
    }
}