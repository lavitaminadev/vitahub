# Catálogo de API Interna: Módulos Reportes y Conocimiento (AI)

## API-REP-001: Dashboard Ejecutivo (Global)
- **Ruta:** `GET /reporting/dashboard`
- **Controlador:** `ReportsController` (Línea 17)
- **Propósito:** Retornar las métricas Core: Clientes Activos, Piezas Pendientes, UDs Consumidas, XP del equipo.
- **Flujo y Base de Datos:**
  - Llama masivamente a 4 Raw Queries distintas (`SELECT COUNT(*) ...`).
  - Une la data de `clients`, `pieces`, `xp_events`, `ud_budgets`.
  - Todo bajo el filtro estricto `WHERE organization_id = ?`.
- **Error Handling:** Ninguno específico. Si una query falla, arroja HTTP 500 crudo.

## API-REP-002: Reportes Detallados y Facturación (Revenue)
- **Ruta:** `GET /reporting/reports`
- **Controlador:** `ReportsController` (Línea 45)
- **Propósito:** Dashboard secundario centrado en Ingresos (Revenue).
- **Riesgo Analítico:** La consulta hace `SELECT SUM(amount) FROM billing_invoices`. Sin embargo, durante el inventario de código **NO se encontró un controlador `BillingController` ni un módulo de creación de facturas**. Esto implica que la tabla `billing_invoices` existe, pero actualmente no hay cómo llenarla de datos vivos desde el Frontend. Las métricas de este dashboard darán siempre `$0` (Falsa sensación operativa).

## API-REP-003: KPIs de Dirección
- **Ruta:** `GET /reporting/kpi`
- **Controlador:** `ReportsController` (Línea 79)
- **Propósito:** Métricas corporativas (Retención de clientes, Utilización de equipos).
- **Estado Técnico:** Funcional vía consultas directas al SQL (MySQL/Postgres compatibility).

## API-KNW-001: RAG y Knowledge Base (AI)
- **Ruta:** Módulo `knowledge` detectado en la carpeta (`apps/api/src/modules/knowledge`).
- **Estado (Incompleto/Mock):** Se encontraron Parsers (`csv.parser.ts`, `html.parser.ts`) y un `rag.service.ts` (Retrieval-Augmented Generation). 
- **Conclusión Forense:** Esto indica un intento inicial de añadir un "Asistente de Inteligencia Artificial" al sistema para que lea manuales de marca (Brand Kits). **Sin embargo**, no se detectan llamadas directas a OpenAI/Anthropic SDKs en las dependencias base documentadas ni controladores HTTP expuestos (`@Controller('knowledge')` está ausente o inactivo). Esta función se considera `DEUDA TÉCNICA FUTURE-PROOF` (Código base preparado, pero inactivo para el usuario).
