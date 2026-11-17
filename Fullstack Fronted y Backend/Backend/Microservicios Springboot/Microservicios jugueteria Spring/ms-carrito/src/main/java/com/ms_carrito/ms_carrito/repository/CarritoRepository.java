package com.ms_carrito.ms_carrito.repository;

import com.ms_carrito.ms_carrito.model.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repositorio JPA para administrar la persistencia de la entidad Carrito.
 * Proporciona metodos de acceso a datos para las operaciones CRUD del carrito de compras.
 */
public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    /**
     * Busca el carrito de compras asociado a un usuario especifico.
     * Permite recuperar la sesion y mantener el carrito guardado (HU15).
     * 
     * @param usuarioId ID del usuario propietario del carrito.
     * @return Un Optional que contiene el carrito si existe en la base de datos.
     */
    Optional<Carrito> findByUsuarioId(Long usuarioId);
}