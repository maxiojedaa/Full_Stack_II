package com.catalogo.ms_catalogo.dto;

import lombok.Data;

/**
 * DTO (Data Transfer Object) para estructurar y transferir los datos
 * de los productos expuestos por el catálogo hacia los clientes.
 */
@Data
public class ProductoResponseDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private Double precio;
    private Integer stock;
    private String categoria;

    // Setters manuales para asegurar que compile a la primera sin depender de Lombok
    public void setId(Long id) { this.id = id; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setPrecio(Double precio) { this.precio = precio; }
    public void setStock(Integer stock) { this.stock = stock; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    // Getters manuales para que Jackson pueda serializar los datos a JSON
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getDescripcion() { return descripcion; }
    public Double getPrecio() { return precio; }
    public Integer getStock() { return stock; }
    public String getCategoria() { return categoria; }
}
