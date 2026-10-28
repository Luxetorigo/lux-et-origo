# Lux et Origo — sitio web

Sitio estático (HTML + CSS + JS). No necesita base de datos ni programar para actualizarlo.

## Cómo agregar una partitura
1. Exporta tu PDF desde MuseScore.
2. Cópialo a `pdf/reducidas/` (y la original, si tienes permiso, a `pdf/originales/`). Usa nombres sin espacios ni acentos, p. ej. `palazon-kyrie-reducida.pdf`.
3. Abre `data/partituras.json` y agrega o edita un bloque:

```json
{
  "titulo": "Señor, ten piedad",
  "obra": "Misa «Alrededor de tu mesa»",
  "compositor": "Francisco Palazón",
  "parte": "Kyrie",
  "notas": "Melodía de soprano en notación moderna.",
  "reducida": "pdf/reducidas/palazon-kyrie-reducida.pdf",
  "original": ""
}
```
Si `reducida` está vacío, la tarjeta dice «en preparación». Los filtros por parte de la Misa se crean solos con el campo `parte`.

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
