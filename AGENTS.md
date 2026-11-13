# AGENTS.md - FRONTEND (React & TypeScript)
# Proyecto: Tequio

## 1. ARQUITECTURA Y CAPAS (REGLA CRÍTICA)
- **Separación Total:** El código frontend es exclusivamente para la capa de presentación.
- **PROHIBICIÓN ABSOLUTA:** Queda estrictamente prohibido incluir lógica de negocio compleja en el frontend. Toda regla de negocio debe ser procesada por el Backend.
- **Estructura:** Usa marcado HTML semántico accesible y garantiza un diseño responsivo fluido.

## 2. BILINGÜISMO ESTRATÉGICO
- **Código Fuente (Inglés):** Nombres de componentes, hooks, funciones, variables, tipos e interfaces deben redactarse 100% en inglés.
- **Interfaz de Usuario (Español):** Todo el texto visible (botones, modales, etiquetas, alertas tipo Toast) debe redactarse en español claro, adaptado a productores locales (sin tecnicismos).

## 3. ESTÁNDARES DE REACT Y TYPESCRIPT
- **Formato de Llaves:** Uso estricto de 1TBS (la llave de apertura va en la misma línea que la declaración).
- **Interfaces y Tipos:** Redactados en `PascalCase`. PROHIBICIÓN ABSOLUTA de usar el prefijo "I" para las interfaces en TypeScript.
- **Consumo de API:** Todas las llamadas a la API deben estar envueltas obligatoriamente en bloques `try-catch` y utilizar `async/await`.
- **Nomenclatura:** Componentes en `PascalCase`, funciones/hooks en `camelCase`. Variables del DOM explícitas (ej. `submitButton`, nunca `btn`). Constantes globales en `UPPER_SNAKE_CASE`.
- **Formato Adicional:** Indentación de 2 espacios. Preferencia por arrow functions. Documentación con JSDoc (`/**...*/`). Prohibido exponer errores nativos en la UI; usar Toasts.

## 4. UI/UX Y ACCESIBILIDAD
- **Paleta de Colores:** Fondo `#FFFDF9`, Contenedores `#FFFFFF`, Texto `#18110A`, Botón Primario `#D9481E`, Confirmaciones `#1E6F43`, Alertas `#FFB703`.
- **Tipografía:** Usar *Plus Jakarta Sans* (Bold 700/800 para títulos, Regular 400/500 para cuerpo, min 16px).
- **Interacción:** Implementar confirmaciones explícitas (Modales) para acciones destructivas/definitivas.
- **Accesibilidad (A11y):** Obligatorio implementar y documentar uso de atributos ARIA y navegación completa por teclado (Tab).

## 5. PRUEBAS UNITARIAS
- **Framework:** Uso obligatorio de Jest y React Testing Library.
- **Estructura:** Los bloques `describe` e `it` deben redactarse como oraciones fluidas en inglés.

## 6. CONTROL DE VERSIONES (GIT)
- Todos los commits generados desde la terminal deben seguir Conventional Commits.
- Prefijos obligatorios: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `style:`, `perf:`, `chore:`, `ci:`.
- La descripción corta (max 50 caracteres) debe estar en inglés y modo imperativo (ej. "feat(ui): implement Mapbox marker for delivery points").