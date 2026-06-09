'use client'

import { useState } from 'react'
import { ServicesGrid } from './ServicesGrid'
import { EventsGrid } from './EventsGrid'
import { WhyUsGrid } from './WhyUsGrid'
import type { Service, Event, WhyUsItem, EventTypeRecord } from '@/types'

const TABS = [
  { id: 'servicios', label: 'Servicios' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'whyus', label: '¿Por qué elegirnos?' },
] as const

type TabId = (typeof TABS)[number]['id']

export function AdminTabs({
  services,
  events,
  whyUsItems,
  eventTypes,
  servicesBgUrl,
  eventsBgUrl,
  whyusBgUrl,
}: {
  services: Service[]
  events: Event[]
  whyUsItems: WhyUsItem[]
  eventTypes: EventTypeRecord[]
  servicesBgUrl: string
  eventsBgUrl: string
  whyusBgUrl: string
}) {
  const [activeTab, setActiveTab] = useState<TabId>('servicios')

  return (
    <div>
      <div className="flex gap-1 mb-8 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-orange text-white'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'servicios' && <ServicesGrid services={services} bgUrl={servicesBgUrl} />}
      {activeTab === 'eventos' && <EventsGrid events={events} eventTypes={eventTypes} availableServices={services} bgUrl={eventsBgUrl} />}
      {activeTab === 'whyus' && <WhyUsGrid items={whyUsItems} bgUrl={whyusBgUrl} />}
    </div>
  )
}
