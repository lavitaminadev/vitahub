# 46. Catálogo de Lógica de Negocio (Reglas Empresariales)

Documentación de las reglas matemáticas y de comportamiento de VITAHUB. Comprobación directa contra el código.

## REGLA-001: Límite de Correcciones (Max 3)
- **ID:** RULE-001
- **Módulo:** Producción (`PieceRulesService`)
- **Documento Maestro Decía:** "El cliente tiene máximo 3 cambios gratis, luego se cobra adicional".
- **Realidad en Código:** 
  - El sistema **sí contabiliza** las iteraciones (tabla `piece_versions`).
  - El sistema **sí marca** la iteración > 3 como "Excedida".
  - **Fallo de Implementación:** No existe un enlace automático que genere una factura (`Invoice`) en el módulo de Billing. El diseñador o CM debe avisar manualmente para el cobro.

## REGLA-002: Descuento de Unidades de Diseño (UD)
- **ID:** RULE-002
- **Módulo:** UDs y Facturación (`ud-budget.entity.ts`)
- **Documento Maestro Decía:** "Unidades estáticas valen 1.0 UD. Reels valen X UDs."
- **Realidad en Código:**
  - Existe el campo `ud_amount` en la entidad `Piece`.
  - **Limitación Técnica:** El código no calcula esto dinámicamente según duración de video, porque Dirección no ha entregado la fórmula matemática de Reels (Anotado en la Matriz de Decisiones). Hoy, el CM tiene que tippear el valor de UDs manualmente al crear la Pieza.

## REGLA-003: Gamificación y Castigos de XP
- **ID:** RULE-003
- **Módulo:** Gamificación / Producción
- **Reglas Implementadas en Eventos:**
  - `piece.delivered`: Si la entrega se hace antes de la mitad del tiempo límite de la grilla, el diseñador recibe `+50% XP`. (Verificado en Listener).
  - `piece.rejected (Internal)`: Si el CM rechaza la pieza por error de diseño, se deduce `-5 XP`. (Verificado).
- **Riesgos:** Al no haber Interfaz Gráfica (Frontend) para ver el ranking, los diseñadores están perdiendo/ganando puntos "fantasma" en la base de datos sin recibir ningún feedback psicológico o visual.
