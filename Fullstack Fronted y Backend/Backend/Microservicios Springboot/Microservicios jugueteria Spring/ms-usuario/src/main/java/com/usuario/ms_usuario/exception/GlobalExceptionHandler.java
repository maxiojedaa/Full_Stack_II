package com.usuario.ms_usuario.exception;

import com.usuario.ms_usuario.dto.ErrorResponseDTO;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ErrorResponseDTO> manejarEstado(ResponseStatusException ex) {
        return respuesta(ex.getStatusCode(), ex.getReason(), Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponseDTO> manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errores.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return respuesta(HttpStatus.BAD_REQUEST, "Revise los datos enviados", errores);
    }

    @ExceptionHandler({HandlerMethodValidationException.class, MethodArgumentTypeMismatchException.class})
    ResponseEntity<ErrorResponseDTO> manejarParametros(Exception ex) {
        return respuesta(HttpStatus.BAD_REQUEST, "Los identificadores deben ser números enteros positivos", Map.of());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ErrorResponseDTO> manejarJson(HttpMessageNotReadableException ex) {
        return respuesta(HttpStatus.BAD_REQUEST, "El cuerpo JSON falta o tiene un formato inválido", Map.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ErrorResponseDTO> manejarDuplicado(DataIntegrityViolationException ex) {
        return respuesta(HttpStatus.CONFLICT, "El registro entra en conflicto con datos existentes", Map.of());
    }

    private ResponseEntity<ErrorResponseDTO> respuesta(HttpStatusCode estado, String mensaje,
            Map<String, String> errores) {
        return ResponseEntity.status(estado).body(
                new ErrorResponseDTO(Instant.now(), estado.value(), mensaje, errores));
    }
}
