package com.usuario.ms_usuario.controller;

import com.usuario.ms_usuario.dto.*;
import com.usuario.ms_usuario.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Registro, acceso y favoritos de Pixel & Toys")
public class UsuarioController {
    private final UsuarioService usuarioService;

    @PostMapping("/registro")
    @Operation(summary = "Registrar un usuario con rol USUARIO")
    @ApiResponse(responseCode = "201", description = "Usuario creado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "409", description = "Email ya registrado")
    public ResponseEntity<UsuarioResponseDTO> registrar(@Valid @RequestBody UsuarioRegistroDTO request) {
        UsuarioResponseDTO usuario = usuarioService.registrar(request);
        return ResponseEntity.created(URI.create("/api/usuarios/" + usuario.getId())).body(usuario);
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión y obtener un token JWT")
    @ApiResponse(responseCode = "200", description = "Credenciales válidas")
    @ApiResponse(responseCode = "401", description = "Email o contraseña incorrectos")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
        return usuarioService.login(request);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Listar usuarios (solo ADMIN)")
    public List<UsuarioResponseDTO> obtenerTodos() {
        return usuarioService.obtenerTodos();
    }

    @GetMapping("/{usuarioId}")
    @PreAuthorize("hasRole('ADMIN') or #usuarioId.toString() == authentication.name")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Consultar un usuario (propietario o ADMIN)")
    public UsuarioResponseDTO obtenerPorId(@PathVariable @Positive Long usuarioId) {
        return usuarioService.obtenerPorId(usuarioId);
    }

    @GetMapping("/{usuarioId}/favoritos")
    @PreAuthorize("hasRole('ADMIN') or #usuarioId.toString() == authentication.name")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Consultar ID de productos favoritos")
    public List<Long> obtenerFavoritos(@PathVariable @Positive Long usuarioId) {
        return usuarioService.obtenerFavoritos(usuarioId);
    }

    @PostMapping("/{usuarioId}/favoritos/{productoId}")
    @PreAuthorize("hasRole('ADMIN') or #usuarioId.toString() == authentication.name")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Agregar un producto a favoritos sin duplicarlo",
            description = "Guarda un ID positivo. La consulta de existencia del producto en catálogo queda para la integración.")
    public List<Long> agregarFavorito(@PathVariable @Positive Long usuarioId,
            @PathVariable @Positive Long productoId) {
        return usuarioService.agregarFavorito(usuarioId, productoId);
    }

    @DeleteMapping("/{usuarioId}/favoritos/{productoId}")
    @PreAuthorize("hasRole('ADMIN') or #usuarioId.toString() == authentication.name")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Eliminar un favorito; si no estaba agregado, mantiene la lista")
    public List<Long> eliminarFavorito(@PathVariable @Positive Long usuarioId,
            @PathVariable @Positive Long productoId) {
        return usuarioService.eliminarFavorito(usuarioId, productoId);
    }

    @DeleteMapping("/{usuarioId}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Eliminar un usuario por ID (solo ADMIN)")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable @Positive Long usuarioId) {
        usuarioService.eliminarUsuario(usuarioId);
        return ResponseEntity.noContent().build();
    }
}
