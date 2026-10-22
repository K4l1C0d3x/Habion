'use client'

import { useWallpaperStore, PRESET_WALLPAPERS } from '@/lib/wallpaper-store'

export function DesktopWallpaper() {
  const { currentWallpaperId, customWallpaperData, blur, dim, fit } = useWallpaperStore()

  // Find if current is preset or custom
  const isCustom = currentWallpaperId === 'custom' && Boolean(customWallpaperData)
  const currentPreset = PRESET_WALLPAPERS.find((p) => p.id === currentWallpaperId)

  // Determine styling based on selected wallpaper
  const backgroundStyle: React.CSSProperties = {}

  if (isCustom && customWallpaperData) {
    backgroundStyle.backgroundImage = `url(${customWallpaperData})`
    backgroundStyle.backgroundPosition = 'center center'
    backgroundStyle.backgroundRepeat = 'no-repeat'
    if (fit === 'contain') {
      backgroundStyle.backgroundSize = 'contain'
    } else {
      backgroundStyle.backgroundSize = 'cover'
    }
  } else if (currentPreset && currentPreset.value) {
    backgroundStyle.background = currentPreset.value
  } else {
    // Default theme background
    backgroundStyle.backgroundColor = 'var(--background)'
  }

  const filterStyle = blur > 0 ? `blur(${blur}px)` : undefined

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Background layer with smooth transition & optional blur */}
      <div
        className="absolute -inset-4 transition-[background,background-image,filter] duration-500 ease-out"
        style={{
          ...backgroundStyle,
          filter: filterStyle,
        }}
      />

      {/* Optional dim overlay (for readability) */}
      {dim > 0 && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300 pointer-events-none"
          style={{ opacity: dim / 100 }}
        />
      )}
    </div>
  )
}
