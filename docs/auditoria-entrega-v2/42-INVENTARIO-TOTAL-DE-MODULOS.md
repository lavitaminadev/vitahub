# 42. Inventario Total de Módulos (Topología NestJS)

Identificación arquitectónica de todos los sub-sistemas agrupados en el backend (`apps/api/src/modules`).

## 1. Módulo: CRM (`crm.module.ts`)
- **Propósito:** Gestión de ciclo de vida del prospecto hasta su conversión a cliente.
- **Entidades:** `Lead`, `Client`, `LeadInteraction`.
- **Controladores:** `LeadsController`, `ClientsController`.
- **Servicios Core:** `CrmLeadAutomationService`.
- **Use Cases:** `ConvertLeadUseCase`, `AssignLeadUseCase`.
- **Eventos Emitidos:** `lead.converted`, `lead.assigned`.
- **Eventos Escuchados:** N/A.
- **Tenancy:** Aplicada en todos los Endpoints mediante `organization_id`.
- **Tests:** `NO IMPLEMENTADO`.
- **Riesgos:** Alto volumen de lectura de Kanban podría generar cuellos de botella sin caché.

## 2. Módulo: Integrations (`integrations.module.ts` / `meta.module.ts`)
- **Propósito:** Puente de comunicación con APIs de terceros.
- **Entidades:** `IntegrationAccount` (Almacena tokens OAuth cifrados).
- **Controladores:** `MetaController` (Webhooks).
- **Servicios Core:** `MetaService` (Llamadas a Graph API).
- **Listeners:** `LeadConvertedHandler` (Envía a CAPI).
- **Jobs:** `MetaLeadRecoveryJob` (Cron cada 4 horas).
- **Tenancy:** Webhooks usan `@SkipTenancy()` (El payload de Facebook no sabe a qué agencia pertenece; el servicio debe inferirlo por el `page_id`).
- **Tests:** `NO IMPLEMENTADO`.
- **Riesgos:** API Externa. Dependencia total del uptime de Meta.

## 3. Módulo: Producción (`production.module.ts`)
- **Propósito:** Fábrica de piezas gráficas y aprobaciones (Core Operativo).
- **Entidades:** `Piece`, `PieceVersion`, `Correction`, `ContentGrid`.
- **Controladores:** `ProductionController`.
- **Use Cases:** `AssignPieceUseCase`, `SubmitVersionUseCase`, `DeliverPieceUseCase`, `RejectPieceUseCase`.
- **Eventos Emitidos:** `piece.assigned`, `piece.delivered`.
- **Permisos:** Requiere rol `DIRECTOR`, `CM`, `DESIGNER` (Restringido para clientes directos).
- **Tests:** `NO IMPLEMENTADO`.

## 4. Módulo: Gamificación (`ud-xp.module.ts`)
- **Propósito:** Retención de talento y gamificación de diseñadores.
- **Entidades:** `XpEvent`, `XpPeriod`, `UDBudget`.
- **Controladores:** `XpController` (Inexistente en rutas activas).
- **Listeners:** Escucha `piece.delivered` para calcular bonos de velocidad.
- **Tenancy:** Aplicada.
- **Riesgos:** Reglas matemáticas fuertemente acopladas.

## 5. Módulo: Reportes (`reports.module.ts`)
- **Propósito:** Extracción analítica y KPIs.
- **Controladores:** `ReportsController`, `DashboardsController`.
- **Base de Datos:** Uso masivo de consultas `.query()` crudas saltándose el Repository Pattern.
- **Riesgos:** Alto riesgo de Inyección SQL si las rutas se modifican en el futuro sin usar parametrización estricta. Alta carga a Base de Datos (Posible lentitud extrema con miles de clientes).

## 6. Módulo: Onboarding (`onboarding.module.ts`)
- **Propósito:** Flujo de inducción de nuevos clientes (Configuración inicial).
- **Entidades:** `Onboarding`.
- **Controladores:** `OnboardingController`.
- **Estado:** Parcialmente implementado.

## 7. Módulo: Reuniones (`meetings.module.ts`)
- **Propósito:** Minutas, Kick-offs y Action Items.
- **Entidades:** `Meeting`, `ActionItem`.
- **Controladores:** `MeetingsController`.
- **Estado:** Activo, con persistencia relacional CRUD básica.
