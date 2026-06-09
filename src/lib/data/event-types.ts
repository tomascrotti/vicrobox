import { createClient } from '@/lib/supabase/server'
import type { EventTypeRecord } from '@/types'

export async function getEventTypes(): Promise<EventTypeRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .order('name', { ascending: true })
  if (error || !data) return []
  return data as EventTypeRecord[]
}
