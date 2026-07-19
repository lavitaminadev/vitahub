# 52. Migraciones y Evolución de Schema

El proyecto utiliza las Migraciones automáticas de TypeORM (`infrastructure/migrations`).

## Inventario de Migraciones Detectadas
1. `CreateInitialSchema` (Genera Users, Clients, Organizations).
2. `AddProductionTables` (Genera Pieces, PieceVersions, Corrections).
3. `AddMetaIntegration` (Añade tabla `integration_accounts` y campos de Meta CAPI).
4. `AddGamificationXP` (Añade `xp_events`).

## Riesgo Operativo (Rollback)
- **Verificado:** Las migraciones cuentan con métodos `up()` y `down()`.
- **Riesgo de Pérdida:** Si se ejecuta un Rollback (`typeorm migration:revert`) de la migración `AddProductionTables`, se ejecutará un `DROP TABLE pieces`. Esto eliminará permanentemente la historia de producción de la agencia (Soft Deletes no protegen contra DROP TABLE). Se requiere una política estricta de respaldos (Snapshots) de la base de datos antes de cualquier deploy de producción.
