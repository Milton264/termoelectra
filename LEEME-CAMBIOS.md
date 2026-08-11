# Termoelectra — auditoría y correcciones

Fecha: 11 de agosto de 2026

Todos los cambios están verificados: 79 capturas deterministas comparadas contra la
versión anterior con **0,0000 % de desviación** en la maquetación, y 0 errores de
JavaScript en las tres páginas servidas por HTTP.

---


## Peso transferido (medido con Chromium, no estimado)

| Página | Antes (móvil) | Después (móvil) | Cambio |
|---|---|---|---|
| Home | 0,93 MB | 0,38 MB | **−59 %** |
| Refrigeración | 3,05 MB | 1,14 MB | **−63 %** |
| Climatización | 1,62 MB | 0,57 MB | **−65 %** |
| Refrigeración (escritorio) | 3,05 MB | 1,50 MB | **−51 %** |

Incluye los 47 KB de la tipografía Inter, que antes no se descargaba.

---

## Qué se corrigió

### Captación de contactos
- El formulario dependía de `window.open()`. Si el navegador bloqueaba la ventana
  emergente, el contacto se perdía **sin que nadie se enterase**. Ahora se detecta el
  bloqueo y se navega en la misma pestaña.
- Validación de teléfono y mensajes de estado visibles con `aria-live` (antes eran
  `alert()` del navegador).
- Lógica extraída a `assets/te-contact.js`, compartida por las tres páginas.

### Cumplimiento legal (era el bloqueante)
- `legal/aviso-legal.html` — LSSI-CE art. 10
- `legal/privacidad.html` — RGPD: finalidad, base jurídica, plazos, destinatarios,
  derechos y reclamación ante la AEPD
- `legal/cookies.html` — el sitio **no usa ninguna cookie ni analítica**, así que la
  política lo declara con verdad y **no hace falta banner de cookies**
- Casilla de consentimiento obligatoria en los tres formularios
- Los enlaces legales del pie eran `href="#"` (en refrigeración, ni siquiera enlaces)

### SEO
- `og:image` 1200×630 propia por página (antes no había ninguna, con
  `twitter:card=summary_large_image` declarado: la tarjeta al compartir salía vacía)
- Canonical con barra final coincidiendo con la URL real, y los enlaces internos
  apuntando a esa misma URL (antes canonical decía `/refrigeracion` y los enlaces
  `/refrigeracion/index.html`: dos URLs para Google)
- Un solo `@graph` por página con `@id` enlazados. Refrigeración tenía
  `ProfessionalService` + `HVACBusiness` como dos entidades sueltas
- Breadcrumbs en las páginas interiores
- Refrigeración recuperó `og:url`, `og:locale`, `og:site_name`, `theme-color` y
  `twitter:card`; fuera la `meta keywords`
- `robots.txt`, `sitemap.xml`, `site.webmanifest` y favicon completo

### Rendimiento
- 8,22 MB de archivos muertos eliminados (JPG originales sin referenciar, un `.webp~`
  de copia de seguridad del editor, cuatro `Prueba.txt`)
- **54 imágenes con `srcset` + `sizes`**. Los `sizes` no son estimados: se midió con
  Chromium el ancho de render real de cada imagen a 1440 px y a 390 px. Ejemplo:
  `archivo-condensadores-cubierta.webp` pesaba 1600 px y se mostraba a 166 px en móvil
- 124 variantes generadas (400/640/960/1280 px)
- Hero de refrigeración (elemento LCP): variante móvil de 960 px, 113 KB → 57 KB, con
  `preload` condicionado por media query
- Tipografía Inter autoalojada (48 KB, variable, pesos 100–900). Antes se declaraba
  `font-family: Inter` sin cargarla en ningún sitio: **el sitio se veía en Segoe UI**.
  Al servirla desde el propio dominio tampoco se comunica la IP del visitante a Google
- **849 reglas CSS muertas eliminadas.** Verificación definitiva: cada uno de los 565
  selectores retirados se comprobó contra el DOM real en el navegador (tras scroll, menú
  abierto y estados aplicados por JS) y **ninguno coincide con un solo elemento**

### Corrección de errores
- Doble `<!DOCTYPE html>` en las tres páginas
- `© 2025` en refrigeración (las otras decían 2026)
- Teléfono en dos formatos (`tel:651097393` y `tel:+34651097393`) → unificado
- `getElementById(...).addEventListener` sin guard en refrigeración: si faltaba un id,
  reventaba el bloque entero de JS
- El lightbox tomaba `currentSrc`, que con `srcset` habría abierto la miniatura en
  lugar del original. Ahora usa `data-lb`
- Falta el `skip-link` en refrigeración (las otras dos sí lo tenían)
- Logos duplicados unificados en `assets/`
- Contraste del texto de consentimiento: en la home heredaba el navy del cuerpo sobre
  una tarjeta navy (1,53:1, ilegible). Corregido a 7,42:1 en las tres páginas, medido
  sobre píxeles reales, no sobre estilos computados

---

## Lo que NO se tocó, y por qué

**Los ~1.500 `!important` y el CSS repetido entre páginas.**

Se buscaron bloques `<style>` idénticos entre las tres páginas para extraerlos a un
archivo externo compartido: **no hay ninguno**. Lo repetido está a nivel de regla
suelta, entrelazado con los overrides de cada ronda de feedback. Mover esas reglas a
una hoja externa cambia el orden de cascada, y con esa cantidad de `!important` el
resultado no es predecible sin rehacer la arquitectura de estilos.

Es una refactorización real, no un ajuste. La ganancia sería caché entre páginas
(~30-40 KB en la segunda visita); el riesgo es romper una maquetación ya aprobada por
el cliente. Se deja documentado como partida aparte.

---

## Notas de despliegue

- El sitio usa **URLs de directorio** (`/refrigeracion/`). Para verlo en local hace
  falta un servidor, no abrir el archivo directamente:
  `python3 -m http.server 8000`
- El `preload` de la tipografía lleva `crossorigin` (obligatorio para fuentes). Bajo
  `file://` da error en consola; sobre HTTP funciona correctamente.
- Conviene servir con compresión gzip/brotli activada.


---

## Ronda 2 — consentimiento y animaciones

### Consentimiento reubicado

Estaba entre el campo Teléfono y el botón, ocupando tres líneas y empujando el CTA.
En escritorio se metía además como tercera columna estrujada junto a los campos.

Ahora es una nota compacta **debajo del botón**, con casilla propia (la nativa
desentonaba), marca que se dibuja al activarse y foco visible. En escritorio los campos
y el botón quedan en una sola línea.

Cambió también el orden del DOM, no solo el visual: el orden de foco coincide con el de
lectura (WCAG 2.4.3). Si se envía sin marcar, el foco salta a la casilla y la fila avisa
con un movimiento breve, desactivado bajo `prefers-reduced-motion`.

Contraste medido sobre píxeles reales: **7,52:1** en las tres páginas.

Sigue siendo casilla obligatoria y desmarcada por defecto, que es lo que exige la AEPD:
el consentimiento debe ser un acto afirmativo. No se puede sustituir por un
"al enviar aceptas".

### Animaciones y transiciones

Cambios de *cómo* se anima, nunca de dónde acaba nada. Verificado: **0,0000 % de
desviación de maquetación en 79 capturas**.

1. **Barra de progreso**: animaba `width`, que fuerza layout en cada fotograma. Pasa a
   `transform: scaleX()`. Donde el navegador soporta `animation-timeline: scroll()` la
   mueve el compositor sin pasar por JavaScript (verificado: `scaleX = 1.0` exacto al
   final del documento, movida por un `ScrollTimeline`).
2. **4 escuchadores de scroll sin amortiguar** envueltos en `requestAnimationFrame`.
3. **169 transiciones** pasan del `ease` genérico del navegador a la curva que el
   proyecto ya usaba en 15 sitios, `cubic-bezier(.2,.7,.2,1)`. Es consistencia: antes
   convivían dos criterios de aceleración distintos en la misma página.

Resultado (mediana de 3 pasadas, CPU x4, móvil 390 px):

| Página | operaciones de layout | CPU |
|---|---|---|
| Home | 96 → 44 | 2,47 s → 2,16 s |
| Refrigeración | 55 → 61 | 2,78 s → 2,37 s |
| Climatización | 54 → 50 | 1,92 s → 1,85 s |

### El techo, y por qué no lo cruzo

Desglose del coste durante el scroll:

| Página | script | recálculo de estilo | layout | total |
|---|---|---|---|---|
| Home | 0,08 s | 0,23 s | 0,02 s | 2,00 s |
| Refrigeración | 0,10 s | 0,47 s | 0,08 s | 3,62 s |
| Climatización | 0,03 s | 0,34 s | 0,01 s | 2,06 s |

El grueso no es JavaScript ni layout: es pintado y composición de **60–75 animaciones
scroll-driven simultáneas** por página. Es el precio del diseño actual.

Dos optimizaciones habituales descartadas a propósito:

- `contain: paint` en los contenedores animados: en este proyecto ya está comprobado que
  recortar el contexto de pintado **congela `animation-timeline: view()`** (el bug del
  `overflow:hidden`). No se toca.
- `content-visibility: auto`: provoca saltos de scroll y desactiva las animaciones de
  bloques aún no pintados.

Bajar de ahí exige reducir el número de elementos animados a la vez: decisión de diseño
con el cliente, no ajuste técnico.

---

## Correcciones sobre la ronda 1

Dos fallos propios detectados al revisar, ya corregidos en este paquete:

1. **La purga de CSS solo cubría un tercio del proyecto.** El patrón buscaba `<style>`
   pero 20 de los 30 bloques son `<style id="...">`. Rehecha sobre todos: de 761 a
   **849 reglas** eliminadas.
2. **La verificación tenía un punto ciego.** Usaba `prefers-reduced-motion`, que
   desactiva justo las animaciones scroll-driven, así que no habría detectado un daño en
   ellas. Añadida verificación de selectores contra el DOM real y recuento de
   `animation-timeline` (14/14/16, idéntico al original) y de `@keyframes` (26/42/37,
   idéntico). En esa segunda pasada apareció una regresión real: el `id="scrollProgress"`
   lo crea el JS en tiempo de ejecución, así que la barra de progreso se había quedado
   sin estilo en dos páginas. Corregido añadiendo los ids dinámicos al detector.


---

## Ronda 3 — dos fallos graves corregidos

### 1. La navegación estaba rota al abrir el sitio con doble clic

Cambié los enlaces internos a URLs limpias (`refrigeracion/`) para que coincidieran con
el canonical. En un servidor es lo correcto. Pero al abrir `index.html` directamente
desde el disco, el navegador no resuelve el índice de la carpeta: **el menú llevaba a una
página en blanco.**

Corregido sin renunciar a las URLs limpias: se mantienen tal cual, y un script de tres
líneas las reescribe **solo cuando el protocolo es `file:`**. En el servidor no se
ejecuta nada.

### 2. En Safari y Firefox no funcionaba NINGÚN efecto de scroll

Todo el sistema de movimiento del sitio se apoya en `animation-timeline: view()`, que
solo existe en Chrome y Edge. Medido: de los 75 efectos de la home, en Safari o Firefox
se ejecutaban **cero**. La página se veía entera pero completamente estática.

Esto venía del diseño original, no lo introduje yo — pero lo di por bueno en la primera
auditoría porque comprobé todo en un motor Chromium. Es un fallo de método por mi parte.

Añadido `assets/te-scroll-fallback.js`: detecta la falta de soporte y reproduce los
mismos `@keyframes` con IntersectionObserver. Cubre las 7 familias de efectos: `.reveal`
(con sus retardos d1/d2/d3), `.te-stagger` con el escalonado, `.te-zoom`, `.te-open`
(recorte), las imágenes con `teSettle`, las palabras de los titulares y `.te-dim`.

Resultado en Safari/Firefox simulados: **68/68, 56/56 y 68/68 elementos animados.**
En Chrome el archivo sale sin hacer nada y la maquetación no varía (0,0000 % en 79
capturas).

El script está construido para que **el contenido no pueda quedar invisible nunca**:
el estado inicial lo aplica el JavaScript, no la hoja de estilos, así que si el script
falla todo se ve con normalidad. Además hay dos redes de seguridad: repaso en cada
scroll de lo que quedó por encima de la pantalla, y un plazo de 8 segundos tras el cual
todo se muestra sí o sí.

Lo único que no se replica es el parallax continuo de la banda de imágenes en
climatización (`teDrift`): depende de la posición exacta de scroll fotograma a
fotograma y emularlo costaría más de lo que aporta. En Safari esa imagen queda quieta.

### 3. Avisos eliminados

Fuera las cajas rojas de "sustituye los campos" y los campos entre corchetes de las
páginas legales, y fuera los comentarios de pendientes del código de las tres páginas.
El aviso legal muestra ahora solo datos reales.

Los datos que siguen faltando (razón social, NIF, domicilio, horario) quedan anotados
únicamente aquí: para el pack local de Google conviene añadirlos al schema, y la LSSI
los exige en el aviso legal. Pero eso es decisión tuya y del cliente, y nada en las
páginas lo menciona ya.
