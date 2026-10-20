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

  const current = photos[currentIndex]?.src
    ? photos[currentIndex]
    : photos.find((p) => Boolean(p.src)) || photos[0]

  return (
    <div
      className="group relative aspect-square w-full select-none overflow-hidden rounded-3xl bg-card shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] border border-black/5 dark:border-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Photo with Custom Crop Framing */}
      <div className="size-full overflow-hidden">
        {current?.src ? (
          <img
            src={current.src}
            alt={current.alt || current.title}
            draggable={false}
            className="size-full transition-all duration-700 ease-out"
            style={{
              objectFit: 'cover',
              objectPosition: `${current.x}% ${current.y}%`,
              transform: `scale(${current.zoom})`,
              transformOrigin: `${current.x}% ${current.y}%`,
            }}
          />
        ) : (
          <div
            onClick={() => photoStore.openApp()}
            className="size-full flex flex-col items-center justify-center gap-1.5 p-4 text-center cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="text-2xl">📷</span>
            <span className="text-[11px] font-bold text-foreground">No Photos</span>
            <span className="text-[9px] text-muted-foreground">Click ↗ to upload photos</span>
          </div>
        )}
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
