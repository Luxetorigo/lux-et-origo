# Lux et Origo — sitio web

Sitio estático (HTML + CSS + JS). No necesita base de datos ni programar para actualizarlo.

## IMPORTANTE al subir a GitHub
Sube **todo**: `index.html`, `transparencia.html` y también las carpetas `css`, `js` y `data` (y `pdf` cuando tengas PDFs). Si falta alguna, la página se ve sin estilo o sin catálogo. Arrastra la carpeta completa al subir.

## Colores y modo
Arriba a la derecha hay 5 colores litúrgicos y un botón claro/oscuro. Al entrar, el sitio elige solo el color del tiempo litúrgico (verde en Tiempo Ordinario, morado en Adviento/Cuaresma, blanco y oro en Navidad/Pascua, rojo en Pentecostés). Cada parte de la Misa tiene además su propio color en las tarjetas.

## Cómo agregar una partitura
1. Sube tus PDFs a Google Drive (partitura reducida, y la original si la hay).
2. En Drive: clic derecho → Compartir → Acceso general → **«Cualquier persona con el enlace»** (Lector). Sin esto la vista y la descarga no funcionan para los visitantes.
3. Copia el enlace de cada archivo (Drive) y, si tienes audio, el enlace de YouTube.
4. Abre `data/partituras.json` y agrega un bloque (el `id` debe ser único, sin espacios ni acentos):

```json
{
  "id": "kyrie-alrededor-de-tu-mesa",
  "titulo": "Señor, ten piedad",
  "obra": "Misa «Alrededor de tu mesa»",
  "compositor": "Francisco Palazón",
  "parte": "Kyrie",
  "notas": "Melodía de soprano en notación moderna.",
  "drive_reducida": "https://drive.google.com/file/d/XXXX/view?usp=sharing",
  "drive_original": "",
  "youtube": "https://youtu.be/XXXX"
}
```
Campos vacíos (`""`) = ese botón dice «próximamente» o no aparece. Los filtros por autor y el orden A–Z se arman solos. Cada partitura tiene su propia página: `partitura.html?id=kyrie-alrededor-de-tu-mesa`.

## Cambiar correo y redes
Todo está en `js/config.js`. Al cambiar el correo se actualiza en todo el sitio, incluida la carta de transparencia.

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
