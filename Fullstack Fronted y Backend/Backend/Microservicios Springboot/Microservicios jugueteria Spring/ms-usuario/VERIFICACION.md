# Verificación de la entrega

Fecha: 17 de octubre de 2026.

- Compilación de código principal y pruebas: correcta con Java 17.
- Pruebas de integración HTTP: **11 ejecutadas, 0 fallos, 0 errores, 0 omitidas**.
- Base utilizada en las pruebas: H2 en modo MySQL, aislada de cualquier base del usuario.
- Empaquetado ejecutable de Spring Boot: correcto (`mvnw -DskipTests package` después de las pruebas).
- Swagger UI y la descripción OpenAPI respondieron correctamente durante las pruebas.

El ZIP contiene código fuente, Maven Wrapper, scripts SQL, colección Postman y guía.
No incluye compilados ni dependencias descargadas. Maven los prepara en el equipo de destino.

La conexión a un servidor MySQL real y la integración con frontend/otros microservicios
no se ejecutaron en este entorno. La configuración de MySQL y los pasos de arranque
están en README.md.

## Pruebas ejecutadas

- validaCamposObligatoriosEmailPasswordYBytesUnicode
- registroYLoginNoExponenPasswordYGuardanHash
- tokenExpiradoNoDaAcceso
- swaggerYOpenApiSonPublicosYDocumentanLasSieteOperaciones
- usuarioInexistenteDevuelve404ParaAdministrador
- emailDuplicadoSeRechazaSinDistinguirMayusculas
- favoritosRechazanIdentificadoresInvalidos
- favoritosSePersistenSinDuplicadosYSePuedenEliminar
- rolEnviadoPorClienteNoPermiteCrearAdministrador
- usuarioSoloAccedeASuPerfilYAdminPuedeListar
- loginIncorrectoYTokenAusenteOInvalidoDevuelven401
