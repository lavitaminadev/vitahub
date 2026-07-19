# 45. Catálogo de Servicios y Métodos Core (Lógica Interna)

El código de negocio no reside en los controladores, sino en los UseCases y Services. Este documento desnuda el funcionamiento de los motores lógicos más críticos.

## 1. Servicio: `ConvertLeadUseCase`
**Archivo:** `apps/api/src/modules/crm/leads/use-cases/convert-lead.use-case.ts`
- **Responsabilidad:** Transformar un prospecto (Lead) en un ente facturable (Client) de manera atómica.
- **Quién lo Llama:** `LeadsController.convert()`.
- **Método: `execute(leadId: string, orgId: string)`**
  1. **Validación:** Obtiene el Lead. Si `status === 'won'`, lanza error `HTTP 409 Conflict`.
  2. **Transacción DB (`dataSource.transaction`):** 
     - Ejecuta `leadRepository.update(leadId, { status: 'won' })`.
     - Ejecuta `clientRepository.save({ name: lead.name, email: lead.email, organization_id: orgId })`.
  3. **Eventos:** Si la transacción hace COMMIT exitoso, dispara `EventEmitter2.emit('lead.converted', payload)`.
- **Riesgos:** Alto riesgo de pérdida asíncrona (Ver archivo 33). Si falla el `emit`, la base de datos ya hizo commit. El sistema cree que funcionó, pero Meta no recibió la señal CAPI.

## 2. Servicio: `PieceRulesService`
**Archivo:** `apps/api/src/modules/production/piece-rules.service.ts`
- **Responsabilidad:** Validador matemático y de negocio para las Piezas Gráficas.
- **Quién lo Llama:** `SubmitVersionUseCase`, `ProductionWorkflowService`.
- **Método: `canSubmitVersion(piece: Piece, userId: string)`**
  1. **Regla de Negocio:** Retorna `false` si el `piece.assigned_to` no coincide con el `userId`.
  2. **Regla de Estado:** Retorna `false` si el `piece.status` no es `IN_PROGRESS` o `CORRECTION`.
- **Método: `calculateCorrectionPenalty(piece: Piece)`**
  1. **Regla Matemática:** Cuenta cuántas versiones existen. Si `versiones > 3`, retorna un flag `requiresBillingExtra = true`.
- **Tests:** `NO EXISTEN TESTS`. Un error matemático aquí afectaría el cobro (Billing) a los clientes de La Vitamina.

## 3. Servicio: `MetaLeadRecoveryJob`
**Archivo:** `apps/api/src/modules/integrations/meta/jobs/meta-lead-recovery.job.ts`
- **Responsabilidad:** Ejecución en segundo plano (Cron) para solventar fallas de red de Facebook Webhooks.
- **Quién lo Llama:** `@Cron(CronExpression.EVERY_4_HOURS)` - Node.js Scheduler.
- **Método: `handleCron()`**
  1. Obtiene todas las `IntegrationAccount` de tipo `META` que estén activas.
  2. Desencripta el OAuth Token usando AES-256 (`integration-secrets.ts`).
  3. Llama a la Graph API: `GET /v18.0/{form_id}/leads?time_range...`
  4. Compara los IDs de Meta contra los Leads en TypeORM (`leads.meta_lead_id`).
  5. Inserta los faltantes.
- **Tenancy (Multitenant):** Como es un Cron en background, no tiene un JWT de usuario. Obtiene el `organization_id` directamente de la tabla `integration_accounts` y se lo inyecta a los Leads nuevos.
- **Riesgos:** Si la tabla crece a 1,000 cuentas de integración, un Cron sincrónico que itere sobre todas y espere la respuesta HTTP de Meta causará un colapso del "Event Loop" de Node.js. Debe migrarse a colas de trabajo distribuidas (BullMQ).
