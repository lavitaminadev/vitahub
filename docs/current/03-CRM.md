# CRM

ESTADO: VIGENTE
FECHA VERIFICACION: `2026-07-16`
COMMIT VERIFICADO: `29fc25ed78ce0ada35a4828fe784a58e6e6a3193`
FUENTE: codigo actual de `apps/api` y `apps/web`

## Inventario Verificado

- Entidad principal: `Lead`
- Modulos expuestos: leads, contacts, opportunities, interactions
- Pantallas web verificadas: `LeadsPage`, drawer de detalle, vistas de oportunidades/interacciones disponibles por codigo

## Flujo Real de Entrada de Lead

1. Entra por `LeadIntakeService.captureLead()`.
2. Se normalizan nombre, email, telefono, company, source y notas.
3. Se busca duplicado por este orden:
   - `externalLeadId`
   - `email`
   - `phone`
4. Se califica el lead:
   - puntaje por email, telefono, company, fuente Meta y contexto de campaña;
   - descarte por palabras de baja calidad o ausencia de canal de contacto;
   - clasificacion en `qualified`, `review` o `discarded`.
5. Se persiste o actualiza el lead.
6. Se ejecuta `CrmLeadAutomationService`.

## Trazabilidad Real Conservada En Lead

- `organizationId`
- `source`
- `sourceDetail`
- `externalLeadId`
- `externalFormId`
- `externalCampaignId`
- `campaignName`
- `pageId`
- `fitStatus`
- `qualityScore`
- `discardReason`
- `assignedTo`
- `consentCapturedAt`
- `retentionReviewAt`
- `metadata`
- `convertedAt`
- `convertedToClientId`

## Endpoints CRM Verificados

- `POST /crm/leads`
- `GET /crm/leads`
- `GET /crm/leads/:id`
- `PUT /crm/leads/:id`
- `POST /crm/leads/:id/convert`

## Hallazgos

- Hallazgo corregido: la UI de detalle de lead ya existia pero el endpoint `GET /crm/leads/:id` no.
- La deduplicacion actual privilegia seguridad operativa sobre agresividad: si coincide `externalLeadId`, `email` o `phone`, se actualiza el lead existente.
- No se observaron restricciones SQL visibles en esta revision para garantizar unicidad fuerte por `organizationId + externalLeadId`; hoy la deduplicacion esta implementada a nivel de servicio.

## Riesgos Abiertos

- Sin constraint unico en base, dos procesos concurrentes podrian intentar insertar el mismo lead externo antes de verse mutuamente.
- No se audito todavia todo el flujo `lead -> opportunity won -> client` para probar ausencia de duplicados de cliente en repeticion.
- No se corrio una prueba E2E real de UI CRM en navegador autenticado durante esta iteracion.

## Estado de Veracidad Frente al Documento Maestro

- Es verdadero que el CRM existe y tiene estructura real de pipeline comercial.
- No esta probado aun todo el ciclo “ganado -> cliente -> reporteria”.
- El sistema si conserva atribucion basica de origen de lead, pero no toda la reporteria de ROI que el Maestro proyecta como objetivo final.
