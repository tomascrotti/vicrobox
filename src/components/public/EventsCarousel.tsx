'use client'

import { CardCarousel } from './CardCarousel'
import { EventCard } from './EventCard'
import type { Event } from '@/types'

export function EventsCarousel({ events }: { events: Event[] }) {
  return (
    <CardCarousel
      items={events}
      getKey={(event) => event.id}
      renderCard={(event) => <EventCard event={event} />}
      ariaLabel="Carrusel de eventos destacados"
    />
  )
}
