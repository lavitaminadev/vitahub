# 39. Limitaciones de esta Auditoría (Alcance y Exclusiones)

Como peritaje forense serio, declaramos explícitamente lo que **NO** pudo verificarse durante este proceso, limitando cualquier garantía absoluta.

## 1. Limitaciones de Entornos y Despliegue (Infraestructura)
- **Ambiente de Producción:** El código analizado reside en entornos locales de desarrollo (`c:\Users\leno\Desktop\hubvit`). No se auditó la infraestructura de red viva, DNS, reglas de Firewall (WAF) ni configuraciones finales de hosting (AWS/Render).
- **Secretos:** Se verificó que el código invoca variables de entorno (`process.env.META_WEBHOOK_VERIFY_TOKEN`), pero no se pudo auditar el gestor de secretos de producción (vault) para confirmar si las claves almacenadas son robustas o vulnerables.
- **Backups (Continuidad):** No se pudo verificar la activación de políticas de retención de Snapshot en la base de datos viva.

## 2. Limitaciones de Dependencias Externas (Terceros)
- **App Review de Meta:** Se confirma que la arquitectura `MetaController` está implementada bajo estándares REST. **PERO**, no se puede asegurar que Facebook aprobará la aplicación en su proceso manual de revisión (Burocracia).
- **Google Drive / Integraciones:** Se auditaron las interfaces del sistema, pero el funcionamiento orgánico del guardado externo depende 100% de la disponibilidad de la API de Google, no imputable a VITAHUB.

## 3. Limitaciones Funcionales
- Se verificó la capa de backend en profundidad (Controllers, UseCases, Interceptors, TypeORM).
- La revisión de componentes React (`apps/web`) en el Frontend no ejecutó pruebas de visualización (Testing Visual), limitándose al contraste estático de rutas y lógicas.
