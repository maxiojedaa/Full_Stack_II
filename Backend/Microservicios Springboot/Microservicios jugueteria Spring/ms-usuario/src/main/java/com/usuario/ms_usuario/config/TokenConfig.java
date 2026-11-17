package com.usuario.ms_usuario.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

@Configuration
public class TokenConfig {
    @Bean
    SecretKey jwtKey(@Value("${app.jwt.secret-base64:}") String configurada) {
        byte[] bytes;
        if (configurada.isBlank()) {
            bytes = new byte[32];
            new SecureRandom().nextBytes(bytes);
            LoggerFactory.getLogger(TokenConfig.class).info(
                    "JWT: clave temporal de desarrollo; al reiniciar deberá iniciar sesión otra vez.");
        } else {
            try { bytes = Base64.getDecoder().decode(configurada); }
            catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("JWT_SECRET_BASE64 debe contener Base64 válido", e);
            }
            if (bytes.length < 32) throw new IllegalArgumentException("La clave JWT debe tener al menos 32 bytes");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey key) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(key));
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey key) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer("ms-usuario"));
        return decoder;
    }
}
