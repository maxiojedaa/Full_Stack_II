package com.usuario.ms_usuario;

import com.usuario.ms_usuario.model.RolUsuario;
import com.usuario.ms_usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.test.context.ActiveProfiles;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import java.net.URI;
import java.net.http.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class UsuarioApiIntegrationTest {
    @LocalServerPort int port;
    @Autowired UsuarioRepository repository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtEncoder jwtEncoder;
    final HttpClient client = HttpClient.newHttpClient();
    final JsonMapper json = JsonMapper.builder().build();
    final String password = "DemoPixel2026!";

    @BeforeEach
    void limpiar() { repository.deleteAll(); }

    @Test
    void registroYLoginNoExponenPasswordYGuardanHash() throws Exception {
        Resultado alta = registrar("USER@pixeltoys.example");
        assertThat(alta.estado()).isEqualTo(201);
        assertThat(alta.datos().get("email").asText()).isEqualTo("user@pixeltoys.example");
        assertThat(alta.datos().get("rol").asText()).isEqualTo("USUARIO");
        assertThat(alta.datos().get("favoritos").size()).isZero();
        assertThat(alta.texto()).doesNotContain("password", password);
        var guardado = repository.findByEmail("user@pixeltoys.example").orElseThrow();
        assertThat(guardado.getPasswordHash()).startsWith("$2");
        assertThat(passwordEncoder.matches(password, guardado.getPasswordHash())).isTrue();
        Resultado login = login("user@pixeltoys.example", password);
        assertThat(login.estado()).isEqualTo(200);
        assertThat(login.datos().get("tipoToken").asText()).isEqualTo("Bearer");
        assertThat(login.datos().get("token").asText().split("\\.")).hasSize(3);
        assertThat(login.texto()).doesNotContain("password", password);
    }

    @Test
    void emailDuplicadoSeRechazaSinDistinguirMayusculas() throws Exception {
        registrar("duplicado@pixeltoys.example");
        Resultado repetido = registrar("DUPLICADO@pixeltoys.example");
        assertThat(repetido.estado()).isEqualTo(409);
        assertThat(repository.count()).isEqualTo(1);
    }

    @Test
    void validaCamposObligatoriosEmailPasswordYBytesUnicode() throws Exception {
        Resultado invalido = enviar("POST", "/api/usuarios/registro", Map.of(
                "nombre", " ", "email", "sin-arroba", "password", "123"), null);
        assertThat(invalido.estado()).isEqualTo(400);
        assertThat(invalido.datos().get("errores").has("nombre")).isTrue();
        assertThat(invalido.datos().get("errores").has("email")).isTrue();
        assertThat(invalido.datos().get("errores").has("password")).isTrue();
        Resultado unicode = enviar("POST", "/api/usuarios/registro", Map.of(
                "nombre", "Prueba", "email", "unicode@pixeltoys.example", "password", "á".repeat(40)), null);
        assertThat(unicode.estado()).isEqualTo(400);
        assertThat(repository.count()).isZero();
    }

    @Test
    void favoritosSePersistenSinDuplicadosYSePuedenEliminar() throws Exception {
        Resultado alta = registrar("favoritos@pixeltoys.example");
        long id = alta.datos().get("id").asLong();
        String token = token("favoritos@pixeltoys.example");
        String ruta = "/api/usuarios/" + id + "/favoritos";
        assertThat(enviar("POST", ruta + "/101", null, token).estado()).isEqualTo(200);
        assertThat(enviar("POST", ruta + "/101", null, token).datos().size()).isEqualTo(1);
        Resultado lista = enviar("GET", ruta, null, token);
        assertThat(lista.datos().get(0).asLong()).isEqualTo(101);
        assertThat(enviar("GET", "/api/usuarios/" + id, null, token)
                .datos().get("favoritos").size()).isEqualTo(1);
        assertThat(enviar("DELETE", ruta + "/101", null, token).datos().size()).isZero();
        assertThat(enviar("GET", ruta, null, token).datos().size()).isZero();
        assertThat(enviar("DELETE", ruta + "/101", null, token).estado()).isEqualTo(200);
    }

    @Test
    void favoritosRechazanIdentificadoresInvalidos() throws Exception {
        long id = registrar("ids@pixeltoys.example").datos().get("id").asLong();
        String token = token("ids@pixeltoys.example");
        String ruta = "/api/usuarios/" + id + "/favoritos/";
        assertThat(enviar("POST", ruta + "0", null, token).estado()).isEqualTo(400);
        assertThat(enviar("POST", ruta + "-1", null, token).estado()).isEqualTo(400);
        assertThat(enviar("POST", ruta + "texto", null, token).estado()).isEqualTo(400);
    }

    @Test
    void loginIncorrectoYTokenAusenteOInvalidoDevuelven401() throws Exception {
        long id = registrar("login@pixeltoys.example").datos().get("id").asLong();
        assertThat(login("login@pixeltoys.example", "incorrecta").estado()).isEqualTo(401);
        assertThat(login("nadie@pixeltoys.example", password).estado()).isEqualTo(401);
        assertThat(enviar("GET", "/api/usuarios/" + id, null, null).estado()).isEqualTo(401);
        assertThat(enviar("GET", "/api/usuarios/" + id, null, "token-falso").estado()).isEqualTo(401);
    }

    @Test
    void usuarioSoloAccedeASuPerfilYAdminPuedeListar() throws Exception {
        long idA = registrar("a@pixeltoys.example").datos().get("id").asLong();
        long idB = registrar("b@pixeltoys.example").datos().get("id").asLong();
        String tokenA = token("a@pixeltoys.example");
        assertThat(enviar("GET", "/api/usuarios/" + idA, null, tokenA).estado()).isEqualTo(200);
        assertThat(enviar("GET", "/api/usuarios/" + idB, null, tokenA).estado()).isEqualTo(403);
        assertThat(enviar("POST", "/api/usuarios/" + idB + "/favoritos/1", null, tokenA).estado()).isEqualTo(403);
        assertThat(enviar("DELETE", "/api/usuarios/" + idB + "/favoritos/1", null, tokenA).estado()).isEqualTo(403);
        assertThat(enviar("GET", "/api/usuarios", null, tokenA).estado()).isEqualTo(403);
        var admin = repository.findById(idA).orElseThrow();
        admin.setRol(RolUsuario.ADMIN);
        repository.save(admin);
        Resultado lista = enviar("GET", "/api/usuarios", null, token("a@pixeltoys.example"));
        assertThat(lista.estado()).isEqualTo(200);
        assertThat(lista.datos().size()).isEqualTo(2);
    }

    @Test
    void rolEnviadoPorClienteNoPermiteCrearAdministrador() throws Exception {
        Resultado alta = enviar("POST", "/api/usuarios/registro", Map.of(
                "nombre", "Prueba", "email", "rol@pixeltoys.example", "password", password,
                "rol", "ADMIN"), null);
        assertThat(alta.estado()).isIn(201, 400);
        if (alta.estado() == 201) assertThat(alta.datos().get("rol").asText()).isEqualTo("USUARIO");
        repository.findByEmail("rol@pixeltoys.example")
                .ifPresent(usuario -> assertThat(usuario.getRol()).isEqualTo(RolUsuario.USUARIO));
    }

    @Test
    void usuarioInexistenteDevuelve404ParaAdministrador() throws Exception {
        long id = registrar("admin@pixeltoys.example").datos().get("id").asLong();
        var admin = repository.findById(id).orElseThrow();
        admin.setRol(RolUsuario.ADMIN);
        repository.save(admin);
        Resultado inexistente = enviar("GET", "/api/usuarios/9999999", null, token("admin@pixeltoys.example"));
        assertThat(inexistente.estado()).isEqualTo(404);
    }

    @Test
    void tokenExpiradoNoDaAcceso() throws Exception {
        long id = registrar("vencido@pixeltoys.example").datos().get("id").asLong();
        var claims = JwtClaimsSet.builder().issuer("ms-usuario").subject(Long.toString(id))
                .issuedAt(Instant.now().minusSeconds(7200)).expiresAt(Instant.now().minusSeconds(3600))
                .claim("roles", List.of("USUARIO")).build();
        String vencido = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        assertThat(enviar("GET", "/api/usuarios/" + id, null, vencido).estado()).isEqualTo(401);
    }

    @Test
    void swaggerYOpenApiSonPublicosYDocumentanLasSieteOperaciones() throws Exception {
        Resultado api = enviar("GET", "/v3/api-docs", null, null);
        assertThat(api.estado()).isEqualTo(200);
        assertThat(api.datos().at("/components/securitySchemes/bearerAuth/type").asText()).isEqualTo("http");
        int operaciones = 0;
        for (JsonNode path : api.datos().get("paths")) operaciones += path.size();
        assertThat(operaciones).isEqualTo(7);
        HttpResponse<String> ui = client.send(HttpRequest.newBuilder(
                URI.create("http://localhost:" + port + "/swagger-ui/index.html")).GET().build(),
                HttpResponse.BodyHandlers.ofString());
        assertThat(ui.statusCode()).isEqualTo(200);
        assertThat(ui.body()).contains("Swagger UI");
    }

    private Resultado registrar(String email) throws Exception {
        return enviar("POST", "/api/usuarios/registro", Map.of(
                "nombre", "Usuario de prueba", "email", email, "password", password), null);
    }

    private Resultado login(String email, String clave) throws Exception {
        return enviar("POST", "/api/usuarios/login", Map.of("email", email, "password", clave), null);
    }

    private String token(String email) throws Exception {
        Resultado respuesta = login(email, password);
        assertThat(respuesta.estado()).isEqualTo(200);
        return respuesta.datos().get("token").asText();
    }

    private Resultado enviar(String metodo, String ruta, Object cuerpo, String token) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + ruta));
        if (token != null) request.header("Authorization", "Bearer " + token);
        request.header("Content-Type", "application/json");
        request.method(metodo, cuerpo == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(json.writeValueAsString(cuerpo)));
        HttpResponse<String> respuesta = client.send(request.build(), HttpResponse.BodyHandlers.ofString());
        JsonNode datos = respuesta.body().isBlank() ? json.readTree("null") : json.readTree(respuesta.body());
        return new Resultado(respuesta.statusCode(), datos, respuesta.body());
    }

    private record Resultado(int estado, JsonNode datos, String texto) { }
}
