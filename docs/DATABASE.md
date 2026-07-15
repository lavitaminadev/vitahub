# Base de Datos VITAHUB

Sistema gestor: **MySQL 8.0**  
ORM: **TypeORM** con migraciones versionadas.

---

## Diagrama Entidad-Relación (Texto)

```
organizations (1) ──→ (N) users
organizations (1) ──→ (N) leads
organizations (1) ──→ (N) clients
organizations (1) ──→ (N) pieces
organizations (1) ──→ (N) content_grids
organizations (1) ──→ (N) meetings
organizations (1) ──→ (N) services
organizations (1) ──→ (N) quotes
organizations (1) ──→ (N) invoices
organizations (1) ──→ (N) integrations
organizations (1) ──→ (N) approval_requests
organizations (1) ──→ (N) briefs
organizations (1) ──→ (N) contracts
organizations (1) ──→ (N) xp_periods
organizations (1) ──→ (N) audit_logs
organizations (1) ──→ (N) onboarding

users (1) ──→ (N) pieces (assigned_to)
users (1) ──→ (N) leads (assigned_to)
users (1) ──→ (N) meeting_attendees
users (1) ──→ (N) action_items (assigned_to)
users (1) ──→ (N) xp_periods
users (1) ──→ (N) xp_events
users (1) ──→ (N) refresh_tokens

clients (1) ──→ (N) pieces
clients (1) ──→ (N) content_grids
clients (1) ──→ (N) ud_budgets
clients (1) ──→ (N) quotes
clients (1) ──→ (N) invoices
clients (1) ──→ (N) contracts
clients (1) ──→ (N) onboarding
clients (1) ──→ (1) leads (converted)

leads (1) ──→ (N) lead_interactions

pieces (1) ──→ (N) piece_versions
pieces (1) ──→ (N) corrections
pieces (1) ──→ (N) ud_movements

piece_versions (1) ──→ (N) corrections

content_grids (1) ──→ (N) content_items

meetings (1) ──→ (N) meeting_attendees
meetings (1) ──→ (N) action_items

ud_budgets (1) ──→ (N) ud_movements

quotes (1) ──→ (N) quote_items

invoices (1) ──→ (N) payments

integrations (1) ──→ (N) integration_accounts
integration_accounts (1) ──→ (N) sync_runs

approval_requests (1) ──→ (N) approval_decisions

parameter_definitions (1) ──→ (N) parameter_values

xp_periods (1) ──→ (N) xp_events
```

---

## Tablas

### Organizaciones

| Tabla | Descripción |
|-------|-------------|
| `organizations` | Agencias. Cada organización tiene su propio aislamiento de datos. |

### Usuarios

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios de la agencia. Roles: admin, designer, community_manager, client. |
| `refresh_tokens` | Tokens de refresco de sesión. |

### CRM

| Tabla | Descripción |
|-------|-------------|
| `leads` | Prospectos comerciales. |
| `lead_interactions` | Interacciones con leads (llamadas, emails, reuniones). |

### Clientes

| Tabla | Descripción |
|-------|-------------|
| `clients` | Clientes de la agencia. Contiene datos de retainer, moneda, presupuesto UD default. |

### Producción

| Tabla | Descripción |
|-------|-------------|
| `pieces` | Piezas de diseño (post, historia, reel, flyer, etc.). |
| `piece_versions` | Versiones de cada pieza con historial de cambios. |
| `corrections` | Correcciones solicitadas, con origen (interna/cliente). |

### Presupuesto UD

| Tabla | Descripción |
|-------|-------------|
| `ud_budgets` | Presupuesto mensual de Unidades de Diseño por cliente. |
| `ud_movements` | Movimientos de UD (reserva, consumo). |

### Gamificación

| Tabla | Descripción |
|-------|-------------|
| `xp_periods` | Períodos semanales de XP por usuario. |
| `xp_events` | Eventos que generan XP (entregas, penalizaciones). |

### Reuniones

| Tabla | Descripción |
|-------|-------------|
| `meetings` | Reuniones programadas. |
| `meeting_attendees` | Asistentes a reuniones. |
| `action_items` | Tareas derivadas de reuniones. |

### Contenido

| Tabla | Descripción |
|-------|-------------|
| `content_grids` | Parrillas de contenido semanal por cliente. |
| `content_items` | Items individuales dentro de una parrilla. |

### Facturación

| Tabla | Descripción |
|-------|-------------|
| `services` | Catálogo de servicios ofrecidos. |
| `quotes` | Cotizaciones a clientes. |
| `quote_items` | Items de cada cotización. |
| `invoices` | Facturas emitidas. |
| `payments` | Pagos recibidos. |

### Integraciones

| Tabla | Descripción |
|-------|-------------|
| `integrations` | Configuración de integraciones por organización. |
| `integration_accounts` | Cuentas vinculadas (Meta, Google, etc.). |
| `sync_runs` | Historial de sincronizaciones. |

### Aprobaciones

| Tabla | Descripción |
|-------|-------------|
| `approval_requests` | Solicitudes de aprobación. |
| `approval_decisions` | Decisiones tomadas sobre solicitudes. |

### Briefs y Contratos

| Tabla | Descripción |
|-------|-------------|
| `briefs` | Briefs creativos. |
| `contracts` | Contratos con clientes, incluye UD mensuales. |

### Onboarding

| Tabla | Descripción |
|-------|-------------|
| `onboarding` | Pasos del proceso de onboarding de nuevos clientes. |

### Parámetros

| Tabla | Descripción |
|-------|-------------|
| `parameter_definitions` | Definiciones de parámetros del sistema. |
| `parameter_values` | Valores de parámetros por scope (organización, cliente). |

### Auditoría

| Tabla | Descripción |
|-------|-------------|
| `audit_logs` | Registro de cambios en todas las entidades del sistema. |

---

## Índices Clave

| Tabla | Índice | Columnas |
|-------|--------|----------|
| `organizations` | `IDX_organizations_code` | `code` |
| `users` | `IDX_users_email` | `email` |
| `users` | `IDX_users_organization_id` | `organization_id` |
| `users` | `IDX_users_role` | `role` |
| `leads` | `IDX_leads_organization_id` | `organization_id` |
| `leads` | `IDX_leads_status` | `status` |
| `clients` | `IDX_clients_organization_id` | `organization_id` |
| `clients` | `IDX_clients_status` | `status` |
| `pieces` | `IDX_pieces_organization_id` | `organization_id` |
| `pieces` | `IDX_pieces_client_id` | `client_id` |
| `pieces` | `IDX_pieces_status` | `status` |
| `piece_versions` | `IDX_piece_versions_piece_id` | `piece_id` |
| `corrections` | `IDX_corrections_piece_id` | `piece_id` |
| `ud_budgets` | `IDX_ud_budgets_year_month` | `year, month` |
| `xp_periods` | `IDX_xp_periods_user_id` | `user_id` |
| `audit_logs` | `IDX_audit_logs_entity` | `entity_type, entity_id` |
| `parameter_values` | `IDX_parameter_values_scope` | `scope_type, scope_id` |
| `refresh_tokens` | `IDX_refresh_tokens_token` | `token` |

---

## Estrategia de Migraciones

Las migraciones están en `apps/api/src/infrastructure/migrations/` y siguen un esquema secuencial:

```
0001-create-organizations.ts
0002-create-users.ts
0003-create-crm.ts
0004-create-clients.ts
0005-create-production.ts
0006-create-ud-xp.ts
0007-create-meetings-content.ts
0008-create-billing-catalog.ts
0009-create-integrations.ts
0010-create-approvals-briefs.ts
0011-create-parameters-audit.ts
```

**Ejecución**:

```bash
# Development: synchronize: true (auto-sync desde entities)
# Producción:
npx ts-node src/infrastructure/database-data-source.ts
typeorm migration:run -d dist/infrastructure/database-data-source.js
```

**Todas las tablas usan**:
- `uuid` como Primary Key (generación automática con `uuid_generate_v4()`)
- `created_at` / `updated_at` como timestamps
- `utf8mb4_unicode_ci` como charset
