# Estado Actual

ESTADO: VIGENTE
FECHA VERIFICACION: `2026-07-16`
COMMIT VERIFICADO: `29fc25ed78ce0ada35a4828fe784a58e6e6a3193`
FUENTE: codigo real del repo local + ejecucion de comandos reales

## Resumen Ejecutivo

La fase de estabilizacion ya no esta en estado teorico. El sistema quedo compilando y con pruebas backend en verde para el alcance auditado:

- `npm run build:api`: PASS
- `npm run build:web`: PASS
- `npm run lint:api`: PASS
- `npm run lint:web`: PASS
- `npm run test:api`: PASS (`24` archivos, `99` tests)

## Correcciones Confirmadas

- Se corrigieron fallas de compilacion en API y Web.
- Se alineo la UI CRM con el backend agregando `GET /crm/leads/:id`.
- Se corrigio el handler de conversion Meta para usar el modelo real de cuentas `PAGE` y `pixelId` persistido en integracion.
- Se endurecio el flujo manual de sincronizacion Meta para respetar aislamiento por organizacion.
- Se bloqueo el procesamiento de leads Meta para paginas no seleccionadas operativamente.

## Estado Real de CRM

- Existe modulo CRM operativo con leads, contactos, oportunidades e interacciones.
- El flujo minimo verificado hoy es: listar leads, abrir detalle, crear/actualizar lead por intake, convertir lead.
- La entidad `Lead` conserva trazabilidad de fuente, campaña, formulario, pagina, scoring y conversion.
- El detalle de lead ahora tiene endpoint real y ya no depende de un contrato inexistente.

## Estado Real de Meta

- Existe flujo OAuth iniciado desde frontend y servido por backend.
- El backend firma y verifica `state` con HMAC y expiracion de 10 minutos.
- Se almacenan tokens cifrados (`enc:v1:`) en la configuracion de integracion.
- Se descubren paginas, perfiles de Instagram y cuentas publicitarias desde Graph API.
- La seleccion de activos se persiste y se usa para determinar `leadCaptureReady`.
- Existe webhook publico para Meta, descarga de lead detail y alta/actualizacion de lead CRM.
- Existe validacion de pixel y envio de evento de prueba a CAPI.

## Segunda Pasada Global

En una pasada adicional sobre el resto del proyecto se detectaron y corrigieron problemas transversales fuera del nucleo CRM/Meta:

- Se corrigio el modulo de reportes para consultar la tabla real `invoices`.
- Se dejo de mostrar en Direccion metas y KPIs inventados como si fueran reales.
- Se alineo el portal cliente con la respuesta real de `GET /reporting/reports`.
- Se agregaron pruebas del controlador de reportes.

Estado validado luego de esta segunda pasada:

- `npm run build:api`: PASS
- `npm run build:web`: PASS
- `npm run lint:api`: PASS
- `npm run lint:web`: PASS
- `npm run test:api`: PASS (`25` archivos, `102` tests)

## Tercera Pasada Global

En una iteracion posterior enfocada en seguridad de acceso y aislamiento multiempresa se corrigio:

- acceso indebido de usuarios `client` a dashboards internos, operaciones y KPIs de direccion;
- exposicion de todas las organizaciones a cualquier usuario autenticado;
- exposicion de otros clientes de la misma organizacion a usuarios portal;
- actualizacion/eliminacion de items de contenido sin verificacion de tenant.

Estado validado luego de esta tercera pasada:

- `npm run build:api`: PASS
- `npm run build:web`: PASS
- `npm run lint:api`: PASS
- `npm run lint:web`: PASS
- `npm run test:api`: PASS (`25` archivos, `102` tests)

## Cuarta Pasada Global

En una iteracion enfocada exclusivamente en despliegue cPanel/iHosting se dejo implementado:

- `.cpanel.yml` en la raiz del repo;
- `build:cpanel` para compilar `shared`, `api` y `web` en el orden correcto;
- `start:prod` en `apps/api/package.json` para consistencia operacional;
- documentacion operativa minima alineada a `Git Version Control + Passenger + public_html`;
- scripts Docker de deploy marcados como legacy para no competir con la estrategia oficial.

Estado validado luego de esta cuarta pasada:

- `npm run build:cpanel`: PASS
- `npm run build:api`: PASS
- `npm run build:web`: PASS
- `npm run lint:api`: PASS
- `npm run lint:web`: PASS

Pendiente critico para usar Git deployment de cPanel:

- limpiar el working tree del repositorio.

## Lo Que Sigue Pendiente

- Validacion con credenciales Meta reales.
- Verificacion real de suscripcion de paginas seleccionadas contra Meta.
- Prueba real de webhook `leadgen` extremo a extremo.
- Confirmacion operacional de refresh/reconexion de token en un entorno Meta vivo.
- Pruebas de conversion repetida para evitar duplicacion de cliente y CAPI logico unico.
- Mayor durabilidad para CAPI: hoy sigue siendo envio directo, no outbox persistente.
- Revision mas profunda de scoping fino en todas las pantallas del portal cliente y reporteria por cliente, mas alla de los contratos ya corregidos.

## Diferencias Relevantes Contra Documentacion Antigua

- El portal de cliente si existe en el frontend actual y sus rutas estan conectadas.
- El CRM no esta “solo mock”; hay backend real para leads/oportunidades/interacciones.
- Meta no estaba completamente roto, pero si tenia grietas reales en compilacion y boundaries de tenancy.
- El reporte anterior no adjunto omitio al menos un desajuste funcional importante: la UI de detalle de lead consumia un endpoint inexistente.
