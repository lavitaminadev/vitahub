# Catálogo de API Interna: Módulo Users y Organizations

## API-USR-001: Crear Usuario
- **Ruta:** `POST /users`
- **Controlador:** `UsersController` (Línea 30)
- **Propósito:** Registrar un nuevo usuario (Staff/Cliente) en el sistema.
- **Flujo:** Controller -> `CreateUserUseCase`.
- **Base de Datos:** `INSERT INTO users`.
- **Tenancy:** Hereda el tenant del request automáticamente a través del contexto (`req.organizationId`).
- **Seguridad:** Requiere rol `ADMIN` o `DIRECTOR` (a través de `RolesGuard`).

## API-USR-002: Listar Usuarios
- **Ruta:** `GET /users`
- **Controlador:** `UsersController` (Línea 43)
- **Base de Datos:** `SELECT * FROM users WHERE organization_id = ?`.
- **Flujo:** Controller -> `ListUsersUseCase`.

## API-USR-003: Actualizar Usuario
- **Ruta:** `PATCH /users/:id`
- **Controlador:** `UsersController` (Línea 70)
- **Propósito:** Modificar rol o datos básicos de un usuario existente.
- **Flujo:** Controller -> `UpdateUserUseCase`.
- **Tenancy:** Verifica que el usuario a modificar pertenezca al tenant del solicitante.

## API-ORG-001: Crear Organización
- **Ruta:** `POST /organizations`
- **Controlador:** `OrganizationsController`
- **Propósito:** Registrar un nuevo Workspace de Agencia.
- **Tenancy:** Esta ruta **NO TIENE TENANT** de entrada (usa `@SkipTenancy()`), porque su propósito es justamente crear el tenant raíz. Es la excepción de la regla.
- **Seguridad (Crítica):** Solo el rol absoluto "SUPERADMIN" (si existe) debería llamar a esto. No verificado en el código si está abierta al público (riesgo de registros spam).

## API-ORG-002: Listar Organizaciones
- **Ruta:** `GET /organizations`
- **Controlador:** `OrganizationsController`
- **Propósito:** Obtener listado de Tenants (Solo para administración central).
