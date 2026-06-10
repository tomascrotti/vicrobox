import type { Metadata } from 'next'
import { Fredoka, Nunito } from 'next/font/google'
import './globals.css'

const fredoka = Fredoka({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vicrobox',
  description:
    'Fotocabinas, stand de glitter, cabina espejada, túnel LED y más para tu evento en Buenos Aires.',
  openGraph: {
    title: 'Vicrobox Entretenimiento',
    description: 'Tu evento, nuestro show.',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="font-body bg-bg-main text-white antialiased">
        {children}
      </body>
    </html>
  )
}
