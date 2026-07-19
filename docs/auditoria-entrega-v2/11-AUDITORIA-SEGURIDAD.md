# 11. Auditoría de Seguridad (V2)

Análisis riguroso de las vulnerabilidades y protecciones reales implementadas en la plataforma.

## 1. Riesgo de Autenticación y JWT (JSON Web Tokens)
- **Evidencia:** El acceso a los endpoints (Ej: `@UseGuards(AuthGuard('jwt'))`) se gestiona mediante tokens JWT.
- **Control Técnico Existente:** Las rutas exigen portar un Token válido firmado criptográficamente.
- **Limitación (Requiere Revisión):** Si el Frontend guarda este Token en `localStorage` (memoria del navegador) en vez de usar "Cookies HttpOnly", el sistema queda estructuralmente vulnerable a ataques XSS (robo de sesiones mediante scripts maliciosos). *Nota: No se pudo verificar la implementación del almacenamiento del frontend al faltar el código visual de login.*

## 2. Prevención de Inyección SQL (SQLi)
- **Evidencia:** Uso de TypeORM.
- **Control Técnico Existente:** TypeORM parametriza automáticamente los valores ingresados por usuarios en los repositorios estándar, mitigando la inyección.
- **Vulnerabilidad Detectada (Riesgo P2):** En `reports.controller.ts` se abusa del método `dataSource.query("SELECT ...")`. Aunque se intentó parametrizar usando marcadores `[orgId]`, dejar consultas SQL expuestas (Hardcoded) en los controladores eleva exponencialmente el riesgo de que futuras modificaciones introduzcan brechas graves. 

## 3. Autorización (Roles Guard)
- **Evidencia:** Uso del decorador `@Roles()` y validadores de NestJS.
- **Control Técnico Existente:** El backend rechaza peticiones (HTTP 403) si el ID de usuario no coincide con el enumerador de permisos requeridos para la acción.
- **Protección Validada:** Esto previene ataques BOLA (Broken Object Level Authorization), impidiendo que un "Diseñador" promueva su propia cuenta a "Administrador" mediante llamadas API maliciosas.

## 4. XSS (Cross Site Scripting)
- **Evidencia:** Frontend en React.
- **Control Técnico Existente:** React sanitiza por defecto las cadenas inyectadas en el DOM (texto plano). 
- **Verificación Adicional:** Una búsqueda estricta no reveló el uso del atributo riesgoso `dangerouslySetInnerHTML` en los módulos principales, reduciendo significativamente la posibilidad de inyecciones de código en la UI por parte de usuarios malintencionados.

### Conclusión de Seguridad
El sistema NO posee "Seguridad de Grado Bancario", ya que carece de defensas en profundidad (RLS, Cookies Seguras obligatorias). No obstante, los controles presentes son técnicamente correctos y adecuados para una versión productiva temprana (Beta), siempre y cuando se parchee urgentemente el uso de Raw Queries en el módulo de Reportes.
