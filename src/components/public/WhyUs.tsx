import { getActiveWhyUsItems } from '@/lib/data/whyus'
import { IconSvg } from '@/lib/icons'

export async function WhyUs({ bgUrl }: { bgUrl: string }) {
  const items = await getActiveWhyUsItems()

  return (
    <section
      id="nosotros"
      className="px-6 py-24"
      style={{
        backgroundImage: `linear-gradient(rgba(18,15,10,0.65),rgba(18,15,10,0.65)), url('${bgUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-14">¿Por qué elegirnos?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-7">
          {items.map((item) => (
            <div key={item.id} className="bg-s2 rounded-3xl p-7 border border-white/8">
              <div className="mb-5">
                <IconSvg iconKey={item.icon_key} />
              </div>
              <h3 className="font-display text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-white/55 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
