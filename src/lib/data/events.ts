import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/types'

export async function getActiveEvents(): Promise<Event[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, images:event_images(*), services:event_services(service:services(*))')
    .eq('active', true)
    .order('date', { ascending: false })

  if (error || !data) return []

  return (data as any[]).map((row) => ({
    ...row,
    services: (row.services ?? []).map((rel: any) => rel.service),
  })) as Event[]
}

export async function getAllEventsAdmin(): Promise<Event[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, images:event_images(*)')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data as Event[]
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, images:event_images(*), services:event_services(service:services(*))')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  if (error || !data) return null

  const row = data as any
  return {
    ...row,
    services: (row.services ?? []).map((rel: any) => rel.service),
  } as Event
}
