'use client'

import { useState, useEffect, useCallback } from 'react'

type Image = { id: string; url: string }

export function ServiceGallery({ images, serviceName }: { images: Image[]; serviceName: string }) {
  const INITIAL_COUNT = 6
  const [showAll, setShowAll] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const visible = showAll ? images : images.slice(0, INITIAL_COUNT)
  const hasMore = images.length > INITIAL_COUNT && !showAll

  const close = useCallback(() => setLightboxIdx(null), [])
  const prev = useCallback(() => setLightboxIdx((i) => i !== null ? (i - 1 + images.length) % images.length : null), [images.length])
  const next = useCallback(() => setLightboxIdx((i) => i !== null ? (i + 1) % images.length : null), [images.length])

  useEffect(() => {
    if (lightboxIdx === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIdx, close, prev, next])

  if (images.length === 0) return null

  return (
    <>
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {visible.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightboxIdx(idx)}
            className="w-full rounded-xl overflow-hidden break-inside-avoid block cursor-zoom-in group"
          >
            <img
              src={img.url}
              alt={serviceName}
              className="w-full object-cover group-hover:opacity-85 transition-opacity"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-6 w-full rounded-full border border-white/16 py-3 text-sm font-bold text-white/60 hover:border-white/32 hover:text-white transition-colors"
        >
          Ver más · {images.length - INITIAL_COUNT} fotos más
        </button>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 text-white/60 hover:text-white p-2"
            aria-label="Cerrar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-2 md:left-6 text-white/60 hover:text-white p-3 rounded-full bg-white/8 hover:bg-white/16 transition-colors"
              aria-label="Anterior"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Image */}
          <img
            src={images[lightboxIdx].url}
            alt={serviceName}
            className="max-h-[90vh] max-w-[88vw] md:max-w-[80vw] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-2 md:right-6 text-white/60 hover:text-white p-3 rounded-full bg-white/8 hover:bg-white/16 transition-colors"
              aria-label="Siguiente"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {/* Counter */}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-sm tabular-nums">
            {lightboxIdx + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  )
}
