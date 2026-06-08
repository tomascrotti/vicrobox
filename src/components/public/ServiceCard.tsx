import Link from 'next/link'
import { buildServiceHref } from '@/lib/service-links'
import type { Service } from '@/types'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop'

type ServiceCardProps = { service: Service }

export function ServiceCard({ service }: ServiceCardProps) {
  const cover = service.images?.[0]?.url ?? PLACEHOLDER_IMAGE
  const tagline = service.tagline || service.name

  return (
    <article className="h-full flex flex-col bg-s2 rounded-[20px] overflow-hidden border border-white/7 transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:scale-[1.01]">
      <div className="relative h-[200px] flex-shrink-0 overflow-hidden">
        <img src={cover} alt={service.name} className="absolute inset-0 h-full w-full object-cover" />
        <span
          className="absolute top-4 left-4 inline-flex items-center rounded-full px-3.5 py-2 text-[13px] font-bold text-white"
          style={{ background: 'rgba(12,12,16,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
          {service.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6 pb-7">
        <p className="text-[15px] font-extrabold leading-tight" style={{ color: service.color }}>{tagline}</p>
        <p className="flex-1 text-sm font-medium leading-relaxed text-white/55">{service.description}</p>
        <Link
          href={buildServiceHref(service.slug)}
          className="inline-flex w-fit items-center gap-1 text-[13px] font-extrabold transition-[gap] hover:gap-2"
          style={{ color: service.color }}
        >
          Ver detalle →
        </Link>
      </div>
    </article>
  )
}
