# Lux et Origo — sitio web

Sitio estático (HTML + CSS + JS). Sin base de datos. Se publica gratis con GitHub Pages
(*Settings → Pages → Deploy from a branch → `main` → `/ (root)`*).

## Cómo se actualiza el contenido: con el Excel
1. Llena `herramientas/plantilla-lux-et-origo.xlsx` (hojas **Partituras**, **Recursos** y **Salmos**; la primera hoja explica qué pasa con cada campo vacío).
2. Pásame el Excel y yo actualizo el sitio, o hazlo tú: `pip install openpyxl` y luego `python3 herramientas/xlsx_a_json.py TuExcel.xlsx`. Eso reescribe `data/partituras.json`, `data/recursos.json` y `data/salmos.json`.
3. Sube los cambios a GitHub (toda la carpeta, incluidas `css`, `js`, `data`).

**Campo vacío = `0`** en el Excel. El sitio lo muestra así: Autor → «Anónimo»; enlaces (Drive, original, YouTube, fuente) → «No disponible»; Condición → «No hay dominio específico»; Descripción → «Aún no hay descripción»; Día o rito → «No específico»; Editorial → «No disponible». Título, Tipo, Parte, Tiempo y «Autorizada por» vacíos simplemente no aparecen ni se usan para clasificar (no hay filtro de algo que nadie llenó). Una fila sin título no aparece.

**Drive:** cada PDF debe estar compartido como «Cualquier persona con el enlace» (Lector), si no la vista y la descarga no funcionan para los visitantes.

**Versión:** 1.1 (`version` en `js/config.js`; se muestra en el pie). No es la versión de la carta de transparencia.

## Secciones
- **Partituras** (`index.html`): menú con búsqueda, filtros (Autor, Tipo, Parte, Tiempo) y orden A→Z / Z→A. Cada partitura tiene su página `partitura.html?id=...` con vista del PDF, descarga, original, YouTube, fuente y condición.
- **Recursos** (`recursos.html`): Cantorales, Libros y Documentos, en filas; cada una abre su página con vista previa (`recurso.html?id=...`).
- **Salmos** (`salmos.html`): filas ordenadas por número; se filtran escribiendo números («5, 6, 77» o «20-25») y por autor. Cada una abre su página con vista previa (`salmo.html?id=...`).
- **Sobre nosotros** y **Transparencia** (`transparencia.html`, con el PDF en `docs/`).

## Colores, correo y redes
Arriba a la derecha hay 5 colores litúrgicos y modo claro/oscuro (el sitio elige solo el color del tiempo litúrgico). Correo y redes en `js/config.js`: `emailPie` va en el pie de todo el sitio; `email` en la carta de transparencia.

## Verlo en tu computadora
Abrir `index.html` con doble clic no carga los datos. Desde la carpeta del sitio: `python3 -m http.server 8000` y abre http://localhost:8000
