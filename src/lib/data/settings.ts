import { createClient } from '@/lib/supabase/server'
import type { ActiveTheme, SiteSettings } from '@/types'

const DEFAULT_SERVICES_BG = 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?q=80&w=1600&auto=format&fit=crop'
const DEFAULT_EVENTS_BG   = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop'
const DEFAULT_WHYUS_BG    = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1600&auto=format&fit=crop'

const DEFAULTS: SiteSettings = {
  whatsapp_number: '',
  active_theme: 'default',
  services_bg_url: DEFAULT_SERVICES_BG,
  events_bg_url: DEFAULT_EVENTS_BG,
  whyus_bg_url: DEFAULT_WHYUS_BG,
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
    services_bg_url: byKey.services_bg_url ?? DEFAULTS.services_bg_url,
    events_bg_url: byKey.events_bg_url ?? DEFAULTS.events_bg_url,
    whyus_bg_url: byKey.whyus_bg_url ?? DEFAULTS.whyus_bg_url,
  }
}
