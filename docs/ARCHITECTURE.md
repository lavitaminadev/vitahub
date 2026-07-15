# Arquitectura de VITAHUB

## Visión General

VITAHUB es un sistema de gestión de agencia digital diseñado para agencias chilenas. Proporciona una plataforma integral para administrar clientes, producción, presupuestos, gamificación, reuniones, contenido y facturación.

## Estructura del Proyecto

```
hubvit/
├── apps/
│   ├── api/              # Backend NestJS + TypeORM + MySQL
│   │   ├── src/
│   │   │   ├── core/          # Módulos transversales (auth, tenancy, audit, etc.)
│   │   │   ├── modules/       # Módulos de dominio (organizations, users, clients, etc.)
│   │   │   ├── infrastructure/# Migraciones y configuración de BD
│   │   │   ├── config/        # Configuración global
│   │   │   ├── shared/        # Utilidades compartidas
│   │   │   ├── app.module.ts  # Módulo raíz
│   │   │   └── main.ts        # Punto de entrada
│   │   ├── prisma/
│   │   └── test/
│   └── web/               # Frontend (a definir)
├── packages/
│   ├── contracts/         # Tipos compartidos entre API y Web
│   ├── shared-types/      # Definiciones de tipos comunes
│   ├── ui/                # Componentes UI compartidos
│   └── validation/        # Esquemas de validación (Zod)
├── infrastructure/       # Docker, despliegue, cron jobs
├── database/             # Seeds y scripts de BD
├── docs/                 # Documentación
├── scripts/              # Scripts de automatización
└── tests/                # Tests E2E
```

## Módulos Core

| Módulo | Descripción |
|--------|-------------|
| **Auth** | Autenticación JWT con refresh tokens, registro y login |
| **Tenancy** | Multi-tenancy por organización (aislamiento de datos) |
| **Audit** | Trazabilidad de cambios en entidades |
| **Health** | Endpoints de health check (BD, memoria, disco, Redis) |
| **Errors** | Manejo centralizado de excepciones |
| **Observability** | Logging, métricas y monitoreo |
| **Events** | Arquitectura basada en eventos (EventEmitter) |
| **Jobs** | Tareas programadas (cron jobs) |
| **Notifications** | Notificaciones internas por usuario |
| **Parameters** | Sistema de parámetros configurables por scope |

## Módulos de Dominio (Capacidades)

| Módulo | Descripción |
|--------|-------------|
| **Organizations** | Gestión de organizaciones (agencias) |
| **Users** | Gestión de usuarios de la agencia |
| **CRM** | Leads, contactos, oportunidades, pipeline |
| **Clients** | Gestión de clientes |
| **Contracts** | Contratos con clientes |
| **Catalog** | Catálogo de servicios |
| **Production** | Piezas, versiones, correcciones, flujo de producción |
| **Design Budget** | Presupuesto de UDs (unidades de diseño) mensual |
| **Gamification** | Gamificación con XP semanal, tiers y ranking |
| **Content** | Parrillas de contenido semanal |
| **Meetings** | Reuniones, asistentes y action items |
| **Integrations** | Integraciones con Meta, Google, Drive, Gmail |
| **Billing** | Cotizaciones, facturas, pagos |
| **Approvals** | Flujo de aprobaciones |
| **Briefs** | Briefs creativos |
| **Documents** | Gestión documental |
| **Uploads** | Subida de archivos |
| **Onboarding** | Flujo de onboarding de clientes |
| **Reports** | Reportes y dashboard ejecutivo |
| **Dashboards** | Dashboards operativos (overview, producción, financiero) |
| **Knowledge** | Base de conocimiento |

## Estructura de cada Módulo

Cada módulo de dominio sigue una arquitectura de casos de uso (use cases):

```
module/
├── *.controller.ts       # Controlador REST
├── *.module.ts            # Módulo NestJS
├── *.entity.ts            # Entidad TypeORM
├── *.service.ts           # Servicio (opcional)
├── *.use-case.ts          # Casos de uso
├── *.enum.ts              # Enumeraciones
└── dto/                   # DTOs de validación
```

## Base de Datos

Ver `docs/DATABASE.md` para el detalle completo.

## Multi-tenancy

VITAHUB implementa multi-tenancy a nivel de organización mediante:

1. **Middleware `TenancyMiddleware`**: Extrae `organizationId` del header `x-organization-id` o del JWT
2. **Filtro de entidad `BaseEntity`**: Toda entidad tenant-aware incluye `organization_id`
3. **Contexto async local (`AsyncLocalStorage`)**: Propaga el tenant en toda la request
4. **Guard `TenantGuard`**: Verifica que las operaciones respeten el aislamiento

```
Request → TenancyMiddleware → AuthGuard → Controller → Service → Repository (filtrado por org)
```

## Flujo de Autenticación

```
┌─────────┐     POST /auth/login     ┌──────────┐
│         │ ────────────────────────→ │          │
│ Cliente │     { email, password }   │   API    │
│         │ ←──────────────────────── │          │
└─────────┘     { accessToken,        └──────────┘
                 refreshToken,
                 user }

1. POST /auth/login → valida credentials → genera JWT (7d exp) + refresh token
2. POST /auth/refresh → refresh token → nuevo access token
3. GET /auth/me → datos del usuario autenticado
4. POST /auth/register → crea usuario y organización (opcional)
```

## Arquitectura de Eventos

VITAHUB usa `@nestjs/event-emitter` para desacoplar procesos:

```
PieceAssigned ─────→ PieceAssignedHandler → Notificación ─────→ Usuario asignado
PieceDelivered ───→ PieceDeliveredHandler → XP Event ────────→ Gamificación
                                            UD Consumption ──→ Design Budget
LeadConverted ────→ LeadConvertedHandler → Onboarding ──────→ Cliente
```

## Diagrama de Capas

```
┌──────────────────────────────────────────────────────────────┐
│                    Controllers (REST API)                     │
│         @Controller, @Get, @Post, @UseGuards, etc.           │
├──────────────────────────────────────────────────────────────┤
│                    Use Cases / Services                       │
│               Lógica de negocio y orquestación               │
├──────────────────────────────────────────────────────────────┤
│                     TypeORM Repositories                      │
│                         @InjectRepository                     │
├──────────────────────────────────────────────────────────────┤
│                    MySQL 8 Database                           │
│                    + Redis (caché/sesión)                     │
├──────────────────────────────────────────────────────────────┤
│              Cross-cutting (Core Modules)                     │
│  Auth | Tenancy | Audit | Health | Events | Observability    │
└──────────────────────────────────────────────────────────────┘
```
