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
  photo: boolean
  apps: boolean
}

export type WidgetPositions = Record<string, { x: number; y: number }>

export interface SettingsState {
  isAppOpen: boolean
  activeTab: SettingsTab
  widgets: WidgetVisibility
  resetLayoutKey: number
  widgetPositions: WidgetPositions
  savedStage: WidgetPositions | null
  savedStageDate: string | null
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
  photo: true,
  apps: true,
}

let state: SettingsState = {
  isAppOpen: false,
  activeTab: 'appearance',
  widgets: DEFAULT_WIDGETS,
  resetLayoutKey: 0,
  widgetPositions: {},
  savedStage: null,
  savedStageDate: null,
}

let isSettingsInitialized = false

function initSettingsClient() {
  if (isSettingsInitialized || typeof window === 'undefined') return
  isSettingsInitialized = true
  try {
    const saved = localStorage.getItem('desktop_settings_widgets')
    if (saved) {
      state = { ...state, widgets: { ...DEFAULT_WIDGETS, ...JSON.parse(saved) } }
    }

    const savedPositions = localStorage.getItem('desktop_widget_positions')
    if (savedPositions) {
      const parsedPos = JSON.parse(savedPositions)
      if (parsedPos && typeof parsedPos === 'object') {
        state = { ...state, widgetPositions: parsedPos }
      }
    }

    const savedStage = localStorage.getItem('desktop_saved_stage')
    const savedTime = localStorage.getItem('desktop_saved_stage_time')
    if (savedStage) {
      const parsedStage = JSON.parse(savedStage)
      if (parsedStage && typeof parsedStage === 'object') {
        state = {
          ...state,
          savedStage: parsedStage,
          savedStageDate: savedTime || 'Saved Snapshot',
        }
      }
    }

    emitChange()
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

  // Set position for a specific widget (auto-remember position)
  setWidgetPosition: (id: string, pos: { x: number; y: number }) => {
    const updated = {
      ...state.widgetPositions,
      [id]: pos,
    }
    state = { ...state, widgetPositions: updated }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('desktop_widget_positions', JSON.stringify(updated))
      } catch {
        // ignore
      }
    }
    emitChange()
  },

  // Save current positions as a snapshot stage
  saveCurrentStage: () => {
    const stageToSave = { ...state.widgetPositions }
    const now = new Date()
    const timeLabel = `${now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} at ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`

    state = {
      ...state,
      savedStage: stageToSave,
      savedStageDate: timeLabel,
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('desktop_saved_stage', JSON.stringify(stageToSave))
        localStorage.setItem('desktop_saved_stage_time', timeLabel)
      } catch {
        // ignore
      }
    }
    emitChange()
  },

  // Restore saved snapshot stage
  restoreSavedStage: () => {
    if (!state.savedStage) return
    const restored = { ...state.savedStage }
    state = {
      ...state,
      widgetPositions: restored,
      resetLayoutKey: state.resetLayoutKey + 1,
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('desktop_widget_positions', JSON.stringify(restored))
      } catch {
        // ignore
      }
    }
    emitChange()
  },

  // Reset all dragged widgets back to clean default coordinates
  resetDesktopLayout: () => {
    state = {
      ...state,
      widgetPositions: {},
      resetLayoutKey: state.resetLayoutKey + 1,
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('desktop_widget_positions')
      } catch {
        // ignore
      }
    }
    emitChange()
  },

  // Delete saved stage snapshot
  deleteSavedStage: () => {
    state = {
      ...state,
      savedStage: null,
      savedStageDate: null,
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('desktop_saved_stage')
        localStorage.removeItem('desktop_saved_stage_time')
      } catch {
        // ignore
      }
    }
    emitChange()
  },

  resetAllWidgets: () => {
    state = {
      ...state,
      widgets: DEFAULT_WIDGETS,
      widgetPositions: {},
      resetLayoutKey: state.resetLayoutKey + 1,
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('desktop_settings_widgets')
        localStorage.removeItem('desktop_widget_positions')
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
