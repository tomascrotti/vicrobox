import { createClient } from '@/lib/supabase/server'
import type { Service } from '@/types'

export async function getActiveServices(): Promise<Service[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
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
    .select('*, images:service_images(*)')
    .eq('slug', slug)
    .eq('active', true)
    .order('order', { ascending: true, foreignTable: 'service_images' })
    .maybeSingle()

  if (error || !data) return null
  return data as Service
}
