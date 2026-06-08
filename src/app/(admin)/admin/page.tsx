import { getAllServices } from '@/lib/data/services'
import { ServicesGrid } from '@/components/admin/ServicesGrid'

export default async function AdminPage() {
  const services = await getAllServices()

  return (
    <main className="px-6 md:px-12 py-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl">Servicios</h1>
          <span className="text-sm text-white/40">{services.length} en total</span>
        </div>
        <ServicesGrid services={services} />
      </div>
    </main>
  )
}
