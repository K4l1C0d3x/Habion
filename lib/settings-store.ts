'use client'

import { useSyncExternalStore, useEffect } from 'react'

export type SettingsTab = 'appearance' | 'widgets' | 'sound' | 'about'

export interface WidgetVisibility {
  clock: boolean
  calendar: boolean
  music: boolean
  weather: boolean
  todo: boolean
  focus: boolean
  habit: boolean
  notes: boolean
  apps: boolean
}

export interface SettingsState {
  isAppOpen: boolean
  activeTab: SettingsTab
  widgets: WidgetVisibility
  resetLayoutKey: number
}

const DEFAULT_WIDGETS: WidgetVisibility = {
  clock: true,
  calendar: true,
  music: true,
  weather: true,
  todo: true,
  focus: true,
  habit: true,
  notes: true,
  apps: true,
}

let state: SettingsState = {
  isAppOpen: false,
  activeTab: 'appearance',
  widgets: DEFAULT_WIDGETS,
  resetLayoutKey: 0,
}

let isSettingsInitialized = false

function initSettingsClient() {
  if (isSettingsInitialized || typeof window === 'undefined') return
  isSettingsInitialized = true
  try {
    const saved = localStorage.getItem('desktop_settings_widgets')
    if (saved) {
      state = { ...state, widgets: { ...DEFAULT_WIDGETS, ...JSON.parse(saved) } }
      emitChange()
    }
  } catch {
    // ignore
  }
}

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

export const settingsStore = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  openApp: (tab?: SettingsTab) => {
    state = {
      ...state,
      isAppOpen: true,
      activeTab: tab || state.activeTab,
    }
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
  setActiveTab: (tab: SettingsTab) => {
    state = { ...state, activeTab: tab }
    emitChange()
  },
  toggleWidget: (widgetKey: keyof WidgetVisibility) => {
    const updated = {
      ...state.widgets,
      [widgetKey]: !state.widgets[widgetKey],
    }
    state = { ...state, widgets: updated }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('desktop_settings_widgets', JSON.stringify(updated))
      } catch {
        // ignore
      }
    }
    emitChange()
  },
  resetDesktopLayout: () => {
    state = { ...state, resetLayoutKey: state.resetLayoutKey + 1 }
    emitChange()
  },
  resetAllWidgets: () => {
    state = { ...state, widgets: DEFAULT_WIDGETS, resetLayoutKey: state.resetLayoutKey + 1 }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('desktop_settings_widgets')
      } catch {
        // ignore
      }
    }
    emitChange()
  },
}

export function useSettingsStore() {
  useEffect(() => {
    initSettingsClient()
  }, [])

  return useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.getState,
    () => state
  )
}
