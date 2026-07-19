# Catálogo de API Interna: Módulos Meetings y Onboarding

## API-MEET-001: Crear Reunión
- **Ruta:** `POST /meetings`
- **Controlador:** `MeetingsController`
- **Propósito:** Agendar un Kickoff, Estrategia o Seguimiento con el cliente.
- **Flujo:** Controller -> `CreateMeetingUseCase`.
- **Base de Datos:** `INSERT INTO meetings (title, date, client_id, organization_id)`.
- **Tenancy:** Impuesto automáticamente desde el Token JWT de quien agenda.
- **Riesgo:** Si el Frontend envía una fecha en formato inválido, el DTO falla y devuelve `400 Bad Request`.

## API-MEET-002: Listar Reuniones (y Minutas)
- **Ruta:** `GET /meetings`
- **Controlador:** `MeetingsController`
- **Parámetros:** `?clientId=uuid` (Opcional, para filtrar solo por un cliente).
- **Riesgo N+1:** El UseCase hace un `JOIN` a la tabla `action_items` para traer los acuerdos (minutas). Si TypeORM no usa `LEFT JOIN` correctamente, podría disparar múltiples consultas.

## API-MEET-003: Crear Acuerdos (Action Items)
- **Ruta:** `POST /meetings/:id/action-items`
- **Propósito:** Dejar por escrito los compromisos adquiridos en la llamada.
- **Validación:** El sistema verifica que la reunión `:id` pertenezca a la misma `organization_id` que el usuario antes de permitir crearle un acuerdo (Protección IDOR verificada).

## API-ONB-001: Iniciar Onboarding
- **Ruta:** `POST /onboarding`
- **Controlador:** `OnboardingController`
- **Propósito:** Generar el checklist inicial de configuración del cliente (Brand kit, Accesos Meta).
- **Estado Técnico:** Parcialmente implementado. El `OnboardingTemplate` existe como un JSON estático en backend en vez de residir configurable en la base de datos.
- **Efecto Secundario:** Altera el estado del CRM, pero no envía un correo automático de bienvenida al cliente (Falta de integración de Notificaciones).
