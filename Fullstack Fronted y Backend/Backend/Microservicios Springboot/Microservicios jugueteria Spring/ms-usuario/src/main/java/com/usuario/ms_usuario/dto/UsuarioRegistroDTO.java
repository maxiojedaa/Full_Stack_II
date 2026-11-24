package com.usuario.ms_usuario.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UsuarioRegistroDTO {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre admite hasta 100 caracteres")
    @Schema(example = "Usuario de prueba")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    @Size(max = 254, message = "El email es demasiado largo")
    @Schema(example = "usuario@pixeltoys.example")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
    @Schema(example = "DemoPixel2026!", format = "password", accessMode = Schema.AccessMode.WRITE_ONLY,
            description = "Mínimo 8 caracteres; máximo 72 bytes UTF-8")
    private String password;
}
