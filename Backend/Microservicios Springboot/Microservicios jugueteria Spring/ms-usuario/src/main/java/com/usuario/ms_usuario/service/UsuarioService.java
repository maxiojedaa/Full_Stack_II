package com.usuario.ms_usuario.service;

import com.usuario.ms_usuario.dto.*;
import com.usuario.ms_usuario.model.*;
import com.usuario.ms_usuario.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final String hashNoExistente;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
            TokenService tokenService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        // Permite comprobar un hash incluso cuando el email no existe.
        this.hashNoExistente = passwordEncoder.encode("usuario-inexistente-no-autenticable");
    }

    public UsuarioResponseDTO registrar(UsuarioRegistroDTO request) {
        validarLongitudPassword(request.getPassword());
        String email = normalizarEmail(request.getEmail());
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }
        UsuarioModel usuario = new UsuarioModel();
        usuario.setNombre(request.getNombre().trim());
        usuario.setEmail(email);
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        // El cliente no puede elegir ADMIN durante el registro.
        usuario.setRol(RolUsuario.USUARIO);
        return mapearADTO(usuarioRepository.saveAndFlush(usuario));
    }

    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO request) {
        validarLongitudPassword(request.getPassword());
        UsuarioModel usuario = usuarioRepository.findByEmail(normalizarEmail(request.getEmail())).orElse(null);
        String hash = usuario == null ? hashNoExistente : usuario.getPasswordHash();
        boolean passwordCorrecta = passwordEncoder.matches(request.getPassword(), hash);
        if (usuario == null || !passwordCorrecta) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos");
        }
        return new LoginResponseDTO(tokenService.crearToken(usuario), "Bearer",
                tokenService.getDuracionSegundos(), mapearADTO(usuario));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> obtenerTodos() {
        return usuarioRepository.findAll().stream().map(this::mapearADTO).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPorId(Long id) {
        return mapearADTO(buscarUsuario(id));
    }

    @Transactional(readOnly = true)
    public List<Long> obtenerFavoritos(Long id) {
        return buscarUsuario(id).getFavoritos().stream().sorted().toList();
    }

    public List<Long> agregarFavorito(Long id, Long productoId) {
        UsuarioModel usuario = buscarParaActualizar(id);
        usuario.getFavoritos().add(productoId);
        // JPA guarda el cambio al finalizar la transacción. Un Set evita duplicados.
        return usuario.getFavoritos().stream().sorted().toList();
    }

    public List<Long> eliminarFavorito(Long id, Long productoId) {
        UsuarioModel usuario = buscarParaActualizar(id);
        usuario.getFavoritos().remove(productoId);
        return usuario.getFavoritos().stream().sorted().toList();
    }

    private UsuarioModel buscarUsuario(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private UsuarioModel buscarParaActualizar(Long id) {
        return usuarioRepository.buscarParaActualizar(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private UsuarioResponseDTO mapearADTO(UsuarioModel usuario) {
        return new UsuarioResponseDTO(usuario.getId(), usuario.getNombre(), usuario.getEmail(),
                usuario.getRol(), usuario.getFechaCreacion(),
                usuario.getFavoritos().stream().sorted().toList());
    }

    private String normalizarEmail(String email) { return email.trim().toLowerCase(Locale.ROOT); }

    private void validarLongitudPassword(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La contraseña supera los 72 bytes UTF-8 admitidos por BCrypt");
        }
    }
}
