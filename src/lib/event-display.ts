import type { Event, EventType, Service } from '@/types'

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  casamiento: 'Casamiento',
  cumpleaños: 'Cumpleaños',
  corporativo: 'Corporativo',
  otro: 'Evento',
}

export function eventBadge(event: Pick<Event, 'event_type' | 'name'>): string {
  return `${EVENT_TYPE_LABELS[event.event_type]} · ${event.name}`
}

export function eventTagline(event: { services?: Pick<Service, 'name'>[] }): string {
  const names = (event.services ?? []).map((s) => s.name)
  return names.length > 0 ? names.join(' + ') : 'Entretenimiento Vicrobox'
}
