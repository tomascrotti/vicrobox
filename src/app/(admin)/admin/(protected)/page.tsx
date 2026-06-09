import { getAllServices } from '@/lib/data/services'
import { getAllEventsAdmin } from '@/lib/data/events'
import { getAllWhyUsItems } from '@/lib/data/whyus'
import { getEventTypes } from '@/lib/data/event-types'
import { getSettings } from '@/lib/data/settings'
import { AdminTabs } from '@/components/admin/AdminTabs'

export default async function AdminPage() {
  const [services, events, whyUsItems, eventTypes, settings] = await Promise.all([
    getAllServices(),
    getAllEventsAdmin(),
    getAllWhyUsItems(),
    getEventTypes(),
    getSettings(),
  ])

  return (
    <main className="px-6 md:px-12 py-10">
      <div className="mx-auto max-w-[1200px]">
        <AdminTabs
          services={services}
          events={events}
          whyUsItems={whyUsItems}
          eventTypes={eventTypes}
          servicesBgUrl={settings.services_bg_url}
          eventsBgUrl={settings.events_bg_url}
        />
      </div>
    </main>
  )
}
