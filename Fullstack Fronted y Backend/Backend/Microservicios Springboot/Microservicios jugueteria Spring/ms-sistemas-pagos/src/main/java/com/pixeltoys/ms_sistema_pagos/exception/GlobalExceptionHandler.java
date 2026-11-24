package com.pixeltoys.ms_sistema_pagos.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Errores generados por nuestras reglas de negocio
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> manejarErrorNegocio(
            ResponseStatusException ex) {

        HttpStatus estado = HttpStatus.valueOf(
                ex.getStatusCode().value());

        return construirRespuesta(
                estado,
                ex.getReason() != null
                        ? ex.getReason()
                        : "Solicitud no valida"
        );
    }

    // Conflictos de integridad en la base de datos
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> manejarConflictoBD(
            DataIntegrityViolationException ex) {

        return construirRespuesta(
                HttpStatus.CONFLICT,
                "La operacion entra en conflicto con los datos existentes"
        );
    }

    // Construye una respuesta JSON uniforme
    private ResponseEntity<Map<String, Object>> construirRespuesta(
            HttpStatus estado, String mensaje) {

        Map<String, Object> respuesta = new LinkedHashMap<>();

        respuesta.put("timestamp", LocalDateTime.now());
        respuesta.put("estado", estado.value());
        respuesta.put("error", estado.getReasonPhrase());
        respuesta.put("mensaje", mensaje);

        return ResponseEntity.status(estado).body(respuesta);
    }
}
