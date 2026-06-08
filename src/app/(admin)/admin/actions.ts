'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slugify'

function revalidateAll() {
  revalidatePath('/admin')
  revalidatePath('/')
}

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

  revalidateAll()
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

  revalidateAll()
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

  revalidateAll()
  return {}
}

export async function toggleServiceActive(
  id: string,
  active: boolean
): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const { error } = await supabase.from('services').update({ active }).eq('id', id)
  if (error) return { error: error.message }
  revalidateAll()
  return {}
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function createEvent(data: {
  name: string
  description: string
  event_type: string
  date: string | null
  imageUrl: string
}): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const slug = slugify(data.name)

  const { data: event, error } = await supabase
    .from('events')
    .insert({ name: data.name, slug, description: data.description, event_type: data.event_type, date: data.date || null, active: false })
    .select()
    .single()

  if (error || !event) return { error: error?.message ?? 'Error al crear el evento' }

  const { error: imgError } = await supabase
    .from('event_images')
    .insert({ event_id: event.id, url: data.imageUrl, order: 0 })

  if (imgError) return { error: imgError.message }

  revalidateAll()
  return {}
}

export async function updateEvent(
  id: string,
  data: { name: string; description: string; event_type: string; date: string | null; imageUrl?: string }
): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const slug = slugify(data.name)

  const { error } = await supabase
    .from('events')
    .update({ name: data.name, slug, description: data.description, event_type: data.event_type, date: data.date || null })
    .eq('id', id)

  if (error) return { error: error.message }

  if (data.imageUrl) {
    await supabase.from('event_images').delete().eq('event_id', id)
    const { error: imgError } = await supabase
      .from('event_images')
      .insert({ event_id: id, url: data.imageUrl, order: 0 })
    if (imgError) return { error: imgError.message }
  }

  revalidateAll()
  return {}
}

export async function deleteEvent(
  id: string,
  imageUrl?: string
): Promise<{ error?: string }> {
  const supabase = await requireAuth()

  if (imageUrl) {
    const storagePrefix = '/storage/v1/object/public/events-images/'
    const path = imageUrl.includes(storagePrefix)
      ? imageUrl.split(storagePrefix)[1]
      : null
    if (path) await supabase.storage.from('events-images').remove([path])
  }

  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidateAll()
  return {}
}

export async function toggleEventActive(
  id: string,
  active: boolean
): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const { error } = await supabase.from('events').update({ active }).eq('id', id)
  if (error) return { error: error.message }
  revalidateAll()
  return {}
}

// ── WhyUs ─────────────────────────────────────────────────────────────────────

export async function createWhyUsItem(data: {
  title: string
  description: string
  icon_key: string
}): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const { data: rows } = await supabase.from('why_us_items').select('order').order('order', { ascending: false }).limit(1)
  const nextOrder = rows?.[0] ? (rows[0] as any).order + 1 : 0

  const { error } = await supabase
    .from('why_us_items')
    .insert({ title: data.title, description: data.description, icon_key: data.icon_key, order: nextOrder, active: true })

  if (error) return { error: error.message }
  revalidateAll()
  return {}
}

export async function updateWhyUsItem(
  id: string,
  data: { title: string; description: string; icon_key: string }
): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const { error } = await supabase
    .from('why_us_items')
    .update({ title: data.title, description: data.description, icon_key: data.icon_key })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidateAll()
  return {}
}

export async function deleteWhyUsItem(id: string): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const { error } = await supabase.from('why_us_items').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateAll()
  return {}
}

export async function toggleWhyUsItemActive(
  id: string,
  active: boolean
): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const { error } = await supabase.from('why_us_items').update({ active }).eq('id', id)
  if (error) return { error: error.message }
  revalidateAll()
  return {}
}
