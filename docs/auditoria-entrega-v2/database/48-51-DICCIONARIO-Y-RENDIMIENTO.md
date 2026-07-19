# 48. Diccionario Completo de Datos

Detalle atómico a nivel de columnas de las tablas centrales no cubiertas en la estructura primaria. Esto garantiza el control absoluto del esquema (Schema).

## Tabla: `piece_versions` (Iteraciones)
- **Propósito:** Historial de correcciones y envíos al cliente.
- **Columnas:**
  - `id` (UUID, Primary Key).
  - `piece_id` (UUID, FK -> `pieces.id`, Indexada para búsquedas rápidas).
  - `version_number` (INT, Default 1).
  - `url` (VARCHAR, Nullable). Link de Drive/Figma.
  - `status` (ENUM, Default: `PENDING_REVIEW`).
- **Retención (Lifecycle):** Sujeta a `deleted_at` del Soft Delete. Nunca se borran físicamente para no alterar el cobro histórico.

## Tabla: `xp_events` (Historial de Puntos)
- **Propósito:** Log inmutable de Gamificación.
- **Columnas:**
  - `id` (UUID, Primary Key).
  - `user_id` (UUID, FK -> `users.id`). El empleado afectado.
  - `amount` (INT). Puntos ganados o perdidos (Negativo permitido).
  - `reason` (VARCHAR). Ej: "Entrega anticipada pieza #445".
  - `created_at` (TIMESTAMP).
- **Riesgo Arquitectónico:** Esta tabla actúa como un "Append-Only Log". Si crece a 10 millones de filas por una agencia grande, el cálculo en tiempo real de XP total (`SELECT SUM(amount)`) colapsará el dashboard. Necesita un cron de Agregación Diaria (Materialized View).

## Tabla: `integration_accounts` (Terceros)
- **Propósito:** Guardar las credenciales (OAuth) de Meta o Google por Agencia.
- **Columnas:**
  - `organization_id` (UUID, FK).
  - `provider` (ENUM: `META`, `GOOGLE`).
  - `access_token` (TEXT, Cifrado AES-256). **NUNCA DEBE SER NULLABLE.**
  - `refresh_token` (TEXT, Cifrado, Opcional).
  - `expires_at` (TIMESTAMP). Define cuándo el Cron debe intentar el Refresh.

## 51. Índices, Constraints y Rendimiento

El TypeORM genera automáticamente los índices (`INDEX`) en las Foreign Keys. Sin embargo:

- **Falta de Índice Crítico (`pieces.organization_id`, `pieces.status`):** El Kanban del CRM filtra masivamente por "Tenant + Estado". Si la agencia tiene 50.000 piezas históricas, el motor hará un *Full Table Scan*. **Se requiere un `Composite Index`** urgente en esos dos campos para garantizar que el tablero cargue en < 200ms.
- **Unique Constraints:** Verificado en `users.email` (Solo puede haber un correo en todo el sistema). 
- **Check Constraints (Matemática SQL):** No existen restricciones en la BD para evitar `pieces.ud_amount < 0`. La validación ocurre 100% en Node.js (Capa de Aplicación). Si alguien manipula la DB manual, rompe la contabilidad.
