# 54. Matriz Maestra de Integraciones y Webhooks (61)

Análisis exhaustivo del contacto con el exterior.

## 1. Integración: Facebook Graph API (Meta)
- **Proveedor:** Meta Platforms, Inc.
- **Módulo:** `integrations/meta`
- **SDK:** Ninguno oficial de Facebook (Uso directo de `axios`).
- **Versión:** Graph API `v18.0`.
- **Autenticación (OAuth):** Flujo implementado en `MetaConnectCard.tsx` y `MetaController`.
- **Tokens (Crítico):** Los tokens de acceso (Access Tokens de larga duración) se cifran usando AES-256 (`integration-secrets.ts`) antes de guardarse en la BD, protegiendo a La Vitamina en caso de brecha de base de datos.
- **Webhooks (Inbound):** 
  - **Endpoint:** `POST /integrations/meta`
  - **Verificación de Seguridad:** Se valida el header `x-hub-signature-256` procesando un HMAC criptográfico contra el App Secret de Facebook.
  - **Manejo de Duplicados (Idempotencia):** `NO IMPLEMENTADO`. Si Facebook envía el mismo Webhook dos veces (por un reintento de red), TypeORM intentará insertar 2 Leads. Como no hay un `UNIQUE CONSTRAINT` en la tabla sobre el `meta_lead_id`, se crearán leads clonados.
- **CAPI (Conversions API) (Outbound):**
  - **Endpoint Usado:** `POST /v18.0/{pixel_id}/events`
  - **Datos Enviados:** Payload JSON con Action Source (`system_generated`).
  - **Privacidad (Hashing):** `email` y `phone` son pasados por `SHA-256` dentro de `lead-converted.handler.ts` antes de transmitirse, cumpliendo normativas.

## 2. Integración: Google Drive
- **Proveedor:** Google LLC.
- **Estado:** Parcial / Abandono de código.
- **Análisis:** Existen fragmentos en `GoogleConnectCard.tsx` (Frontend) apuntando a `/integrations/google/auth-url`. Sin embargo, el backend `drive.service.ts` no parece inyectarse activamente en los controladores de Producción para auto-crear carpetas. No operativo.
