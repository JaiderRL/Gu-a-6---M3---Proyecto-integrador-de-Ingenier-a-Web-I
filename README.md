# Lumen · Biblioteca Virtual Comunitaria

Proyecto integrador de **Ingeniería Web I** (Guía 6 · Módulo 3).

Lumen es un sitio web responsivo para una biblioteca de barrio. Permite consultar el catálogo y la disponibilidad de los libros, reservar un préstamo en línea, conocer la agenda cultural y encontrar los datos de contacto. Funciona en computador, tableta y teléfono móvil.

## Problemática

En las bibliotecas comunitarias la información está dispersa: el catálogo solo se consulta en el mostrador, los horarios están en carteleras y los eventos se anuncian por grupos de mensajería. Los usuarios hacen viajes en vano por libros que ya están prestados y se pierden las actividades culturales.

## Páginas

| Página | Contenido |
|---|---|
| `index.html` | Inicio: búsqueda rápida, indicadores, servicios, libros destacados, testimonios, preguntas frecuentes |
| `catalogo.html` | Catálogo con búsqueda en vivo, filtros por categoría y disponibilidad, orden y detalle en ventana modal |
| `eventos.html` | Agenda cultural con filtro por público, agenda personal, galería con visor y video del recorrido |
| `reservas.html` | Formulario de reserva con validación, lista «Mis reservas», horario y contacto |

## Estructura

```
├── index.html
├── catalogo.html
├── eventos.html
├── reservas.html
├── css/styles.css        Estilos (mobile-first, Flexbox, Grid, media queries)
├── js/main.js            Interacciones en JavaScript sin librerías
├── img/                  Logo, ilustraciones, portadas, eventos y galería (SVG)
├── media/                Video del recorrido (MP4) y póster
└── docs/
    ├── Documentacion-Proyecto-Lumen.pdf
    └── evidencias/       Capturas en computador, tableta y móvil
```

## Tecnologías

- HTML5 semántico (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `dialog`, `details`, `video`, formularios con validación)
- CSS3 (variables, Flexbox, CSS Grid, `clamp()`, transiciones, tema oscuro)
- Diseño responsivo con media queries en 30em, 48em y 64em
- JavaScript (ES6+) para menú móvil, filtros, modales, validación y `localStorage`

## Cómo verlo

Abre `index.html` en el navegador. También puedes publicarlo con **GitHub Pages**: en el repositorio ve a *Settings → Pages*, elige la rama `main` y la carpeta `/ (root)`.

## Documentación

La documentación completa (problemática, objetivos, arquitectura, HTML5, CSS3, diseño responsivo, pruebas y evidencias) está en [`docs/Documentacion-Proyecto-Lumen.pdf`](docs/Documentacion-Proyecto-Lumen.pdf).
