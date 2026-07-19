# 59. Mapa Completo de Multi-Tenancy (Y Autorización 58)

Auditoría estricta de las fronteras de aislamiento B2B.

## Mecanismo Central (`tenant.filter.ts`)
- **Cómo opera:** Lee el token JWT del usuario, extrae la variable `orgId`, y la inyecta mutando el objeto HTTP Request (`req.organizationId = payload.orgId`).

## Tablas que NO tienen Organization ID (Globales)
- `integration_accounts`: Curiosamente, se detectó que los tokens de integración pueden no estar fuertemente amarrados al tenant a nivel de Entidad, resolviéndose por relaciones secundarias.
- `audit_logs`: Si existen, deberían ser globales para el sistema maestro.

## Vectores de Fuga (IDOR Vulnerability)
- **Problema Estructural:** Si un controlador (Ej: `LeadsController.findOne(id)`) hace una búsqueda `repository.findOne(id)` y **olvida** incluir `organization_id` en el objeto `where`, un usuario de la Agencia A podría pasar el UUID de un Lead de la Agencia B en la URL (`GET /leads/1234-uuid-de-B`) y el backend se lo entregaría.
- **Mitigación Parcial Encontrada:** El desarrollador fue disciplinado, se observó que la inmensa mayoría de las llamadas a `find` incluyen el filtro. Sin embargo, esto es frágil. Una arquitectura de "Grado Bancario" usaría PostgreSQL RLS (Row Level Security), donde la base de datos aborta la query si el ID no coincide, sin importar si el programador Node.js lo olvidó en el código.

## Roles y Autorización (RolesGuard)
- Matriz de Permisos:
  - `ADMIN`: Global (Ignora Tenancy).
  - `DIRECTOR`: Tenancy local. Acceso a todo el CRUD y Dashboards.
  - `CM`: Tenancy local. Acceso a Producción, Aprobaciones. No puede ver KPIs financieros (Dashboards).
  - `DESIGNER`: Tenancy local. Solo ve piezas que tengan su `assigned_to`.
