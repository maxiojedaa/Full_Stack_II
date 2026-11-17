package com.usuario.ms_usuario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String tipoToken;
    private long expiraEnSegundos;
    private UsuarioResponseDTO usuario;
}
