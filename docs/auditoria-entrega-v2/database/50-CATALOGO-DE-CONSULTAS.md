# 50. Catálogo de Consultas y Riesgo N+1

Documentación exhaustiva de las operaciones de lectura hacia la base de datos, enfocándose en las consultas manuales (Raw Queries) detectadas.

## QUERY-REP-001: Dashboard General
- **Módulo:** Reports
- **Archivo:** `reports.controller.ts`
- **Operación:** `dataSource.query("SELECT COUNT(*) as total FROM clients WHERE organization_id = ? AND status = 'active'", [orgId])`
- **Riesgo N+1:** Ninguno (Es una agregación directa en DB).
- **Riesgo SQLi:** Mitigado por parametrización posicional `[orgId]`. 
- **Deuda Técnica:** Rompe el patrón Repository de TypeORM, haciendo imposible interceptar la llamada con un `Subscriber` global.

## QUERY-PROD-001: Listar Piezas (Kanban)
- **Módulo:** Production
- **Archivo:** `list-pieces.use-case.ts`
- **Operación:** `pieceRepository.find({ where: { organization_id, status }, relations: ['assignedTo', 'client'] })`
- **Riesgo N+1:** Mitigado. TypeORM convierte el array de `relations` en `LEFT JOIN` a nivel de SQL antes de traer los datos.
- **Tenant Filter:** Aplicado en el objeto `where` explícitamente.

## QUERY-META-001: Buscar Leads Huérfanos
- **Módulo:** Integrations (MetaLeadRecoveryJob)
- **Operación:** `leadRepository.findOne({ where: { meta_lead_id: id } })` ejecutado dentro de un bucle `for...of`.
- **Riesgo N+1:** **ALTO RIESGO.** Si el Job recupera 500 leads perdidos de Facebook, ejecutará 500 queries de tipo `SELECT` separadas, más 500 `INSERT` separadas. Esto saturará la conexión de base de datos.
- **Recomendación:** Refactorizar usando `IN (...)` y un `Upsert` masivo (Bulk Insert).
