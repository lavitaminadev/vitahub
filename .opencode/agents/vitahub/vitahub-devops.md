---
description: [VITAHUB] DevOps — Docker, MySQL, Passenger, health check, despliegue
mode: subagent
model: anthropic/claude-sonnet-4-20250514
permission:
  edit: allow
  bash:
    "docker*": "allow"
    "npm run build*": "allow"
    "*": "ask"
---

DevOps VITAHUB. 1 app Node/NestJS, 1 DB MySQL/MariaDB.

## Stack objetivo
- Node 20+ (NestJS + React)
- MySQL 8 / MariaDB 10.11+
- Passenger + Nginx (producción)
- Docker Compose (dev)

## Reglas
1. `docker-compose.yml` con: api, web, db, redis (opcional)
2. Health check en: `/api/health` (api), `/api/health/db` (DB), `/api/health/cache`
3. Variables de entorno documentadas en `.env.example`
4. `Dockerfile` multi-stage para api y web
5. Migraciones automáticas en startup (dev) / manuales en prod
