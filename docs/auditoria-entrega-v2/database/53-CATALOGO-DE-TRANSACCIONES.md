# 53. Catálogo de Transacciones (ACID)

Identificación de los bloques atómicos de la aplicación (Todo o Nada).

## TRANS-001: Conversión de Lead
- **Archivo:** `convert-lead.use-case.ts`
- **Operaciones:** `UPDATE lead` + `INSERT client`.
- **Protección:** Ejecutadas dentro de un `queryRunner.startTransaction()`. Si falla el Insert, el Lead vuelve a su estado anterior gracias al `queryRunner.rollbackTransaction()`.
- **Evento Post-Transacción:** La emisión a Meta CAPI se hace **después** del `commitTransaction()`. Si la emisión a Meta falla por timeout, la base de datos local **NO** hace rollback. La Vitamina se queda con el cliente creado, pero Facebook no suma la conversión.

## TRANS-002: Asignación de Pieza
- **Archivo:** `assign-piece.use-case.ts`
- **Operaciones:** `UPDATE piece`.
- **Riesgo Detectado:** No utiliza transacciones manuales. Si dos directores intentan asignar la misma pieza a dos diseñadores diferentes exactamente en el mismo milisegundo (Race Condition), el último que impacte la DB sobrescribirá al primero. 
- **Recomendación:** Implementar bloqueo optimista (`@VersionColumn`) o forzar transacción con `Pessimistic Read/Write Lock`.
