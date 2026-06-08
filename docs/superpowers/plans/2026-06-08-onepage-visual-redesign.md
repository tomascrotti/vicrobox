# Vicrobox One-Page Visual Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing public page from the old multi-page/grey design to the new validated one-page design — warm palette, image-based service cards, centralized wordmark, "Eventos Destacados" carousel section, translucent party-photo section backgrounds — and remove the pieces the client explicitly cut (Stats strip, seasonal overlay, separate CTA banner).

**Architecture:** Pure visual refactor of the existing public page. Infra (Cloudflare, Supabase, routing, data layer, `events`/`event_images`/`event_services` schema) is already wired and working — none of it changes. This is swapping component bodies/styles to match the validated mockup, plus one small migration (`services.tagline`).

**Tech Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 (`@theme` tokens) + Supabase + Vitest/Testing Library.

---

## Context: current vs. target

The codebase currently implements an **older** spec (multi-page, grey palette, icon-based service cards, Stats strip, seasonal overlay, dead links to `/servicios` `/eventos`). The validated mockup (`docs/superpowers/specs/2026-06-07-vicrobox-onepage-design.md`) replaces all of that visually — not structurally.

**Reference for every value below:** `.superpowers/brainstorm/1842-1780848428/content/wordmark-colors-v5.html` (source-of-truth mockup HTML, already inspected — every hex/class/copy here comes straight from it).

## Out of scope (separate plan later)

- Admin/edit-mode (`/admin`, `EditModeProvider`, `ImageEditOverlay`) — never visually validated, independent subsystem.
- `/servicios/[slug]` and `/eventos/[slug]` detail pages — explicitly deferred.
- `settings.active_theme` — DB column/seed stay; we just stop rendering the (incomplete) `SeasonalOverlay`.

---

## File structure (new/changed)

```
src/
├── app/
│   ├── globals.css                          ← palette tokens + section bg classes
│   └── (public)/
│       ├── layout.tsx                       ← drop SeasonalOverlay
│       └── page.tsx                         ← drop Stats/CTABanner, add Eventos section
├── components/
│   ├── ui/Wordmark.tsx + __tests__           ← CREATE — single source of truth for the logo
│   └── public/
│       ├── Header.tsx, Hero.tsx              ← MODIFY
│       ├── ServiceCard.tsx                   ← REWRITE (image-top layout)
│       ├── CardCarousel.tsx                  ← CREATE — shared shell (services + events)
│       ├── ServicesCarousel.tsx              ← REWRITE (thin wrapper)
│       ├── EventCard.tsx, EventsCarousel.tsx ← CREATE
│       ├── WhyUs.tsx, Footer.tsx             ← MODIFY
│       └── StatsStrip.tsx, SeasonalOverlay.tsx, CTABanner.tsx  ← DELETE
├── lib/
│   ├── service-links.ts + event-display.ts + __tests__ ← CREATE
│   └── ...
└── types/index.ts                            ← add optional Service.tagline

supabase/migrations/20260608000000_service_tagline.sql  ← CREATE
```

---

## Validated design values (use exactly — taken from the mockup)

**Palette:**
```
--color-orange:  #EA7C03   (was #F07820)
--color-yellow:  #F8BD19   (was #F5C420)
--color-teal:    #079684   (was #00B898)
--color-bg-main: #120F0A   (was #0D0D0D)
--color-s1:      #1C170F   (was #181818)
--color-s2:      #251E13   (was #1E1E1E)
```
`--color-vg`/`--color-vb` (green/blue) stay — functional `WhyUs` icon accents, not brand identity.

**Wordmark** (canonical 3-segment coloring):
```
"VI" → #F8BD19 (yellow)   "CRO" → #079684 (teal)   "BOX" → #EA7C03 (orange)
```

**Section translucent backgrounds:** `linear-gradient(rgba(<base>,0.90),rgba(<base>,0.90)), url(<photo>)`, `cover`/`center`. URLs in Task 1.

---

### Task 1: Palette + section backgrounds (`globals.css`)

**Files:** Modify `src/app/globals.css`

- [ ] **Step 1:** Replace the `@theme` color block (lines 5-13):
```css
@theme {
  --color-orange: #EA7C03;
  --color-yellow: #F8BD19;
  --color-vg: #28C44A;
  --color-vb: #1A52C8;
  --color-teal: #079684;
  --color-bg-main: #120F0A;
  --color-s1: #1C170F;
  --color-s2: #251E13;
```

- [ ] **Step 2:** Append a `@layer components` block at the end of the file with the three section backgrounds:
```css
@layer components {
  .section-bg-servicios {
    background-image: linear-gradient(rgba(28, 23, 15, 0.9), rgba(28, 23, 15, 0.9)),
      url('https://images.unsplash.com/photo-1496337589254-7e19d01cec44?q=80&w=1600&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
  }
  .section-bg-nosotros {
    background-image: linear-gradient(rgba(18, 15, 10, 0.9), rgba(18, 15, 10, 0.9)),
      url('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1600&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
  }
  .section-bg-eventos {
    background-image: linear-gradient(rgba(28, 23, 15, 0.9), rgba(28, 23, 15, 0.9)),
      url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
  }
}
```
(`rgba(28,23,15,*)` = `--color-s1`; `rgba(18,15,10,*)` = `--color-bg-main` — raw rgba because `@theme` vars aren't usable inside `linear-gradient()` stops here.)

- [ ] **Step 3:** `npm test` → PASS. Commit:
```bash
git add src/app/globals.css
git commit -m "style: warm brand palette + translucent section backgrounds (validated mockup)"
```

---

### Task 2: Shared lib helpers — Wordmark, link/display helpers, tagline migration

Bundles everything that's "small reusable piece with a test" — centralized logo, the extensibility hook for future service-detail links, and the derived display strings for event cards.

**Files:**
- Create: `src/components/ui/Wordmark.tsx` + `__tests__/Wordmark.test.tsx`
- Create: `src/lib/service-links.ts`, `src/lib/event-display.ts` + tests
- Create: `supabase/migrations/20260608000000_service_tagline.sql`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Wordmark — write test then component**

```tsx
// @vitest-environment jsdom
// src/components/ui/__tests__/Wordmark.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Wordmark } from '@/components/ui/Wordmark'

describe('Wordmark', () => {
  it('renders the full "VICROBOX" mark', () => {
    render(<Wordmark />)
    expect(screen.getByLabelText('Vicrobox')).toHaveTextContent('VICROBOX')
  })

  it('colors the three brand segments per the validated mockup palette', () => {
    render(<Wordmark />)
    const spans = screen.getByLabelText('Vicrobox').querySelectorAll('span')
    expect(spans[0]).toHaveStyle({ color: '#F8BD19' }) // "VI"
    expect(spans[1]).toHaveStyle({ color: '#079684' }) // "CRO"
    expect(spans[2]).toHaveStyle({ color: '#EA7C03' }) // "BOX"
  })
})
```

```tsx
// src/components/ui/Wordmark.tsx
const SEGMENTS = [
  { text: 'VI', color: '#F8BD19' },
  { text: 'CRO', color: '#079684' },
  { text: 'BOX', color: '#EA7C03' },
] as const

type WordmarkProps = { className?: string }

/**
 * Single source of truth for the "VICROBOX" logo coloring — validated
 * live with the client. Don't reintroduce per-usage color arrays.
 */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={className} aria-label="Vicrobox">
      {SEGMENTS.map(({ text, color }) => (
        <span key={text} style={{ color }}>{text}</span>
      ))}
    </span>
  )
}
```

- [ ] **Step 2: `buildServiceHref` — write test then implementation**

```ts
// src/lib/__tests__/service-links.test.ts
import { describe, it, expect } from 'vitest'
import { buildServiceHref } from '@/lib/service-links'

describe('buildServiceHref', () => {
  it('points every service at the quote anchor (no detail pages yet)', () => {
    expect(buildServiceHref('fotocabina')).toBe('#cta')
    expect(buildServiceHref('cabina-espejada')).toBe('#cta')
  })
})
```

```ts
// src/lib/service-links.ts

/**
 * Centralized link-builder for service cards. Today every service
 * links to the quote form. The day `/servicios/[slug]` exists, change
 * ONLY this function — ServiceCard and the carousel never need to change.
 */
export function buildServiceHref(_slug: string): string {
  return '#cta'
}
```

- [ ] **Step 3: `event-display` helpers — write test then implementation**

```ts
// src/lib/__tests__/event-display.test.ts
import { describe, it, expect } from 'vitest'
import { eventBadge, eventTagline } from '@/lib/event-display'

describe('eventBadge', () => {
  it('combines the human-readable event type with the event name', () => {
    expect(eventBadge({ event_type: 'casamiento', name: 'Caro & Juan' })).toBe('Casamiento · Caro & Juan')
  })
  it('falls back to "Evento" for the catch-all type', () => {
    expect(eventBadge({ event_type: 'otro', name: 'Lanzamiento ABC' })).toBe('Evento · Lanzamiento ABC')
  })
})

describe('eventTagline', () => {
  it('joins the names of the services used in the event', () => {
    expect(
      eventTagline({ services: [{ id: '1', name: 'Fotocabina' } as never, { id: '2', name: 'Cabina Espejada' } as never] })
    ).toBe('Fotocabina + Cabina Espejada')
  })
  it('falls back to a generic line when no services are linked', () => {
    expect(eventTagline({ services: [] })).toBe('Entretenimiento Vicrobox')
    expect(eventTagline({})).toBe('Entretenimiento Vicrobox')
  })
})
```

```ts
// src/lib/event-display.ts
import type { Event, EventType, Service } from '@/types'

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  casamiento: 'Casamiento',
  cumpleaños: 'Cumpleaños',
  corporativo: 'Corporativo',
  otro: 'Evento',
}

export function eventBadge(event: Pick<Event, 'event_type' | 'name'>): string {
  return `${EVENT_TYPE_LABELS[event.event_type]} · ${event.name}`
}

export function eventTagline(event: { services?: Pick<Service, 'name'>[] }): string {
  const names = (event.services ?? []).map((s) => s.name)
  return names.length > 0 ? names.join(' + ') : 'Entretenimiento Vicrobox'
}
```

- [ ] **Step 4: `services.tagline` — migration + type**

```sql
-- supabase/migrations/20260608000000_service_tagline.sql
alter table services add column tagline text not null default '';
update services set tagline = 'Recuerdos impresos al instante' where slug = 'fotocabina';
```

In `src/types/index.ts`, add `tagline?: string` to the `Service` type, right after `description`:
```ts
export type Service = {
  id: string
  name: string
  slug: string
  description: string
  tagline?: string
  icon: string
  color: string
  active: boolean
  order: number
  created_at: string
  images?: ServiceImage[]
}
```

Apply the migration: `npx supabase migration up` (or whatever command this project's Supabase setup already uses — check existing docs, infra is already wired).

- [ ] **Step 5: Run everything, commit as one unit**

Run: `npm test` → PASS (all new + existing suites)
```bash
git add src/components/ui/Wordmark.tsx src/components/ui/__tests__/Wordmark.test.tsx \
        src/lib/service-links.ts src/lib/event-display.ts src/lib/__tests__/service-links.test.ts src/lib/__tests__/event-display.test.ts \
        supabase/migrations/20260608000000_service_tagline.sql src/types/index.ts
git commit -m "feat: add Wordmark, buildServiceHref, event-display helpers + services.tagline column"
```

---

### Task 3: Card system — `ServiceCard`, shared `CardCarousel`, `EventCard`/`EventsCarousel`

This is the visual core: image-top cards (replacing icon-based ones) and a shared carousel shell so Servicios and the new Eventos Destacados look and behave identically by construction (DRY — not copy-paste).

**Critical detail from the mockup iteration:** carousel wrapper needs `overflow-x: hidden` + `overflow-y: visible` (two separate axes — NOT one `overflow: hidden`). A single `overflow:hidden` clips the card hover lift+glow — a bug the client explicitly flagged and that got permanently fixed in the mockup. Don't reintroduce it.

**Files:**
- Rewrite: `src/components/public/ServiceCard.tsx`
- Create: `src/components/public/CardCarousel.tsx`
- Rewrite: `src/components/public/ServicesCarousel.tsx`
- Create: `src/components/public/EventCard.tsx`, `src/components/public/EventsCarousel.tsx`

- [ ] **Step 1: Rewrite `ServiceCard`**

```tsx
// src/components/public/ServiceCard.tsx
import Link from 'next/link'
import { buildServiceHref } from '@/lib/service-links'
import type { Service } from '@/types'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop'

type ServiceCardProps = { service: Service }

export function ServiceCard({ service }: ServiceCardProps) {
  const cover = service.images?.[0]?.url ?? PLACEHOLDER_IMAGE
  const tagline = service.tagline || service.name

  return (
    <article className="h-full flex flex-col bg-s2 rounded-[20px] overflow-hidden border border-white/7 transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:scale-[1.01]">
      <div
        className="relative h-[200px] flex-shrink-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${cover}')` }}
      >
        <span
          className="absolute top-4 left-4 inline-flex items-center rounded-full px-3.5 py-2 text-[13px] font-bold text-white"
          style={{ background: 'rgba(12,12,16,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
          {service.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6 pb-7">
        <p className="text-[15px] font-extrabold leading-tight" style={{ color: service.color }}>{tagline}</p>
        <p className="flex-1 text-sm font-medium leading-relaxed text-white/55">{service.description}</p>
        <Link
          href={buildServiceHref(service.slug)}
          className="inline-flex w-fit items-center gap-1 text-[13px] font-extrabold transition-[gap] hover:gap-2"
          style={{ color: service.color }}
        >
          Ver detalle →
        </Link>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Create `CardCarousel` (shared shell), then thin `ServicesCarousel`**

```tsx
// src/components/public/CardCarousel.tsx
'use client'

import { useRef, type ReactNode } from 'react'

type CardCarouselProps<T> = {
  items: T[]
  getKey: (item: T) => string
  renderCard: (item: T) => ReactNode
  ariaLabel: string
}

const NAV_BUTTON_CLASS =
  'flex h-11 w-11 items-center justify-center rounded-full border border-white/16 bg-s2 text-white transition-colors duration-150 hover:border-white/32 hover:bg-white/8'

export function CardCarousel<T>({ items, getKey, renderCard, ariaLabel }: CardCarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null)

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('[data-card]')
    const step = (card?.offsetWidth ?? track.clientWidth / 3) + 18
    track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <div className="-mx-12 overflow-x-hidden overflow-y-visible px-12">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-[18px] overflow-x-auto overflow-y-visible scroll-smooth pt-6 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div key={getKey(item)} data-card className="w-[calc((100%-36px)/3)] max-[880px]:w-[calc((100%-18px)/2)] flex-none snap-start">
            {renderCard(item)}
          </div>
        ))}
      </div>
      <nav className="mt-2 flex justify-center gap-2.5" aria-label={ariaLabel}>
        <button type="button" onClick={() => scrollByCard(-1)} aria-label="Anteriores" className={NAV_BUTTON_CLASS}>‹</button>
        <button type="button" onClick={() => scrollByCard(1)} aria-label="Siguientes" className={NAV_BUTTON_CLASS}>›</button>
      </nav>
    </div>
  )
}
```

```tsx
// src/components/public/ServicesCarousel.tsx
import { CardCarousel } from './CardCarousel'
import { ServiceCard } from './ServiceCard'
import type { Service } from '@/types'

export function ServicesCarousel({ services }: { services: Service[] }) {
  return (
    <CardCarousel
      items={services}
      getKey={(service) => service.id}
      renderCard={(service) => <ServiceCard service={service} />}
      ariaLabel="Carrusel de servicios"
    />
  )
}
```

- [ ] **Step 3: `EventCard` + `EventsCarousel`**

```tsx
// src/components/public/EventCard.tsx
import { eventBadge, eventTagline } from '@/lib/event-display'
import type { Event } from '@/types'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=600&auto=format&fit=crop'

export function EventCard({ event }: { event: Event }) {
  const cover = event.images?.[0]?.url ?? PLACEHOLDER_IMAGE

  return (
    <article className="h-full flex flex-col bg-s2 rounded-[20px] overflow-hidden border border-white/7 transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:scale-[1.01]">
      <div className="relative h-[200px] flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url('${cover}')` }}>
        <span
          className="absolute top-4 left-4 inline-flex items-center rounded-full px-3.5 py-2 text-[13px] font-bold text-white"
          style={{ background: 'rgba(12,12,16,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
          {eventBadge(event)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6 pb-7">
        <p className="text-[15px] font-extrabold leading-tight text-orange">{eventTagline(event)}</p>
        <p className="flex-1 text-sm font-medium leading-relaxed text-white/55">{event.description}</p>
        <a href="#cta" className="inline-flex w-fit items-center gap-1 text-[13px] font-extrabold text-orange transition-[gap] hover:gap-2">Ver más →</a>
      </div>
    </article>
  )
}
```

```tsx
// src/components/public/EventsCarousel.tsx
import { CardCarousel } from './CardCarousel'
import { EventCard } from './EventCard'
import type { Event } from '@/types'

export function EventsCarousel({ events }: { events: Event[] }) {
  return (
    <CardCarousel
      items={events}
      getKey={(event) => event.id}
      renderCard={(event) => <EventCard event={event} />}
      ariaLabel="Carrusel de eventos destacados"
    />
  )
}
```

- [ ] **Step 4: Run tests, commit as one unit**

Run: `npm test` → PASS
```bash
git add src/components/public/ServiceCard.tsx src/components/public/CardCarousel.tsx \
        src/components/public/ServicesCarousel.tsx src/components/public/EventCard.tsx src/components/public/EventsCarousel.tsx
git commit -m "refactor: image-top ServiceCard + shared CardCarousel shell + EventCard/EventsCarousel"
```

---

### Task 4: Header + Hero polish

**Files:** Rewrite `Header.tsx`, modify `Hero.tsx`

- [ ] **Step 1: Rewrite `Header`** — centralized `<Wordmark>`, anchors instead of dead `/servicios` `/eventos` routes, scroll-triggered solid background, responsive "Cotiza tu evento"/"Cotiza" + hidden text links below 760px (the client's narrow-screen concern, validated in the mockup):

```tsx
// src/components/public/Header.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wordmark } from '@/components/ui/Wordmark'

const NAV_LINK_CLASS =
  'hidden whitespace-nowrap text-sm font-bold text-white/70 transition-colors hover:text-white min-[760px]:inline'

export function Header() {
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    function onScroll() { setSolid(window.scrollY > 40) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between gap-6 border-b px-6 py-4 transition-colors duration-200 md:px-12 ${
        solid ? 'border-white/8 bg-bg-main/90 backdrop-blur-md' : 'border-transparent bg-transparent'
      }`}
    >
      <Link href="#inicio" className="flex flex-shrink-0 items-center font-display text-2xl" aria-label="Vicrobox — Inicio">
        <Wordmark />
      </Link>
      <nav className="flex items-center gap-6">
        <Link href="#servicios" className={NAV_LINK_CLASS}>Servicios</Link>
        <Link href="#nosotros" className={NAV_LINK_CLASS}>Nosotros</Link>
        <Link href="#eventos-destacados" className={NAV_LINK_CLASS}>Eventos</Link>
        <Link
          href="#cta"
          className="rounded-full bg-orange px-5 py-2.5 text-sm font-extrabold whitespace-nowrap text-white shadow-[0_0_18px_rgba(234,124,3,0.30)] transition-all hover:scale-[1.03] hover:bg-[#D06B00]"
        >
          <span className="hidden min-[760px]:inline">Cotiza tu evento</span>
          <span className="inline min-[760px]:hidden">Cotiza</span>
        </Link>
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: Hero — add 3 brand-accent sparkles, drop the scroll-hint SVG**

In the `SPARKLES` array, append (keep all 9 existing entries as-is — they got no change feedback):
```ts
  { left: '30%', top: '12%', color: '#EA7C03', size: '13px', delay: '1.1s' },
  { left: '58%', top: '50%', color: '#F8BD19', size: '10px', delay: '2.3s' },
  { left: '18%', top: '85%', color: '#079684', size: '14px', delay: '0.7s' },
```

Replace the scroll-hint block (it currently wraps an SVG icon — client said *"saca el svg de scroll"*, keep plain text):
```tsx
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/20 text-[11px] font-bold tracking-[0.14em] uppercase animate-[bob_2s_ease-in-out_infinite]" aria-hidden="true">
        Scroll
      </div>
```
(deleting the `<svg>...</svg>` block that was inside it)

- [ ] **Step 3:** `npm test` → PASS. Commit:
```bash
git add src/components/public/Header.tsx src/components/public/Hero.tsx
git commit -m "refactor: Header (centralized Wordmark, anchors, scroll-solid, responsive CTA) + Hero polish"
```

---

### Task 5: Wire it all together — WhyUs/Footer updates, page assembly, delete cut sections

**Files:**
- Modify: `WhyUs.tsx`, `Footer.tsx`, `(public)/page.tsx`, `(public)/layout.tsx`
- Delete: `StatsStrip.tsx`, `CTABanner.tsx`, `SeasonalOverlay.tsx`

- [ ] **Step 1: `WhyUs`** — add the `#nosotros` anchor id (Header now links to it, section currently has none) and the translucent background:

Change `<section className="py-24 px-6">` to `<section id="nosotros" className="section-bg-nosotros px-6 py-24">`

- [ ] **Step 2: `Footer`** — replace the duplicated rainbow wordmark with `<Wordmark>`, point dead-route links at in-page anchors:

Remove `LETTER_COLORS`/`WORDMARK` constants, add `import { Wordmark } from '@/components/ui/Wordmark'`, replace the logo `<Link>` body with `<Wordmark />`. Replace every `href="/servicios"` → `href="#servicios"`, `href="/eventos"` → `href="#eventos-destacados"`, `href="/#cotizar"` → `href="#cta"` (matches the quote section's actual id — verify against `QuoteForm.tsx` if it differs).

- [ ] **Step 3: Rewrite `page.tsx`** — drop `StatsStrip`/`CTABanner`, add the `#servicios` translucent-bg wrapper with copy from the mockup, insert the new Eventos Destacados section between WhyUs and the quote form:

```tsx
// src/app/(public)/page.tsx
import { Hero } from '@/components/public/Hero'
import { ServicesCarousel } from '@/components/public/ServicesCarousel'
import { WhyUs } from '@/components/public/WhyUs'
import { EventsCarousel } from '@/components/public/EventsCarousel'
import { QuoteForm } from '@/components/public/QuoteForm'
import { getActiveServices } from '@/lib/data/services'
import { getActiveEvents } from '@/lib/data/events'
import { getSettings } from '@/lib/data/settings'

export default async function HomePage() {
  const [services, events, settings] = await Promise.all([
    getActiveServices(),
    getActiveEvents(),
    getSettings(),
  ])

  return (
    <>
      <Hero />

      <section id="servicios" className="section-bg-servicios px-6 py-[100px]">
        <div className="mx-auto max-w-[1200px]">
          <span className="mb-2.5 block text-[11px] font-extrabold tracking-[0.22em] text-teal uppercase">Nuestros Servicios</span>
          <h2 className="mb-3.5 font-display text-3xl leading-tight md:text-4xl">Todo lo que necesitas<br />para tu evento</h2>
          <p className="mb-13 max-w-[520px] text-base font-medium leading-relaxed text-white/55">
            Desde fotocabinas profesionales hasta instalaciones de luz LED, tenemos todo para hacer brillar tu celebración.
          </p>
          <ServicesCarousel services={services} />
        </div>
      </section>

      <WhyUs />

      <section id="eventos-destacados" className="section-bg-eventos px-6 py-[100px]">
        <div className="mx-auto max-w-[1200px]">
          <span className="mb-2.5 block text-[11px] font-extrabold tracking-[0.22em] text-teal uppercase">Eventos Destacados</span>
          <h2 className="mb-3.5 font-display text-3xl leading-tight md:text-4xl">Momentos que ya<br />hicimos brillar</h2>
          <p className="mb-13 max-w-[520px] text-base font-medium leading-relaxed text-white/55">
            Una muestra de los eventos donde pusimos nuestro equipo, nuestra energía y muchas ganas de divertirnos.
          </p>
          <EventsCarousel events={events} />
        </div>
      </section>

      <QuoteForm services={services} whatsappNumber={settings.whatsapp_number} />
    </>
  )
}
```

- [ ] **Step 4: `(public)/layout.tsx`** — drop `SeasonalOverlay` import and `<SeasonalOverlay theme={settings.active_theme} />` (keep `getSettings()` — `whatsapp_number` still feeds `QuoteForm`/`WhatsAppFAB`; `active_theme` just goes unused, its DB row stays for a possible future feature).

- [ ] **Step 5: Delete the cut components and verify nothing references them**

```bash
git rm src/components/public/StatsStrip.tsx src/components/public/CTABanner.tsx src/components/public/SeasonalOverlay.tsx
```
Run: `grep -rn "StatsStrip\|CTABanner\|SeasonalOverlay" src/` → expect no output

- [ ] **Step 6: Run full suite, commit as one unit**

Run: `npm test` → PASS
```bash
git add src/components/public/WhyUs.tsx src/components/public/Footer.tsx \
        "src/app/(public)/page.tsx" "src/app/(public)/layout.tsx"
git commit -m "refactor: assemble redesigned homepage — Eventos section wired in, Stats/CTABanner/SeasonalOverlay removed"
```

---

### Task 6: Final verification

- [ ] **Step 1:** `npm test` → PASS
- [ ] **Step 2:** `npm run lint` → no errors
- [ ] **Step 3:** `npm run build` → succeeds
- [ ] **Step 4:** `npm run dev`, open homepage, compare against the mockup (`wordmark-colors-v5.html` / last published `wordmark-colors-v12.html`):
  - Header: 3-color wordmark, anchors scroll correctly, "Cotiza"-only below ~760px, solid bg after ~40px scroll
  - Hero: 12 sparkles (3 in new accents), "Scroll" with no icon
  - Servicios: translucent bg, image-top cards, nav buttons centered below grid (no animation), hover lift not clipped
  - Nosotros: translucent bg, unchanged content
  - Eventos Destacados: renders between Nosotros and quote form, same card chrome, badge "Tipo · Nombre", tagline = joined service names
  - Footer: single wordmark, all links scroll in-page (no 404s)
- [ ] **Step 5:** Report back. No commit — verification only; fix anything off-spec in its owning task's files and amend/follow-up commit.

---

## Self-review notes

- **Spec coverage:** palette+bg ✓ T1, Wordmark/links/event-display/tagline ✓ T2, image cards+carousel+no-clip-bug+events ✓ T3, header/hero ✓ T4, page assembly+cleanup ✓ T5, verification ✓ T6.
- **Type consistency:** `buildServiceHref(slug: string)`, `eventBadge({event_type, name})`, `eventTagline({services?})` match across `ServiceCard`/`EventCard`.
- **No placeholders:** every value (hex, URLs, copy) is lifted directly from the validated mockup HTML.
