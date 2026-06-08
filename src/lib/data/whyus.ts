import { createClient } from '@/lib/supabase/server'
import type { WhyUsItem } from '@/types'

export async function getActiveWhyUsItems(): Promise<WhyUsItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('why_us_items')
    .select('*')
    .eq('active', true)
    .order('order', { ascending: true })
  if (error || !data) return []
  return data as WhyUsItem[]
}

export async function getAllWhyUsItems(): Promise<WhyUsItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('why_us_items')
    .select('*')
    .order('order', { ascending: true })
  if (error || !data) return []
  return data as WhyUsItem[]
}
