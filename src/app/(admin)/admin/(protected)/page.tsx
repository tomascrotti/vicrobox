import { getAllServices } from '@/lib/data/services'
import { getAllEventsAdmin } from '@/lib/data/events'
import { getAllWhyUsItems } from '@/lib/data/whyus'
import { AdminTabs } from '@/components/admin/AdminTabs'

export default async function AdminPage() {
  const [services, events, whyUsItems] = await Promise.all([
    getAllServices(),
    getAllEventsAdmin(),
    getAllWhyUsItems(),
  ])

  return (
    <main className="px-6 md:px-12 py-10">
      <div className="mx-auto max-w-[1200px]">
        <AdminTabs services={services} events={events} whyUsItems={whyUsItems} />
      </div>
    </main>
  )
}
