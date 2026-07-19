# Meta Status

ESTADO: VIGENTE
FECHA VERIFICACION: `2026-07-16`
COMMIT VERIFICADO: `29fc25ed78ce0ada35a4828fe784a58e6e6a3193`
FUENTE: auditoria sobre codigo local y pruebas ejecutadas

| Componente | Implementado | Probado local | Probado con Meta real | Operativo produccion | Pendiente | Evidencia |
|---|---|---|---|---|---|---|
| OAuth | Si | Si | No | No confirmado | Validacion con app real | `MetaPixelController`, `MetaOAuthService`, `oauth-state.spec.ts` |
| Token storage | Si | Si | No | No confirmado | Verificar secretos reales y rotacion | `protectSecret`, `revealSecret`, `credentialsEncrypted` |
| Token refresh/reconnect | Si | Parcial | No | No confirmado | Ejecutar refresh con token real | `refreshIntegration()` |
| Pages | Si | Si | No | No confirmado | Descubrimiento real | `discoverAssets()` |
| Instagram | Si | Si | No | No confirmado | Cuenta conectada real | `connected_instagram_account` |
| Ad Accounts | Si | Si | No | No confirmado | Cuenta publicitaria real | `discoverAssets()` |
| Lead Forms | Parcial | No | No | No confirmado | Descubrimiento/uso real de forms | solo llega `form_id` desde lead detail |
| Webhook verification | Si | Parcial | No | No confirmado | Prueba externa firmada | `MetaController`, `meta-webhook-access.spec.ts` |
| Webhook Leadgen | Si | Si | No | No confirmado | Probar con page real | `MetaLeadAdsService` |
| Historical Sync | Parcial | Si | No | No confirmado | definir alcance y paginacion real | `POST /integrations/meta/leads/sync` es sync puntual, no historico completo |
| Deduplication | Si | Si | No | No confirmado | idealmente constraint DB | `LeadIntakeService` |
| Campaign attribution | Si | Si | No | No confirmado | verificar datos reales de campañas | `campaign_id`, `campaign_name`, `ad_id`, `adset_id` |
| CAPI | Si | Parcial | No | No confirmado | prueba real y durabilidad | `MetaConversionsService`, `lead-converted.handler.ts` |
| Retries | Parcial | No | No | No confirmado | clasificacion retryable/non-retryable | manejo actual simple |
| Monitoring | Parcial | Si | No | No confirmado | tablero operacional y alertas | `MetaLeadWebhookEvent`, `health` endpoint |
