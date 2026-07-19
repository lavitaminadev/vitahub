# 38. Cambios Respecto a V1 (Control de Versiones de Auditoría)

Este documento justifica las correcciones sustanciales realizadas frente a la Auditoría V1.

### 1. Cambio en "Garantías de Multitenancy"
- **ANTES (V1):** "El aislamiento multi-tenant hace matemáticamente imposible la fuga de información."
- **DESPUÉS (V2):** "Existe aislamiento multi-tenant en la capa de aplicación. Su efectividad depende de la cobertura estricta de Guards. No hay RLS en Base de Datos, por lo que no existe garantía de imposibilidad absoluta frente a malas praxis futuras."
- **MOTIVO:** La afirmación V1 era absoluta sin respaldo de Base de Datos. Una consulta cruda mal hecha puentea el sistema actual.

### 2. Cambio en "Eventos Asíncronos y Resiliencia"
- **ANTES (V1):** "El patrón Event-Emitter empila procesos y salva el sistema ante colapsos."
- **DESPUÉS (V2):** "Se detectó uso de `EventEmitter2` síncrono en memoria. Al no existir una cola persistente (RabbitMQ/Redis), una caída repentina del servidor (OOM o Crash) destruirá los eventos pendientes de proceso."
- **MOTIVO:** V1 confundió código "asíncrono" (`async/await`) con una verdadera "cola durable".

### 3. Cambio en "Estado de QA y Pruebas"
- **ANTES (V1):** "Pruebas de Componentes Frontend / Unitarias: PARCIAL"
- **DESPUÉS (V2):** "NO IMPLEMENTADO".
- **MOTIVO:** Búsquedas exhaustivas de código (grep) demostraron que no existen archivos de pruebas funcionales ni unitarias.

### 4. Cambio en "Escalabilidad"
- **ANTES (V1):** "Escalará sin problemas asimilando 1.000 clientes."
- **DESPUÉS (V2):** "Arquitectura razonablemente elástica por estar en Node.js, pero escalabilidad estricta no cuantificable sin Benchmarks reales de estrés (K6/Artillery)."
- **MOTIVO:** No se puede garantizar tráfico sin pruebas de carga comprobables.
