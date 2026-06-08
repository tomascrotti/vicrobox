# Admin Panel — Services Management Design

**Date:** 2026-06-08

## Goal

Protected admin panel at `/admin` where the owner can create, publish, edit, and delete services. Login via Supabase Auth (email/password). Single user.

---

## Auth

- `src/proxy.ts` — Next.js 16 Proxy (formerly `middleware.ts`) at project root. Matcher: `/admin/:path*`. If no active Supabase session → redirect to `/admin/login`. If session present on `/admin/login` → redirect to `/admin`.
- Login form at `/admin/login` calls `supabase.auth.signInWithPassword()` via server action.
- Logout server action calls `supabase.auth.signOut()`, redirects to `/admin/login`.
- All server actions verify the session themselves — Proxy is secondary protection, not the only gate.
- User is created manually in Supabase Dashboard (Authentication → Users → Add user). No signup flow needed.

---

## Routes

- `/admin/login` — login form, dark Vicrobox style
- `/admin` — services management grid
- Both under `src/app/(admin)/` route group with its own layout

---

## Admin Services View

- Same dark visual style as public site (`bg-main`, `bg-s2` cards, Vicrobox palette)
- **Grid layout** (not carousel) — all services visible at once including drafts
- Drafts (`active: false`) show a yellow "Borrador" badge top-right on the card
- Per-card controls: "Publicar" / "Despublicar" toggle + pencil (edit) + trash (delete)
- "Nuevo Servicio" placeholder card at end of grid — dashed border, centered `+` icon
- Header shows Wordmark + "Admin" label + "Cerrar sesión" button

---

## Create / Edit Form (modal)

- Centered modal overlay (`bg-s2`, same dark style)
- Fields:
  - **Nombre** — text input, required
  - **Descripción** — textarea, required
  - **Imagen** — file input (jpg/png/webp). Required on create, optional on edit (keeps existing if empty)
- Slug auto-generated from name (`"Cabina Espejada"` → `"cabina-espejada"`) — not shown to user
- Image upload: client-side upload to `services-images` Supabase Storage bucket → URL passed to server action
- On create: service saved with `active: false` (draft)

---

## Delete Confirmation

- Clicking trash icon shows inline confirmation overlay on the card
- Text: "¿Eliminar [nombre]? Esta acción no se puede deshacer."
- Buttons: "Cancelar" / "Eliminar"
- On confirm: server action deletes Storage file + service record (DB cascade removes `service_images`)

---

## Cascade Effect on Public Page

`getActiveServices()` already filters `active: true` — deleted or unpublished services disappear from public page and quote form automatically. No extra changes needed.

---

## Data Layer

**New in `src/lib/data/services.ts`:**
- `getAllServices()` — fetches all services including inactive, with images, ordered by `order ASC`

**New `src/lib/slugify.ts`:**
- `slugify(text)` — pure function: lowercase, strip accents, replace spaces with dashes

**New `src/app/(admin)/admin/actions.ts`** (server actions, all verify auth internally):
- `createService({ name, description, imageUrl })` — auto-slug, `active: false`
- `updateService(id, { name, description, imageUrl? })` — replaces image if provided
- `deleteService(id, imageUrl?)` — removes Storage file + service row
- `toggleServiceActive(id, active)` — flips `active`
- `signOut()` — signs out and redirects to `/admin/login`

---

## File Structure

```
src/
├── proxy.ts                                         ← NEW: route protection
├── lib/
│   ├── slugify.ts                                   ← NEW: pure slug utility
│   ├── __tests__/slugify.test.ts                    ← NEW
│   └── data/
│       └── services.ts                              ← MODIFY: add getAllServices()
├── app/
│   └── (admin)/
│       └── admin/
│           ├── layout.tsx                           ← NEW: header + logout
│           ├── page.tsx                             ← NEW: fetches all services
│           ├── actions.ts                           ← NEW: CRUD server actions
│           └── login/
│               ├── page.tsx                         ← NEW: login form
│               └── actions.ts                       ← NEW: signIn action
└── components/
    └── admin/
        ├── SignOutButton.tsx                         ← NEW: client wrapper for signOut
        ├── ServicesGrid.tsx                          ← NEW: interactive grid (client)
        ├── AdminServiceCard.tsx                      ← NEW: card with controls
        ├── NewServiceCard.tsx                        ← NEW: + placeholder card
        └── ServiceFormModal.tsx                      ← NEW: create/edit modal
```
