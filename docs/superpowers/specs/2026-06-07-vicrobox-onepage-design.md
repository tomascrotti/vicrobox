# Vicrobox — One-Page Redesign — Design Spec
**Fecha:** 2026-06-07
**Reemplaza/recorta:** [2026-06-06-vicrobox-design.md](./2026-06-06-vicrobox-design.md) — esta versión es deliberadamente más chica (una sola página pública, admin de imágenes solamente). Lo que se saca de scope queda anotado para sumarse después sin reescribir.

## Resumen

Sitio de **una sola página** para Vicrobox Entretenimiento (Buenos Aires), con secciones ancladas (sin redirección entre rutas), scroll suave y scroll-reveal. Incluye modo de edición de imágenes para el dueño, integrado en la misma página pública (sin dashboard separado).

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js (App Router) + TypeScript |
| Estilos | Tailwind CSS |
| Backend/DB | Supabase (Postgres + Auth + Storage) |
| Deploy | Cloudflare Pages vía `@opennextjs/cloudflare` |
| Fuentes | Fredoka One (display/logo) + Nunito (cuerpo) |

(Mismo stack que la sesión anterior — ya está conectado y funcionando.)

---

## Rutas

```
/        → única página pública (todas las secciones ancladas)
/admin   → login Supabase Auth → redirige a "/" en modo edición
```

No hay `/servicios`, `/servicios/[slug]`, `/eventos`, `/admin/dashboard`, etc. — eliminado del scope anterior.

---

## Arquitectura para extensibilidad futura

El pedido explícito es: simple ahora, fácil de ampliar después. Dos mecanismos lo garantizan:

1. **`buildServiceHref(slug)`** (`src/lib/service-links.ts`): helper centralizado que arma el link de cada `ServiceCard`. Hoy devuelve `#cta` (ancla a cotización). El día que se quiera una página de detalle por servicio, se cambia ese helper para devolver `/servicios/[slug]` y se arma esa ruta — sin tocar `ServiceCard` ni el carrusel.
   - **Importante (pedido del cliente):** cuando esa página de detalle exista, debe respetar el lenguaje visual validado en este mockup — paleta cálida (`--black/--s1/--s2` + acentos `#EA7C03`/`#F8BD19`/`#079684`), tipografía (Fredoka One display + Nunito cuerpo), estilo de card (`.svc-media` imagen-arriba + `.svc-badge` + tagline con color de acento), y fondos con foto traslúcida tipo fiesta/luces. No es un rediseño nuevo — es una extensión del mismo sistema visual, reusando los mismos componentes/clases (`.svc-*`) que ya sirven a Servicios y Eventos Destacados.
2. **Login separado en `/admin`**: aunque el modo edición se ve sobre la página pública, el punto de entrada de auth ya existe como ruta propia. Si en el futuro se necesita un dashboard real con más secciones, se cuelga de ahí sin reestructurar el flujo de login.

---

## Página pública — secciones

| Sección | Contenido | Fuente de datos |
|---|---|---|
| **Header** | Wordmark multicolor "VICROBOX", nav con anclas (`#servicios`, `#nosotros`, `#cta`), fondo se vuelve sólido al hacer scroll (>40px) | estático |
| **Hero** `#inicio` | Partículas flotantes animadas, wordmark grande con ícono de obturador SVG, eyebrow + tagline + párrafo, 2 CTAs (`¡Cotizá tu evento!` → `#cta`, `Ver servicios` → `#servicios`), scroll hint animado | estático |
| **Servicios** `#servicios` | **Carrusel horizontal**: 3 cards visibles, 2 botones (← →) debajo del carrusel que avanzan de a una card vía `scrollBy`, + gesto drag/swipe nativo (mouse y touch) usando `overflow-x: scroll` + `scroll-snap-type`. Card formato imagen-arriba: foto editable (`ImageEditOverlay`) con badge de categoría superpuesto, tagline con color de acento, descripción, link "Ver detalle →" armado por `buildServiceHref(slug)`. Fondo de sección con foto de fiesta/luces traslúcida (overlay ~90% color base) | Supabase `services` (filtro `active = true`, orden por `order`) |
| **Nosotros** `#nosotros` | 4 razones para elegir Vicrobox (ícono + título + texto). Fondo con foto traslúcida, mismo patrón que Servicios | estático |
| **Eventos Destacados** `#eventos-destacados` | Carrusel horizontal (mismo componente/estilo que Servicios, reutiliza `.svc-card`/`.svc-media`/`.svc-badge` con modificador `evt-card`): cards con foto del evento, badge "Tipo de evento · Cliente", tagline de servicios usados, descripción breve, "Ver más →". Fondo con foto traslúcida. Sección agregada en el mockup — entra a scope (ver "Sacado de esta versión" abajo, actualizado) | Supabase `events` + `event_images` (nuevas tablas, ver modelo de datos) |
| **Cotización + CTA** `#cta` | Formulario: nombre, servicios (multi-select dinámico), fecha, cantidad de invitados, ubicación, mensaje opcional. Botón "Enviar por WhatsApp" arma URL `wa.me/{numero}?text={mensaje}` y la abre | servicios desde Supabase; número de WhatsApp hardcodeado por ahora (estructura permite mover a `settings` después) |
| **WhatsApp FAB** | Botón flotante visible en toda la página | estático |
| **Footer** | Logo, columnas de links (todos anclas a secciones), datos de contacto, copyright | estático |

**Sacado de esta versión** (vs. plan anterior): Stats strip (removida también del mockup — confirmado en iteración visual), páginas de detalle de servicio/evento, dashboard admin con CRUD completo. Quedan documentadas acá para cuando el cliente las pida — no se borra la idea, se posterga.

**Suma respecto al plan anterior**: sección "Eventos Destacados" — surgió en iteración del mockup, el cliente la valora como prueba social visual. Entra a scope de esta versión (ver tabla de secciones y modelo de datos).

---

## Animaciones — scroll reveal

- **Scroll suave a anclas**: ya viene gratis con `html { scroll-behavior: smooth }` (igual que `_staging/designs/index.html`).
- **Scroll-reveal**: elementos (cards, títulos, imágenes) aparecen con fade-in/slide-in al entrar en viewport. Implementado como wrapper reusable `<Reveal>` (`src/components/ui/Reveal.tsx`) sobre `IntersectionObserver` — se envuelve cualquier elemento de cualquier sección, presente o futura.

---

## Modo edición (admin de imágenes)

**Flujo:** dueño entra a `/admin`, login con email + contraseña (Supabase Auth) → redirige a `/` con sesión activa.

**Comportamiento en `/`:**
- Sin sesión: la página se ve exactamente igual para todos — cero diferencia de código duplicado.
- Con sesión: `EditModeProvider` (chequeo de sesión server-side) envuelve las cards de servicio con `ImageEditOverlay`, que agrega botones superpuestos sobre cada imagen:
  - **+ agregar imagen**: sube a `services-images/` (Supabase Storage), asocia a `service_images`
  - **✕ borrar imagen**: elimina de Storage y de `service_images`

**Diseñado para crecer**: `EditModeProvider` es el único punto que sabe "¿estoy en modo edición?". Sumar edición de texto, ajustes, etc. más adelante significa agregar overlays nuevos dentro de ese contexto — no reescribir el flujo de auth ni la página pública.

---

## Modelo de datos (Supabase)

Recorte del esquema de la sesión anterior — solo lo que esta versión usa:

```sql
services
  id          uuid PK
  name        text
  slug        text unique
  description text
  icon        text          -- nombre ícono SVG
  color       text          -- color acento hex
  active      boolean
  order       integer       -- orden en el carrusel
  created_at  timestamptz

service_images
  id          uuid PK
  service_id  uuid FK → services
  url         text          -- URL Supabase Storage
  order       integer
  created_at  timestamptz

settings
  key         text PK       -- 'whatsapp_number'
  value       text
  updated_at  timestamptz

events
  id          uuid PK
  title       text          -- ej. "Casamiento · Caro & Juan"
  tagline     text          -- ej. "Fotocabina + Cabina Espejada"
  description text
  color       text          -- color acento hex (reusa paleta de marca)
  active      boolean
  order       integer       -- orden en el carrusel
  created_at  timestamptz

event_images
  id          uuid PK
  event_id    uuid FK → events
  url         text          -- URL Supabase Storage
  order       integer
  created_at  timestamptz
```

**No se crea** (vs. plan viejo): `event_services` (relación events↔services). Fuera de scope por ahora — el campo `tagline` de `events` cubre la necesidad actual de mostrar "qué servicios se usaron" como texto libre. Si más adelante se necesita filtrar/relacionar estructuradamente, se agrega esa tabla siguiendo el mismo patrón.

### Storage buckets
```
services-images/    → fotos por servicio (gestionadas desde modo edición)
events-images/      → fotos de eventos destacados (gestionadas desde modo edición)
```

---

## Design system

### Colores
Paleta final ajustada en mockup (menos gris, tinte cálido, acentos de marca):
```
--orange: #EA7C03   --yellow: #F8BD19   --teal:   #079684
--black:  #120F0A   (fondo base)
--s1:     #1C170F   (fondo secciones alternas)
--s2:     #251E13   (cards)
--muted:  rgba(255,255,255,0.55)
```
(Reemplaza la paleta gris/azul-violeta de la versión anterior — validada visualmente en el mockup interactivo.)

### Fuentes
- Display/Logo: `Fredoka One`
- Cuerpo: `Nunito` (weights: 400, 500, 600, 700, 800, 900)

### Referencia visual
- Base: `_staging/designs/index.html` — layout, secciones ancladas, paleta, tipografía, hero con partículas y wordmark con ícono de obturador. Es la referencia más fiel a lo que se quiere ahora (single-page, anclas, scroll suave).
- `_staging/designs/VicroBox.html` (mockup multi-página con paleta violeta/oklch) **no aplica** a esta versión — era para el enfoque de rutas múltiples descartado.

---

## Estructura de directorios

```
vicrobox/
├── _staging/                          ← gitignored
├── src/
│   ├── app/
│   │   ├── page.tsx                   ← única página pública
│   │   ├── admin/
│   │   │   └── page.tsx               ← login Supabase Auth
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── public/
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ServicesCarousel.tsx   ← scroll-snap + botones + drag/swipe
│   │   │   ├── ServiceCard.tsx        ← link vía buildServiceHref(slug)
│   │   │   ├── EventsCarousel.tsx     ← mismo patrón visual que ServicesCarousel
│   │   │   ├── EventCard.tsx          ← reusa estilos de ServiceCard (.svc-* + modificador evt-)
│   │   │   ├── WhyUs.tsx
│   │   │   ├── QuoteForm.tsx
│   │   │   ├── WhatsAppFAB.tsx
│   │   │   └── Footer.tsx
│   │   ├── edit-mode/
│   │   │   ├── EditModeProvider.tsx   ← contexto de sesión / modo edición
│   │   │   └── ImageEditOverlay.tsx   ← botones +/✕ sobre imágenes
│   │   └── ui/
│   │       └── Reveal.tsx             ← wrapper scroll-reveal (IntersectionObserver)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── whatsapp.ts                ← buildWhatsAppURL
│   │   └── service-links.ts           ← buildServiceHref(slug)
│   └── types/
│       └── index.ts
├── supabase/
│   └── migrations/
├── public/
├── .env.local
├── .gitignore
├── next.config.ts
└── wrangler.toml
```

---

## Fuera de scope (por ahora — documentado para sumar después)

- Stats strip
- **Páginas de detalle por servicio/evento** (`/servicios/[slug]`) — el helper `buildServiceHref` ya deja la puerta abierta. Cliente mostró referencia de estructura para esa página futura (layout, no estilo — la visual debe ser la de este mockup, no la de la referencia):
  - Hero: imagen del servicio + breadcrumb + badge categoría + título + tagline
  - Fila de datos clave (ej. duración, capacidad) — **sin precio/monto base**, decisión explícita del cliente (igual que en las cards del carrusel)
  - Descripción larga
  - Grid de "Características" (ícono + título + texto corto, varias por servicio)
  - Sidebar sticky: mini-resumen del servicio + botones "Solicitar cotización" / "Consultar por WhatsApp" + lista "¿Qué incluye?"
  - Galería de imágenes del servicio
  - FAQ en acordeón
  - Construir reusando el sistema visual ya validado (`.svc-*`, paleta, tipografía, fondos traslúcidos) — no es un rediseño
- Dashboard admin con CRUD completo (texto de servicios, ajustes, tema estacional)
- Versión mobile del admin
- Estadísticas / analytics
- Integración con redes sociales
- Pagos online
