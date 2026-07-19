# Catálogo de API Interna: Módulos Operaciones y Documentos

## API-OPS-001: Visión General de Pods (Equipos)
- **Ruta:** `GET /operations/overview`
- **Controlador:** `OperationsController`
- **Propósito:** Nutrir la pantalla de gestión donde los directores ven qué equipo (Pod) está saturado.
- **Base de Datos (Crítico):** 
  - Se ejecuta a través de `get-operations-overview.use-case.ts`.
  - **Usa RAW QUERIES:** `dataSource.query("SELECT ... FROM pods")`.
  - Esta consulta incluye lógica matemática de `current_load * 100 / capacity`.
  - **Riesgo de Inyección:** Mitigado por el paso de parámetros seguros `[orgId]`. 

## API-UPL-001: Subir Archivo (Presigned URL o Base64)
- **Ruta:** `POST /uploads`
- **Controlador:** `UploadsController`
- **Propósito:** Módulo transversal para adjuntar briefs o comprobantes.
- **Entrada:** `multipart/form-data` o JSON.
- **Limitaciones (Deuda de Infraestructura):** El código original parece preparar la subida local. Para SaaS multi-tenant se requiere forzosamente integración con Amazon S3 (`@aws-sdk/client-s3`) para evitar que el disco del servidor Node.js se llene y colapse (OOM / Disk Full).

## API-UPL-002: Borrar Archivo
- **Ruta:** `DELETE /uploads/:id`
- **Controlador:** `UploadsController`
- **Propósito:** Eliminar archivos huérfanos.
- **Tenancy:** Debe comprobar que el `Upload` pertenece al `organization_id` del solicitante.
