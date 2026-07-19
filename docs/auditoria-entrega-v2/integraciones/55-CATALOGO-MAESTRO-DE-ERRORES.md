# 55. Catálogo Maestro de Errores (y 56. Validaciones)

Inventario de excepciones capturadas y no capturadas.

## 1. Validaciones DTO (Data Transfer Objects)
La primera barrera contra la basura.
- **Librerías:** `class-validator`, `class-transformer`.
- **Pipeline:** Activado globalmente en `main.ts` (`new ValidationPipe()`).
- **Error Generado:** `HTTP 400 Bad Request`.
- **Comportamiento FrontEnd:** El `api.ts` intercepta este 400, pero no desglosa visualmente qué campo falló (Ej: "El email es inválido"). Solo muestra un "Error genérico" en un Toast de React.

## 2. Errores de Negocio Controlados
Excepciones lanzadas manualmente con `throw new HttpException()`.
- **ERR-CRM-01 (HTTP 409):** `ConflictException('Lead ya está convertido')`. Origen: `convert-lead.use-case.ts`.
- **ERR-PROD-01 (HTTP 403):** `ForbiddenException('No puedes asignar una pieza que no es tuya')`. Origen: `PieceRulesService`.

## 3. Errores ORM No Controlados (Fugas)
- **Violación de Únicos:** Si se intenta crear un Usuario con un email que ya existe en `users`, TypeORM arrojará un error nativo del driver SQL (`QueryFailedError: ER_DUP_ENTRY`).
- **Problema de Seguridad (Leak):** Como no hay un Filtro Global de Excepciones (ExceptionFilter personalizado) que capture los errores del ORM, NestJS arrojará un `HTTP 500 Internal Server Error` devolviendo al Frontend **el mensaje puro de SQL**. Esto revela la estructura de la base de datos al atacante.

## 4. Fallas en Integraciones
- Si Facebook (Meta) responde con un Error `HTTP 500` cuando VITAHUB envía el CAPI (Conversión), Axios lanza una excepción.
- **Manejo:** El manejador de eventos `LeadConvertedHandler` tiene un bloque `catch`, hace un `console.error()`, pero no guarda en ninguna tabla de fallos (Log BD) el intento fallido. El dato se pierde.
