'use client'

import { useSyncExternalStore, useEffect } from 'react'

export interface PhotoItem {
  id: string
  src: string
  alt: string
  title: string
  isCustom?: boolean
  x: number // 0 to 100%
  y: number // 0 to 100%
  zoom: number // 1.0 to 2.5
}

export interface PhotoState {
  photos: PhotoItem[]
  currentIndex: number
  isAppOpen: boolean
  autoRotate: boolean
  intervalSeconds: number
}

export const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: '1',
    src: '/images/photo-1.jpg',
    alt: 'Cinematic elevator scene',
    title: 'Elevator Lights',
    x: 50,
    y: 35,
    zoom: 1.15,
  },
  {
    id: '2',
    src: '/images/photo-2.jpg',
    alt: 'The Weeknd smiling in red jacket',
    title: 'After Hours Smile',
    x: 50,
    y: 30,
    zoom: 1.25,
  },
  {
    id: '3',
    src: '/images/photo-3.jpg',
    alt: 'Profile under golden bokeh lights',
    title: 'Golden Bokeh',
    x: 55,
    y: 40,
    zoom: 1.1,
  },
  {
    id: '4',
    src: '/images/photo-4.jpg',
    alt: 'Under marquee lights',
    title: 'Marquee Night',
    x: 75,
    y: 45,
    zoom: 1.2,
  },
  {
    id: '5',
    src: '/images/photo-5.jpg',
    alt: 'Portrait close-up',
    title: 'Blinding Lights Portrait',
    x: 50,
    y: 45,
    zoom: 1.0,
  },
  {
    id: '6',
    src: '/images/photo-6.jpg',
    alt: 'Stage profile smile',
    title: 'Stage Profile',
    x: 50,
    y: 30,
    zoom: 1.1,
  },
  {
    id: '7',
    src: '/images/photo-7.jpg',
    alt: 'City lights atmosphere',
    title: 'City Lights',
    x: 60,
    y: 40,
    zoom: 1.15,
  },
]

const STORAGE_KEY_SLOTS = 'desktop_photo_slots_v3'
const STORAGE_KEY_INTERVAL = 'desktop_photo_interval_v3'
const STORAGE_KEY_AUTOROTATE = 'desktop_photo_autorotate_v3'

let state: PhotoState = {
  photos: DEFAULT_PHOTOS,
  currentIndex: 0,
  isAppOpen: false,
  autoRotate: true,
  intervalSeconds: 5,
}

let isInitialized = false
const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function persistPhotos() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(state.photos))
  } catch {
    // ignore
  }
}

function loadInitialState() {
  if (isInitialized || typeof window === 'undefined') return
  isInitialized = true
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SLOTS)
    const savedInterval = localStorage.getItem(STORAGE_KEY_INTERVAL)
    const savedAuto = localStorage.getItem(STORAGE_KEY_AUTOROTATE)

    let nextPhotos = DEFAULT_PHOTOS
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        nextPhotos = DEFAULT_PHOTOS.map((def, i) => {
          const item = parsed[i]
          if (!item) return def
          return {
            ...def,
            src: item.src || def.src,
            title: item.title || def.title,
            isCustom: Boolean(item.isCustom),
            x: typeof item.x === 'number' ? item.x : def.x,
            y: typeof item.y === 'number' ? item.y : def.y,
            zoom: typeof item.zoom === 'number' ? item.zoom : def.zoom,
          }
        })
      }
    }

    state = {
      ...state,
      photos: nextPhotos,
      intervalSeconds: savedInterval ? Number(savedInterval) : 5,
      autoRotate: savedAuto !== null ? savedAuto === 'true' : true,
    }
    emitChange()
  } catch {
    // ignore
  }
}

export const photoStore = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  openApp: () => {
    state = { ...state, isAppOpen: true }
    emitChange()
  },
  closeApp: () => {
    state = { ...state, isAppOpen: false }
    emitChange()
  },
  toggleApp: () => {
    state = { ...state, isAppOpen: !state.isAppOpen }
    emitChange()
  },
  nextPhoto: () => {
    state = { ...state, currentIndex: (state.currentIndex + 1) % state.photos.length }
    emitChange()
  },
  prevPhoto: () => {
    state = {
      ...state,
      currentIndex: (state.currentIndex - 1 + state.photos.length) % state.photos.length,
    }
    emitChange()
  },
  setCurrentIndex: (idx: number) => {
    if (idx >= 0 && idx < state.photos.length) {
      state = { ...state, currentIndex: idx }
      emitChange()
    }
  },
  updateCrop: (idx: number, partial: { x?: number; y?: number; zoom?: number }) => {
    const updated = state.photos.map((p, i) => (i === idx ? { ...p, ...partial } : p))
    state = { ...state, photos: updated }
    persistPhotos()
    emitChange()
  },
  resetCrop: (idx: number) => {
    const def = DEFAULT_PHOTOS[idx]
    if (!def) return
    photoStore.updateCrop(idx, { x: def.x, y: def.y, zoom: def.zoom })
  },
  uploadPhoto: (idx: number, dataUrl: string, title?: string) => {
    const updated = state.photos.map((p, i) => {
      if (i === idx) {
        return {
          ...p,
          src: dataUrl,
          isCustom: true,
          title: title || `Custom Photo ${idx + 1}`,
          x: 50,
          y: 50,
          zoom: 1.0,
        }
      }
      return p
    })
    state = { ...state, photos: updated }
    persistPhotos()
    emitChange()
  },
  resetPhotoToDefault: (idx: number) => {
    const def = DEFAULT_PHOTOS[idx]
    if (!def) return
    const updated = state.photos.map((p, i) => (i === idx ? { ...def } : p))
    state = { ...state, photos: updated }
    persistPhotos()
    emitChange()
  },
  resetAllPhotosToDefault: () => {
    state = { ...state, photos: DEFAULT_PHOTOS }
    persistPhotos()
    emitChange()
  },
  setIntervalSeconds: (sec: number) => {
    state = { ...state, intervalSeconds: sec }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_INTERVAL, String(sec))
      } catch {
        // ignore
      }
    }
    emitChange()
  },
  toggleAutoRotate: () => {
    const next = !state.autoRotate
    state = { ...state, autoRotate: next }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_AUTOROTATE, String(next))
      } catch {
        // ignore
      }
    }
    emitChange()
  },
}

export function usePhotoStore() {
  useEffect(() => {
    loadInitialState()
  }, [])

  return useSyncExternalStore(
    photoStore.subscribe,
    photoStore.getState,
    () => state
  )
}

export function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX_DIM = 1200
        let { width, height } = img
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width)
            width = MAX_DIM
          } else {
            width = Math.round((width * MAX_DIM) / height)
            height = MAX_DIM
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', 0.88)
        resolve(compressed)
      }
      img.onerror = () => resolve(e.target?.result as string)
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
