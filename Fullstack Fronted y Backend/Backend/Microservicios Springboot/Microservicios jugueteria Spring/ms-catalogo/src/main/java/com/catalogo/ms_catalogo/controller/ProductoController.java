package com.catalogo.ms_catalogo.controller;

import com.catalogo.ms_catalogo.dto.ProductoResponseDTO;
import com.catalogo.ms_catalogo.model.ProductoModel;
import com.catalogo.ms_catalogo.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controlador REST que expone los endpoints HTTP para la navegación del
 * catálogo.
 * Ruta base: /api/catalogo
 */
@RestController
@RequestMapping("/api/catalogo")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    /**
     * Endpoint HTTP GET para acceder al catálogo completo de productos mediante
     * DTO.
     * Ruta completa: GET http://localhost:8082/api/catalogo
     * 
     * @return ResponseEntity con la lista de DTOs de productos y código de estado
     *         200 OK.
     */
    @GetMapping
    public ResponseEntity<List<ProductoResponseDTO>> obtenerCatalogo() {
        List<ProductoResponseDTO> productos = productoService.obtenerCatalogoCompleto();
        return ResponseEntity.ok(productos);
    }

    // 1. CREAR PRODUCTO (POST)
    @PostMapping
    public ResponseEntity<ProductoResponseDTO> crearProducto(@RequestBody ProductoModel producto) {
        ProductoResponseDTO nuevo = productoService.guardarProducto(producto);
        return ResponseEntity.ok(nuevo);
    }

    // 2. EDITAR PRODUCTO / PRECIO (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> actualizarProducto(@PathVariable Long id,
            @RequestBody ProductoModel producto) {
        ProductoResponseDTO actualizado = productoService.actualizarProducto(id, producto);
        return ResponseEntity.ok(actualizado);
    }

    // 3. ELIMINAR PRODUCTO (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }
}