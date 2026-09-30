# Guía de Diseño y Estándares de Interfaz: Tequio

La plataforma web Tequio está diseñada para conectar directamente a consumidores con pequeños productores agrícolas y artesanales (cafetaleros, apicultores, artesanos) de la región de Xalapa y sus alrededores[cite: 4, 7]. 

Una parte significativa de los usuarios que gestionan productos y confirman entregas corresponde a adultos mayores o personas del entorno rural no nativas digitales[cite: 7]. Asimismo, la interacción ocurre frecuentemente en espacios físicos abiertos, sobre dispositivos móviles y bajo la luz directa del sol[cite: 7]. Por ello, la accesibilidad (WCAG) y el diseño inclusivo son pilares de la arquitectura visual de Tequio[cite: 4, 7, 8].

---

## 1. Pautas de Accesibilidad (WCAG)

### 1.1 Accesibilidad Visual y Legibilidad
* **Alto contraste (WCAG 1.4.3 / AAA):** Las combinaciones de color entre texto y fondo garantizan un contraste superior a 13:1 en cuerpos principales, asegurando legibilidad inmediata bajo luz solar en exteriores[cite: 4, 7].
* **Escalabilidad de texto (WCAG 1.4.4):** El diseño respeta el tamaño preconfigurado por el usuario en su navegador o móvil sin truncar contenido ni quebrar el layout[cite: 7, 8].
* **Sin dependencia exclusiva del color:** Los estados y validaciones se acompañan de texto semántico e iconografía clara[cite: 8].

### 1.2 Accesibilidad Táctil y Física
* **Área táctil mínima (WCAG 2.5.5 - Target Size):** Todo control interactivo (botones, inputs, enlaces principales y selectores) cuenta con una dimensión mínima de `48px x 48px` para facilitar su pulsación con manos cansadas o poca precisión motriz[cite: 4, 7, 8].
* **Botones primarios amplios:** En pantallas móviles, los botones de acción principal abarcan el 100% del ancho del contenedor con alturas entre `48px` y `52px`[cite: 4, 8].

### 1.3 Accesibilidad Cognitiva y Claridad
* **Confirmación obligatoria antes de acciones definitivas:** Diálogos explícitos previos a cualquier modificación irreversible o eliminación de datos[cite: 4, 7, 8].
* **Lenguaje directo y libre de tecnicismos:** Notificaciones y etiquetas redactadas en vocabulario cotidiano, omitiendo términos internos como *endpoint*, *token* o *backend*[cite: 7, 8].
* **Flujos paso a paso:** Formularios complejos divididos en fases cortas y numeradas con indicador de progreso[cite: 7, 8].
* **Retroalimentación visual inmediata:** Notificaciones destacadas de éxito tras finalizar cada operación[cite: 7, 8].

---

## 2. Paleta Oficial "Tierra Viva"

| Nombre del Token | Código Hex | Uso Principal | Función y Accesibilidad |
| :--- | :--- | :--- | :--- |
| `--color-warm-ivory` | `#FFFDF9` | Fondo general | Evita el deslumbramiento solar del blanco puro[cite: 4, 7]. |
| `--color-surface-white` | `#FFFFFF` | Tarjetas y contenedores | Superficie limpia para destacar fotografías con sombras suaves[cite: 4, 7]. |
| `--color-espresso` | `#18110A` | Texto principal y títulos | Contraste superior a 13:1 frente a fondos claros[cite: 4, 7]. |
| `--color-ash-brown` | `#63584F` | Texto secundario y descriptores | Lectura secundaria legible sin competir visualmente[cite: 4, 7]. |
| `--color-terracotta` | `#D9481E` | Acción principal (CTA) | Color primario para botones y avances; foco interactivo[cite: 4, 7]. |
| `--color-emerald` | `#1E6F43` | Éxito, naturaleza y barras | Barras de progreso, estados de lote y confirmación[cite: 4, 7]. |
| `--color-amber-honey` | `#FFB703` | Avisos de tiempo y etiquetas | Etiquetas de fechas límite y datos clave sin denotar peligro[cite: 4, 7]. |
| `--color-border-subtle` | `#F0ECE4` | Delimitadores y bordes | Separación suave entre contenedores. |

### Cintas Culturales (Isotipo Tequio)
La identidad visual integra una cinta multicolor de 6 segmentos simétricos (`ColorBar`), inspirada en el trabajo colectivo y el tejido tradicional de la región[cite: 4, 7]:
1. Ámbar Miel (`#FFB703`)[cite: 4, 7]
2. Rosa Mexicano (`#D81B60`)[cite: 4]
3. Turquesa Esmeralda (`#00BFA5`)
4. Naranja Cálido (`#FF6D00`)
5. Terracota Vivo (`#D9481E`)[cite: 4, 7]
6. Verde Bosque (`#1E6F43`)[cite: 4, 7]

---

## 3. Tipografía Oficial

* **Fuente oficial:** `Plus Jakarta Sans` (importada globalmente vía Google Fonts en `index.html`)[cite: 4, 7].
* **Regla de herencia:** Todos los controles nativos (`button`, `input`, `textarea`, `select`) deben heredar la tipografía mediante `font-family: inherit` desde `src/index.css`.

### Escala Tipográfica
* **Títulos Principales (H1):** `32px` (escritorio) / `26px` (móvil) — ExtraBold 800[cite: 4, 7].
* **Subtítulos y Encabezados de Tarjetas (H2):** `22px` (escritorio) / `20px` (móvil) — Bold 700[cite: 4, 7].
* **Encabezados de Sección (H3):** `18px` — Bold 700[cite: 4, 7].
* **Cuerpo de Texto y Párrafos:** `16px` base (en móvil `17px` para confort de lectura) — Regular 400 o Medium 500[cite: 4, 7].
* **Textos en Botones y Enlaces:** Bold 700[cite: 4, 7].
* **Textos Pequeños / Badges:** `14px` (límite inferior accesible)[cite: 4].

---

## 4. Estándares Responsivos y Breakpoints

Para mantener consistencia en toda la plataforma y evitar desbordes en dispositivos móviles, se define un único punto de quiebre estructural entre la visualización en celular y pantallas mayores:

| Dispositivo / Pantalla | Rango de Ancho | Comportamiento del Layout |
| :--- | :--- | :--- |
| **Móvil (Smartphones)** | `< 768px` | 1 columna vertical fluida, drawer de navegación, botones al 100% de ancho[cite: 4, 5]. |
| **Tablet / Laptop compacta** | `768px – 1023px` | Grillas adaptables de 2 columnas, menús de navegación visibles. |
| **Escritorio (Desktop)** | `≥ 1024px` | Navegación horizontal completa, catálogos en 3 o 4 columnas[cite: 4, 5]. |

---

### 4.1 Reglas Generales de Maquetación
1. **Contenedor elástico (`pageContainer`):** Toda vista debe envolverse en un contenedor central con ancho máximo de `1200px` (`--container-max-width`), centrado con `margin: 0 auto`, y padding horizontal de `1rem` (16px) en celular y `1.5rem` (24px) en pantallas medianas y grandes[cite: 5].
2. **Cero anchos fijos horizontales:** Prohibido el uso de `width: [px]` estáticos en elementos contenedores o tarjetas. Utilizar siempre `width: 100%` restringido por `max-width`[cite: 5].
3. **Flujo táctil prioritario (Mobile-First):** Asumir primero el espacio vertical de pantallas de 360px a 390px, permitiendo desplazamiento natural con el pulgar[cite: 5].
4. **Contención de medios:** Toda imagen o gráfico debe incluir `max-width: 100%`, `height: auto` y `display: block` para prevenir desbordes de caja.

---

### 4.2 Estándar para Componentes con Tamaños Dinámicos

#### Botones de Acción (`Button`)
* **En celular (`< 768px`):** Ocupan el 100% del ancho del contenedor (`fullWidth`) con una altura táctil de `48px` a `52px` (`--button-height-large`) para facilitar pulsaciones cómodas en exteriores[cite: 4, 5].
* **En escritorio (`≥ 768px`):** Se adaptan al tamaño de su contenido (`width: auto`) con un ancho mínimo recomendado de `160px` a `180px`, alineados a la derecha o al centro según el flujo del formulario.

#### Campos de Entrada de Datos (`InputField`)
* Ocupan siempre el `100%` del ancho de su contenedor padre (`width: 100%`) con altura mínima de `48px` (`--target-size-min`)[cite: 5].
* **En celular:** Apilamiento estrictamente vertical (1 campo por renglón)[cite: 4, 5].
* **En escritorio:** Dos campos relacionados pueden distribuirse en una grilla de 2 columnas paralelas (`grid-template-columns: 1fr 1fr`) separadas por un espacio de `1rem` a `1.5rem`.

#### Tarjetas y Módulos de Contenido (`Card` / `AuthCard`)
* Ancho elástico restringido: `width: 100%; max-width: 440px; margin: 0 auto;` para formularios centrados (como Login y Registro).
* Grillas de productos o lotes: 1 columna en móvil, 2 columnas en tablet (`≥ 768px`) y 3 columnas en escritorio (`≥ 1024px`)[cite: 5].

#### Elementos Circulares y Multimedia (`Avatar`, Íconos)
* El componente interno se dimensiona al 100% de su envoltorio con `object-fit: cover` o `contain`.
* El tamaño del contenedor se define según la zona: `38px` en Navbar, `48px` en listas o comentarios, y `80px` a `96px` en la vista de perfil.