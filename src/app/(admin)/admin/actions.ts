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
  color?: string
  order?: number
}): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const slug = slugify(data.name)

  const { data: service, error } = await supabase
    .from('services')
    .insert({ name: data.name, slug, description: data.description, active: false, color: data.color ?? '#F07820', order: data.order ?? 0 })
    .select()
    .single()

  if (error || !service) return { error: error?.message ?? 'Error al crear el servicio' }

  const { error: imgError } = await supabase
    .from('service_images')
    .insert({ service_id: service.id, url: data.imageUrl, order: 0, is_cover: true })

  if (imgError) return { error: imgError.message }

  revalidateAll()
  return {}
}

export async function updateService(
  id: string,
  data: { name: string; description: string; imageUrl?: string; color?: string; order?: number }
): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const slug = slugify(data.name)

  const update: Record<string, unknown> = { name: data.name, slug, description: data.description }
  if (data.color !== undefined) update.color = data.color
  if (data.order !== undefined) update.order = data.order

  const { error } = await supabase
    .from('services')
    .update(update)
    .eq('id', id)

  if (error) return { error: error.message }

  if (data.imageUrl) {
    await supabase.from('service_images').delete().eq('service_id', id)
    const { error: imgError } = await supabase
      .from('service_images')
      .insert({ service_id: id, url: data.imageUrl, order: 0, is_cover: true })
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

  // Collect events that will be affected (before cascade)
  const { data: affectedEventServices } = await supabase
    .from('event_services')
    .select('event_id')
    .eq('service_id', id)
  const affectedEventIds = [...new Set((affectedEventServices ?? []).map((r: any) => r.event_id))]

  // Delete event_images storage files for this service before cascade removes the rows
  const { data: eventImages } = await supabase
    .from('event_images')
    .select('url')
    .eq('service_id', id)
  const evtPaths = (eventImages ?? [])
    .map((img: any) => extractStoragePath(img.url, 'events-images'))
    .filter(Boolean) as string[]
  if (evtPaths.length > 0) {
    await supabase.storage.from('events-images').remove(evtPaths)
  }

  // Delete service's own image from storage
  if (imageUrl) {
    const path = extractStoragePath(imageUrl, 'services-images')
    if (path) await supabase.storage.from('services-images').remove([path])
  }

  // Delete service (DB cascade handles: service_images, event_services, event_images.service_id)
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) return { error: error.message }

  // Delete events that now have no services
  for (const eventId of affectedEventIds) {
    const { count } = await supabase
      .from('event_services')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
    if ((count ?? 0) === 0) {
      const { data: remainingImages } = await supabase
        .from('event_images')
        .select('url')
        .eq('event_id', eventId)
      const remainingPaths = (remainingImages ?? [])
        .map((img: any) => extractStoragePath(img.url, 'events-images'))
        .filter(Boolean) as string[]
      if (remainingPaths.length > 0) {
        await supabase.storage.from('events-images').remove(remainingPaths)
      }
      await supabase.from('events').delete().eq('id', eventId)
    }
  }

  revalidateAll()
  return {}
}

function extractStoragePath(url: string, bucket: string): string | null {
  const prefix = `/storage/v1/object/public/${bucket}/`
  return url.includes(prefix) ? url.split(prefix)[1] : null
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

export async function createEventType(name: string): Promise<{ id?: string; error?: string }> {
  const supabase = await requireAuth()
  const slug = slugify(name)
  const { data, error } = await supabase
    .from('event_types')
    .insert({ name: name.trim(), slug })
    .select('id')
    .single()
  if (error) {
    // If duplicate, return existing
    const { data: existing } = await supabase
      .from('event_types')
      .select('id')
      .eq('slug', slug)
      .single()
    if (existing) return { id: (existing as any).id }
    return { error: error.message }
  }
  return { id: (data as any).id }
}

export async function createEvent(data: {
  name: string
  description: string
  event_type_id: string
  date: string | null
  service_ids: string[]
  images: Array<{ url: string; service_id: string | null; order: number; is_cover: boolean }>
}): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const slug = slugify(data.name)

  const { data: event, error } = await supabase
    .from('events')
    .insert({ name: data.name, slug, description: data.description, event_type_id: data.event_type_id, date: data.date || null, active: false })
    .select()
    .single()

  if (error || !event) return { error: error?.message ?? 'Error al crear el evento' }
  const eventId = (event as any).id

  if (data.service_ids.length > 0) {
    const { error: svcError } = await supabase
      .from('event_services')
      .insert(data.service_ids.map((service_id) => ({ event_id: eventId, service_id })))
    if (svcError) return { error: svcError.message }
  }

  if (data.images.length > 0) {
    const { error: imgError } = await supabase
      .from('event_images')
      .insert(data.images.map((img) => ({ event_id: eventId, url: img.url, service_id: img.service_id, order: img.order, is_cover: img.is_cover })))
    if (imgError) return { error: imgError.message }
  }

  revalidateAll()
  return {}
}

export async function updateEvent(
  id: string,
  data: {
    name: string
    description: string
    event_type_id: string
    date: string | null
    service_ids: string[]
    delete_image_ids: string[]
    new_images: Array<{ url: string; service_id: string | null; order: number; is_cover: boolean }>
    cover_image_id?: string | null
  }
): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const slug = slugify(data.name)

  const { error } = await supabase
    .from('events')
    .update({ name: data.name, slug, description: data.description, event_type_id: data.event_type_id, date: data.date || null })
    .eq('id', id)
  if (error) return { error: error.message }

  // Replace services
  await supabase.from('event_services').delete().eq('event_id', id)
  if (data.service_ids.length > 0) {
    const { error: svcError } = await supabase
      .from('event_services')
      .insert(data.service_ids.map((service_id) => ({ event_id: id, service_id })))
    if (svcError) return { error: svcError.message }
  }

  // Delete marked images from DB
  if (data.delete_image_ids.length > 0) {
    await supabase.from('event_images').delete().in('id', data.delete_image_ids)
  }

  // Update cover on existing images
  if (data.cover_image_id !== undefined) {
    await supabase.from('event_images').update({ is_cover: false }).eq('event_id', id)
    if (data.cover_image_id) {
      await supabase.from('event_images').update({ is_cover: true }).eq('id', data.cover_image_id)
    }
  }

  // Insert new images
  if (data.new_images.length > 0) {
    const { data: existing } = await supabase
      .from('event_images')
      .select('order')
      .eq('event_id', id)
      .order('order', { ascending: false })
      .limit(1)
    const baseOrder = existing?.[0] ? (existing[0] as any).order + 1 : 0
    const { error: imgError } = await supabase
      .from('event_images')
      .insert(data.new_images.map((img, i) => ({ event_id: id, url: img.url, service_id: img.service_id, order: baseOrder + i })))
    if (imgError) return { error: imgError.message }
  }

  revalidateAll()
  return {}
}

export async function deleteEvent(id: string): Promise<{ error?: string }> {
  const supabase = await requireAuth()

  // Delete all event images from storage
  const { data: images } = await supabase.from('event_images').select('url').eq('event_id', id)
  const paths = (images ?? [])
    .map((img: any) => extractStoragePath(img.url, 'events-images'))
    .filter(Boolean) as string[]
  if (paths.length > 0) await supabase.storage.from('events-images').remove(paths)

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

// ── Settings ──────────────────────────────────────────────────────────────────

export async function updateSetting(
  key: string,
  value: string
): Promise<{ error?: string }> {
  const supabase = await requireAuth()
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })
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
