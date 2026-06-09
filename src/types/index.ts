// src/types/index.ts

export type ServiceFeature = {
  id: string
  service_id: string
  emoji: string
  title: string
  description: string
  order: number
  created_at: string
}

export type Service = {
  id: string
  name: string
  slug: string
  description: string
  tagline?: string
  icon: string
  color: string
  active: boolean
  order: number
  base_price?: string | null
  duration?: string | null
  capacity?: string | null
  space_needed?: string | null
  created_at: string
  images?: ServiceImage[]
  features?: ServiceFeature[]
}

export type ServiceImage = {
  id: string
  service_id: string
  url: string
  order: number
  is_cover: boolean
  created_at: string
}

export type EventTypeRecord = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type Event = {
  id: string
  name: string
  slug: string
  event_type_id: string
  event_type?: EventTypeRecord
  description: string
  date: string | null
  active: boolean
  created_at: string
  images?: EventImage[]
  services?: Service[]
}

export type EventImage = {
  id: string
  event_id: string
  url: string
  order: number
  is_cover: boolean
  service_id?: string | null
  created_at: string
}

export type ActiveTheme = 'default' | 'navidad' | 'halloween'

export type WhyUsItem = {
  id: string
  title: string
  description: string
  icon_key: string
  order: number
  active: boolean
  created_at: string
}

export type SiteSettings = {
  whatsapp_number: string
  active_theme: ActiveTheme
  services_bg_url: string
  events_bg_url: string
  whyus_bg_url: string
  instagram_url: string
  facebook_url: string
}

export type QuoteFormData = {
  name: string
  services: string[]       // nombres de servicios seleccionados
  date: string
  guests: number | ''
  location: string
  message?: string
}
