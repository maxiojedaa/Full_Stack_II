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
 * carrito.
 */
@Service
public class CarritoService {

    @Autowired
    private CarritoRepository carritoRepository;

    /**
     * Obtiene el carrito de compras asociado a un usuario.
     * Si no existe, crea uno nuevo para garantizar la persistencia de sesión.
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
     * Agrega un producto al carrito del usuario.
     * Si el producto ya se encuentra en el carrito, incrementa su cantidad.
     */
    public CarritoResponseDTO agregarItem(Long usuarioId, ItemCarritoRequestDTO request) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    Carrito nuevo = new Carrito();
                    nuevo.setUsuarioId(usuarioId);
                    return carritoRepository.save(nuevo);
                });

        // Buscar si el ítem ya existe en el carrito usando getIdProducto()
        ItemCarrito itemExistente = carrito.getItems().stream()
                .filter(i -> i.getIdProducto() != null && i.getIdProducto().equals(request.getProductoId()))
                .findFirst()
                .orElse(null);

        if (itemExistente != null) {
            itemExistente.setCantidad(itemExistente.getCantidad() + request.getCantidad());
            if (request.getPrecioUnitario() != null) {
                itemExistente.setPrecioUnitario(request.getPrecioUnitario());
            }
        } else {
            ItemCarrito nuevoItem = new ItemCarrito();
            nuevoItem.setIdProducto(request.getProductoId()); // Usar setIdProducto
            nuevoItem.setCantidad(request.getCantidad());
            nuevoItem.setPrecioUnitario(request.getPrecioUnitario() != null ? request.getPrecioUnitario() : 0.0);
            carrito.getItems().add(nuevoItem);
        }

        Carrito carritoGuardado = carritoRepository.save(carrito);
        return mapearADTO(carritoGuardado);
    }

    /**
     * Elimina un producto específico del carrito por su ID de ítem.
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
     * CarritoResponseDTO.
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