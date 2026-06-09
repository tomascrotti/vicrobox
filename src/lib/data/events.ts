import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/types'

const EVENT_SELECT = '*, event_type:event_types(*), images:event_images(*), services:event_services(service:services(*))'

function mapEvents(rows: any[]): Event[] {
  return rows.map((row) => ({
    ...row,
    services: (row.services ?? []).map((rel: any) => rel.service),
  })) as Event[]
}

export async function getActiveEvents(): Promise<Event[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('active', true)
    .order('date', { ascending: false })
  if (error || !data) return []
  return mapEvents(data)
}

export async function getAllEventsAdmin(): Promise<Event[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return mapEvents(data)
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('slug', slug)
    .maybeSingle()
  if (error || !data) return null
  const event = mapEvents([data])[0]
  // Check active in JS — PostgREST boolean filter + complex join can silently fail
  if (!event.active) return null
  return event
}
