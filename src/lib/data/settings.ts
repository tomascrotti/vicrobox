import { createClient } from '@/lib/supabase/server'
import type { ActiveTheme, SiteSettings } from '@/types'

const DEFAULTS: SiteSettings = {
  whatsapp_number: '',
  active_theme: 'default',
}

const VALID_THEMES: ActiveTheme[] = ['default', 'navidad', 'halloween']

export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('settings').select('key, value')

  if (error || !data) return { ...DEFAULTS }

  const rows = data as { key: string; value: string }[]
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  const theme = byKey.active_theme as ActiveTheme | undefined

  return {
    whatsapp_number: byKey.whatsapp_number ?? DEFAULTS.whatsapp_number,
    active_theme: theme && VALID_THEMES.includes(theme) ? theme : DEFAULTS.active_theme,
  }
}
