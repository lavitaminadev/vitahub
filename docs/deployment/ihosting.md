# Deploy en iHosting (cPanel + Phusion Passenger)

ESTADO: VIGENTE
FECHA VERIFICACION: `2026-07-17`
FUENTE: estrategia oficial de despliegue para VITAHUB en iHosting

## Estrategia Oficial

La unica estrategia soportada para produccion es:

- repositorio gestionado por `Git Version Control` de cPanel;
- backend NestJS ejecutado por `Phusion Passenger`;
- frontend React/Vite compilado y publicado como estatico en `public_html`;
- despliegue automatizado por [`.cpanel.yml`](C:/Users/leno/Desktop/hubvit/.cpanel.yml);
- migraciones ejecutadas manualmente y de forma controlada.

## Requisitos

- Node.js `20.20.2` en cPanel.
- repositorio Git gestionado desde cPanel.
- `app.js` en la raiz del repo.
- `.cpanel.yml` versionado en la raiz del repo.
- `.env` productivo configurado en el servidor.
- working tree limpio antes de publicar cambios.

## Flujo Recomendado

1. Subir cambios a GitHub.
2. En cPanel, usar `Update from Remote`.
3. En cPanel, usar `Deploy HEAD Commit`.
4. cPanel ejecuta `.cpanel.yml`.
5. Passenger reinicia la API.
6. Si corresponde, correr `npm run migration:run` manualmente.

## Que Hace `.cpanel.yml`

El flujo oficial ejecuta:

1. `npm ci`
2. `npm run build:shared`
3. `npm run build:api`
4. `npm run build:web`
5. copia `apps/web/dist/` a `$HOME/public_html`
6. `touch app.js` para reiniciar Passenger

## Passenger

Configurar en cPanel:

- Application root: raiz del repositorio
- Startup file: `app.js`
- Node version: `20.20.2`

`app.js` arranca la API compilada desde `apps/api/dist/main.js`.

## Frontend

El frontend no lo sirve Passenger.

Se publica como archivos estaticos en:

```bash
$HOME/public_html
```

## Migraciones

Se ejecutan manualmente:

```bash
npm run migration:run
```

No se recomienda meter migraciones automaticamente dentro de `.cpanel.yml` hasta cerrar completamente el flujo productivo.

## Estructura Esperada

```text
/home/ACCOUNT/repositories/vitahub/
|-- .cpanel.yml
|-- app.js
|-- package.json
|-- apps/api/dist/main.js
|-- apps/web/dist/
`-- .env
```

## Notas

- Passenger no compila; solo ejecuta `app.js`.
- Si falla el arranque, primero validar que existan `apps/api/dist/main.js` y `apps/web/dist/index.html`.
- Los scripts Docker de `infrastructure/` quedan como legacy y no son la ruta oficial de produccion en iHosting.
