package com.usuario.ms_usuario.service;

import com.usuario.ms_usuario.model.UsuarioModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
public class TokenService {
    private final JwtEncoder encoder;
    private final long duracionSegundos;

    public TokenService(JwtEncoder encoder,
            @Value("${app.jwt.duracion-segundos:3600}") long duracionSegundos) {
        if (duracionSegundos <= 0) throw new IllegalArgumentException("La duración del token debe ser positiva");
        this.encoder = encoder;
        this.duracionSegundos = duracionSegundos;
    }

    public String crearToken(UsuarioModel usuario) {
        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("ms-usuario")
                .subject(usuario.getId().toString())
                .issuedAt(ahora)
                .expiresAt(ahora.plusSeconds(duracionSegundos))
                .claim("roles", List.of(usuario.getRol().name()))
                .build();
        JwsHeader cabecera = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(cabecera, claims)).getTokenValue();
    }

    public long getDuracionSegundos() { return duracionSegundos; }
}
