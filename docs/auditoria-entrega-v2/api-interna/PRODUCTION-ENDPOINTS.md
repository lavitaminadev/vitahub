# Catálogo de API Interna: Módulo Producción (Piezas)

## API-PROD-001: Asignar Pieza a Diseñador

### Identificación
- **ID Único:** API-PROD-001
- **Módulo:** Production
- **Ruta Completa:** `/production/:id/assign`
- **Método HTTP:** `POST`
- **Controlador:** `ProductionController`
- **Archivo:** `apps/api/src/modules/production/production.controller.ts` (Línea 58)

### Propósito
Asigna un integrante del Pod (Diseñador) a una pieza específica, marcando su estado como `ASSIGNED`.

### DTO
- **Clase:** `AssignPieceDto` (Requiere `userId` del diseñador destino).

### Multi-tenancy y Autorización
- **¿Cómo verifica?**: Exige que el `userId` provisto pertenezca a la misma `organization_id` que el usuario que hace la request.
- **Roles Permitidos:** `[ADMIN, DIRECTOR, CM]`. Un diseñador normal no puede autoasignarse piezas si no tiene permiso.

### Transacción
- **Inicio:** Inicia transacción en `AssignPieceUseCase`.
- **Operaciones:** 
  1. Bloqueo optimista del ID de la Pieza.
  2. `UPDATE pieces SET assigned_to = ?, status = 'assigned' WHERE id = ? AND organization_id = ?`.
- **Evento Emitido:** `piece.assigned`. Este evento podría gatillar un correo electrónico (NotificationService).

## API-PROD-002: Enviar Versión para Aprobación Interna

### Identificación
- **ID Único:** API-PROD-002
- **Ruta Completa:** `/production/:id/versions`
- **Método HTTP:** `POST`
- **Archivo:** `production.controller.ts` (Línea 65)

### Propósito
El diseñador sube una URL (Drive) con el diseño terminado para que su CM lo revise antes del cliente.

### Base de Datos
- **Entidades:** `PieceVersion`, `Piece`.
- **Operaciones:**
  1. `INSERT INTO piece_versions (piece_id, url, version_number) VALUES (...)`.
  2. `UPDATE pieces SET status = 'internal_review' WHERE id = ?`.

### Errores Posibles
- **HTTP 403 Forbidden:** Si el `userId` logueado intenta subir una versión a una pieza que NO tiene asignada a su nombre. (Verificado por regla de negocio).

## API-PROD-003: Rechazar Versión (Core de Correcciones)

### Identificación
- **ID Único:** API-PROD-003
- **Ruta Completa:** `/production/:id/reject`
- **Método HTTP:** `POST`
- **Archivo:** `production.controller.ts` (Línea 72)

### Flujo Interno y Lógica Matemática (Gamificación)
Esta es una de las APIs más complejas arquitectónicamente.
1. Recibe el motivo y origen (`CLIENT` o `INTERNAL_ERROR`).
2. Se inserta en tabla `corrections`.
3. El estado de la pieza retrocede a `CORRECTION`.
4. **Efecto secundario (XP):** Si el error fue marcado como `INTERNAL_ERROR`, se gatilla una penalización matemática (Ej: -5 XP) procesada asíncronamente en el módulo de Gamificación.

### Riesgos Verificados
- Esta API no presenta validación explícita (en código frontend hallado) para cobrar "Adicionales" al cliente si supera la barrera máxima de 3 correcciones. El backend contabiliza la corrección, pero el cargo automático (Billing) no está enlazado directamente, dejándolo como responsabilidad de un CRON futuro o carga manual.
