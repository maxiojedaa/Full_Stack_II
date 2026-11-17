package com.usuario.ms_usuario.dto;

import java.time.Instant;
import java.util.Map;

public record ErrorResponseDTO(
        Instant fecha, int estado, String mensaje, Map<String, String> errores) {
}
