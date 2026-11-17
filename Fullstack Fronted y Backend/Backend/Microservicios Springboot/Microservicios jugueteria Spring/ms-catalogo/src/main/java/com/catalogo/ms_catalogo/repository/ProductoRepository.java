package com.catalogo.ms_catalogo.repository;

import com.catalogo.ms_catalogo.model.ProductoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de Spring Data JPA para gestionar la persistencia y consultas
 * de la entidad ProductoModel en la base de datos.
 */
@Repository
public interface ProductoRepository extends JpaRepository<ProductoModel, Long> {
    // Hereda métodos estándar como findAll(), findById(), save(), etc.
}