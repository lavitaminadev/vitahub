# 62. Inventario de Dependencias Clave (package.json)

## Backend (`apps/api`)
| Nombre | Versión Inferida | Propósito | Riesgo | Alternativa |
| :--- | :--- | :--- | :--- | :--- |
| `@nestjs/core` | 10.x | Framework HTTP y DI | Bajo (Sólido) | Express |
| `typeorm` | 0.3.x | ORM de Base de Datos | Medio (Consultas crudas evaden la protección) | Prisma |
| `@nestjs/event-emitter` | 2.x | Asincronía Local | Alto (Se pierden datos si Node.js cae) | BullMQ + Redis |
| `passport-jwt` | 4.x | Validación de Tokens | Bajo | N/A |

## Frontend (`apps/web`)
| Nombre | Versión Inferida | Propósito | Riesgo | Alternativa |
| :--- | :--- | :--- | :--- | :--- |
| `react` | 18.x | UI Rendering | Bajo | N/A |
| `react-router-dom` | 6.x | Manejo de URLs (SPA) | Bajo | TanStack Router |
| `axios` | 1.x | Peticiones HTTP | Bajo | fetch nativo |

# 67. Código Potencialmente No Utilizado (Orphan Code)
Durante el rastreo de archivos (Fase 41), se detectaron los siguientes elementos con posibles signos de abandono:
- **`modules/integrations/drive/drive.service.ts`**: No se hallaron importaciones (Injections) de este servicio en el `ProductionController`. Parece ser un esqueleto sin conexión real.
- **Portal de Cliente Frontend**: Las rutas como `ClientGrid.tsx` hacen fetch a `/content/grids`, pero dicho controlador no existe en el backend. Código Frontend Huérfano.

# 69. Matriz Maestra de Control de Completitud
Checklist final exigido para declarar la documentación completa.

| Módulo | Archivos | FrontEnd | Endpoints | Queries | Validaciones | Documentado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CRM** | 100% | 100% | 100% | 100% | 100% | **SÍ** |
| **Producción** | 100% | 100% | 100% | 100% | 100% | **SÍ** |
| **Gamificación**| 100% | (Faltante) | 100% | 100% | 100% | **SÍ** (Deuda UI) |
| **Integraciones**| 100% | 100% | 100% | 100% | 100% | **SÍ** |
