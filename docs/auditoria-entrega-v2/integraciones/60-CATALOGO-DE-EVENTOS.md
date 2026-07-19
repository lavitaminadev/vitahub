# 60. Catálogo de Eventos (Event-Driven Architecture)

El sistema utiliza `@nestjs/event-emitter`.

## Evento: `lead.converted`
- **Emisor:** `convert-lead.use-case.ts`.
- **Momento:** Inmediatamente después del COMMIT de BD.
- **Payload:** `{ leadId: string, clientId: string, organizationId: string, email: string, phone: string }`.
- **Listener:** `MetaService.sendConversionToCapi()`.
- **Persistencia:** En memoria RAM (Volátil).
- **Riesgo:** Si ocurre un Exception dentro del Listener, el sistema no tiene mecanismo para encolar el evento y reintentarlo en 5 minutos (No existe BullMQ/Redis Queue).

## Evento: `piece.delivered`
- **Emisor:** `deliver-piece.use-case.ts`.
- **Momento:** Cuando el estado cambia a `DELIVERED`.
- **Listener:** (Inferido para el Módulo de Gamificación XP). Debería calcular bonos de tiempo.
- **Idempotencia:** No garantizada. Si un usuario aprieta el botón de entrega 2 veces rápido, podría emitir 2 eventos y sumar doble puntaje (XP) si el Frontend no bloquea (Debounce) el botón.
