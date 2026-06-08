# Admin Panel — Services Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a protected `/admin` panel where the owner can create, publish, edit, and delete services using Supabase Auth.

**Architecture:** Next.js 16 App Router with `proxy.ts` (renamed from `middleware.ts`) for route protection. Admin is a separate `(admin)` route group with its own layout. Image uploads go client-side to Supabase Storage, then the URL is passed to server actions. All server actions verify auth internally in addition to the proxy guard.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase Auth + Storage + DB, `@supabase/ssr` v0.10.x, Vitest.

---

## Context: what already exists

- `src/lib/supabase/server.ts` — `createClient()` using `@supabase/ssr` `createServerClient` with cookies
- `src/lib/supabase/client.ts` — `createClient()` using `createBrowserClient`
- `src/lib/data/services.ts` — `getActiveServices()`, `getServiceBySlug()`
- `src/types/index.ts` — `Service`, `ServiceImage` types
- Supabase RLS: `auth_manage_services` policy allows all operations for `auth.role() = 'authenticated'`
- Storage bucket `services-images` — public read, authenticated upload/delete
- **IMPORTANT:** In Next.js 16, `middleware.ts` is renamed to `proxy.ts` and `export function middleware` is renamed to `export function proxy`. Use `proxy.ts`.

---

## File structure

```
src/
├── proxy.ts                                         ← NEW
├── lib/
│   ├── slugify.ts                                   ← NEW
│   ├── __tests__/slugify.test.ts                    ← NEW
│   └── data/services.ts                             ← MODIFY (add getAllServices)
├── app/(admin)/admin/
│   ├── layout.tsx                                   ← NEW
│   ├── page.tsx                                     ← NEW
│   ├── actions.ts                                   ← NEW
│   └── login/
│       ├── page.tsx                                 ← NEW
│       └── actions.ts                               ← NEW
└── components/admin/
    ├── SignOutButton.tsx                             ← NEW
    ├── ServicesGrid.tsx                             ← NEW
    ├── AdminServiceCard.tsx                         ← NEW
    ├── NewServiceCard.tsx                           ← NEW
    └── ServiceFormModal.tsx                         ← NEW
```

---

### Task 1: `slugify` utility + `getAllServices` data fetcher

**Files:**
- Create: `src/lib/slugify.ts`
- Create: `src/lib/__tests__/slugify.test.ts`
- Modify: `src/lib/data/services.ts`
- Modify: `src/lib/data/__tests__/services.test.ts`

- [ ] **Step 1: Write failing slugify tests**

```ts
// src/lib/__tests__/slugify.test.ts
import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/slugify'

describe('slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('Cabina Espejada')).toBe('cabina-espejada')
  })
  it('strips accents', () => {
    expect(slugify('Fotografía')).toBe('fotografia')
  })
  it('collapses multiple spaces', () => {
    expect(slugify('  Foto  Cabina  ')).toBe('foto-cabina')
  })
  it('removes special characters', () => {
    expect(slugify('Túnel & LED!')).toBe('tunel-led')
  })
})
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npx vitest run src/lib/__tests__/slugify.test.ts
```
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement slugify**

```ts
// src/lib/slugify.ts
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
```

- [ ] **Step 4: Run to verify PASS**

```bash
npx vitest run src/lib/__tests__/slugify.test.ts
```
Expected: PASS (4 tests)

- [ ] **Step 5: Write failing getAllServices test**

Add to `src/lib/data/__tests__/services.test.ts` (append after existing tests — the mock setup at the top of the file already handles Supabase):

```ts
import { getActiveServices, getServiceBySlug, getAllServices } from '@/lib/data/services'

// (add these two new describe blocks at the bottom of the existing file)

describe('getAllServices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns all services including inactive ones', async () => {
    queryResult = {
      data: [
        { id: '1', name: 'Fotocabina', active: true, images: [] },
        { id: '2', name: 'Draft', active: false, images: [] },
      ],
      error: null,
    }
    const services = await getAllServices()
    expect(services).toHaveLength(2)
    expect(services[1].active).toBe(false)
  })

  it('returns empty array on error', async () => {
    queryResult = { data: null, error: { message: 'err' } }
    expect(await getAllServices()).toEqual([])
  })
})
```

- [ ] **Step 6: Run to verify FAIL**

```bash
npx vitest run src/lib/data/__tests__/services.test.ts
```
Expected: FAIL with "getAllServices is not a function"

- [ ] **Step 7: Add getAllServices to services.ts**

Append to the bottom of `src/lib/data/services.ts`:

```ts
export async function getAllServices(): Promise<Service[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*, images:service_images(*)')
    .order('order', { ascending: true })

  if (error || !data) return []
  return data as Service[]
}
```

- [ ] **Step 8: Run to verify PASS**

```bash
npx vitest run src/lib/data/__tests__/services.test.ts
```
Expected: PASS (all tests including new ones)

- [ ] **Step 9: Run full test suite**

```bash
npx vitest run
```
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add src/lib/slugify.ts src/lib/__tests__/slugify.test.ts src/lib/data/services.ts src/lib/data/__tests__/services.test.ts
git commit -m "feat: add slugify utility + getAllServices for admin"
```

---

### Task 2: Proxy auth guard

**Files:**
- Create: `src/proxy.ts`

**Context:** Next.js 16 renames `middleware.ts` → `proxy.ts` and `export function middleware` → `export function proxy`. The file goes at `src/proxy.ts` (same level as `src/app/`). The `@supabase/ssr` pattern requires creating a Supabase client in the proxy and calling `supabase.auth.getUser()` to refresh the session and check auth.

- [ ] **Step 1: Create proxy.ts**

```ts
// src/proxy.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 2: Run full test suite (no new tests — proxy runs at Edge, not unit-testable here)**

```bash
npx vitest run
```
Expected: PASS (no regressions)

- [ ] **Step 3: Commit**

```bash
git add src/proxy.ts
git commit -m "feat: proxy auth guard for /admin routes"
```

---

### Task 3: Login page + signIn action

**Files:**
- Create: `src/app/(admin)/admin/login/page.tsx`
- Create: `src/app/(admin)/admin/login/actions.ts`

- [ ] **Step 1: Create signIn server action**

```ts
// src/app/(admin)/admin/login/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return 'Email o contraseña incorrectos'

  redirect('/admin')
}
```

- [ ] **Step 2: Create login page**

```tsx
// src/app/(admin)/admin/login/page.tsx
'use client'

import { useActionState } from 'react'
import { Wordmark } from '@/components/ui/Wordmark'
import { signIn } from './actions'

export default function LoginPage() {
  const [error, formAction, isPending] = useActionState(signIn, null)

  return (
    <main className="min-h-screen bg-bg-main flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-s2 rounded-[20px] p-8 border border-white/8">
        <div className="text-center mb-8">
          <span className="font-display text-3xl"><Wordmark /></span>
          <p className="text-white/40 text-sm mt-2">Panel de administración</p>
        </div>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-bold text-white/70">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange"
              placeholder="admin@vicrobox.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-bold text-white/70">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="mt-2 rounded-full bg-orange px-6 py-3 text-sm font-extrabold text-white disabled:opacity-50 hover:bg-[#D06B00] transition-colors"
          >
            {isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add "src/app/(admin)/admin/login/page.tsx" "src/app/(admin)/admin/login/actions.ts"
git commit -m "feat: admin login page + signIn server action"
```

---

### Task 4: Admin layout + signOut

**Files:**
- Create: `src/app/(admin)/admin/layout.tsx`
- Create: `src/components/admin/SignOutButton.tsx`
- Create: `src/app/(admin)/admin/actions.ts` (add `signOut` — rest of actions added in Task 5)

- [ ] **Step 1: Create signOut action (stub file — more actions added in Task 5)**

```ts
// src/app/(admin)/admin/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  return supabase
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
```

- [ ] **Step 2: Create SignOutButton client component**

```tsx
// src/components/admin/SignOutButton.tsx
'use client'

import { signOut } from '@/app/(admin)/admin/actions'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm font-bold text-white/50 hover:text-white transition-colors"
      >
        Cerrar sesión
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Create admin layout**

```tsx
// src/app/(admin)/admin/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Wordmark } from '@/components/ui/Wordmark'
import { SignOutButton } from '@/components/admin/SignOutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-bg-main text-white">
      <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/8 bg-bg-main sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl"><Wordmark /></span>
          <span className="text-white/30 text-sm font-bold">Admin</span>
        </div>
        <SignOutButton />
      </header>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Run full test suite**

```bash
npx vitest run
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add "src/app/(admin)/admin/layout.tsx" "src/app/(admin)/admin/actions.ts" src/components/admin/SignOutButton.tsx
git commit -m "feat: admin layout with logout"
```

---

### Task 5: CRUD server actions

**Files:**
- Modify: `src/app/(admin)/admin/actions.ts` (add createService, updateService, deleteService, toggleServiceActive)

- [ ] **Step 1: Add all CRUD actions to actions.ts**

Replace the contents of `src/app/(admin)/admin/actions.ts` with:

```ts
// src/app/(admin)/admin/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slugify'

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  return supabase
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export async function createService(data: {
  name: string
  description: string
  imageUrl: string
}): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const slug = slugify(data.name)

  const { data: service, error } = await supabase
    .from('services')
    .insert({ name: data.name, slug, description: data.description, active: false })
    .select()
    .single()

  if (error || !service) return { error: error?.message ?? 'Error al crear el servicio' }

  const { error: imgError } = await supabase
    .from('service_images')
    .insert({ service_id: service.id, url: data.imageUrl, order: 0 })

  if (imgError) return { error: imgError.message }

  revalidatePath('/admin')
  revalidatePath('/')
  return {}
}

export async function updateService(
  id: string,
  data: { name: string; description: string; imageUrl?: string }
): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const slug = slugify(data.name)

  const { error } = await supabase
    .from('services')
    .update({ name: data.name, slug, description: data.description })
    .eq('id', id)

  if (error) return { error: error.message }

  if (data.imageUrl) {
    await supabase.from('service_images').delete().eq('service_id', id)
    const { error: imgError } = await supabase
      .from('service_images')
      .insert({ service_id: id, url: data.imageUrl, order: 0 })
    if (imgError) return { error: imgError.message }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return {}
}

export async function deleteService(
  id: string,
  imageUrl?: string
): Promise<{ error?: string }> {
  const supabase = await requireAuth()

  if (imageUrl) {
    const storagePrefix = '/storage/v1/object/public/services-images/'
    const path = imageUrl.includes(storagePrefix)
      ? imageUrl.split(storagePrefix)[1]
      : null
    if (path) await supabase.storage.from('services-images').remove([path])
  }

  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/')
  return {}
}

export async function toggleServiceActive(
  id: string,
  active: boolean
): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const { error } = await supabase.from('services').update({ active }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/')
  return {}
}
```

- [ ] **Step 2: Run full test suite**

```bash
npx vitest run
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add "src/app/(admin)/admin/actions.ts"
git commit -m "feat: admin CRUD server actions (create/update/delete/toggle service)"
```

---

### Task 6: Admin UI components + page

**Files:**
- Create: `src/components/admin/NewServiceCard.tsx`
- Create: `src/components/admin/AdminServiceCard.tsx`
- Create: `src/components/admin/ServiceFormModal.tsx`
- Create: `src/components/admin/ServicesGrid.tsx`
- Create: `src/app/(admin)/admin/page.tsx`

- [ ] **Step 1: Create NewServiceCard**

```tsx
// src/components/admin/NewServiceCard.tsx
export function NewServiceCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 bg-s2/50 rounded-[20px] border border-dashed border-white/20 min-h-[300px] w-full hover:border-white/40 hover:bg-s2/70 transition-colors group"
    >
      <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-white/70 transition-colors">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <span className="text-sm font-bold text-white/40 group-hover:text-white/70 transition-colors">
        Nuevo Servicio
      </span>
    </button>
  )
}
```

- [ ] **Step 2: Create AdminServiceCard**

```tsx
// src/components/admin/AdminServiceCard.tsx
'use client'

import { useState } from 'react'
import { toggleServiceActive, deleteService } from '@/app/(admin)/admin/actions'
import type { Service } from '@/types'

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop'

export function AdminServiceCard({
  service,
  onEdit,
}: {
  service: Service
  onEdit: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)
  const cover = service.images?.[0]?.url ?? PLACEHOLDER

  async function handleToggle() {
    setPending(true)
    await toggleServiceActive(service.id, !service.active)
    setPending(false)
  }

  async function handleDelete() {
    setPending(true)
    await deleteService(service.id, service.images?.[0]?.url)
    setPending(false)
    setConfirming(false)
  }

  return (
    <article className="flex flex-col bg-s2 rounded-[20px] overflow-hidden border border-white/7">
      <div className="relative h-[200px] flex-shrink-0 overflow-hidden">
        <img
          src={cover}
          alt={service.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {!service.active && (
          <span className="absolute top-3 right-3 rounded-full bg-yellow px-2.5 py-1 text-[11px] font-extrabold text-black">
            Borrador
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="font-display text-base leading-tight" style={{ color: service.color }}>
          {service.name}
        </p>
        <p className="flex-1 text-sm text-white/55 leading-relaxed line-clamp-3">
          {service.description}
        </p>
      </div>

      {confirming ? (
        <div className="px-5 pb-5 flex flex-col gap-3">
          <p className="text-sm text-white/70">
            ¿Eliminar <span className="font-bold text-white">{service.name}</span>? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-full border border-white/16 py-2 text-sm font-bold text-white/70 hover:border-white/32 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={pending}
              className="flex-1 rounded-full bg-red-600 py-2 text-sm font-bold text-white disabled:opacity-50 hover:bg-red-700 transition-colors"
            >
              {pending ? '...' : 'Eliminar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-5 flex items-center justify-between gap-2">
          <button
            onClick={handleToggle}
            disabled={pending}
            className="rounded-full border border-white/16 px-3.5 py-1.5 text-[12px] font-bold text-white/70 hover:border-white/32 disabled:opacity-50 transition-colors"
          >
            {service.active ? 'Despublicar' : 'Publicar'}
          </button>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-white/8 text-white/50 hover:text-white transition-colors"
              aria-label="Editar servicio"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="p-2 rounded-lg hover:bg-white/8 text-white/50 hover:text-red-400 transition-colors"
              aria-label="Eliminar servicio"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
```

- [ ] **Step 3: Create ServiceFormModal**

```tsx
// src/components/admin/ServiceFormModal.tsx
'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createService, updateService } from '@/app/(admin)/admin/actions'
import type { Service } from '@/types'

type Props =
  | { mode: 'create'; service?: never; onClose: () => void }
  | { mode: 'edit'; service: Service; onClose: () => void }

export function ServiceFormModal({ mode, service, onClose }: Props) {
  const [name, setName] = useState(service?.name ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(
    service?.images?.[0]?.url ?? ''
  )
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('services-images')
      .upload(path, file)
    if (uploadError) throw new Error(uploadError.message)
    const { data } = supabase.storage.from('services-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) { setError('El nombre es requerido'); return }
    if (!description.trim()) { setError('La descripción es requerida'); return }
    if (mode === 'create' && !imageFile) { setError('La imagen es requerida'); return }

    setUploading(true)
    try {
      let imageUrl: string | undefined
      if (imageFile) imageUrl = await uploadImage(imageFile)

      const result =
        mode === 'create'
          ? await createService({ name, description, imageUrl: imageUrl! })
          : await updateService(service.id, { name, description, imageUrl })

      if (result.error) { setError(result.error); return }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-s2 rounded-[20px] border border-white/8 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl">
            {mode === 'create' ? 'Nuevo Servicio' : 'Editar Servicio'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/70">Nombre del servicio</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange"
              placeholder="Ej: Cabina Espejada"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/70">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange resize-none"
              placeholder="Describí el servicio..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/70">
              Imagen
              {mode === 'edit' && (
                <span className="text-white/40 font-normal ml-1">(opcional — dejá vacío para mantener la actual)</span>
              )}
            </label>
            <div
              className="relative rounded-xl border border-dashed border-white/20 overflow-hidden cursor-pointer hover:border-white/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative h-36">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-sm font-bold text-white">Cambiar imagen</span>
                  </div>
                </div>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center gap-2 text-white/40">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <span className="text-sm">Subir imagen</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-white/16 py-2.5 text-sm font-bold text-white/70 hover:border-white/32 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 rounded-full bg-orange py-2.5 text-sm font-extrabold text-white disabled:opacity-50 hover:bg-[#D06B00] transition-colors"
            >
              {uploading
                ? 'Guardando...'
                : mode === 'create'
                ? 'Crear servicio'
                : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create ServicesGrid**

```tsx
// src/components/admin/ServicesGrid.tsx
'use client'

import { useState } from 'react'
import { AdminServiceCard } from './AdminServiceCard'
import { NewServiceCard } from './NewServiceCard'
import { ServiceFormModal } from './ServiceFormModal'
import type { Service } from '@/types'

export function ServicesGrid({ services }: { services: Service[] }) {
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service) => (
          <AdminServiceCard
            key={service.id}
            service={service}
            onEdit={() => setEditingService(service)}
          />
        ))}
        <NewServiceCard onClick={() => setShowCreate(true)} />
      </div>

      {showCreate && (
        <ServiceFormModal mode="create" onClose={() => setShowCreate(false)} />
      )}

      {editingService && (
        <ServiceFormModal
          mode="edit"
          service={editingService}
          onClose={() => setEditingService(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 5: Create admin page**

```tsx
// src/app/(admin)/admin/page.tsx
import { getAllServices } from '@/lib/data/services'
import { ServicesGrid } from '@/components/admin/ServicesGrid'

export default async function AdminPage() {
  const services = await getAllServices()

  return (
    <main className="px-6 md:px-12 py-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl">Servicios</h1>
          <span className="text-sm text-white/40">{services.length} en total</span>
        </div>
        <ServicesGrid services={services} />
      </div>
    </main>
  )
}
```

- [ ] **Step 6: Run full test suite**

```bash
npx vitest run
```
Expected: PASS

- [ ] **Step 7: Run build to verify no TypeScript errors**

```bash
npx next build
```
Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/NewServiceCard.tsx src/components/admin/AdminServiceCard.tsx src/components/admin/ServiceFormModal.tsx src/components/admin/ServicesGrid.tsx "src/app/(admin)/admin/page.tsx"
git commit -m "feat: admin services UI — grid, cards, create/edit modal"
```

---

### Task 7: Final verification

- [ ] **Step 1:** `npx vitest run` → PASS

- [ ] **Step 2:** `npx next build` → succeeds, no type errors

- [ ] **Step 3:** `npx next dev`, open `http://localhost:3000/admin`:
  - Without session → redirected to `/admin/login`
  - Login with valid Supabase user → redirected to `/admin`
  - Admin page shows all services (active + drafts) in grid
  - "Borrador" badge visible on inactive services
  - "Nuevo Servicio" card at end of grid
  - Click "+ Nuevo Servicio" → modal opens, fill name/description/image → create → new service appears as "Borrador"
  - Click "Publicar" on a draft → service becomes active, visible on public homepage
  - Click pencil on existing card → edit modal opens pre-filled → save → changes reflected
  - Click trash → confirmation overlay → "Eliminar" → service removed from grid and from public page
  - Click "Cerrar sesión" → redirected to `/admin/login`

- [ ] **Step 4:** Verify public homepage at `http://localhost:3000` — deleted/unpublished services do NOT appear in services carousel or quote form checkboxes.
