import { createClient } from '@/lib/supabase/server'
import type { Service } from '@/types'

export async function getActiveServices(): Promise<Service[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*, images:service_images(*)')
    .eq('active', true)
    .order('order', { ascending: true })

  if (error || !data) return []
  return data as Service[]
}

export async function getAllServices(): Promise<Service[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*, images:service_images(*)')
    .order('order', { ascending: true })

  if (error || !data) return []
  return data as Service[]
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*, images:service_images(*), features:service_features(*)')
    .eq('slug', slug)
    .order('order', { ascending: true, foreignTable: 'service_images' })
    .maybeSingle()

  if (error || !data) return null
  // Check active in JS — PostgREST boolean filter + complex join can silently fail
  if (!data.active) return null
  const service = data as Service
  // Sort features by order
  if (service.features) service.features.sort((a, b) => a.order - b.order)
  return service
}
