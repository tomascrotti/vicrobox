// src/types/index.ts

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
  created_at: string
  images?: ServiceImage[]
}

export type ServiceImage = {
  id: string
  service_id: string
  url: string
  order: number
  created_at: string
}

export type EventType = 'casamiento' | 'cumpleaños' | 'corporativo' | 'otro'

export type Event = {
  id: string
  name: string
  slug: string
  event_type: EventType
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
}

export type QuoteFormData = {
  name: string
  services: string[]       // nombres de servicios seleccionados
  date: string
  guests: number | ''
  location: string
  message?: string
}
