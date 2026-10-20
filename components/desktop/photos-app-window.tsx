'use client'

import { useState, useEffect, useRef } from 'react'
import {
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { usePhotoStore, photoStore, processImageFile } from '@/lib/photo-store'

export function PhotosAppWindow() {
  const { photos, currentIndex, isAppOpen, autoRotate, intervalSeconds } = usePhotoStore()
  const [isMaximized, setIsMaximized] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [targetSlot, setTargetSlot] = useState<number>(0)
  const [customSecInput, setCustomSecInput] = useState<string>(
    [3, 5, 10, 15].includes(intervalSeconds) ? '' : String(intervalSeconds)
  )
  const windowRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (![3, 5, 10, 15].includes(intervalSeconds)) {
      setCustomSecInput(String(intervalSeconds))
    }
  }, [intervalSeconds])

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

  function triggerUpload(slotIdx?: number) {
    setTargetSlot(typeof slotIdx === 'number' ? slotIdx : currentIndex)
    fileInputRef.current?.click()
  }

  async function handleFileSelected(file: File, slot: number) {
    setIsUploading(true)
    try {
      const dataUrl = await processImageFile(file)
      const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 24)
      photoStore.uploadPhoto(slot, dataUrl, cleanName)
      photoStore.setCurrentIndex(slot)
    } catch (err) {
      console.error('Failed to process image file:', err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await handleFileSelected(file, targetSlot)
  }

  async function handleDropOnPreview(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      await handleFileSelected(file, currentIndex)
    }
  }

  if (!isAppOpen) return null

  const current = photos[currentIndex] || photos[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-200 select-none">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

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
            ? 'h-[90vh] w-[94vw] max-w-5xl'
            : 'h-[620px] max-h-[94vh] w-full max-w-2xl'
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

          {/* Slots Count Pill */}
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">
              Slot {currentIndex + 1} of {photos.length}
            </span>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex flex-1 flex-col overflow-y-auto p-5 sm:p-6 gap-5 bg-card">
          {/* Top Preview & Crop Canvas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
            {/* Live Widget Preview Square */}
            <div className="flex flex-col items-center gap-2.5">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropOnPreview}
                title={current.src ? 'Drag & drop any photo file here to replace' : 'Click or drop photo here to upload'}
                className={`group relative size-52 sm:size-56 overflow-hidden rounded-3xl border-2 shadow-lg cursor-pointer ${
                  current.src
                    ? 'border-signal bg-black/10'
                    : 'border-dashed border-muted-foreground/40 bg-muted/20 flex flex-col items-center justify-center'
                }`}
                onClick={() => triggerUpload(currentIndex)}
              >
                {current.src ? (
                  <>
                    <img
                      src={current.src}
                      alt={current.alt || current.title}
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
                      <div className="border-r border-b border-white/15" />
                      <div />
                    </div>

                    {/* Upload Overlay on Hover */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                      <Upload className="size-6 stroke-[2]" />
                      <span className="text-[11px] font-bold">Replace Picture</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground group-hover:scale-110 group-hover:text-foreground transition-all">
                      <Upload className="size-6 stroke-[2]" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Empty Slot {currentIndex + 1}</span>
                    <span className="text-[10px] text-muted-foreground">Click or drop image to upload</span>
                  </div>
                )}
              </div>

              {/* Title and Upload/Remove/Reset Actions */}
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-foreground text-center truncate max-w-[180px]">
                    {current.title}
                  </p>
                  {current.isCustom && (
                    <span className="rounded-full bg-signal/15 text-signal text-[9px] font-bold px-1.5 py-0.2">
                      Custom
                    </span>
                  )}
                  {!current.src && (
                    <span className="rounded-full bg-muted text-muted-foreground text-[9px] font-semibold px-1.5 py-0.2 border border-border">
                      No Image
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {/* 1. Upload Button */}
                  <button
                    type="button"
                    onClick={() => triggerUpload(currentIndex)}
                    disabled={isUploading}
                    className="flex items-center gap-1 rounded-xl bg-signal px-3 py-1 text-xs font-bold text-white shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    <Upload className="size-3 stroke-[2.5]" />
                    <span>{isUploading ? 'Uploading…' : (current.src ? 'Replace Photo' : 'Upload Photo')}</span>
                  </button>

                  {/* 2. Remove Image Button */}
                  {current.src && (
                    <button
                      type="button"
                      onClick={() => photoStore.removePhoto(currentIndex)}
                      title="Remove image from this slot"
                      className="flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-medium text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      <Trash2 className="size-3" />
                      <span>Remove</span>
                    </button>
                  )}

                  {/* 3. Restore Default Button */}
                  {(current.isCustom || !current.src) && (
                    <button
                      type="button"
                      onClick={() => photoStore.resetPhotoToDefault(currentIndex)}
                      title="Restore original default preset image for this slot"
                      className="flex items-center gap-1 rounded-xl border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                    >
                      <RotateCcw className="size-3" />
                      <span>Default</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Crop Sliders for the Active Image */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-border/60">
                <span className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
                  Crop Adjustments (Slot {currentIndex + 1})
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

          {/* 7 Slots Selector Strip */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Photo Slots ({photos.length} Total Slots)
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

            {/* 7 Thumbnails Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
              {photos.map((p, idx) => {
                const isSelected = idx === currentIndex
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => photoStore.setCurrentIndex(idx)}
                    className={`group relative flex flex-col items-center gap-1 rounded-xl p-1.5 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-signal bg-signal/10 shadow-sm scale-102 ring-2 ring-signal/30'
                        : 'border-border/80 bg-card hover:border-foreground/30'
                    }`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted/50">
                      {p.src ? (
                        <img
                          src={p.src}
                          alt={p.alt || p.title}
                          className="size-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="size-full flex flex-col items-center justify-center border border-dashed border-border rounded-lg text-muted-foreground/60 bg-muted/20">
                          <Upload className="size-3.5" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-signal text-white shadow-xs">
                          <Check className="size-2.5 stroke-[3]" />
                        </div>
                      )}
                      {p.isCustom && (
                        <div className="absolute bottom-1 left-1 flex size-3.5 items-center justify-center rounded-full bg-black/60 text-white shadow-xs">
                          <Sparkles className="size-2 fill-current" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`truncate text-[10px] font-medium w-full text-center ${
                        isSelected ? 'text-signal font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      Slot {idx + 1}
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
                Cycles across all 7 photo slots on the desktop widget
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Presets: 3s, 5s, 10s, 15s - they STICK regardless of pause state */}
              {[3, 5, 10, 15].map((sec) => {
                const isSelected = intervalSeconds === sec
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      photoStore.setIntervalSeconds(sec)
                      setCustomSecInput('')
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-foreground text-background shadow-xs ring-2 ring-foreground/20 scale-102'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sec}s
                  </button>
                )
              })}

              {/* Custom Seconds Input */}
              <div
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all ${
                  ![3, 5, 10, 15].includes(intervalSeconds)
                    ? 'bg-foreground text-background shadow-xs ring-2 ring-foreground/20 border-foreground'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Custom:</span>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={customSecInput}
                  onChange={(e) => {
                    const val = e.target.value
                    setCustomSecInput(val)
                    const num = parseInt(val, 10)
                    if (!isNaN(num) && num > 0) {
                      photoStore.setIntervalSeconds(num)
                    }
                  }}
                  placeholder="sec"
                  className={`w-9 bg-transparent text-center font-bold outline-none text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    ![3, 5, 10, 15].includes(intervalSeconds)
                      ? 'text-background placeholder:text-background/60'
                      : 'text-foreground'
                  }`}
                />
                <span className="font-bold">s</span>
              </div>

              {/* Play / Paused Toggle with stable fixed width so it never moves when clicked */}
              <button
                type="button"
                onClick={() => photoStore.toggleAutoRotate()}
                className={`flex w-24 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  autoRotate
                    ? 'bg-foreground text-background hover:opacity-90'
                    : 'bg-signal text-white hover:opacity-90'
                }`}
              >
                {autoRotate ? (
                  <>
                    <Play className="size-3 fill-current" />
                    <span>Auto</span>
                  </>
                ) : (
                  <>
                    <Pause className="size-3 fill-current" />
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
