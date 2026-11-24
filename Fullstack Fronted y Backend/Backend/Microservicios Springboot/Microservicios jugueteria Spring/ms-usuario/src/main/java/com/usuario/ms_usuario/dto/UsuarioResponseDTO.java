package com.usuario.ms_usuario.dto;

import com.usuario.ms_usuario.model.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
public class UsuarioResponseDTO {
    private Long id;
    private String nombre;
    private String email;
    private RolUsuario rol;
    private Instant fechaCreacion;
    private List<Long> favoritos;
}
