# 43. Catálogo Maestro de Endpoints (Índice de API REST)

Debido al volumen masivo de rutas expuestas por el backend de VITAHUB, la documentación de la Capa de Red ha sido fraccionada en submódulos especializados dentro del directorio `api-interna/`.

Este documento sirve como índice unificado.

## Estándar de Documentación Aplicado
Todos los endpoints listados en las carpetas secundarias cumplen estrictamente con el siguiente análisis forense exigido:
- Identificación de Método, Controlador y Línea exacta de archivo.
- Mapeo de DTOs, Autenticación (JWT) y Autorización (RolesGuard).
- Trazabilidad de Multi-Tenancy (`organization_id`).
- Flujo secuencial interno (Controller -> UseCase -> TypeORM -> Events).
- Catálogo de Excepciones HTTP.

## Índice de Catálogos de API Interna

1. **[Catálogo API: CRM (Leads y Clientes)](file:///c:/Users/leno/Desktop/hubvit/docs/auditoria-entrega-v2/api-interna/CRM-ENDPOINTS.md)**
   - Rutas principales: `/leads`, `/clients`, `/contacts`, `/opportunities`
   - Total de Endpoints: 11 endpoints rastreados.
   
2. **[Catálogo API: Producción y Piezas Gráficas](file:///c:/Users/leno/Desktop/hubvit/docs/auditoria-entrega-v2/api-interna/PRODUCTION-ENDPOINTS.md)**
   - Rutas principales: `/production`
   - Total de Endpoints: 8 endpoints rastreados (asignaciones, entregas, correcciones).

3. **[Catálogo API: Autenticación y Usuarios](file:///c:/Users/leno/Desktop/hubvit/docs/auditoria-entrega-v2/api-interna/AUTH-USERS-ENDPOINTS.md)** (Pendiente de escritura)
   - Rutas principales: `/auth`, `/users`, `/organizations`
   - Total de Endpoints: Por escanear.

4. **[Catálogo API: Integraciones Externas (Webhooks)](file:///c:/Users/leno/Desktop/hubvit/docs/auditoria-entrega-v2/api-interna/WEBHOOKS-ENDPOINTS.md)** (Pendiente de escritura)
   - Rutas principales: `/webhooks/meta`

5. **[Catálogo API: Reportes y KPI](file:///c:/Users/leno/Desktop/hubvit/docs/auditoria-entrega-v2/api-interna/REPORTS-ENDPOINTS.md)** (Pendiente de escritura)
   - Rutas principales: `/reporting/dashboard`, `/reporting/kpi`

---
*Progreso de escritura en curso. Los enlaces marcados como "Pendientes" se irán resolviendo a medida que avanza la auditoría.*
