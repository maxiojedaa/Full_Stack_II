package com.ms_carrito.ms_carrito.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad que representa el Carrito de Compras de un usuario.
 * Cumple con la persistencia para mantener el carrito guardado (HU15)
 * y agrupa los productos seleccionados para la compra (HU11).
 */
@Entity
@Table(name = "carritos")
@Data
public class Carrito {

    /**
     * Identificador único del carrito en la base de datos.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Identificador del usuario propietario del carrito.
     * Permite asociar la sesión y mantener el carrito guardado (HU15).
     */
    private Long usuarioId;

    /**
     * Lista de ítems o productos contenidos dentro del carrito.
     * Utiliza CascadeType.ALL para que cualquier cambio en los ítems 
     * se guarde o elimine automáticamente junto con el carrito.
     */
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "carrito_id")
    private List<ItemCarrito> items = new ArrayList<>();
}