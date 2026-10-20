# Museo Digital CETIS 69

Sitio web conmemorativo de los **46 años del CETIS 69** (Ciudad Obregón, Sonora). Reúne la historia del plantel, una línea del tiempo, el salón de la fama, un recorrido virtual 360°, un archivo fotográfico colaborativo y créditos. Funciona como **PWA** (se puede instalar y consultar sin conexión) y tiene un **modo kiosco** para pantallas táctiles dentro del plantel.

No requiere compilación: es HTML, CSS y JavaScript puro. Todo el contenido editable vive en un solo archivo, `datos.json`.

---

## Contenido

- [Páginas](#páginas)
- [Estructura de archivos](#estructura-de-archivos)
- [Cómo ejecutarlo](#cómo-ejecutarlo)
- [Editar el contenido (`datos.json`)](#editar-el-contenido-datosjson)
- [Funciones principales](#funciones-principales)
- [Modo offline (PWA)](#modo-offline-pwa)
- [Códigos QR por zona](#códigos-qr-por-zona)
- [Modo kiosco](#modo-kiosco)
- [Recursos externos](#recursos-externos)
- [Archivos que debes agregar](#archivos-que-debes-agregar)
- [Problemas conocidos y pendientes](#problemas-conocidos-y-pendientes)
- [Créditos](#créditos)

---

## Páginas

| Archivo | Descripción |
|---|---|
| `index.html` | Inicio: historia, línea del tiempo, oferta educativa, docentes, archivo, eventos, proyectos, exalumnos, ciencia y contadores. |
| `salon-fama.html` | Trofeos y reconocimientos, filtrables por categoría (deportivo / cultural). |
| `libro-visitas.html` | Libro de visitas. **No venía en los archivos entregados**, pero el menú y el service worker lo referencian. |
| `mapa-360.html` | Plano interactivo del plantel con vistas panorámicas 360° por zona. |
| `archivo-fotografico.html` | Galería por décadas con buscador, visor con navegación y formulario para enviar recuerdos. |
| `creditos.html` | Equipo, agradecimientos, fuentes y herramientas libres utilizadas. |
| `qr-zonas.html` | Herramienta interna para generar e imprimir un QR por zona (`noindex`). |

## Estructura de archivos

```
.
├── index.html
├── salon-fama.html
├── libro-visitas.html          (pendiente de agregar)
├── mapa-360.html
├── archivo-fotografico.html
├── creditos.html
├── qr-zonas.html
│
├── datos.json                  ← TODO el contenido del sitio
├── comun.js                    Lógica compartida (menú, pie, modal, buscador, kiosco, SW)
├── qrcode.js                   Generador de códigos QR (SVG)
├── estilos.css                 Estilos globales (tema guinda)
├── paginas.css                 Estilos de las páginas interiores
│
├── sw.js                       Service worker (caché y modo offline)
├── manifest.webmanifest        Manifiesto PWA
│
├── iconos/                     (pendiente) icono-180.png, icono-192.png, icono-512.png
├── images/                     (pendiente) historia-1..4.jpg, hito-1986..2026.jpg
├── mapa-escolar.jpeg           (pendiente) plano del plantel
└── entrada.jpg                 (pendiente) panorámica 360° de la entrada
```

## Cómo ejecutarlo

El sitio carga `datos.json` con `fetch()`, por lo que **no funciona abriendo los archivos con doble clic** (`file://`). Hay que servirlo por HTTP:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Luego abre `http://localhost:8080/`.

Con `file://` el sitio muestra el aviso *"No se pudieron cargar los datos del sitio…"* y el service worker no se registra.

Para publicarlo sirve cualquier hosting estático (GitHub Pages, Netlify, servidor de la escuela). Se necesita **HTTPS** para el service worker y la instalación como app.

## Editar el contenido (`datos.json`)

| Clave | Para qué sirve |
|---|---|
| `sitio` | Menús (`menu` para páginas internas, `menuInicio` para anclas del inicio), índice de páginas del buscador, y el pie de página (contacto, enlaces, redes, copyright). |
| `ajustes` | `archivoEndpoint` (URL que recibe los recuerdos del formulario), `recorridoSegundos` (duración por zona en el recorrido automático), `kiosco.segundosInactividad`. |
| `hitos` | Línea del tiempo: año `y`, título `t`, texto `d`, especialidades `s` (pares `[icono FontAwesome, nombre]`) y `docentes`. |
| `hitoImagenes` | Ruta de la imagen de cada hito. |
| `eventos`, `proyectos` | Tarjetas de eventos (día `d`, mes `m`, nombre `n`, texto `t`) y proyectos estudiantiles. |
| `exalumnos`, `ciencia` | Tarjetas con nombre `n`, rol o generación `r` y descripción `d`. |
| `premios` | Salón de la fama. `c` = categoría (`d` deportivo, `c` cultural), `l` = nivel, `y` = año, `p` = lugar. |
| `archivo` | Galería: `d` = década (`198`, `199`, `200`, `201`, `202`), `c` = título, `r` = proporción (`3/4`, `4/3`, `1/1`). |
| `zonas` | Zonas del mapa 360° (ver abajo). |
| `creditos` | Equipo, agradecimientos, fuentes y créditos por imagen. |
| `offline` | Archivos extra que el service worker guarda para uso sin conexión. |

> Hoy buena parte de los textos son **marcadores** ("Nombre del docente", "Describe aquí…"). Reemplázalos antes de publicar.

### Configurar una zona del mapa 360°

```json
{
  "id": "entrada",
  "n": "Entrada principal",
  "ic": "door-open",
  "pts": [[73.9, 5.8]],
  "pano": "entrada.jpg",
  "etiquetas": ["Entrada"],
  "d": "Descripción de la zona."
}
```

- `pts`: posiciones `[x, y]` en **porcentaje** sobre `mapa-escolar.jpeg`. Una por cada etiqueta (y por cada ícono, si usas `iconos`).
- `pano`: imagen panorámica equirectangular. **Si está vacío, la zona aparece como "Próximamente"** y se desactiva el giro automático.
- `id`: se usa en la URL (`mapa-360.html?zona=entrada`) y en los QR. No lo cambies una vez impresos los códigos.

## Funciones principales

- **Búsqueda global**: lupa del menú o tecla `/`. Busca en páginas, hitos, docentes, eventos, proyectos, exalumnos, ciencia, premios, zonas, archivo y créditos; ignora acentos y mayúsculas. Flechas para moverse, `Enter` para abrir, `Esc` para cerrar.
- **Menú y pie dinámicos**: se generan desde `datos.json` en todas las páginas.
- **Modal accesible**: foco atrapado, cierre con `Esc`, devuelve el foco al elemento que lo abrió.
- **Mapa 360°**: arrastre con mouse o dedo, giro con flechas del teclado, giro automático, recorrido automático por zonas, pantalla completa (doble clic o tecla `F`), botón de compartir y enlace directo a cada zona.
- **Archivo fotográfico**: filtro por década con contadores, búsqueda en vivo, visor con anterior/siguiente (también con flechas), "Copiar enlace" y barra de progreso de lectura.
- **Formulario "Comparte tu recuerdo"**: límite de 100 MB y consentimiento obligatorio. Ver [pendientes](#problemas-conocidos-y-pendientes) sobre el envío.
- **Accesibilidad**: enlace "Saltar al contenido", roles ARIA, foco visible y soporte de teclado.

## Modo offline (PWA)

`sw.js` usa dos estrategias:

- **Red primero** (espera máxima de 4 s, con respaldo en caché) para HTML, CSS, JS, JSON y manifiesto propios. Así los cambios se ven al publicarlos.
- **Caché primero** (actualizando en segundo plano) para imágenes, fuentes y demás recursos.

Al instalarse precarga `NUCLEO`, los archivos de `datos.json → offline` y los recursos externos (Font Awesome y Montserrat).

**Al publicar cambios**, sube el número de `VERSION` en `sw.js` (por ejemplo `museo-cetis69-v2`) para que los navegadores borren la caché anterior. Si agregas páginas nuevas, inclúyelas en `NUCLEO`.

## Códigos QR por zona

1. Abre `qr-zonas.html`.
2. Escribe la **dirección pública** del sitio (por ejemplo `https://tu-sitio.mx/museo/`). Se recuerda en el navegador.
3. Se genera un QR por zona que abre `mapa-360.html?zona=<id>`.
4. Descarga cada uno en SVG o usa **Imprimir todos**.

Avisa si la dirección es local (`localhost`, `192.168.x.x`…), porque esos QR no funcionarían fuera de tu red. Puedes resaltar uno con `qr-zonas.html#<id-de-zona>`. La vista de impresión oculta menú, pie y controles.

## Modo kiosco

Pensado para pantallas táctiles en el plantel.

| URL | Efecto |
|---|---|
| `…/?kiosco=1` | Lo activa (se guarda en `localStorage`). |
| `…/?kiosco=0` | Lo desactiva. |

Activo, tras `ajustes.kiosco.segundosInactividad` segundos (90 por defecto) sin interacción se cierran modales y buscador, se sale de pantalla completa y se regresa al inicio.

## Recursos externos

Por CDN (requieren conexión la primera vez; luego los guarda el service worker):

- **Montserrat** — Google Fonts (SIL OFL 1.1)
- **Font Awesome Free 6.5.1** — cdnjs (íconos CC BY 4.0, fuentes SIL OFL, código MIT)

`qrcode.js` va incluido localmente.

## Archivos que debes agregar

Se referencian en el código o en `datos.json`, pero no venían en el paquete:

- `libro-visitas.html`
- `iconos/icono-180.png`, `icono-192.png`, `icono-512.png`
- `mapa-escolar.jpeg`
- `entrada.jpg` y las demás panorámicas que asignes en `zonas[].pano`
- `images/historia-1.jpg` … `historia-4.jpg` y `images/hito-1986.jpg` … `hito-2026.jpg`

Mientras falten, el sitio sigue funcionando: las imágenes se ven como marcadores y el service worker omite lo que no pueda descargar.

## Problemas conocidos y pendientes

1. **Nombre inconsistente de la página de inicio.** El archivo es `index.html` (así está en `datos.json → sitio.inicio`), pero `manifest.webmanifest` (`start_url`), `comun.js` (`raiz` y el valor por defecto del modo kiosco) y `sw.js` (respaldo offline) usan `museo-cetis69.html`. Resultado: los enlaces de ancla del pie desde páginas interiores, el arranque de la PWA y el regreso del kiosco pueden apuntar a una página inexistente. Solución: cambiar esas referencias a `index.html`.
2. **El formulario del archivo no guarda envíos.** `ajustes.archivoEndpoint` está vacío; sin un servidor que reciba el `POST` (`multipart/form-data`, campos `nm`, `yr`, `ds`, `fl`, `cons`), el recuerdo solo se ve en esa sesión del navegador.
3. **Descripciones genéricas en el visor del archivo.** El modal muestra un texto fijo ("Describe aquí el evento…"); conviene agregar un campo de descripción en `datos.json → archivo`.
4. **`salon-fama.html` inserta textos con `innerHTML` sin escapar.** Es seguro mientras solo tú edites `datos.json`; no lo alimentes con texto enviado por visitantes.
5. **Cabecera duplicada** en `archivo-fotografico.html`: dos `theme-color` y dos `<link rel="icon">`.
6. **Errores de captura en créditos:** "Jose" / "José" Diego Madrid Leyva y "Direccción escolar".
7. **Archivos pesados:** `index.html` (~277 KB) lleva la imagen de portada embebida en base64 y `estilos.css` (~190 KB) los logotipos. Funciona, pero conviene moverlos a archivos de imagen.

## Créditos

- **Coordinación del proyecto:** Gabriela Herrera Vilchis (maestra)
- **Investigación histórica y diseño/desarrollo web:** José Diego Madrid Leyva (alumno, 5AMPRG)
- **Fotografía:** Dirección escolar, CETIS 69

Detalle de fuentes y agradecimientos en `creditos.html`.

© 2026 CETIS 69 · Todos los derechos reservados.
