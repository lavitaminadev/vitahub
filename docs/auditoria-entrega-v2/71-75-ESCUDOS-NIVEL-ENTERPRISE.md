# 71. Inventario de Vulnerabilidades CVE (Seguridad Estática)
**Fase Enterprise**

Al auditar la infraestructura, las dependencias de código abierto (`node_modules`) introducen riesgos silentes.
- **Severidad Crítica:** No se han detectado CVEs de severidad alta en NestJS 10 ni React 18, siempre y cuando se mantengan las políticas de actualización (`npm audit fix`).
- **Secretos Hardcodeados:** Se verificó que los tokens de integración (Facebook) se guardan en BD y no en el código fuente, lo cual es excelente. Sin embargo, si la variable `process.env.ENCRYPTION_KEY` (usada en `integration-secrets.ts`) se subiera a GitHub por accidente, la base de datos entera quedaría comprometida.

# 72. Ciclo de Destrucción de Datos (Derecho al Olvido)
**Fase Enterprise**

El sistema implementa "Soft Deletes" de TypeORM (`deleted_at`).
- **Problema de Cumplimiento (GDPR/Ley de Datos):** Si un cliente de La Vitamina exige que se borren sus datos, presionar el botón "Borrar" en el CRM **NO elimina los datos físicamente de la base de datos**. El registro queda oculto.
- **Riesgo Legal:** Si el cliente descubre que su teléfono e email siguen en las tablas SQL, puede demandar. 
- **Endpoint Faltante:** Es obligatorio desarrollar un script o endpoint (Ej: `/data-protection/leads/:id/hard-delete`) que ejecute un `DELETE` real saltándose el `SoftDelete` de TypeORM para cumplir normativas.

# 73. Mapa de Estados y Caché Frontend
**Fase Enterprise**

Las llamadas desde `apps/web/src` a las APIs están acopladas al navegador.
- **Caché React:** No se evidenció el uso de librerías avanzadas como `TanStack Query (React Query)`. Esto significa que si el usuario entra a "Leads", vuelve al "Dashboard" y entra a "Leads" nuevamente, el frontend **volverá a hacer la petición HTTP completa** al servidor.
- **Efecto de Rendimiento:** La aplicación es ineficiente en su uso de red. Para 50 usuarios simultáneos, el servidor recibirá un exceso de peticiones redundantes.
- **Solución:** Implementar `React Query` para retener la lista de Leads en la RAM del navegador por 5 minutos antes de volver a solicitarla al backend.
