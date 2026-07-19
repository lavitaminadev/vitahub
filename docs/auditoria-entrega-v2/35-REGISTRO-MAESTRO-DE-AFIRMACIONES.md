# 35. Registro Maestro de Afirmaciones (Trazabilidad)

Cada afirmación entregada al cliente está indexada aquí con su nivel de confianza y evidencia.

| ID Reclamación | Afirmación Técnica | Evidencia Real en Código | Estado | Nivel Confianza | Tipo Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- |
| CLAIM-001 | El sistema protege las rutas según la Organización. | `TenancyInterceptor` en `tenant.guard.ts` | Confirmado | Alto | Código |
| CLAIM-002 | El motor de base de datos aísla estrictamente a los Tenants. | Falta de políticas RLS en TypeORM Schemas. | Parcialmente Confirmado | Bajo | Arquitectura |
| CLAIM-003 | Meta CAPI recibe datos encriptados. | Uso de `SHA-256` en Payload Builder de `meta.service`. | Confirmado | Alto | Código |
| CLAIM-004 | Las transacciones previenen leads huérfanos. | `manager.transaction()` en `convert-lead.use-case.ts`. | Confirmado | Alto | Código |
| CLAIM-005 | El sistema evita cuellos de botella en DB. | Uso masivo de `.query()` crudo en `reports.controller.ts`. | Refutado | Alto | Código |
| CLAIM-006 | La Gamificación calcula castigos automáticamente. | Archivos CRON detectados en lógica de backend. | Parcialmente Confirmado | Medio | Código / Inferencia |
| CLAIM-007 | La Bandeja Unificada respeta regla de 24 horas. | Ningún código Frontend/Backend detectado para el Inbox. | No Implementado | N/A | Ausencia Código |
| CLAIM-008 | Recuperación de Webhooks perdidos. | Existencia de `MetaLeadRecoveryJob`. | Confirmado | Alto | Código |
