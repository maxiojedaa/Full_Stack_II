package com.usuario.ms_usuario.repository;

import com.usuario.ms_usuario.model.UsuarioModel;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<UsuarioModel, Long> {
    Optional<UsuarioModel> findByEmail(String email);
    boolean existsByEmail(String email);

    // Serializa los cambios de favoritos del mismo usuario para evitar perder cambios.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from UsuarioModel u where u.id = :id")
    Optional<UsuarioModel> buscarParaActualizar(@Param("id") Long id);
}
