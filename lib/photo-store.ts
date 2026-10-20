'use client'

import { useSyncExternalStore, useEffect } from 'react'

export interface PhotoItem {
  id: string
  src: string
  alt: string
  title: string
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

const DEFAULT_PHOTOS: PhotoItem[] = [
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
]

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

function loadInitialState() {
  if (isInitialized || typeof window === 'undefined') return
  isInitialized = true
  try {
    const saved = localStorage.getItem('desktop_photo_crops_v2')
    const savedInterval = localStorage.getItem('desktop_photo_interval_v2')
    const savedAuto = localStorage.getItem('desktop_photo_autorotate_v2')

    let nextPhotos = DEFAULT_PHOTOS
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length === DEFAULT_PHOTOS.length) {
        nextPhotos = DEFAULT_PHOTOS.map((p, i) => ({
          ...p,
          x: parsed[i]?.x ?? p.x,
          y: parsed[i]?.y ?? p.y,
          zoom: parsed[i]?.zoom ?? p.zoom,
        }))
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('desktop_photo_crops_v2', JSON.stringify(updated))
      } catch {
        // ignore
      }
    }
    emitChange()
  },
  resetCrop: (idx: number) => {
    const def = DEFAULT_PHOTOS[idx]
    if (!def) return
    photoStore.updateCrop(idx, { x: def.x, y: def.y, zoom: def.zoom })
  },
  setIntervalSeconds: (sec: number) => {
    state = { ...state, intervalSeconds: sec }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('desktop_photo_interval_v2', String(sec))
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
        localStorage.setItem('desktop_photo_autorotate_v2', String(next))
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
