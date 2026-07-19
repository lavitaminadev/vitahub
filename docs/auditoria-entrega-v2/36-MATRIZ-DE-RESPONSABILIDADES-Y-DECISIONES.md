# 36. Matriz de Responsabilidades y Decisiones

Existen bloqueos en el proyecto que no son culpa de desarrollo, sino definiciones comerciales pendientes por Nicolás Cardemil y la Dirección.

### DECISIONES DE NEGOCIO (Bloqueantes por Dirección)
| Decisión Pendiente | Impacto Técnico | Alternativa Actual | Recomendación Técnica | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Fórmula de Esfuerzo Audiovisual** | Impide programar la entidad `ud_cost` dinámica para Reels/Fotos en `production`. | Usar tarifa plana temporal (Ej: 1 Reel = 5 UDs estáticas). | Dirección debe definir tabla de valores matemáticos exactos. | PENDIENTE |
| **Elección de Pasarela de Facturación** | Impide construir integración API (`billing.service.ts`). | Facturar manual a fin de mes. | Contratar Toku (para automatizar retención). | PENDIENTE |
| **Proceso Legal de App Review (Meta)**| Detiene construcción de Bandeja Unificada. | Usar Business Suite nativo. | Iniciar el trámite burocrático de Facebook hoy, desarrollar después. | PENDIENTE |

### DECISIONES TÉCNICAS (Responsabilidad Desarrollo)
| Decisión Pendiente | Impacto Arquitectónico | Alternativa Actual | Acción Inmediata | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Reemplazo de EventEmitter2** | Riesgo de pérdida de eventos en memoria. | Mantener in-memory síncrono. | Levantar instancia de BullMQ + Redis para garantizar persistencia asíncrona. | DEUDA TÉCNICA |
| **Refactorización de Raw Queries** | Riesgo SQLi por uso intensivo de `dataSource.query()` en `reports`. | Uso de parámetros posicionales (`[orgId]`). | Migrar a QueryBuilder de TypeORM. | DEUDA TÉCNICA |
| **Ausencia de Cobertura Tests** | Inestabilidad futura al escalar (Regresiones silentes). | Pruebas manuales post-deploy. | Crear Unit Tests base en `crm` y `production`. | NO IMPLEMENTADO |
