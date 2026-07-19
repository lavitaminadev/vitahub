# 14. Integraciones (Meta Webhooks y CAPI) - V2

Esta ficha técnica clasifica el nivel real de integración operativa con plataformas de terceros.

## Integración 1: Meta Lead Ads (Webhooks)
**ESTADO: OPERATIVO VERIFICADO**

- **Código Implementado:** `meta.controller.ts` expone métodos GET (verificación) y POST (recepción).
- **Autenticación (Seguridad Inbound):** El sistema rechaza cargas que no contengan una firma válida de Facebook (HMAC `x-hub-signature-256`), bloqueando inyecciones fraudulentas.
- **Rate Limit:** No gestionado en aplicación. Si Meta envía 10,000 leads en 1 segundo, el servidor Node.js intentará procesarlos todos, pudiendo causar OOM (Out Of Memory).
- **Error Handling (Resiliencia):** `MetaLeadRecoveryJob` actúa como mecanismo de contingencia para interrogar la API Graph de Meta y arrastrar los leads que el servidor no haya logrado atrapar. Este es un control robusto comprobado en código.

## Integración 2: Meta Conversions API (CAPI)
**ESTADO: IMPLEMENTADA SIN VERIFICACIÓN EXTERNA (SIN TEST MOCK)**

- **Código Implementado:** `lead-converted.handler.ts` captura el evento interno de conversión CRM y formatea un Payload JSON hacia Graph API de Meta.
- **Cumplimiento Legal y PII:** Verificado exhaustivamente. El Payload aplica el algoritmo `SHA-256` a `email` y `phone`. Esto protege a La Vitamina de multas de privacidad al NO compartir información cruda identificable con redes publicitarias extranjeras.
- **Riesgo:** Como los eventos viajan en `EventEmitter2` (Memoria RAM), un error de red hacia Facebook causará la pérdida silenciosa de la notificación de venta, perjudicando las métricas de la agencia sin reintentos persistentes (No Retry).

## Integración 3: Google Drive (Archivos)
**ESTADO: NO IMPLEMENTADO**
- No se encontró lógica de autenticación (OAuth2 de Google) ni librerías del SDK de Drive en el núcleo de backend para subida automatizada. Se infiere que el sistema solo guardará URLs de texto (Hipervínculos) copiados manualmente por el usuario.

## Integración 4: Bandeja de Mensajería (Instagram/FB)
**ESTADO: NO IMPLEMENTADO**
- Cero líneas de código asociadas al consumo de la API de mensajería (Inbox) de Meta. Requerirá un sprint completo de desarrollo futuro.
