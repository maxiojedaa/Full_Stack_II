package com.usuario.ms_usuario.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

/** Usuario y sus ID de productos favoritos. Los productos pertenecen al catálogo. */
@Entity
@Table(name = "usuarios", uniqueConstraints = @UniqueConstraint(
        name = "uk_usuario_email", columnNames = "email"))
@Getter
@Setter
public class UsuarioModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 254)
    private String email;

    // Solo se almacena el hash BCrypt; nunca se devuelve en los DTO.
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RolUsuario rol = RolUsuario.USUARIO;

    @Column(nullable = false, updatable = false)
    private Instant fechaCreacion;

    @ElementCollection
    @CollectionTable(name = "usuario_favoritos",
            joinColumns = @JoinColumn(name = "usuario_id"),
            uniqueConstraints = @UniqueConstraint(name = "uk_usuario_favorito",
                    columnNames = {"usuario_id", "producto_id"}))
    @Column(name = "producto_id", nullable = false)
    private Set<Long> favoritos = new LinkedHashSet<>();

    @PrePersist
    void asignarFechaCreacion() {
        if (fechaCreacion == null) fechaCreacion = Instant.now();
    }
}
