# 41. Inventario Total de Código (Repositorio Completo)

Este documento registra físicamente la topología del repositorio, sin omisiones. (Excluye `node_modules` y directorios `.git`).

## 1. BACKEND (`apps/api/src/`)

### Módulo: Core (Infraestructura Transversal)
| Ruta Física | Tipo | Responsabilidad Principal | Quién lo utiliza | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `core/audit/audit.entity.ts` | Entity | Define tabla de logs de auditoría. | TypeORM | ACTIVO |
| `core/health/health.controller.ts` | Controller | Expone endpoints liveness/readiness. | Infraestructura (AWS/Docker) | ACTIVO |
| `core/health/health.service.ts` | Service | Ejecuta `SELECT 1` y ping a Redis. | `HealthController` | ACTIVO |
| `core/notifications/notification.entity.ts` | Entity | Define tabla de notificaciones push/in-app. | Módulo Notificaciones | PARCIALMENTE UTILIZADO |
| `core/tenancy/skip-tenancy.decorator.ts` | Decorator | Permite ignorar el filtro de tenant. | Webhooks (Meta) | ACTIVO |
| `core/tenancy/tenant.filter.ts` | Middleware | Inyecta `organization_id` en request global. | NestJS HTTP Pipeline | ACTIVO |
| `core/tenancy/tenant.guard.ts` | Guard | Bloquea requests sin `organization_id`. | Controladores Globales | ACTIVO |

### Módulo: CRM (Leads y Clientes)
| Ruta Física | Tipo | Responsabilidad Principal | Quién lo utiliza | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `modules/crm/leads/lead.entity.ts` | Entity | Esquema BD de Prospectos. | CRM | ACTIVO |
| `modules/crm/leads/leads.controller.ts` | Controller | Expone rutas CRUD de Leads. | Frontend React | ACTIVO |
| `modules/crm/leads/crm-lead-automation.service.ts` | Service | Reglas de negocio (ej. mover a Kanban). | Event Listeners | ACTIVO |
| `modules/crm/leads/use-cases/convert-lead.use-case.ts` | UseCase | Ejecuta transacción DB Lead -> Client. | `LeadsController` | ACTIVO |
| `modules/crm/clients/client.entity.ts` | Entity | Esquema BD de Clientes oficiales. | CRM/Producción | ACTIVO |

### Módulo: Integrations (Terceros)
| Ruta Física | Tipo | Responsabilidad Principal | Quién lo utiliza | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `modules/integrations/meta/meta.controller.ts` | Controller | Endpoint Webhook para Facebook. | Servidores Meta | ACTIVO |
| `modules/integrations/meta/meta.service.ts` | Service | Orquesta lógica de CAPI y Leads. | Jobs y UseCases | ACTIVO |
| `modules/integrations/meta/jobs/meta-lead-recovery.job.ts` | Cron Job | Recupera leads perdidos cada 4 horas. | NestJS Scheduler | ACTIVO |
| `modules/integrations/meta/handlers/lead-converted.handler.ts` | Listener | Escucha `lead.converted` y envía a CAPI. | Event Emitter | ACTIVO |
| `modules/integrations/drive/drive.service.ts` | Service | Generación de carpetas (Dummy). | Módulo Documents | POSIBLEMENTE OBSOLETO |

### Módulo: Producción y UDs
| Ruta Física | Tipo | Responsabilidad Principal | Quién lo utiliza | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `modules/production/piece.entity.ts` | Entity | Unidad atómica de trabajo. | Operaciones | ACTIVO |
| `modules/production/production.controller.ts` | Controller | Endpoints de aprobación/rechazo. | Frontend | ACTIVO |
| `modules/production/production-workflow.service.ts` | Service | State Machine de piezas. | Controller | ACTIVO |
| `modules/production/assign-piece.use-case.ts` | UseCase | Asigna Diseñador a Pieza. | Controller | ACTIVO |
| `modules/ud-xp/ud-budget.entity.ts` | Entity | Registro contable de Unidades Diseño. | Reports | ACTIVO |

### Archivos Transversales
| Ruta Física | Tipo | Responsabilidad Principal | Quién lo utiliza | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `app.module.ts` | Config | Raíz de NestJS, inyecta Tenancy. | `main.ts` | ACTIVO |
| `main.ts` | Bootstrap | Levanta servidor puerto 3000. | Node.js | ACTIVO |
| `infrastructure/migrations/*` | Migrations | Scripts SQL de TypeORM (11 archivos). | TypeORM CLI | ACTIVO |
| `shared/security/integration-secrets.ts` | Helper | Cifrado/Descifrado AES. | MetaService | ACTIVO |

---

## 2. FRONTEND (`apps/web/src/`)

### Módulo: Core (Ruteo y Layout)
| Ruta Física | Tipo | Responsabilidad Principal | Estado |
| :--- | :--- | :--- | :--- |
| `App.tsx` | Component | Raíz de React. | ACTIVO |
| `core/router.tsx` | Router | Define árbol de rutas (`react-router-dom`). | ACTIVO |
| `core/api.ts` | Utility | Instancia de Axios interceptando JWT. | ACTIVO |
| `core/ProtectedRoute.tsx` | Component | Wrapper que expulsa usuarios sin token. | ACTIVO |

### Features (Pantallas)
| Ruta Física | Tipo | Responsabilidad Principal | Estado |
| :--- | :--- | :--- | :--- |
| `features/auth/LoginPage.tsx` | Page | UI de acceso. | ACTIVO |
| `features/crm/LeadsPage.tsx` | Page | Tablero Kanban. | ACTIVO |
| `features/crm/components/LeadDetailDrawer.tsx` | Component | Modal lateral (Drawer) de detalles de Lead. | ACTIVO |
| `features/dashboard/DashboardPage.tsx` | Page | Cuadro de mando ejecutivo. | ACTIVO |
| `features/reports/ReportsPage.tsx` | Page | Consumo de `reports.controller.ts`. | ACTIVO |
| `features/client-portal/ClientLayout.tsx` | Page | Layout portal cliente (Mock). | PARCIALMENTE UTILIZADO |

*(Nota: Este inventario omite archivos estáticos de assets por brevedad, centrándose estrictamente en código de negocio)*.
