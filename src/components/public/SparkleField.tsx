'use client'

import { useEffect, useState } from 'react'

type Flash = { left: string; top: string; size: string; delay: string; duration: string; opacity: number }

function randomFlashes(count: number): Flash[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.round(Math.random() * 96)}%`,
    top: `${Math.round(Math.random() * 92)}%`,
    size: `${10 + Math.round(Math.random() * 16)}px`,
    delay: `${(Math.random() * 6).toFixed(1)}s`,
    duration: `${(2.4 + Math.random() * 3.6).toFixed(1)}s`,
    opacity: 0.6 + Math.random() * 0.4,
  }))
}

export function SparkleField({ count = 24, className = 'absolute inset-0' }: { count?: number; className?: string }) {
  const [flashes, setFlashes] = useState<Flash[]>([])

  useEffect(() => {
    setFlashes(randomFlashes(count))
  }, [count])

  return (
    <div className={`${className} pointer-events-none`} aria-hidden="true">
      {flashes.map((f, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: f.left,
            top: f.top,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            boxShadow: `0 0 ${parseInt(f.size) * 4}px ${parseInt(f.size) * 1.5}px rgba(255,255,255,0.9)`,
            animation: `camflash ${f.duration} ease-out infinite`,
            animationDelay: f.delay,
            animationFillMode: 'backwards',
          }}
        />
      ))}
    </div>
  )
}
