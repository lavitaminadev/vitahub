# 47. Modelo Físico y Diccionario de Datos (TypeORM)

Las entidades de VITAHUB operan bajo un esquema relacional estricto. Todas las tablas, salvo excepciones globales, exigen `organization_id` como clave de partición lógica.

## Tabla: `users` (Usuarios y Staff)
- **Propósito:** Almacena credenciales y roles del personal de la agencia (Diseñadores, CMs, Directores).
- **Entidad ORM:** `User` (`apps/api/src/modules/users/user.entity.ts`)
- **Tenant:** SÍ (`organization_id`).
- **Relaciones:** `pod_id` (N:1 con `pods`).
- **Columnas Críticas:**
  - `email` (VARCHAR, UNIQUE, INDEXED).
  - `password_hash` (VARCHAR, Sensible, Oculto en DTOs).
  - `role` (ENUM: `ADMIN`, `DIRECTOR`, `CM`, `DESIGNER`, `CLIENT`).

## Tabla: `clients` (Clientes Finales)
- **Propósito:** Empresas a las que La Vitamina presta servicios.
- **Entidad ORM:** `Client` (`apps/api/src/modules/crm/clients/client.entity.ts`)
- **Tenant:** SÍ (`organization_id`).
- **Relaciones:** N:1 con `pods` (Qué equipo atiende al cliente).
- **Columnas Críticas:**
  - `default_ud_budget` (INTEGER, Default: 0). Base para cálculo de UDs mensuales.

## Tabla: `pieces` (Piezas de Producción)
- **Propósito:** El "Ticket" de trabajo gráfico.
- **Entidad ORM:** `Piece`
- **Tenant:** SÍ (`organization_id`).
- **Relaciones:** N:1 con `Client`, N:1 con `User` (Asignado).
- **Columnas Críticas:**
  - `status` (ENUM: `BACKLOG`, `ASSIGNED`, `IN_PROGRESS`, `CORRECTION`, `DELIVERED`).
  - `ud_amount` (DECIMAL, Uso: Consumo del presupuesto mensual).

## Soft Deletes y Auditoría
Casi todas las tablas extienden de una base que inyecta:
- `created_at` (TIMESTAMP, Default: `NOW()`).
- `updated_at` (TIMESTAMP, Auto Update).
- `deleted_at` (TIMESTAMP, Nullable). **CONFIRMADO:** TypeORM usa "Soft Deletes" para no romper relaciones si un usuario es borrado.
