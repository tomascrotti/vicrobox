# Vicrobox — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repo listo para desarrollar: Next.js 15 inicializado, Tailwind con design tokens, Supabase schema + RLS + Storage, clientes Supabase, tipos TypeScript, utilitario WhatsApp testeado, Cloudflare configurado, branch develop creado.

**Architecture:** Next.js 15 App Router en repo existente. Supabase como BaaS (DB + Auth + Storage). Deploy via `@cloudflare/next-on-pages` a Cloudflare Pages (main=prod, develop=preview).

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v3, @supabase/ssr v0.5, @cloudflare/next-on-pages, Vitest

---

## Files que crea este plan

```
src/
  app/
    layout.tsx                 → Root layout con fuentes y metadata
    globals.css                → CSS vars + Tailwind directives
  lib/
    supabase/
      client.ts                → Supabase browser client
      server.ts                → Supabase server client (async cookies)
    whatsapp.ts                → buildWhatsAppURL utility
  types/
    index.ts                   → Tipos compartidos (Service, Event, Settings)
supabase/
  migrations/
    20260606000000_schema.sql  → Tablas + seed
    20260606000001_rls.sql     → RLS policies
    20260606000002_storage.sql → Storage buckets + policies
tailwind.config.ts             → Design tokens
next.config.ts                 → Remote images Supabase
wrangler.toml                  → Cloudflare Pages config
.env.local                     → Variables de entorno (gitignored)
vitest.config.ts               → Config de tests
```

---

## Task 1: Inicializar Next.js en el repo existente

**Files:**
- Create: todos los archivos de Next.js en la raíz del repo

- [ ] **Step 1: Ejecutar create-next-app en el directorio actual**

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

Cuando pregunte si sobreescribir README.md, responder **No** (preservar el existente).

- [ ] **Step 2: Verificar que el servidor de desarrollo levanta**

```bash
npm run dev
```

Esperado: `✓ Ready in Xms` en `http://localhost:3000`. Abrirlo en el navegador — debe mostrar la página default de Next.js.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 15 App Router"
```

---

## Task 2: Crear branch develop

**Files:** ninguno (solo git)

- [ ] **Step 1: Crear y pushear branch develop**

```bash
git checkout -b develop
git push -u origin develop
```

- [ ] **Step 2: Volver a main para continuar el setup**

```bash
git checkout main
```

> A partir de acá: todo el trabajo se hace en `develop`. Solo se mergea a `main` cuando una feature está terminada y testeada.

- [ ] **Step 3: Cambiar a develop y continuar**

```bash
git checkout develop
```

---

## Task 3: Configurar Tailwind con design tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Reemplazar tailwind.config.ts**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange:  '#F07820',
        yellow:  '#F5C420',
        'vg':    '#28C44A',   // verde (evita conflicto con green de Tailwind)
        'vb':    '#1A52C8',   // azul
        teal:    '#00B898',
        'bg-main': '#0D0D0D',
        's1':    '#181818',
        's2':    '#1E1E1E',
        muted:   'rgba(255,255,255,0.55)',
      },
      fontFamily: {
        display: ['"Fredoka One"', 'cursive'],
        body:    ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Reemplazar globals.css**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --orange: #F07820;
    --yellow: #F5C420;
    --green:  #28C44A;
    --blue:   #1A52C8;
    --teal:   #00B898;
    --black:  #0D0D0D;
    --s1:     #181818;
    --s2:     #1E1E1E;
    --muted:  rgba(255, 255, 255, 0.55);
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Nunito', sans-serif;
    background-color: var(--black);
    color: white;
    overflow-x: hidden;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: configure Tailwind design tokens"
```

---

## Task 4: Actualizar root layout (fuentes + metadata)

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Reemplazar layout.tsx**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Fredoka_One, Nunito } from 'next/font/google'
import './globals.css'

const fredokaOne = Fredoka_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vicrobox Entretenimiento — Fotocabinas y más',
  description:
    'Fotocabinas, stand de glitter, cabina espejada, túnel LED y más para tu evento en Buenos Aires.',
  openGraph: {
    title: 'Vicrobox Entretenimiento',
    description: 'Tu evento, nuestro show.',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${fredokaOne.variable} ${nunito.variable}`}>
      <body className="font-body bg-bg-main text-white antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verificar que el dev server no rompe**

```bash
npm run dev
```

Esperado: página default sin errores en consola.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: configure root layout with Google Fonts and metadata"
```

---

## Task 5: Crear schema de Supabase (tablas + seed)

**Files:**
- Create: `supabase/migrations/20260606000000_schema.sql`

- [ ] **Step 1: Crear el archivo de migración**

```sql
-- supabase/migrations/20260606000000_schema.sql

create table services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text not null,
  icon        text not null default 'camera',
  color       text not null default '#F07820',
  active      boolean not null default true,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

create table service_images (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references services(id) on delete cascade,
  url         text not null,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

create table events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  event_type  text not null check (event_type in ('casamiento','cumpleaños','corporativo','otro')),
  description text not null default '',
  date        date,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table event_images (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  url         text not null,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

create table event_services (
  event_id    uuid not null references events(id) on delete cascade,
  service_id  uuid not null references services(id) on delete cascade,
  primary key (event_id, service_id)
);

create table settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now()
);

-- Seed: configuración inicial
insert into settings (key, value) values
  ('whatsapp_number', '5491100000000'),
  ('active_theme',    'default');

-- Seed: primer servicio
insert into services (name, slug, description, icon, color, active, "order") values
  (
    'Fotocabina',
    'fotocabina',
    'Capturá los mejores momentos con nuestra cabina fotográfica profesional de alta resolución y accesorios divertidos.',
    'camera',
    '#F07820',
    true,
    0
  );
```

- [ ] **Step 2: Ejecutar en Supabase Dashboard**

1. Ir a `https://supabase.com/dashboard` → tu proyecto → **SQL Editor**
2. Pegar el contenido del archivo
3. Click **Run**
4. Verificar que se crearon las 6 tablas en **Table Editor**

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema migration"
```

---

## Task 6: Configurar RLS y Storage buckets

**Files:**
- Create: `supabase/migrations/20260606000001_rls.sql`
- Create: `supabase/migrations/20260606000002_storage.sql`

- [ ] **Step 1: Crear migración RLS**

```sql
-- supabase/migrations/20260606000001_rls.sql

alter table services       enable row level security;
alter table service_images enable row level security;
alter table events         enable row level security;
alter table event_images   enable row level security;
alter table event_services enable row level security;
alter table settings       enable row level security;

-- Lectura pública para el sitio
create policy "public_read_services"       on services       for select using (true);
create policy "public_read_service_images" on service_images for select using (true);
create policy "public_read_events"         on events         for select using (true);
create policy "public_read_event_images"   on event_images   for select using (true);
create policy "public_read_event_services" on event_services for select using (true);
create policy "public_read_settings"       on settings       for select using (true);

-- Escritura solo para usuarios autenticados (admin)
create policy "auth_manage_services"       on services       for all using (auth.role() = 'authenticated');
create policy "auth_manage_service_images" on service_images for all using (auth.role() = 'authenticated');
create policy "auth_manage_events"         on events         for all using (auth.role() = 'authenticated');
create policy "auth_manage_event_images"   on event_images   for all using (auth.role() = 'authenticated');
create policy "auth_manage_event_services" on event_services for all using (auth.role() = 'authenticated');
create policy "auth_manage_settings"       on settings       for all using (auth.role() = 'authenticated');
```

- [ ] **Step 2: Ejecutar RLS en SQL Editor de Supabase**

Pegar y ejecutar `20260606000001_rls.sql` en el SQL Editor.
Verificar: Table Editor → cada tabla muestra el ícono de RLS activado.

- [ ] **Step 3: Crear migración Storage**

```sql
-- supabase/migrations/20260606000002_storage.sql

insert into storage.buckets (id, name, public) values
  ('services-images', 'services-images', true),
  ('events-images',   'events-images',   true);

-- Lectura pública
create policy "public_read_services_images" on storage.objects
  for select using (bucket_id = 'services-images');

create policy "public_read_events_images" on storage.objects
  for select using (bucket_id = 'events-images');

-- Upload solo autenticados
create policy "auth_upload_services_images" on storage.objects
  for insert with check (bucket_id = 'services-images' and auth.role() = 'authenticated');

create policy "auth_upload_events_images" on storage.objects
  for insert with check (bucket_id = 'events-images' and auth.role() = 'authenticated');

-- Delete solo autenticados
create policy "auth_delete_services_images" on storage.objects
  for delete using (bucket_id = 'services-images' and auth.role() = 'authenticated');

create policy "auth_delete_events_images" on storage.objects
  for delete using (bucket_id = 'events-images' and auth.role() = 'authenticated');
```

- [ ] **Step 4: Ejecutar Storage en SQL Editor**

Pegar y ejecutar `20260606000002_storage.sql`.
Verificar: **Storage** → dos buckets `services-images` y `events-images` aparecen como públicos.

- [ ] **Step 5: Commit**

```bash
git add supabase/
git commit -m "feat: add RLS policies and Storage buckets"
```

---

## Task 7: Instalar Supabase y crear clientes

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `.env.local`

- [ ] **Step 1: Instalar paquetes**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Crear .env.local con tus credenciales**

Obtener de Supabase Dashboard → Settings → API:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxx
```

- [ ] **Step 3: Verificar que .env.local está en .gitignore**

Agregar a `.gitignore` si no está:

```
.env.local
.env*.local
```

- [ ] **Step 4: Crear browser client**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 5: Crear server client**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 6: Verificar que el dev server no rompe**

```bash
npm run dev
```

Esperado: sin errores de compilación.

- [ ] **Step 7: Commit**

```bash
git add src/lib/supabase/ .gitignore
git commit -m "feat: add Supabase browser and server clients"
```

---

## Task 8: Definir tipos TypeScript compartidos

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Crear el archivo de tipos**

```typescript
// src/types/index.ts

export type Service = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  active: boolean
  order: number
  created_at: string
  images?: ServiceImage[]
}

export type ServiceImage = {
  id: string
  service_id: string
  url: string
  order: number
  created_at: string
}

export type EventType = 'casamiento' | 'cumpleaños' | 'corporativo' | 'otro'

export type Event = {
  id: string
  name: string
  slug: string
  event_type: EventType
  description: string
  date: string | null
  active: boolean
  created_at: string
  images?: EventImage[]
  services?: Service[]
}

export type EventImage = {
  id: string
  event_id: string
  url: string
  order: number
  created_at: string
}

export type ActiveTheme = 'default' | 'navidad' | 'halloween'

export type SiteSettings = {
  whatsapp_number: string
  active_theme: ActiveTheme
}

export type QuoteFormData = {
  name: string
  services: string[]       // nombres de servicios seleccionados
  date: string
  guests: number | ''
  location: string
  message?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/
git commit -m "feat: add shared TypeScript types"
```

---

## Task 9: Crear y testear buildWhatsAppURL

**Files:**
- Create: `src/lib/whatsapp.ts`
- Create: `src/lib/__tests__/whatsapp.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Instalar Vitest**

```bash
npm install -D vitest @vitest/coverage-v8
```

- [ ] **Step 2: Crear vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Agregar script de test a package.json**

En `package.json`, dentro de `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Escribir el test primero**

```typescript
// src/lib/__tests__/whatsapp.test.ts
import { describe, it, expect } from 'vitest'
import { buildWhatsAppURL } from '@/lib/whatsapp'

describe('buildWhatsAppURL', () => {
  const base: Parameters<typeof buildWhatsAppURL>[1] = {
    name: 'Ana García',
    services: ['Fotocabina', 'Stand de Glitter'],
    date: '2026-12-15',
    guests: 100,
    location: 'Salón Versailles, CABA',
  }

  it('genera una URL wa.me válida', () => {
    const url = buildWhatsAppURL('5491100000000', base)
    expect(url).toMatch(/^https:\/\/wa\.me\/5491100000000\?text=/)
  })

  it('incluye el nombre en el mensaje', () => {
    const url = buildWhatsAppURL('5491100000000', base)
    expect(decodeURIComponent(url)).toContain('Ana García')
  })

  it('incluye todos los servicios', () => {
    const url = buildWhatsAppURL('5491100000000', base)
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('Fotocabina')
    expect(decoded).toContain('Stand de Glitter')
  })

  it('incluye la fecha, invitados y ubicación', () => {
    const url = buildWhatsAppURL('5491100000000', base)
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('2026-12-15')
    expect(decoded).toContain('100')
    expect(decoded).toContain('Salón Versailles, CABA')
  })

  it('incluye mensaje adicional si se provee', () => {
    const url = buildWhatsAppURL('5491100000000', {
      ...base,
      message: 'Necesito decoración especial',
    })
    expect(decodeURIComponent(url)).toContain('Necesito decoración especial')
  })

  it('omite la sección de mensaje si no se provee', () => {
    const url = buildWhatsAppURL('5491100000000', base)
    expect(decodeURIComponent(url)).not.toContain('Mensaje adicional')
  })
})
```

- [ ] **Step 5: Correr el test — debe fallar**

```bash
npm test
```

Esperado: `FAIL` — `Cannot find module '@/lib/whatsapp'`

- [ ] **Step 6: Implementar buildWhatsAppURL**

```typescript
// src/lib/whatsapp.ts
import type { QuoteFormData } from '@/types'

export function buildWhatsAppURL(phoneNumber: string, data: QuoteFormData): string {
  const lines = [
    `¡Hola! Quiero cotizar un servicio de Vicrobox 🎉`,
    ``,
    `*Nombre:* ${data.name}`,
    `*Servicios:* ${data.services.join(', ')}`,
    `*Fecha del evento:* ${data.date}`,
    `*Cantidad de invitados:* ${data.guests}`,
    `*Ubicación:* ${data.location}`,
  ]

  if (data.message) {
    lines.push(`*Mensaje adicional:* ${data.message}`)
  }

  const text = lines.join('\n')
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`
}
```

- [ ] **Step 7: Correr el test — debe pasar**

```bash
npm test
```

Esperado:
```
✓ src/lib/__tests__/whatsapp.test.ts (6)
  ✓ buildWhatsAppURL > genera una URL wa.me válida
  ✓ buildWhatsAppURL > incluye el nombre en el mensaje
  ✓ buildWhatsAppURL > incluye todos los servicios
  ✓ buildWhatsAppURL > incluye la fecha, invitados y ubicación
  ✓ buildWhatsAppURL > incluye mensaje adicional si se provee
  ✓ buildWhatsAppURL > omite la sección de mensaje si no se provee
Test Files  1 passed (1)
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/ vitest.config.ts package.json
git commit -m "feat: add buildWhatsAppURL utility with tests"
```

---

## Task 10: Configurar next.config.ts y Cloudflare

**Files:**
- Modify: `next.config.ts`
- Create: `wrangler.toml`

- [ ] **Step 1: Instalar @cloudflare/next-on-pages**

```bash
npm install -D @cloudflare/next-on-pages wrangler
```

- [ ] **Step 2: Actualizar next.config.ts**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 3: Crear wrangler.toml**

```toml
# wrangler.toml
name = "vicrobox"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```

- [ ] **Step 4: Agregar scripts en package.json**

Dentro de `"scripts"`:

```json
"build:cf": "npx @cloudflare/next-on-pages",
"preview:cf": "npm run build:cf && npx wrangler pages dev"
```

- [ ] **Step 5: Agregar .vercel/ y .open-next/ al .gitignore**

```
.vercel/
.open-next/
.wrangler/
```

- [ ] **Step 6: Verificar build de Cloudflare**

```bash
npm run build:cf
```

Esperado: build completa sin errores. Carpeta `.vercel/output/static/` creada.

Si hay warnings de Edge Runtime, agregar en `src/app/layout.tsx`:

```typescript
export const runtime = 'edge'
```

- [ ] **Step 7: Commit**

```bash
git add next.config.ts wrangler.toml package.json .gitignore
git commit -m "feat: configure Cloudflare Pages build"
```

---

## Task 11: Verificar setup completo + merge a main

- [ ] **Step 1: Correr todos los tests**

```bash
npm test
```

Esperado: 6 tests pasando.

- [ ] **Step 2: Verificar dev server**

```bash
npm run dev
```

Abrir `http://localhost:3000` — página default de Next.js, sin errores en consola.

- [ ] **Step 3: Merge develop → main**

```bash
git checkout main
git merge develop
git push origin main
git push origin develop
```

- [ ] **Step 4: Configurar Cloudflare Pages (manual, una sola vez)**

1. Ir a [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages** → **Create a project** → **Connect to Git**
2. Seleccionar repo `vicrobox`
3. Configuración:
   - **Production branch:** `main`
   - **Build command:** `npm run build:cf`
   - **Build output directory:** `.vercel/output/static`
4. Variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
5. **Preview branches:** agregar `develop` como branch de preview

Después del primer deploy exitoso, cada push a `main` despliega a producción y cada push a `develop` genera una URL de preview.

---

## Verificación final del Plan 1

Al terminar este plan, el repo debe tener:

- [ ] `npm run dev` → levanta sin errores
- [ ] `npm test` → 6 tests verdes
- [ ] `npm run build:cf` → build exitoso para Cloudflare
- [ ] Supabase: 6 tablas con RLS, 2 storage buckets públicos, seed de fotocabina y settings
- [ ] Branch `develop` existe y tiene tracking en origin
- [ ] Cloudflare Pages conectado (si se completó Task 11 Step 4)
