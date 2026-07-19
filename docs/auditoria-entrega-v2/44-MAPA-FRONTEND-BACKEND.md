# 44. Mapa de Flujo: Frontend React a Backend API

Este documento traza las peticiones (HTTP Requests) que nacen en los componentes visuales de React y mueren en los controladores de NestJS. 
Cualquier desajuste aquí (Rutas huérfanas) se marca como riesgo de deuda técnica.

## 1. Módulo: CRM (LeadsPage.tsx)
| Componente React | Disparador | Método HTTP | URL (Frontend Envía) | Controlador Destino (Backend) | Estado Global Afectado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `LeadsPage.tsx` | Montaje (useEffect) | `GET` | `/crm/leads` | `LeadsController.findAll()` | React Query Cache: `['leads']` |
| `LeadsPage.tsx` | Drag & Drop | `PUT` | `/crm/leads/:id` | `LeadsController.update()` | Invalida Cache: `['leads']` |
| `LeadsPage.tsx` | Botón "Sync CAPI" | `POST` | `/integrations/meta/leads/sync` | `MetaController.syncLeads()` | N/A |
| `LeadDetailDrawer.tsx` | Abrir Cajón | `GET` | `/crm/leads/:id` | `LeadsController.findOne()` | React Query Cache: `['lead', id]` |
| `LeadDetailDrawer.tsx` | Clic "Exportar" | `GET` | `/data-protection/leads/:id/export` | `DataProtectionController.export()` | Descarga de Archivo (Blob) |
| `LeadDetailDrawer.tsx` | Clic "Anonimizar" | `DELETE` | `/data-protection/leads/:id/anonymize`| `DataProtectionController.anonymize()`| **RIESGO:** Destrucción de dato (Hard/Soft Delete no verificado visualmente). |

## 2. Módulo: Producción y Aprobaciones (ApprovalsPage.tsx)
| Componente React | Disparador | Método HTTP | URL (Frontend Envía) | Controlador Destino (Backend) | Estado Global Afectado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ApprovalsPage.tsx` | Montaje | `GET` | `/approvals` | `ApprovalsController.getPending()` | React Query Cache: `['approvals']` |
| `ApprovalsPage.tsx` | Botón "Aprobar" | `PUT` | `/approvals/:id` | `ApprovalsController.approve()` | Invalida Cache: `['approvals']` |
| `ApprovalsPage.tsx` | Botón "Rechazar" | `PUT` | `/approvals/:id` | `ApprovalsController.reject()` | Invalida Cache: `['approvals']` |

## 3. Módulo: Catálogo y Servicios (CatalogServicesTab.tsx)
| Componente React | Disparador | Método HTTP | URL (Frontend Envía) | Controlador Destino (Backend) | Estado Global Afectado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CatalogServicesTab.tsx`| Montaje | `GET` | `/catalog/services` | `CatalogController.getServices()`| React Query Cache: `['catalog-services']` |
| `CatalogServicesTab.tsx`| Form Submit | `POST` | `/catalog/services` | `CatalogController.create()` | Invalida Cache: `['catalog-services']` |

## 4. Módulo: Integraciones (MetaConnectCard.tsx)
| Componente React | Disparador | Método HTTP | URL (Frontend Envía) | Controlador Destino (Backend) | Estado Global Afectado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MetaConnectCard.tsx` | Botón "Conectar" | `GET` | `/integrations/meta/auth-url?redirect_uri=...`| `MetaController.getAuthUrl()` | Redirección OAuth externa (Facebook) |
| `MetaConnectCard.tsx` | Polling (Health) | `GET` | `/integrations/meta/:id/health` | `MetaController.checkHealth()` | React Query Cache (Background) |
| `MetaConnectCard.tsx` | Botón "Probar" | `POST` | `/integrations/meta/:id/conversions/test`| `MetaController.testConversion()`| Notificación Toast (UI) |

## 5. Portal del Cliente (ClientGrid.tsx)
**ESTADO MOCK DETECTADO:** 
En los archivos de `apps/web/src/features/client-portal/`, se evidencia el uso de `api.get('/content/grids')`. Sin embargo, durante el inventario de Controladores Backend, **no se halló un `ContentGridController`**. 
**Conclusión Forense:** El portal de cliente frontend está disparando hacia endpoints que no existen (Deuda 404), o están apuntando temporalmente a mocks locales en el navegador.

## 6. Manejo de Errores Frontend (Error Handling)
- **Interceptores Axios (`core/api.ts`):** Todas las respuestas con código HTTP 401 (Unauthorized) redirigen silenciosamente a `LoginPage.tsx` y purgan el caché (Tokens).
- **No detectado:** No hay un interceptor global de `HTTP 403` para mostrar una página de "Permisos Insuficientes". El usuario se quedará en la pantalla viendo un componente roto o un Toast de error.
