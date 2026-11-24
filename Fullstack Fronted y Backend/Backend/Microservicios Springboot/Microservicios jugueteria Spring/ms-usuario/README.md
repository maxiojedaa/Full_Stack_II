# Pixel & Toys — ms-usuario

Microservicio de usuarios y favoritos basado en la estructura del proyecto del equipo
(controller, service, repository, model y dto) y en el diagrama de Usuario proporcionado.

## Configuración

| Elemento | Valor |
|---|---|
| Lenguaje | Java 17 |
| Framework | Spring Boot 4.1.1, como ms-carrito y ms-pedido |
| Compilación | Maven Wrapper incluido |
| Persistencia | Spring Data JPA / Hibernate |
| Base de datos de desarrollo | MySQL, `usuarios_db` |
| Puerto | `8084` |
| Documentación | springdoc-openapi 3.1.1 / Swagger UI |
| Acceso | Contraseñas BCrypt y tokens JWT de una hora |

Las siete operaciones del diagrama están en `UsuarioService`. Los favoritos están
integrados en este microservicio; no se necesita crear ms-favoritos.

## 1. Abrir el proyecto en Windows

1. Extraer el ZIP con **Extraer todo**.
2. Colocar la carpeta `ms-usuario` junto a `ms-carrito`, `ms-catalogo` y `ms-pedido`.
3. En Visual Studio Code, elegir **Archivo → Abrir carpeta** y abrir `ms-usuario`.
4. Abrir **Terminal → Nueva terminal**. La terminal debe estar en la carpeta que contiene `pom.xml` y `mvnw.cmd`.
5. Comprobar el JDK:

```powershell
java -version
javac -version
```

Ambos deben responder. El proyecto está configurado para Java 17. Se necesita un
JDK, que incluye el compilador `javac`. No es necesario instalar Maven por separado:
el wrapper lo descarga en el primer uso, con conexión a Internet.

## 2. Preparar MySQL

Si usan XAMPP, iniciar su servicio **MySQL** y abrir **Admin** para acceder a phpMyAdmin.
También se puede usar un servidor MySQL instalado por separado. Ejecutar el archivo
`scripts/01_crear_base.sql`, o pegar en la pestaña SQL:

```sql
CREATE DATABASE IF NOT EXISTS usuarios_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

La configuración de desarrollo usa `localhost:3306`, usuario `root` y contraseña vacía,
como la referencia del equipo. Si tu servidor tiene contraseña, configurarla en esa
terminal de PowerShell antes de iniciar:

```powershell
$env:DB_PASSWORD = "TU_CONTRASEÑA_DE_MYSQL"
```

Para otro usuario, también se puede definir `$env:DB_USERNAME`. Para otra dirección o
puerto, usar `DB_URL` con la URL JDBC completa. Las tablas `usuarios` y
`usuario_favoritos` se crean al iniciar; no se necesita crearlas manualmente.

## 3. Iniciar

En la terminal abierta dentro de `ms-usuario`:

```powershell
.\mvnw.cmd spring-boot:run
```

Cuando aparezca `Started MsUsuarioApplication`, abrir:

- Swagger: http://localhost:8084/swagger-ui.html
- Descripción OpenAPI: http://localhost:8084/v3/api-docs

Mantener la terminal abierta. Para detener el servicio, presionar **Ctrl+C**.

## 4. Primera prueba en Swagger

### Registrar

Abrir **POST /api/usuarios/registro**, pulsar **Try it out** y enviar:

```json
{
  "nombre": "Usuario de prueba",
  "email": "usuario@pixeltoys.example",
  "password": "DemoPixel2026!"
}
```

Debe responder `201`. Anotar el `id` devuelto. La cuenta se crea con rol `USUARIO`
y favoritos vacíos. El cliente no puede asignarse el rol `ADMIN`.

### Iniciar sesión

Abrir **POST /api/usuarios/login** y enviar:

```json
{
  "email": "usuario@pixeltoys.example",
  "password": "DemoPixel2026!"
}
```

Debe responder `200` con `token`, `tipoToken`, `expiraEnSegundos` y `usuario`.
Copiar solo el valor de `token`, sin comillas. Arriba en Swagger, pulsar **Authorize**,
pegarlo y autorizar. Swagger agrega automáticamente `Bearer` al encabezado.

### Usar favoritos

1. En **POST /api/usuarios/{usuarioId}/favoritos/{productoId}**, usar el ID real del
   usuario registrado y un producto de prueba, por ejemplo `101`.
2. Ejecutarlo dos veces: la lista debe seguir teniendo un solo `101`.
3. Consultar **GET /api/usuarios/{usuarioId}/favoritos**.
4. Eliminar con **DELETE /api/usuarios/{usuarioId}/favoritos/{productoId}**.

Los ID deben ser positivos. Se guardan solo los ID de productos: la comprobación de
que existen en ms-catalogo queda para la integración entre microservicios. No se
crea una relación JPA hacia una base de datos de otro microservicio.

## Endpoints

| Método | Ruta | Acceso | Resultado |
|---|---|---|---|
| POST | `/api/usuarios/registro` | Público | Usuario creado, `201` |
| POST | `/api/usuarios/login` | Público | Token y usuario, `200` |
| GET | `/api/usuarios` | ADMIN | Lista de usuarios |
| GET | `/api/usuarios/{usuarioId}` | Propietario o ADMIN | Un usuario |
| GET | `/api/usuarios/{usuarioId}/favoritos` | Propietario o ADMIN | Lista de ID de productos |
| POST | `/api/usuarios/{usuarioId}/favoritos/{productoId}` | Propietario o ADMIN | Lista actualizada sin duplicados |
| DELETE | `/api/usuarios/{usuarioId}/favoritos/{productoId}` | Propietario o ADMIN | Lista actualizada |

El login no inicia una sesión con cookies. Las siguientes solicitudes deben enviar
`Authorization: Bearer <token>`. En Postman se configura en **Authorization → Bearer Token**.
Se incluye `postman/ms-usuario.postman_collection.json`: al importar y ejecutar registro
y login en ese orden, la colección guarda automáticamente el ID y el token.

## Administrador

Para probar la consulta de todos los usuarios, registrar una cuenta administrativa,
aplicar `scripts/02_asignar_admin_opcional.sql` con el email correcto y volver a iniciar
sesión. El cambio de rol no se ofrece en una ruta pública. Un usuario normal recibe
`403` al intentar listar usuarios o acceder a los favoritos de otra persona.

## Organización del código

| Carpeta | Responsabilidad |
|---|---|
| `controller` | Rutas HTTP, validación de entrada y permisos |
| `dto` | Datos de entrada y salida; no se devuelve el hash de la contraseña |
| `model` | Entidad Usuario y enumeración RolUsuario |
| `repository` | Consultas y persistencia JPA |
| `service` | Registro, login, consultas, favoritos y creación del token |
| `config` | Swagger, seguridad, firma del token y CORS |
| `exception` | Respuestas de error con códigos HTTP adecuados |

`favoritos` es un `Set<Long>` para impedir repeticiones. JPA lo representa mediante
una tabla auxiliar `usuario_favoritos` en la misma base `usuarios_db`. Sigue siendo
una colección del usuario. No es un microservicio adicional.

## Errores previstos

| Código | Significado |
|---|---|
| 400 | Datos inválidos, JSON incorrecto o ID no positivo |
| 401 | Credenciales incorrectas o token ausente, inválido o vencido |
| 403 | Usuario autenticado sin permiso para la operación |
| 404 | Usuario no encontrado |
| 409 | Email duplicado u otro conflicto de unicidad |

Si aparece `Unknown database 'usuarios_db'`, ejecutar el SQL de creación. Si aparece
`Access denied for user`, revisar usuario y contraseña de MySQL. Si el puerto 8084
está ocupado, detener la instancia anterior o definir `$env:SERVER_PORT = "8085"` y
usar ese puerto también en Swagger y Postman. Si `javac` no se reconoce, falta un JDK
o su configuración de PATH/JAVA_HOME.

## Pruebas y compilación

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```

Las pruebas levantan un servidor HTTP real en un puerto aleatorio con H2 en modo
MySQL, aislado de la base local. Cubren registro, hash de contraseña, email duplicado,
login, permisos, tokens inválidos/vencidos, persistencia de favoritos, IDs inválidos,
usuarios inexistentes y documentación Swagger. H2 solo está disponible en las pruebas.
El uso real sigue configurado para MySQL. Consultar `VERIFICACION.md` para el resultado
de la ejecución de esta entrega.

## Configuración de desarrollo y alcance

- Cada arranque genera una clave JWT temporal si no se define `JWT_SECRET_BASE64`.
  Los tokens anteriores dejan de servir al reiniciar: basta con iniciar sesión otra vez.
- Se puede configurar una clave Base64 de al menos 32 bytes aleatorios para conservar
  tokens entre reinicios. No guardar una clave real en el repositorio.
- Los orígenes locales permitidos están en `app.cors.origenes` y pueden reemplazarse
  con `CORS_ORIGINS`, separados por comas.
- Los permisos implementados protegen este microservicio. La integración de tokens,
  usuarios y productos con los demás servicios y el frontend requiere coordinar al equipo.
- Este alcance sigue las siete operaciones del diagrama: no incluye recuperación de
  contraseña, envío de emails ni edición/eliminación de cuentas.
- `ddl-auto=update` mantiene el enfoque de desarrollo del equipo.

## Referencias técnicas

- Spring Boot: https://docs.spring.io/spring-boot/system-requirements.html
- Springdoc/Swagger: https://springdoc.org/
- Spring Security JWT: https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html
