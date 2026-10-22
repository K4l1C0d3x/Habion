'use client'

import { useSyncExternalStore, useEffect } from 'react'

export type WallpaperFit = 'cover' | 'contain' | 'blur'

export interface WallpaperPreset {
  id: string
  name: string
  type: 'color' | 'gradient' | 'image'
  value: string // css background value or image url
  thumbnail?: string
}

export const PRESET_WALLPAPERS: WallpaperPreset[] = [
  {
    id: 'default',
    name: 'Default',
    type: 'color',
    value: '', // transparent, shows default system theme background
  },
  {
    id: 'sequoia-dusk',
    name: 'Sequoia Dusk',
    type: 'gradient',
    value: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
  },
  {
    id: 'sonoma-horizon',
    name: 'Sonoma Horizon',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    type: 'gradient',
    value: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0ba360 0%, #3cba92 50%, #30cfd0 100%)',
  },
  {
    id: 'miami-sunset',
    name: 'Miami Sunset',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    id: 'midnight-violet',
    name: 'Midnight Violet',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  },
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    type: 'gradient',
    value: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
  },
]

export interface WallpaperState {
  currentWallpaperId: string // preset ID or 'custom'
  customWallpaperData: string | null // base64 or object URL
  customWallpaperName: string | null
  blur: number // 0 to 20 px
  dim: number // 0 to 80 %
  fit: WallpaperFit
}

const STORAGE_KEY_WALLPAPER = 'desktop_wallpaper_v1'

const DEFAULT_STATE: WallpaperState = {
  currentWallpaperId: 'default',
  customWallpaperData: null,
  customWallpaperName: null,
  blur: 0,
  dim: 0,
  fit: 'cover',
}

let state: WallpaperState = { ...DEFAULT_STATE }
let isInitialized = false
const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function persistState() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_WALLPAPER, JSON.stringify(state))
  } catch (err) {
    // If quota exceeded, try saving without custom data or warn
    console.warn('Could not save wallpaper to localStorage:', err)
  }
}

function loadState() {
  if (isInitialized || typeof window === 'undefined') return
  isInitialized = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WALLPAPER)
    if (raw) {
      const parsed = JSON.parse(raw)
      state = { ...DEFAULT_STATE, ...parsed }
      emitChange()
    }
  } catch {
    // ignore
  }
}

export const wallpaperStore = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  setPreset: (presetId: string) => {
    state = {
      ...state,
      currentWallpaperId: presetId,
    }
    persistState()
    emitChange()
  },

  setCustomWallpaper: (dataUrl: string, fileName?: string) => {
    state = {
      ...state,
      currentWallpaperId: 'custom',
      customWallpaperData: dataUrl,
      customWallpaperName: fileName || 'Uploaded Wallpaper',
    }
    persistState()
    emitChange()
  },

  removeCustomWallpaper: () => {
    state = {
      ...state,
      customWallpaperData: null,
      customWallpaperName: null,
      currentWallpaperId: state.currentWallpaperId === 'custom' ? 'default' : state.currentWallpaperId,
    }
    persistState()
    emitChange()
  },

  setBlur: (blur: number) => {
    state = { ...state, blur: Math.max(0, Math.min(30, blur)) }
    persistState()
    emitChange()
  },

  setDim: (dim: number) => {
    state = { ...state, dim: Math.max(0, Math.min(90, dim)) }
    persistState()
    emitChange()
  },

  setFit: (fit: WallpaperFit) => {
    state = { ...state, fit }
    persistState()
    emitChange()
  },

  resetToDefault: () => {
    state = { ...DEFAULT_STATE }
    persistState()
    emitChange()
  },
}

export function useWallpaperStore() {
  useEffect(() => {
    loadState()
  }, [])

  return useSyncExternalStore(
    wallpaperStore.subscribe,
    wallpaperStore.getState,
    () => state
  )
}

/**
 * Helper to process and compress uploaded wallpaper images
 * Standard desktop resolution cap (max 1920x1080, JPEG quality 0.82)
 * to stay safely within browser storage limits while looking crisp.
 */
export function processWallpaperFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.onload = () => {
        const MAX_WIDTH = 1920
        const MAX_HEIGHT = 1080
        let { width, height } = img

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        const compressed = canvas.toDataURL('image/jpeg', 0.82)
        resolve(compressed)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
