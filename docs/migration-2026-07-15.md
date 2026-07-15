# Migración: Reorganización del Repositorio VITAHUB

**Fecha:** 2026-07-15
**Objetivo:** Hacer el repo clonable directamente en `/home/mbarrios/VITAHUB` (iHosting) con `app.js` en raíz, manteniendo modularidad y compatibilidad con Node 20.20.2 + Phusion Passenger + cPanel.

## Cambios Realizados

### Fase 1: Foundation (configs + raíz)
| Archivo | Cambio | Motivo |
|---------|--------|--------|
| `app.js` | **CREADO** | Entry point de Phusion Passenger. Requiere `apps/api/dist/main` |
| `.gitignore` | Actualizado | Añadido `build/`, `.turbo`, `.env.local`, `.env.production`, `coverage/`, `*.tsbuildinfo` |
| `package.json` | Actualizado | Añadido script `start:passenger`, workspace `packages/*`, `migration:run`, `migration:revert` |
| `.env.example` | Actualizado | Añadido `CORS_ORIGIN`, `JWT_REFRESH_EXPIRES_IN`, `BCRYPT_ROUNDS` |

### Fase 2: Limpieza de directorios vacíos/stale
| Ruta eliminada | Motivo |
|----------------|--------|
| `packages/contracts/` | Vacío (0 archivos) |
| `packages/ui/` | Vacío (0 archivos) |
| `packages/validation/` | Vacío (0 archivos) |
| `apps/api/prisma/` | Vacío — el proyecto usa TypeORM, no Prisma |
| `apps/api/src/shared/` | Vacío — tipos compartidos están en `packages/shared/` |
| `apps/web/src/layout/` | Vacío — `AppLayout` usa `shared/Layout` directamente |
| `apps/api/src/modules/integrations/billing/` | Vacío |
| `apps/api/src/modules/integrations/calendar/` | Vacío |
| `apps/api/src/modules/integrations/core/` | Vacío |
| `apps/api/src/modules/integrations/drive/` | Vacío |
| `apps/api/src/modules/integrations/generic/` | Vacío |
| `apps/api/src/modules/integrations/gmail/` | Vacío |
| `apps/api/src/modules/integrations/google/` | Vacío |
| `apps/api/src/modules/integrations/reservations/` | Vacío |

### Fase 3: Renombres
| Ruta anterior | Ruta nueva | Motivo |
|---------------|------------|--------|
| `packages/shared-types/` | `packages/shared/` | Nombre más corto y semántico |
| `@vitahub/shared-types` | `@vitahub/shared` | Consistente con el directorio |

### Fase 4: Features frontend vacías
| Ruta eliminada | Motivo |
|----------------|--------|
| `apps/web/src/features/dashboards/` | Vacío — la feature activa es `dashboard/` |
| `apps/web/src/features/audiovisual/` | Vacío — sin implementación |

## Estado Post-Migración

### Builds verificados
- `apps/api`: `npm run build` → OK (tsc compila sin errores)
- `apps/web`: `npm run build` → OK (tsc + vite build, 169 módulos)

### Lo que NO se modificó (intencionalmente)
- Estructura de módulos backend (`modules/{dominio}/`) — funciona y es modular
- Estructura de features frontend (`features/{feature}/`) — funciona y es plana
- Core transversal (`core/auth`, `core/tenancy`, etc.) — arquitectura correcta
- Integraciones con contenido (`integrations/meta/`, `integrations/oauth/`) — tienen código real
- `infrastructure/` — scripts de deploy, docker, monitoreo
- `database/` — seeds, diagramas, documentación
- `docs/` — documentación existente
- `skills/` — skills de opencode (no del proyecto)

### Próximos pasos sugeridos
1. Implementar contenido en `packages/shared/` (types ya existen)
2. Implementar tests en `tests/`
3. Agregar integraciones reales en los módulos backend vacíos
4. Configurar Passenger en cPanel apuntando a la raíz del repo
5. Servir el frontend compilado (`apps/web/dist/`) desde nginx/apache
