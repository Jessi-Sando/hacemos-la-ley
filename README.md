# HACEMOS LA LEY — maqueta funcional

Experiencia educativa transmedia (simulación) para comprender cómo se forman las leyes nacionales en Argentina.
Trabajo final de Materiales Educativos Transmedia.

## Cómo verla en tu computadora
Abrí `index.html` con doble clic: funciona sin servidor (los contenidos están en `js/data.js`, no en JSON externos).
Opcional, con servidor local: `python -m http.server 8000` dentro de esta carpeta y abrí http://localhost:8000

## Estructura
- `index.html`: estructura general (barra superior, progreso, panel del expediente, aviso de simulación)
- `css/styles.css`, `css/responsive.css`: estética de collage (papel rasgado, títulos tipo marcador, dorado)
- `js/data.js`: TODO el contenido editable: roles, publicaciones, fuentes, podcast, proyecto, personajes del Congreso, glosario
- `js/legislative-process.js`: pantalla 6 y motor de escenarios (CN arts. 77–84)
- `js/screens.js`: pantallas 1–5, 7 y 8
- `js/expediente.js`: expediente digital, línea de tiempo y descarga del resumen
- `js/storage.js`: guardado en localStorage · `js/ui.js`: utilidades · `js/app.js`: navegación
- `assets/images/`, `assets/audio/`: para la ilustración de portada y los audios del podcast

## Publicar en GitHub Pages
1. Creá un repositorio nuevo en GitHub (por ejemplo `hacemos-la-ley`), público.
2. Subí el contenido de esta carpeta (que `index.html` quede en la raíz del repositorio).
3. En el repositorio: Settings → Pages → Source: «Deploy from a branch» → rama `main`, carpeta `/ (root)` → Save.
4. En uno o dos minutos queda publicado en `https://<tu-usuario>.github.io/hacemos-la-ley/`.

## Pendientes / desarrollos futuros
- Audios reales del podcast (cada episodio en `js/data.js` tiene `audio: null`).
- Ilustración de portada definitiva.
- Revisión docente de las simplificaciones institucionales señaladas en la app.
- Partidas grupales, archivo de experiencias y panel docente (requieren servidor).
