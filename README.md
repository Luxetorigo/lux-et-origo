# Lux et Origo — sitio web

Sitio estático (HTML + CSS + JS). No necesita base de datos ni programar para actualizarlo.

## IMPORTANTE al subir a GitHub
Sube **todo**: `index.html`, `transparencia.html` y también las carpetas `css`, `js` y `data` (y `pdf` cuando tengas PDFs). Si falta alguna, la página se ve sin estilo o sin catálogo. Arrastra la carpeta completa al subir.

## Colores y modo
Arriba a la derecha hay 5 colores litúrgicos y un botón claro/oscuro. Al entrar, el sitio elige solo el color del tiempo litúrgico (verde en Tiempo Ordinario, morado en Adviento/Cuaresma, blanco y oro en Navidad/Pascua, rojo en Pentecostés). Cada parte de la Misa tiene además su propio color en las tarjetas.

## Cómo se carga el contenido (Excel)
Todo sale de `herramientas/lux_et_origo_Datos.xlsx`, que tiene tres hojas con datos: **Partituras**, **Recursos** y **Salmos**. La primera hoja explica qué se muestra cuando falta un dato. Los pasos son:
1. Sube tus PDFs a Google Drive y compártelos como **«Cualquier persona con el enlace»** (si no, no se ven ni se descargan).
2. Llena una fila por elemento en el Excel. Una celda vacía se escribe con **0**.
3. Pásame el Excel (o corre `python3 herramientas/xlsx_a_json.py herramientas/lux_et_origo_Datos.xlsx`; necesita `pip install openpyxl`). Eso reescribe `data/partituras.json`, `data/recursos.json` y `data/salmos.json`.

### Qué pasa cuando un campo está vacío (0)
| Campo | En el sitio |
|---|---|
| Título | La fila no aparece |
| Tipo, Parte, Tiempo, Categoría, No. de salmo | No se muestra ni se usa en los filtros |
| Autor | «Anónimo» (no entra en el filtro de autor) |
| Drive, Original, YouTube, Fuente, Editorial | «No disponible» |
| Condición | «No hay dominio específico» |
| Autorizada por | No se muestra |
| Día o rito (salmos) | «No específico» |
| Descripción | «Aún no hay descripción» |

## Cambiar correo y redes
Todo está en `js/config.js`. `emailPie` es el correo del pie de página de todo el sitio; `email` es el de la carta de transparencia.

## Verlo en tu computadora
Los navegadores bloquean la carga del catálogo si abres `index.html` con doble clic. Desde la carpeta del sitio ejecuta:

```
python3 -m http.server 8000
```
y abre http://localhost:8000

## Publicarlo gratis
- **GitHub Pages**: crea un repositorio, sube esta carpeta, y en *Settings → Pages* elige la rama principal.
- **Netlify** o **Cloudflare Pages**: arrastra la carpeta completa al panel y listo.
Todas permiten conectar un dominio propio después.

## Pendientes tuyos
- Correo propio del proyecto (`js/config.js`).
- Enlaces de redes (`js/config.js`).
- Confirmar santos de la encomienda y si mencionas tu diócesis (`transparencia.html`).
- Revisar el plazo de retiro («a la brevedad») por si quieres fijar uno concreto.
