'use client'

import { useRef, type ReactNode } from 'react'

type CardCarouselProps<T> = {
  items: T[]
  getKey: (item: T) => string
  renderCard: (item: T) => ReactNode
  ariaLabel: string
}

const NAV_BUTTON_CLASS =
  'flex h-11 w-11 items-center justify-center rounded-full border border-white/16 bg-s2 text-white transition-colors duration-150 hover:border-white/32 hover:bg-white/8'

// Keep this in sync with the track's `gap-[18px]` className below —
// scrollByCard's step must match the actual visual gap between cards.
const CARD_GAP_PX = 18

export function CardCarousel<T>({ items, getKey, renderCard, ariaLabel }: CardCarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null)

  // Assumes uniform card width (guaranteed today by the calc()-based
  // width classes applied to every [data-card] wrapper above).
  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('[data-card]')
    const step = (card?.offsetWidth ?? track.clientWidth / 3) + CARD_GAP_PX
    track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <div className="-mx-12 overflow-x-hidden overflow-y-visible px-12">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-[18px] overflow-x-auto overflow-y-visible scroll-smooth pt-6 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div key={getKey(item)} data-card className="w-[calc((100%-36px)/3)] max-[880px]:w-[calc((100%-18px)/2)] flex-none snap-start">
            {renderCard(item)}
          </div>
        ))}
      </div>
      <nav className="mt-2 flex justify-center gap-2.5" aria-label={ariaLabel}>
        <button type="button" onClick={() => scrollByCard(-1)} aria-label="Anteriores" className={NAV_BUTTON_CLASS}>‹</button>
        <button type="button" onClick={() => scrollByCard(1)} aria-label="Siguientes" className={NAV_BUTTON_CLASS}>›</button>
      </nav>
    </div>
  )
}
