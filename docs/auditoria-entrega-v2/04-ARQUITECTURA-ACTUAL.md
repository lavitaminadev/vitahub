# 04. Arquitectura Actual del Sistema (V2)

Revisión exhaustiva de los patrones de diseño y la topología implementada en el código fuente.

## Stack Tecnológico Confirmado
- **Backend:** Node.js bajo el framework NestJS (Patrón MVC Modular).
- **Frontend:** React (Vite) en arquitectura SPA (Single Page Application).
- **ORM:** TypeORM conectando con base de datos SQL relacional.
- **Aislamiento:** Arquitectura Multi-Tenant Lógica (Separación por columna, esquema compartido).

## Análisis de Decisiones Arquitectónicas

### 1. Inyección de Dependencias (Dependency Injection)
- **Estado:** `IMPLEMENTADO Y VERIFICADO`.
- **Análisis:** El uso exhaustivo del sistema IoC (Inversion of Control) de NestJS permite que el código esté altamente desacoplado. Los controladores solo rutean peticiones y los casos de uso (Ej: `convert-lead.use-case.ts`) orquestan la lógica. Esta es una decisión arquitectónica excelente.

### 2. Eventos Internos (El Problema de EventEmitter2)
- **Estado:** `IMPLEMENTADO CON RIESGO ARQUITECTÓNICO`.
- **Análisis:** Para separar el CRM de las integraciones con Meta, el sistema emite eventos. 
- **Problema Crítico:** Se comprobó que `EventEmitter2` opera estrictamente en memoria local. No existe un intermediario persistente.
- **Consecuencia Operativa:** Si se aprueba un Lead, el código emite un evento para enviar la respuesta a Facebook. Si el servidor sufre un corte de energía 1 milisegundo después, el evento se desvanece de la RAM. **Se debe migrar urgentemente a un sistema de Colas (Message Queue) como BullMQ con Redis.**

### 3. Aislamiento Lógico Multi-Tenant
- **Estado:** `IMPLEMENTADO A NIVEL APLICACIÓN (SIN GARANTÍAS RLS)`.
- **Análisis:** El `TenancyInterceptor` intercepta todas las llamadas y añade un filtro obligatorio por `organization_id` a nivel de TypeORM. 
- **Riesgo Residual:** Al no existir seguridad a nivel de motor de BD (Row Level Security), la seguridad es frágil frente a errores humanos. Si un programador hace una consulta SQL manual (como se detectó en `reports.controller.ts`), podría saltarse el interceptor, provocando que la Agencia A vea datos de la Agencia B.

## Escalabilidad Teórica vs Demostrada
La arquitectura separada de APIs REST permite alojar los servidores en múltiples contenedores (Docker / Kubernetes), sugiriendo una alta capacidad de escalamiento horizontal. **Sin embargo, no existen archivos de pruebas de estrés (K6, Artillery) ni benchmarking en el repositorio, por lo que afirmar que el sistema "soporta alto tráfico" carece de evidencia empírica.**
