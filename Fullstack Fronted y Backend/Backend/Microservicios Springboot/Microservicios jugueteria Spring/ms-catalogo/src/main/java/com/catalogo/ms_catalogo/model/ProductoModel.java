package com.catalogo.ms_catalogo.model;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Entidad JPA que representa un producto dentro del catálogo de la juguetería.
 * Mapea la tabla "productos" en la base de datos H2 en memoria.
 */
@Entity
@Table(name = "productos")
@Data
public class ProductoModel {

    /**
     * Identificador único del producto (Clave primaria autoincremental).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nombre comercial del juguete o producto.
     */
    private String nombre;

    /**
     * Descripción detallada de las características del producto.
     */
    private String descripcion;

    /**
     * Precio unitario de venta del producto.
     */
    private Double precio;

    /**
     * Cantidad de unidades disponibles en el inventario.
     */
    private Integer stock;

    /**
     * Categoría a la que pertenece el producto.
     */
    private String categoria;

    // Getters manuales para asegurar la compilación limpia sin depender de Lombok
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
}