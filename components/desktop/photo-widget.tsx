'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { usePhotoStore, photoStore } from '@/lib/photo-store'

export function PhotoWidget() {
  const { photos, currentIndex, autoRotate, intervalSeconds, isAppOpen } = usePhotoStore()
  const [isHovered, setIsHovered] = useState(false)

  // Auto-rotate slideshow timer
  useEffect(() => {
    if (!autoRotate || isHovered || isAppOpen) return
    const id = setInterval(() => {
      photoStore.nextPhoto()
    }, intervalSeconds * 1000)
    return () => clearInterval(id)
  }, [autoRotate, isHovered, isAppOpen, intervalSeconds, photos.length])

  const current = photos[currentIndex] || photos[0]

  return (
    <div
      className="group relative aspect-square w-full select-none overflow-hidden rounded-3xl bg-card shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] border border-black/5 dark:border-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Photo with Custom Crop Framing */}
      <div className="size-full overflow-hidden">
        <img
          src={current.src}
          alt={current.alt}
          draggable={false}
          className="size-full transition-all duration-700 ease-out"
          style={{
            objectFit: 'cover',
            objectPosition: `${current.x}% ${current.y}%`,
            transform: `scale(${current.zoom})`,
            transformOrigin: `${current.x}% ${current.y}%`,
          }}
        />
      </div>

      {/* Top Right "Open App" Arrow Button - only visible on hover */}
      <div
        className={`absolute top-2.5 right-2.5 z-10 transition-opacity duration-200 ${
          isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            photoStore.openApp()
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title="Open Photos & Framing App"
          className="flex size-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/85 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
