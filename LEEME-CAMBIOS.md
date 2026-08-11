# Termoelectra — auditoría y correcciones

Fecha: 11 de agosto de 2026

Todos los cambios están verificados: 79 capturas deterministas comparadas contra la
versión anterior con **0,0000 % de desviación** en la maquetación, y 0 errores de
JavaScript en las tres páginas servidas por HTTP.

---

## ⚠️ Antes de publicar — datos que faltan del cliente

El schema de negocio local y el aviso legal necesitan datos que **no estaban en el
proyecto**. No se han inventado: un domicilio falso en el schema perjudica el SEO local
y un aviso legal incompleto incumple la LSSI-CE.

Pídele a Bernardo:

1. **Razón social completa** y **NIF/CIF**
2. **Domicilio** (calle, número, CP, localidad, provincia)
3. **Datos registrales** (Registro Mercantil), si es sociedad
4. **Horario de atención**
5. **Coordenadas** o enlace a la ficha de Google Maps
6. Nº de **autorización/inscripción como empresa frigorista** (RD 552/2019), si aplica

Dónde ponerlos:
- `index.html` → comentario `PENDIENTE DE DATOS DEL CLIENTE` justo encima del JSON-LD
  (el mismo bloque va en las tres páginas)
- `legal/aviso-legal.html` y `legal/privacidad.html` → campos marcados con `[CORCHETES]`

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
- 761 reglas CSS muertas eliminadas, verificadas con 79 capturas deterministas
  (`prefers-reduced-motion` + scroll fijo) a 0,0000 % de desviación

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
