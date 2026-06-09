import { describe, it, expect } from 'vitest'
import { eventBadge, eventTagline } from '@/lib/event-display'

describe('eventBadge', () => {
  it('uses the event_type name joined from DB', () => {
    expect(eventBadge({ event_type: { id: '1', name: 'Casamiento', slug: 'casamiento', created_at: '' }, name: 'Caro & Juan' })).toBe('Casamiento · Caro & Juan')
  })
  it('falls back to "Evento" when event_type is undefined', () => {
    expect(eventBadge({ event_type: undefined, name: 'Lanzamiento ABC' })).toBe('Evento · Lanzamiento ABC')
  })
})

describe('eventTagline', () => {
  it('joins the names of the services used in the event', () => {
    expect(
      eventTagline({ services: [{ id: '1', name: 'Fotocabina' } as never, { id: '2', name: 'Cabina Espejada' } as never] })
    ).toBe('Fotocabina + Cabina Espejada')
  })
  it('falls back to a generic line when no services are linked', () => {
    expect(eventTagline({ services: [] })).toBe('Entretenimiento Vicrobox')
    expect(eventTagline({})).toBe('Entretenimiento Vicrobox')
  })
})
