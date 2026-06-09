import type { Event, Service } from '@/types'

export function eventBadge(event: Pick<Event, 'event_type' | 'name'>): string {
  return `${event.event_type?.name ?? 'Evento'} · ${event.name}`
}

export function eventTagline(event: { services?: Pick<Service, 'name'>[] }): string {
  const names = (event.services ?? []).map((s) => s.name)
  return names.length > 0 ? names.join(' + ') : 'Entretenimiento Vicrobox'
}
