package com.catalogo.ms_catalogo.service;

import com.catalogo.ms_catalogo.dto.ProductoResponseDTO;
import com.catalogo.ms_catalogo.model.ProductoModel;
import com.catalogo.ms_catalogo.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Capa de servicio que encapsula la lógica de negocio para la gestión del
 * catálogo.
 * Da cumplimiento a los requerimientos de la historia de usuario HU62 mediante
 * DTOs.
 */
@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    /**
     * Obtiene el catálogo completo con todos los productos registrados en el
     * sistema,
     * transformando las entidades a DTOs para su exposición externa (HU62).
     * 
     * @return Lista de ProductoResponseDTO con los datos de los productos.
     */
    public List<ProductoResponseDTO> obtenerCatalogoCompleto() {
        List<ProductoModel> productosModel = productoRepository.findAll();

        // Mapeamos cada entidad de la base de datos a un DTO de respuesta
        return productosModel.stream().map(producto -> {
            ProductoResponseDTO dto = new ProductoResponseDTO();
            dto.setId(producto.getId());
            dto.setNombre(producto.getNombre());
            dto.setDescripcion(producto.getDescripcion());
            dto.setPrecio(producto.getPrecio());
            dto.setStock(producto.getStock());
            dto.setCategoria(producto.getCategoria());
            return dto;
        }).collect(Collectors.toList());
    }

    public ProductoResponseDTO guardarProducto(ProductoModel producto) {
        ProductoModel guardado = productoRepository.save(producto);
        return mapearADTO(guardado);
    }

    public ProductoResponseDTO actualizarProducto(Long id, ProductoModel detalles) {
        ProductoModel producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setNombre(detalles.getNombre());
        producto.setPrecio(detalles.getPrecio());
        producto.setDescripcion(detalles.getDescripcion());

        ProductoModel actualizado = productoRepository.save(producto);
        return mapearADTO(actualizado);
    }

    public void eliminarProducto(Long id) {
        productoRepository.deleteById(id);
    }

    // Método auxiliar de mapeo
    private ProductoResponseDTO mapearADTO(ProductoModel producto) {
        ProductoResponseDTO dto = new ProductoResponseDTO();
        dto.setId(producto.getId());
        dto.setNombre(producto.getNombre());
        dto.setDescripcion(producto.getDescripcion());
        dto.setPrecio(producto.getPrecio());
        dto.setStock(producto.getStock());
        dto.setCategoria(producto.getCategoria());
        return dto;
    }
}