'use client'

import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

let currentTheme: Theme = 'light'
const listeners = new Set<() => void>()

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  try {
    const saved = localStorage.getItem('desktop_theme')
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    // ignore
  }
  return getSystemTheme()
}

// Initial client-side sync
if (typeof window !== 'undefined') {
  currentTheme = getStoredTheme()
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const themeManager = {
  getTheme: () => currentTheme,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setTheme: (theme: Theme) => {
    currentTheme = theme
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('desktop_theme', theme)
      } catch {
        // ignore
      }
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    listeners.forEach((l) => l())
  },
  toggleTheme: () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark'
    themeManager.setTheme(next)
  },
}

export function useTheme() {
  return useSyncExternalStore(
    themeManager.subscribe,
    themeManager.getTheme,
    () => 'light' as Theme
  )
}
