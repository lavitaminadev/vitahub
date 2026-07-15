# Arquitectura Actual — VITAHUB

## Stack
- **Node:** 20.20.2 (`.nvmrc`)
- **Backend:** NestJS 10 + TypeORM + MySQL 8+ + Passport JWT + Swagger
- **Frontend:** React 19 + Vite 5 + React Router 7 + TanStack Query + Zustand + PWA
- **Infra:** Docker Compose, Prometheus/Grafana, Phusion Passenger

## Estructura de Directorios

### Raíz
```
/
├── app.js              ← Passenger entry point (require apps/api/dist/main)
├── package.json        ← Monorepo raíz (workspaces: apps/api, apps/web, packages/*)
├── .nvmrc              ← 20.20.2
├── .env.example
└── .gitignore
```

### Backend (`apps/api/`)
```
apps/api/src/
├── main.ts                 ← NestJS bootstrap
├── app.module.ts           ← Module raíz (importa todos los módulos)
├── config/index.ts         ← Config centralizada
├── core/                   ← Transversal
│   ├── auth/               ← Login, register, JWT, refresh
│   ├── authorization/      ← Roles, permisos
│   ├── tenancy/            ← Multi-tenant middleware
│   ├── audit/              ← Auditoría de cambios
│   ├── errors/             ← Filtros de excepción
│   ├── events/             ← Event emitter
│   ├── health/             ← Health check endpoint
│   ├── jobs/               ← Background jobs
│   ├── notifications/      ← Notificaciones
│   ├── observability/      ← Logging, métricas
│   └── parameters/         ← Parámetros del sistema
├── modules/                ← Dominios de negocio
│   ├── {dominio}/          ← Módulo plano (entity, controller, use-cases)
│   └── integrations/       ← Integraciones por proveedor
│       ├── meta/           ← Meta/Facebook Ads API
│       └── oauth/          ← OAuth2 flow
└── infrastructure/
    ├── database-data-source.ts  ← TypeORM DataSource
    └── migrations/              ← Migraciones SQL secuenciales
```

### Frontend (`apps/web/`)
```
apps/web/src/
├── main.tsx              ← React entry
├── App.tsx               ← App wrapper
├── index.css             ← Estilos globales
├── core/                 ← Core transversal
│   ├── router.tsx        ← React Router config
│   ├── api.ts            ← Axios client + interceptors
│   ├── auth.tsx          ← Zustand auth store
│   ├── ProtectedRoute.tsx
│   └── AppLayout.tsx     ← Layout wrapper
├── features/             ← Features planas
│   ├── {feature}/        ← Dashboard, Clients, CRM, etc.
│   └── {feature}/{SubFeaturePage}.tsx
└── shared/               ← UI components
    ├── Layout.tsx         ← Sidebar + Outlet
    ├── Card.tsx
    ├── DataTable.tsx
    ├── Modal.tsx
    ├── LoadingSpinner.tsx
    └── StatusBadge.tsx
```

### Paquetes compartidos (`packages/`)
```
packages/shared/          ← @vitahub/shared
├── src/
│   ├── types/            ← Interfaces por dominio
│   ├── enums/            ← Enums compartidos
│   └── constants/        ← Constantes
└── index.ts              ← Barrel export
```

### Database (`database/`)
```
database/
├── seeds/seed.sql
├── diagrams/er-diagram.md
└── documentation/schema.md
```

### Infraestructura (`infrastructure/`)
```
infrastructure/
├── docker-compose.yml
├── deploy.sh
├── deployment/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   ├── nginx.conf
│   └── ecosystem.config.js
├── ihosting/deploy.ps1
├── monitoring/
│   ├── docker-compose.monitoring.yml
│   └── prometheus.yml
├── scripts/
│   ├── backup.sh
│   └── seed.sh
└── cron/crontab
```

## Patrones

### Backend — Módulo plano
Cada módulo de dominio sigue el mismo patrón:
```
modules/{nombre}/
├── {nombre}.module.ts         ← @Module()
├── {nombre}.controller.ts     ← @Controller()
├── {entidad}.entity.ts        ← @Entity() TypeORM
└── {accion}.use-case.ts       ← Use case (servicio)
```

### Frontend — Feature plana
Cada feature es un directorio con página(s):
```
features/{nombre}/
└── {Nombre}Page.tsx           ← Página exportada
```
El routing se declara exclusivamente en `core/router.tsx`.

## Flujo de Despliegue (iHosting / cPanel / Passenger)

1. Clonar repo en `/home/mbarrios/VITAHUB`
2. `cd apps/api && npm install && npm run build`
3. `cd apps/web && npm install && npm run build`
4. Configurar Passenger para que apunte a `/home/mbarrios/VITAHUB`
5. `app.js` en raíz ejecuta `require('./apps/api/dist/main')` → arranca NestJS
6. Servir `apps/web/dist/` como DocumentRoot para el frontend

## Variables de Entorno Requeridas
Ver `.env.example` en la raíz del proyecto.
