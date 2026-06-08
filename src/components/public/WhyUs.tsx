const ITEMS = [
  {
    title: 'Experiencia comprobada',
    description: 'Más de 500 eventos realizados con la mejor energía y dedicación.',
    icon: (
      <>
        <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4z" />
        <path d="M7 6H4a2 2 0 002 5M17 6h3a2 2 0 01-2 5" />
      </>
    ),
  },
  {
    title: 'Equipos de calidad',
    description: 'Cabinas, pantallas y accesorios de última generación, siempre impecables.',
    icon: <path d="M12 2l2.7 6.4L22 9.3l-5 4.7 1.4 7-6.4-3.5-6.4 3.5L7 14 2 9.3l7.3-.9z" />,
  },
  {
    title: 'Atención personalizada',
    description: 'Te acompañamos desde la cotización hasta el último brindis.',
    icon: <path d="M20.8 8.6c0 4.5-8.8 9.9-8.8 9.9S3.2 13.1 3.2 8.6a4.6 4.6 0 018.8-1.9 4.6 4.6 0 018.8 1.9z" />,
  },
  {
    title: 'Personalización total',
    description: 'Adaptamos cada propuesta a la temática y estilo de tu evento.',
    icon: (
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
    ),
  },
]

export function WhyUs() {
  return (
    <section id="nosotros" className="section-bg-nosotros px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-14">¿Por qué elegirnos?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {ITEMS.map(({ title, description, icon }) => (
            <div key={title} className="bg-s2 rounded-3xl p-7 border border-white/8">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F07820"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-5"
                aria-hidden="true"
              >
                {icon}
              </svg>
              <h3 className="font-display text-lg mb-2">{title}</h3>
              <p className="text-sm text-white/55 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
