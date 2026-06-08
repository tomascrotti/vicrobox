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
