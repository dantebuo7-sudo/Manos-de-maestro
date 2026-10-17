# Manos de Maestro · sitio web

Sitio de una sola página para **Manos de Maestro**, de Miguel Saldivia e Ignacio Mora: construcción y remodelaciones en la Región de Los Ríos. WhatsApp: +56 9 7710 7052.

Es HTML, CSS y JavaScript estático. No hay que compilar nada: Vercel lo publica tal cual.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | La página completa, con el CSS dentro |
| `app.js` | Animaciones, galería, visor de fotos, comparador y preguntas frecuentes |
| `vendor/` | GSAP 3.12.5, ScrollTrigger y Lenis 1.1.13 (dentro del proyecto, no dependen de otros servidores) |
| `fonts/` | Geist, Geist Mono y Bodoni Moda (woff2, solo caracteres latinos) |
| `img/` | Fotos en `.webp`, en dos tamaños: `-800` (celular) y `-1600` (computador). Hero también en `-2400` |
| `video/empaste.mp4` | Timelapse real del empaste de un cielo |
| `og.jpg` | Imagen que aparece al compartir el link por WhatsApp o redes |
| `favicon.png`, `apple-touch-icon.png`, `icon-512.png` | Íconos |
| `404.html`, `robots.txt`, `sitemap.xml`, `vercel.json` | Página de error, SEO y caché |

## Fotos

Todas son reales. Las restauradas se limpiaron con IA. Las demás se agrandaron 4 veces con Real-ESRGAN y después se redujeron a los tamaños web.

| Archivo | Sección | Foto |
|---|---|---|
| `hero` | Portada | Cocina terminada (restaurada) |
| `story-1/2/3` | Escalera destacada | Antes, proceso, terminado |
| `bano-1/2/3` | Obra 01 · Baños | Mampara, ducha negra, espejo con viga |
| `cocina-1/2/3` | Obra 02 · Cocinas | Cocina de día, campana y encimera, cerámica en proceso |
| `pasillo-1/2/3` | Obra 03 · Pisos y carpintería | Pasillo, puerta granero, taller |
| `obra-1/2/3` | Obra 04 · Ampliaciones | Maestros en la techumbre, interior del segundo piso, casa con la estructura |
| `g-*` | Galería "Hecho a mano" | Escalera, vanitorio, muro de madera, cielo de madera, fachada |
| `antes` / `despues` | Comparador | Baño rosado y el mismo baño remodelado |

Para cambiar una foto, reemplaza los dos archivos (`-800.webp` y `-1600.webp`) manteniendo el nombre.

## Antes de usar un dominio propio

En `index.html`, `robots.txt` y `sitemap.xml` está `https://manosdemaestro.vercel.app`. Si el sitio queda en otra dirección, por ejemplo `manosdemaestro.cl`, hay que reemplazarla en esos tres archivos. Sin eso, la imagen de WhatsApp no aparece.

## Pendiente

- Confirmar con Miguel e Ignacio las respuestas de **Preguntas frecuentes** (si la visita se cobra, si compran ellos los materiales, si dan garantía) y agregar esas preguntas.
- Agregar Instagram y TikTok en el pie de página cuando existan las cuentas.
- Agregar la sección del **food truck** cuando estén las fotos.
- Agregar testimonios reales de clientes, con su permiso. No hay que inventarlos.
