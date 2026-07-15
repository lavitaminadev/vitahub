# Guía de Desarrollo - VITAHUB

## Prerrequisitos

- **Node.js** `20.20.2` (ver `.nvmrc`)
- **MySQL** `8.0`
- **Redis** `7.x` (opcional, para caché)
- **npm** `>=9`

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-org/hubvit.git
cd hubvit

# 2. Usar versión correcta de Node
nvm use

# 3. Instalar dependencias
npm install
cd apps/api && npm install && cd ../..

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores locales
```

## Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Entorno |
| `PORT` | `3000` | Puerto del API |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen permitido CORS |
| `DB_HOST` | `localhost` | Host MySQL |
| `DB_PORT` | `3306` | Puerto MySQL |
| `DB_USERNAME` | `vitahub` | Usuario MySQL |
| `DB_PASSWORD` | `vitahub_secret` | Contraseña MySQL |
| `DB_DATABASE` | `vitahub` | Nombre BD |
| `REDIS_HOST` | `localhost` | Host Redis |
| `REDIS_PORT` | `6379` | Puerto Redis |
| `JWT_SECRET` | `vitahub_jwt_secret...` | Secreto JWT |
| `JWT_EXPIRES_IN` | `7d` | Expiración JWT |
| `STORAGE_DRIVER` | `local` | Driver de archivos |
| `STORAGE_PATH` | `./storage` | Ruta de almacenamiento |
| `AI_PROVIDER` | `openai` | Proveedor IA |
| `AI_API_KEY` | - | API Key IA |
| `AI_MODEL` | `gpt-4` | Modelo IA |

## Ejecutar la API

```bash
# Development (hot reload)
cd apps/api
npm run start:dev

# Producción
npm run build
npm run start
```

## Ejecutar el Frontend (Web)

```bash
cd apps/web
npm run dev
```

## Ejecutar Tests

```bash
# Tests de la API
cd apps/api
npm run test

# Tests desde la raíz
npm run test:api
```

## Migraciones

```bash
# Development: las entidades se sincronizan automáticamente
# (synchronize: true en development)

# Producción: ejecutar migraciones
cd apps/api
npx typeorm migration:run -d dist/infrastructure/database-data-source.js
```

## Linting

```bash
cd apps/api
npm run lint

# Desde raíz
npm run lint:api
```

## Docker Setup

```bash
# Iniciar servicios (MySQL + Redis)
cd infrastructure
docker-compose up -d mysql redis

# Iniciar todo (API + Web + BD + Redis)
docker-compose up -d
```

## Scripts Disponibles (raíz)

| Comando | Descripción |
|---------|-------------|
| `npm run dev:api` | Iniciar API en desarrollo |
| `npm run dev:web` | Iniciar Web en desarrollo |
| `npm run build:api` | Compilar API |
| `npm run build:web` | Compilar Web |
| `npm run lint:api` | Lint API |
| `npm run test:api` | Tests API |

## Estructura de Commits

```
feat: descripción del cambio
fix: descripción del bug
chore: tareas de mantenimiento
docs: cambios en documentación
refactor: refactorización de código
```
