'use client'

import { useState } from 'react'
import { AdminEventCard } from './AdminEventCard'
import { EventFormModal } from './EventFormModal'
import { SectionBgEditor } from './SectionBgEditor'
import type { Event, EventTypeRecord, Service } from '@/types'

export function EventsGrid({
  events,
  eventTypes,
  availableServices,
  bgUrl,
}: {
  events: Event[]
  eventTypes: EventTypeRecord[]
  availableServices: Service[]
  bgUrl: string
}) {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      <SectionBgEditor settingKey="events_bg_url" currentUrl={bgUrl} label="Eventos Destacados" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {events.map((event) => (
          <AdminEventCard key={event.id} event={event} onEdit={() => setEditingEvent(event)} />
        ))}
        <button
          onClick={() => setShowCreate(true)}
          className="flex flex-col items-center justify-center gap-3 bg-s2/50 rounded-[20px] border border-dashed border-white/20 min-h-[300px] w-full hover:border-white/40 hover:bg-s2/70 transition-colors group"
        >
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-white/70 transition-colors">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white/40 group-hover:text-white/70 transition-colors">Nuevo Evento</span>
        </button>
      </div>

      {showCreate && (
        <EventFormModal
          mode="create"
          eventTypes={eventTypes}
          availableServices={availableServices}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editingEvent && (
        <EventFormModal
          mode="edit"
          event={editingEvent}
          eventTypes={eventTypes}
          availableServices={availableServices}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </>
  )
}
