package com.usuario.ms_usuario.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoginRequestDTO {
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    @Size(max = 254)
    @Schema(example = "usuario@pixeltoys.example")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(max = 72)
    @Schema(example = "DemoPixel2026!", format = "password", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String password;
}
