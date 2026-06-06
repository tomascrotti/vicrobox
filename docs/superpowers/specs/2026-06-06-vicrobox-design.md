# Vicrobox — Design Spec
**Fecha:** 2026-06-06

## Resumen

Sitio web responsivo para Vicrobox Entretenimiento (Buenos Aires), empresa de servicios para eventos: fotocabinas, stand de glitter, cabina espejada, túnel LED, etc. Incluye panel de administración para que el dueño gestione servicios, eventos destacados y configuración del sitio.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 App Router + TypeScript |
| Estilos | Tailwind CSS |
| Backend/DB | Supabase (Postgres + Auth + Storage) |
| Deploy | Cloudflare Pages via `@opennextjs/cloudflare` |
| Fuentes | Fredoka One (display/logo) + Nunito (cuerpo) |

---

## Branches y Deploy

| Branch | Entorno | Acceso |
|--------|---------|--------|
| `main` | Producción | URL pública |
| `develop` | Preview/Testing | URL privada (no indexada) |

Ambas branches tienen deploy automático en Cloudflare Pages. `develop` es para testing antes de mergear a `main`.

---

## Rutas

### Públicas
```
/                          → Home
/servicios                 → Grilla de servicios
/servicios/[slug]          → Detalle de servicio + imágenes de ejemplo
/eventos                   → Galería filtrable de eventos destacados
/eventos/[slug]            → Detalle de evento + fotos
```

### Admin (protegidas por Supabase Auth middleware)
```
/admin                     → Login (email + contraseña)
/admin/dashboard           → Panel principal
/admin/servicios           → CRUD de servicios
/admin/servicios/[id]      → Editar servicio + subir imágenes
/admin/eventos             → CRUD de eventos destacados
/admin/eventos/[id]        → Editar evento + subir fotos + asignar tags
/admin/ajustes             → Número WhatsApp + tema estacional activo
```

El admin está diseñado para uso desktop. No se optimiza para mobile.

---

## Modelo de datos (Supabase)

```sql
services
  id          uuid PK
  name        text
  slug        text unique
  description text
  icon        text          -- nombre ícono SVG
  color       text          -- color acento hex
  active      boolean
  order       integer       -- orden en carrusel homepage
  created_at  timestamptz

service_images
  id          uuid PK
  service_id  uuid FK → services
  url         text          -- URL Supabase Storage
  order       integer
  created_at  timestamptz

events
  id          uuid PK
  name        text
  slug        text unique
  event_type  text          -- casamiento | cumpleaños | corporativo | otro
  description text
  date        date
  active      boolean
  created_at  timestamptz

event_images
  id          uuid PK
  event_id    uuid FK → events
  url         text
  order       integer
  created_at  timestamptz

event_services                    -- relación N:M evento ↔ servicios
  event_id    uuid FK → events
  service_id  uuid FK → services
  PRIMARY KEY (event_id, service_id)

settings
  key         text PK       -- 'whatsapp_number' | 'active_theme'
  value       text
  updated_at  timestamptz
```

### Storage buckets
```
services-images/    → fotos de ejemplo por servicio
events-images/      → fotos de eventos destacados
```

---

## Páginas públicas — comportamiento

### Home (`/`)
- **Hero:** partículas flotantes, wordmark multicolor, tagline, dos CTAs ("¡Cotizá tu evento!" → scroll a formulario, "Ver servicios" → `/servicios`)
- **Carrusel de servicios:** dinámico desde Supabase, solo `active = true`, ordenado por `order`
- **Stats strip:** +500 eventos, servicios disponibles, 100% satisfechos, 24/7
- **Por qué elegirnos:** 4 items con ícono
- **Formulario de cotización:** campos — nombre, servicios (multi-select dinámico desde Supabase), fecha, cantidad de invitados, ubicación, mensaje opcional. Botón "Enviar por WhatsApp" → genera URL `wa.me/{whatsapp_number}?text={mensaje_url_encoded}` y la abre en nueva pestaña
- **WhatsApp FAB:** botón flotante siempre visible en todas las páginas públicas
- **Seasonal overlay:** si `settings.active_theme !== 'default'`, renderiza decoraciones temáticas (copos de nieve, luces navideñas, etc.)

### Servicios (`/servicios`)
- Grilla de todas las cards de servicios activos
- Cada card linkea a `/servicios/[slug]`

### Detalle de servicio (`/servicios/[slug]`)
- Nombre, descripción, galería de imágenes de ejemplo
- Botón "Cotizar este servicio" → Home con servicio pre-seleccionado en el form

### Eventos destacados (`/eventos`)
- Grilla de eventos con filtros client-side:
  - Por tipo de evento (casamiento, cumpleaños, corporativo, otro)
  - Por servicio usado (tags dinámicos desde Supabase)
- Filtros combinables

### Detalle de evento (`/eventos/[slug]`)
- Nombre, fecha, tipo, servicios usados (como tags)
- Galería de fotos del evento

---

## Admin — comportamiento

### Login (`/admin`)
- Email + contraseña vía Supabase Auth
- Redirect a `/admin/dashboard` si ya está logueado
- Middleware protege todas las rutas `/admin/*` excepto `/admin` (login)

### Servicios
- Lista con toggle activo/inactivo, drag para reordenar
- Crear: nombre, slug (auto desde nombre), descripción, color acento, ícono
- Imágenes: drag & drop → upload a Supabase Storage, reordenar, eliminar
- Al guardar: actualiza Supabase, el carrusel del home refleja el cambio en la próxima visita

### Eventos destacados
- Lista con toggle activo/inactivo
- Crear: nombre, slug, tipo de evento, fecha, descripción
- Tags de servicios: multi-select de los servicios existentes
- Fotos: drag & drop → upload, reordenar, eliminar

### Ajustes
- Campo: número de WhatsApp (con preview del link generado)
- Toggle de tema estacional: Ninguno | Navidad | Halloween

---

## Design system

### Colores
```
--orange: #F07820
--yellow: #F5C420
--green:  #28C44A
--blue:   #1A52C8
--teal:   #00B898
--black:  #0D0D0D
--s1:     #181818   (fondo secciones alternas)
--s2:     #1E1E1E   (cards)
--muted:  rgba(255,255,255,0.55)
```

### Fuentes
- Display/Logo: `Fredoka One`
- Cuerpo: `Nunito` (weights: 400, 500, 600, 700, 800, 900)

### Referencia visual
- Base: `_staging/designs/index.html` (layout, colores, tipografía)
- Elementos a incorporar de `_staging/designs/VicroBox.html`: páginas de galería, detalle de servicio, formulario de cotización, WhatsApp FAB

---

## Estructura de directorios

```
vicrobox/
├── _staging/                        ← gitignored
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── servicios/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   └── eventos/
│   │   │       ├── page.tsx
│   │   │       └── [slug]/page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── servicios/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── eventos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── ajustes/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── public/
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ServicesCarousel.tsx
│   │   │   ├── ServiceCard.tsx
│   │   │   ├── StatsStrip.tsx
│   │   │   ├── WhyUs.tsx
│   │   │   ├── CTABanner.tsx
│   │   │   ├── QuoteForm.tsx
│   │   │   ├── WhatsAppFAB.tsx
│   │   │   ├── EventsGallery.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── SeasonalOverlay.tsx
│   │   ├── admin/
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── ServiceForm.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── ImageUploader.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Toggle.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── whatsapp.ts
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

## Fuera de scope (por ahora)

- Galería de eventos: estructura lista, se activa cuando el cliente decida
- Versión mobile del admin
- Estadísticas / analytics
- Integración con redes sociales (Instagram feed)
- Pagos online
