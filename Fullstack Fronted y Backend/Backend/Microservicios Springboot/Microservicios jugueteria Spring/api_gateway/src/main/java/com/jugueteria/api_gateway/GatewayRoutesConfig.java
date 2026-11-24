package com.jugueteria.api_gateway;

import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.stripPrefix;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouterFunction<ServerResponse> usuariosRoute() {
        return route("ms-usuario")
                .route(RequestPredicates.path("/api/usuarios/**"), http())
                .before(uri("http://localhost:8081"))
                .before(stripPrefix(1))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> carritoRoute() {
        return route("ms-carrito")
                .route(RequestPredicates.path("/api/carrito/**"), http())
                .before(uri("http://localhost:8082"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> catalogoRoute() {
        return route("ms-catalogo")
                .route(RequestPredicates.path("/api/catalogo/**"), http())
                .before(uri("http://localhost:8083"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> pedidosRoute() {
        return route("ms-pedidos")
                .route(RequestPredicates.path("/api/pedidos/**"), http())
                .before(uri("http://localhost:8084"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> stockRoute() {
        return route("ms-stock")
                .route(RequestPredicates.path("/api/productos/**"), http())
                .before(uri("http://localhost:8086"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> pagosRoute() {
        return route("ms-sistema-pago")
                .route(RequestPredicates.path("/api/pagos/**"), http())
                .before(uri("http://localhost:8085"))
                .build();
    }
}