'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Crop,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react'
import { usePhotoStore, photoStore } from '@/lib/photo-store'

export function PhotosAppWindow() {
  const { photos, currentIndex, isAppOpen, autoRotate, intervalSeconds } = usePhotoStore()
  const [isMaximized, setIsMaximized] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isAppOpen) {
        photoStore.closeApp()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAppOpen])

  if (!isAppOpen) return null

  const current = photos[currentIndex] || photos[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-200 select-none">
      {/* Background click to dismiss */}
      <div
        className="absolute inset-0"
        onClick={() => photoStore.closeApp()}
        aria-hidden="true"
      />

      {/* Main Window */}
      <div
        ref={windowRef}
        className={`relative z-10 flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-card text-card-foreground shadow-[0_25px_50px_-12px_rgb(0_0_0/0.3),0_0_0_1px_rgb(0_0_0/0.05)] transition-all duration-300 ${
          isMaximized
            ? 'h-[88vh] w-[92vw] max-w-5xl'
            : 'h-[580px] max-h-[92vh] w-full max-w-2xl'
        }`}
      >
        {/* macOS Title Bar */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-muted/40 px-4">
          {/* Traffic Light Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => photoStore.closeApp()}
              title="Close"
              className="group flex size-3 items-center justify-center rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-90 transition-all cursor-pointer"
            >
              <span className="text-[8px] font-bold text-black/60 opacity-0 group-hover:opacity-100">✕</span>
            </button>
            <button
              onClick={() => photoStore.closeApp()}
              title="Minimize"
              className="group flex size-3 items-center justify-center rounded-full bg-[#febc2e] border border-[#d89e24] hover:brightness-90 transition-all cursor-pointer"
            >
              <span className="text-[8px] font-bold text-black/60 opacity-0 group-hover:opacity-100">−</span>
            </button>
            <button
              onClick={() => setIsMaximized((m) => !m)}
              title={isMaximized ? 'Restore' : 'Maximize'}
              className="group flex size-3 items-center justify-center rounded-full bg-[#28c840] border border-[#1aab29] hover:brightness-90 transition-all cursor-pointer"
            >
              <span className="text-[7px] font-bold text-black/60 opacity-0 group-hover:opacity-100">⤢</span>
            </button>
          </div>

          {/* Window Title */}
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/85">
            <ImageIcon className="size-4 text-signal" />
            <span>Photos & Framing Studio</span>
          </div>

          {/* Slideshow Status Pill */}
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">
              {currentIndex + 1} of {photos.length}
            </span>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex flex-1 flex-col overflow-y-auto p-5 sm:p-6 gap-5 bg-card">
          {/* Top Preview & Crop Canvas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
            {/* Live Widget Preview Square */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative size-52 sm:size-56 overflow-hidden rounded-3xl border-2 border-signal shadow-lg bg-black/10">
                <img
                  src={current.src}
                  alt={current.alt}
                  draggable={false}
                  className="size-full transition-all duration-100"
                  style={{
                    objectFit: 'cover',
                    objectPosition: `${current.x}% ${current.y}%`,
                    transform: `scale(${current.zoom})`,
                    transformOrigin: `${current.x}% ${current.y}%`,
                  }}
                />
                {/* Rule of Thirds Guide Lines */}
                <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/20">
                  <div className="border-r border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-r border-white/15" />
                  <div />
                </div>
              </div>
              <p className="text-xs font-semibold text-foreground text-center">
                {current.title}
              </p>
            </div>

            {/* Crop Sliders for the Active Image */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-border/60">
                <span className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
                  Crop Adjustments
                </span>
                <button
                  type="button"
                  onClick={() => photoStore.resetCrop(currentIndex)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset Crop</span>
                </button>
              </div>

              {/* Horizontal Pan X */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Horizontal Position (X)</span>
                  <span className="tabular-nums font-semibold">{current.x}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={current.x}
                  onChange={(e) =>
                    photoStore.updateCrop(currentIndex, { x: Number(e.target.value) })
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-signal"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>Left</span>
                  <span>Center</span>
                  <span>Right</span>
                </div>
              </div>

              {/* Vertical Pan Y */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Vertical Position (Y)</span>
                  <span className="tabular-nums font-semibold">{current.y}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={current.y}
                  onChange={(e) =>
                    photoStore.updateCrop(currentIndex, { y: Number(e.target.value) })
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-signal"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>Top</span>
                  <span>Center</span>
                  <span>Bottom</span>
                </div>
              </div>

              {/* Zoom Scale */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Zoom Scale</span>
                  <span className="tabular-nums font-semibold">{current.zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.05"
                  value={current.zoom}
                  onChange={(e) =>
                    photoStore.updateCrop(currentIndex, { zoom: Number(e.target.value) })
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-signal"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>1.0x (Standard)</span>
                  <span>1.75x</span>
                  <span>2.5x (Close-up)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Image Crop Selector Strip */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Select Photo to Crop ({photos.length} photos)
              </span>

              {/* Previous / Next buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => photoStore.prevPhoto()}
                  className="flex items-center gap-1 rounded-lg bg-card px-2 py-1 text-xs font-semibold border border-border hover:bg-muted transition-all cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => photoStore.nextPhoto()}
                  className="flex items-center gap-1 rounded-lg bg-card px-2 py-1 text-xs font-semibold border border-border hover:bg-muted transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* 5 Thumbnails Grid */}
            <div className="grid grid-cols-5 gap-2.5 pt-1">
              {photos.map((p, idx) => {
                const isSelected = idx === currentIndex
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => photoStore.setCurrentIndex(idx)}
                    className={`group flex flex-col items-center gap-1.5 rounded-xl p-1.5 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-signal bg-signal/10 shadow-sm scale-102'
                        : 'border-border/80 bg-card hover:border-foreground/30'
                    }`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                      <img
                        src={p.src}
                        alt={p.alt}
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-signal text-white shadow-xs">
                          <Check className="size-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`truncate text-[10px] font-medium w-full text-center ${
                        isSelected ? 'text-signal font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      Photo {idx + 1}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Slideshow Rotation Timing & Play/Pause */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-xs">
            <div>
              <p className="font-semibold text-foreground">Widget Auto-Slide Speed</p>
              <p className="text-[11px] text-muted-foreground">
                How often the desktop photo widget cycles to the next image
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[3, 5, 10, 15].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => photoStore.setIntervalSeconds(sec)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    intervalSeconds === sec && autoRotate
                      ? 'bg-foreground text-background shadow-xs'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sec}s
                </button>
              ))}

              <button
                type="button"
                onClick={() => photoStore.toggleAutoRotate()}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  autoRotate
                    ? 'bg-foreground text-background'
                    : 'bg-signal text-white'
                }`}
              >
                {autoRotate ? (
                  <>
                    <Pause className="size-3 fill-current" />
                    <span>Auto</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3 fill-current" />
                    <span>Paused</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
