# Pixel & Toys - Microservicio de Pagos

## Descripción

Microservicio desarrollado en Java y Spring Boot para gestionar
los pagos de los pedidos de Pixel & Toys.

Permite registrar, consultar, aprobar y rechazar pagos,
incorporando validaciones y persistencia en MySQL.

## Tecnologías utilizadas

- Java 17
- Spring Boot 4.1.1
- Maven
- Spring Data JPA
- Spring Security
- MySQL
- Swagger / OpenAPI

## Base de datos

Nombre de la base de datos: pagos_db

El archivo scripts/01_crear_base.sql contiene las
instrucciones necesarias para crear la base de datos
y la tabla pagos.

Para configurarla:

1. Iniciar MySQL desde XAMPP.
2. Abrir phpMyAdmin.
3. Seleccionar la pestaña Importar.
4. Importar scripts/01_crear_base.sql.

## Configuración

El archivo application.properties utiliza estas
variables de entorno opcionales:

- DB_URL: dirección de conexión a MySQL.
- DB_USERNAME: usuario de MySQL.
- DB_PASSWORD: contraseña de MySQL.

Por defecto, utiliza:

- Base de datos: pagos_db
- Servidor MySQL: localhost:3306
- Usuario: root
- Contraseña: vacía
- Puerto del microservicio: 8085

Los valores predeterminados son para desarrollo local.

## Ejecución

Abrir una terminal en la carpeta del proyecto.

En Windows, ejecutar:

    .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"

El perfil dev permite realizar pruebas locales
sin autenticación.

## Swagger

Con el microservicio iniciado, abrir:

http://localhost:8085/swagger-ui.html

## Endpoints REST

- GET /api/pagos
  Lista todos los pagos.

- GET /api/pagos/{id}
  Consulta un pago por su identificador.

- GET /api/pagos/usuario/{usuarioId}
  Consulta los pagos de un usuario.

- GET /api/pagos/pedido/{pedidoId}
  Consulta los pagos asociados a un pedido.

- POST /api/pagos
  Registra un nuevo pago.

- PATCH /api/pagos/{id}/estado
  Aprueba o rechaza un pago pendiente.

## Validaciones

- No permite montos negativos o iguales a cero.
- No permite pagos duplicados para un mismo pedido.
- No permite modificar pagos finalizados.
- Maneja errores mediante GlobalExceptionHandler.

## Estados del pago

- PENDIENTE
- APROBADO
- RECHAZADO

## Arquitectura

El microservicio está organizado en:

- controller: endpoints REST.
- service: lógica de negocio.
- repository: acceso a MySQL mediante JPA.
- model: entidad PagoModel.
- exception: manejo centralizado de errores.
- config: configuración de seguridad.

## Consideraciones de integración

Actualmente se permite un único registro de pago
por pedido, incluso si el pago fue rechazado.

Antes de integrar el sistema, el equipo debe decidir
si será necesario permitir nuevos intentos de pago.

La configuración dev es solo para pruebas locales.

Está pendiente implementar autenticación y
autorización definitivas, integradas con ms-usuario.

La creación de pagos todavía no procesa transacciones
reales con bancos o pasarelas de pago.
