# Manos de Maestro · sitio web

Sitio de una sola página para **Manos de Maestro**, de Miguel Saldivia e Ignacio Mora: construcción y remodelaciones en la Región de Los Ríos. WhatsApp de los dos socios, ambos principales: Miguel Saldivia +56 9 7710 7052 e Ignacio Mora +56 9 6583 6682. Los botones de WhatsApp y el formulario muestran un menú para elegir a quién escribirle; en contacto, pie de página y en la tarjeta de cada uno están los dos números.

Es HTML, CSS y JavaScript estático. No hay que compilar nada: Vercel lo publica tal cual.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | La página completa, con el CSS dentro |
| `app.js` | Animaciones, galería, visor de fotos, preguntas frecuentes y formulario de cotización |
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
| `cocina-1/2/3` | Obra 02 · Cocinas | Cocina con cielo de doble nivel y ventanal, campana y encimera, cerámica en proceso |
| `pasillo-1/2/3` | Obra 03 · Pisos y carpintería | Pasillo, puerta granero, taller |
| `obra-1/2/3` | Obra 04 · Ampliaciones | Maestros en la techumbre, interior del segundo piso, casa con la estructura |
| `g-*` | Galería "Hecho a mano" | Escalera, vanitorio, muro de madera, cielo de madera, fachada de madera café con alero negro |

Para cambiar una foto, reemplaza los dos archivos (`-800.webp` y `-1600.webp`) manteniendo el nombre.

## Fichas de obra

Las 4 obras grandes (casa en Valdivia, Pichihuape, Punucapa y techumbre) tienen una ficha con ubicación, estructura, superficie, plazo y etapas. Los datos que faltan aparecen como `[DATO: …]` con borde punteado: hay que reemplazarlos en `index.html` (buscar `class="dato"`) cuando se tengan los datos reales.

## Servicios

- **Principal: construcción de casas desde cero**, de principio a fin. Tiene su bloque propio al inicio de Servicios con las etapas: terreno y fundaciones, estructura (tradicional o panel SIP), techumbre, instalaciones (eléctrica, agua, fosa séptica), terminaciones y entrega.
- Tarjetas: panel SIP, ampliaciones, techumbres, instalaciones eléctricas, fosa séptica, baños, cocinas, escaleras y carpintería, pisos y revestimientos.
- **Instalaciones eléctricas**: Miguel e Ignacio hacen la instalación completa; el certificado SEC (TE1) lo emite un electricista autorizado con quien trabajan. No decir que ellos son instaladores autorizados SEC.

## Animaciones

- **Intro del logo**: al entrar por primera vez en la visita, los dos martillos se cruzan, salta una chispa y aparece la MM; en 1,15 segundos se abre la portada. No vuelve a salir hasta cerrar la pestaña. Está en el `<script>` del `<head>` y en el CSS (`.intro`), así que nunca bloquea la página aunque falle `app.js`.
- **Logo del encabezado**: se achica suavemente al bajar. Un brillo pasa por el logo cada tanto y al pasar el mouse se inclina apenas. El brillo usa el mismo logo como máscara, así que el dibujo no cambia.
- **Portada**: el título aparece línea por línea y a la derecha hay un indicador de "Baja". Las fotos grandes de cada casa terminada tienen un paralaje suave (solo `transform`, sin recalcular el diseño).
- Quien tenga activado "reducir movimiento" en su teléfono o computador ve la web sin animaciones.

## Formulario de cotización

Sección `#cotizar`, antes del contacto. Son 4 pasos: tipo de trabajo, comuna (Valdivia marcada), tamaño y plazo, nombre y descripción. Como la web no tiene servidor, al final la persona elige si escribirle a Miguel o a Ignacio y se abre WhatsApp con el mensaje escrito y ordenado, terminando en "Te envío fotos del espacio por aquí". No se guarda ningún dato en la web.

## Código QR

En `qr/` está el QR que abre https://manosdemaestro.vercel.app:

- `manos-de-maestro-qr-tarjeta.png`: tarjeta con logo, QR y los teléfonos de Miguel e Ignacio, lista para compartir o imprimir.
- `manos-de-maestro-qr.png`: solo el QR, en alta resolución.
- `manos-de-maestro-qr.svg`: solo el QR en vector, para imprenta (letreros, autoadhesivos, ropa de trabajo).

Si la web se cambia a un dominio propio, hay que generar un QR nuevo.

## Antes de usar un dominio propio

En `index.html`, `robots.txt` y `sitemap.xml` está `https://manosdemaestro.vercel.app`. Si el sitio queda en otra dirección, por ejemplo `manosdemaestro.cl`, hay que reemplazarla en esos tres archivos. Sin eso, la imagen de WhatsApp no aparece.

## Pendiente

- Confirmar con Miguel e Ignacio las respuestas de **Preguntas frecuentes** (si la visita se cobra, si compran ellos los materiales, si dan garantía) y agregar esas preguntas.
- Agregar Instagram y TikTok en el pie de página cuando existan las cuentas.
- Agregar la sección del **food truck** cuando estén las fotos.
- Agregar testimonios reales de clientes, con su permiso. No hay que inventarlos.
