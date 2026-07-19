# Catálogo de API Interna: Módulo CRM (Leads)

## API-CRM-001: Crear Nuevo Lead (Post)

### Identificación
- **ID Único:** API-CRM-001
- **Módulo:** CRM / Leads
- **Ruta Completa:** `/leads`
- **Método HTTP:** `POST`
- **Controlador:** `LeadsController`
- **Método:** `createLead`
- **Archivo:** `apps/api/src/modules/crm/leads/lead.controller.ts` (Línea 26)

### Propósito
Permitir la creación manual de prospectos desde el Frontend (Ej: por un vendedor), saltándose el webhook automático de Meta.

### Entrada
- **Body:** JSON. Requiere nombre, email/teléfono y origen.
- **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`.

### DTO (Data Transfer Object)
- **Clase:** `CreateLeadDto` (Inferido por estándar REST, a verificar su existencia en `/dto`).
- **Validaciones:** Se asume uso de `class-validator` (IsString, IsEmail, IsOptional).

### Autenticación y Autorización
- **¿Requiere Autenticación?:** SÍ (Global Guard de JWT).
- **Mecanismo:** Token JWT en cabecera HTTP.
- **Roles Permitidos:** `[ADMIN, DIRECTOR, SELLER]`.

### Multi-tenancy
- **¿Cómo obtiene organization_id?:** Del JWT decodificado en la request a través del `TenantFilter`.
- **¿Puede llegar organization_id desde el usuario?:** NO. Se ignora si viene en el Body.
- **¿Existe Bypass (SkipTenancy)?:** NO.

### Flujo Interno Secuencial
1. Request entra a `LeadsController.createLead()`.
2. Llama a `LeadsService.create()` (Inyectado).
3. `TypeORM Repository.save()` inserta la fila agregando el `organization_id` automático del Request Context.
4. Respuesta devuelta con el Entity serializado.

### Base de Datos
- **Entidades:** `Lead`.
- **Operación:** `INSERT INTO leads (name, email, phone, organization_id) VALUES (...)`.
- **Transacción Explicita:** No detectada en la creación simple.

### Eventos
- No emite eventos asíncronos en la creación simple (Solo en la conversión).

### Respuesta y Errores
- **Respuesta de Éxito:** `HTTP 201 Created`. Retorna el objeto `Lead` con UUID generado.
- **ERR-CRM-001:** `HTTP 400 Bad Request` - Validation failed (Falta email o teléfono).

---

## API-CRM-002: Listar Leads Kanban (Get)

### Identificación
- **ID Único:** API-CRM-002
- **Ruta Completa:** `/leads`
- **Método HTTP:** `GET`
- **Controlador:** `LeadsController` (Línea 33)

### Propósito
Obtener todos los leads de la organización activa, filtrados por estado, para pintar la vista Kanban del CRM.

### Entrada
- **Query Params:** `?status=new`, `?assignedTo=uuid`.

### Base de Datos (Seguridad de Riesgo Medio)
- **Operación:** `SELECT * FROM leads WHERE organization_id = ? AND status = ?`.
- **Potencial N+1:** Si la query carga la relación de "Usuario Asignado" mediante Left Join automático, TypeORM lo maneja. Si el servicio itera, hay N+1.
- **Tenant Filter:** Absoluto. Impuesto a nivel de Repositorio.

---

## API-CRM-003: Convertir Lead a Cliente (Post Action)

### Identificación
- **ID Único:** API-CRM-003
- **Ruta Completa:** `/leads/:id/convert`
- **Método HTTP:** `POST`
- **Archivo:** `lead.controller.ts` (Línea 46)

### Propósito
Acción crítica de negocio. Mueve un lead a etapa "Ganado" y crea automáticamente su entidad "Client" (Facturación).

### Flujo Interno (Crítico)
1. Controller -> `ConvertLeadUseCase.execute(id, orgId)`.
2. **Transacción TypeORM iniciada.**
3. `UPDATE leads SET status = 'won'`.
4. `INSERT INTO clients (name, email, ... )`.
5. Si falla DB -> `ROLLBACK`.
6. Si éxito DB -> `COMMIT`.
7. **Emisión de Evento:** `eventEmitter.emit('lead.converted', { leadId, clientId })`.
8. *Nota: Este evento viaja a `MetaService` para ser mandado a Facebook.*

### Errores Documentados
- **ERR-CRM-CONV-01:** `HTTP 404 Not Found` (Lead no existe o pertenece a otro Tenant).
- **ERR-CRM-CONV-02:** `HTTP 409 Conflict` (Lead ya estaba convertido).

### Efectos Secundarios y Riesgos
- **Riesgo Comprobable:** Como se mapeó en la auditoría general, el evento `lead.converted` viaja por memoria. Si el pod de Node se reinicia tras el Commit de base de datos (paso 6) y antes de la emisión (Paso 7), Facebook jamás se enterará de la conversión, arruinando el CAPI. No existe mecanismo de Reintento (`Retry`) en memoria.
