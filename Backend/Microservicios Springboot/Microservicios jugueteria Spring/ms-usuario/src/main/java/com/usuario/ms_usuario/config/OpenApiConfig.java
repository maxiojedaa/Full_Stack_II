package com.usuario.ms_usuario.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI usuariosOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Pixel & Toys — Usuarios y favoritos").version("1.0.0")
                        .description("Registre un usuario, inicie sesión y copie el token en Authorize. "
                                + "Los favoritos guardan únicamente ID de productos."))
                .components(new Components().addSecuritySchemes("bearerAuth",
                        new SecurityScheme().type(SecurityScheme.Type.HTTP)
                                .scheme("bearer").bearerFormat("JWT")));
    }
}
