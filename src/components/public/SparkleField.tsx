'use client'

import { useEffect, useState } from 'react'

type Flash = { left: string; top: string; size: string; delay: string; duration: string; opacity: number }

function randomFlashes(count: number): Flash[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.round(Math.random() * 96)}%`,
    top: `${Math.round(Math.random() * 92)}%`,
    size: `${40 + Math.round(Math.random() * 90)}px`,
    delay: `${(Math.random() * 5).toFixed(1)}s`,
    duration: `${(2.6 + Math.random() * 2).toFixed(1)}s`,
    opacity: 0.18 + Math.random() * 0.22,
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
          className="absolute rounded-full"
          style={{
            left: f.left,
            top: f.top,
            width: f.size,
            height: f.size,
            background: `radial-gradient(circle, rgba(255,255,255,${f.opacity}) 0%, transparent 70%)`,
            animation: `shutterflash-bg ${f.duration} ease-in-out infinite`,
            animationDelay: f.delay,
            animationFillMode: 'backwards',
          }}
        />
      ))}
    </div>
  )
}
