'use client'

import { useSyncExternalStore, useEffect } from 'react'

export type HabitCategory = 'health' | 'productivity' | 'mindset' | 'learning'

export interface Habit {
  id: string
  name: string
  icon: string
  category: HabitCategory
  createdAt: number
}

export interface HabitState {
  habits: Habit[]
  history: Record<string, string[]>
  isAppOpen: boolean
  activeFilter: 'all' | HabitCategory
}

export const DEFAULT_HABITS: Habit[] = [
  { id: 'read', name: 'Read', icon: '📖', category: 'learning', createdAt: 1 },
  { id: 'exercise', name: 'Exercise', icon: '🏃', category: 'health', createdAt: 2 },
  { id: 'meditate', name: 'Meditate', icon: '🧘', category: 'mindset', createdAt: 3 },
]

export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getInitialHistory(): Record<string, string[]> {
  const history: Record<string, string[]> = {}
  const now = new Date()

  // Generate realistic GitHub/activity-style heatmap distribution across past 140 days
  // Pattern closely matching the user's uploaded habit streak reference
  for (let i = 140; i >= 1; i--) {
    const past = new Date(now)
    past.setDate(past.getDate() - i)
    const key = toDateKey(past)
    
    // Pseudo-random pseudo-structured completion pattern
    const dayOfWeek = past.getDay()
    const cycle = (i * 7 + dayOfWeek * 13) % 100
    
    if (i <= 4) {
      // Current active streak (last 4 days 100% completed)
      history[key] = ['read', 'exercise', 'meditate']
    } else if (cycle > 70) {
      history[key] = ['read', 'exercise', 'meditate'] // 100% complete (bright green)
    } else if (cycle > 45) {
      history[key] = ['read', 'exercise'] // 66% complete (medium green)
    } else if (cycle > 25) {
      history[key] = ['read'] // 33% complete (subtle dark green)
    } else {
      history[key] = [] // 0% (empty dark cell)
    }
  }

  // Today seeded with 2 habits done
  history[toDateKey(now)] = ['read', 'exercise']
  return history
}

export function calculateStreak(
  habits: Habit[],
  history: Record<string, string[]>,
  todayKey: string = toDateKey()
): number {
  if (habits.length === 0) return 0
  const isDayComplete = (dateStr: string) => {
    const doneIds = history[dateStr] || []
    return habits.every((h) => doneIds.includes(h.id))
  }

  let count = 0
  const todayDone = isDayComplete(todayKey)
  if (todayDone) count = 1

  const d = new Date()
  d.setDate(d.getDate() - 1)
  for (let i = 0; i < 365; i++) {
    const key = toDateKey(d)
    if (isDayComplete(key)) {
      count++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return count
}

const HABITS_KEY = 'desktop_habits_list_v2'
const HISTORY_KEY = 'habit-history-v3'

let state: HabitState = {
  habits: DEFAULT_HABITS,
  history: getInitialHistory(),
  isAppOpen: false,
  activeFilter: 'all',
}

let isInitialized = false

function initClientStore() {
  if (isInitialized || typeof window === 'undefined') return
  isInitialized = true
  let loadedHabits = DEFAULT_HABITS
  let loadedHistory = getInitialHistory()

  try {
    const savedHabits = localStorage.getItem(HABITS_KEY)
    if (savedHabits) {
      const parsed = JSON.parse(savedHabits)
      if (Array.isArray(parsed) && parsed.length > 0) {
        loadedHabits = parsed
      }
    }

    const savedHistory = localStorage.getItem(HISTORY_KEY)
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        loadedHistory = parsed
      }
    }
  } catch {
    // ignore
  }

  state = {
    ...state,
    habits: loadedHabits,
    history: loadedHistory,
  }
  emitChange()
}

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function persistState() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(state.habits))
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history))
  } catch {
    // ignore
  }
}

export const habitStore = {
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
  setActiveFilter: (filter: 'all' | HabitCategory) => {
    state = { ...state, activeFilter: filter }
    emitChange()
  },
  toggleHabit: (habitId: string, dateKey: string = toDateKey()) => {
    const currentList = state.history[dateKey] || []
    const updatedList = currentList.includes(habitId)
      ? currentList.filter((id) => id !== habitId)
      : [...currentList, habitId]

    state = {
      ...state,
      history: {
        ...state.history,
        [dateKey]: updatedList,
      },
    }
    emitChange()
    persistState()
  },
  addHabit: (name: string, icon: string = '✨', category: HabitCategory = 'productivity') => {
    const trimmed = name.trim()
    if (!trimmed) return
    const newHabitId = `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const newHabit: Habit = {
      id: newHabitId,
      name: trimmed,
      icon: icon || '✨',
      category,
      createdAt: Date.now(),
    }

    // Automatically backfill history for existing completed days
    // so user's existing historical streak and 100% glow are preserved
    const updatedHistory: Record<string, string[]> = { ...state.history }
    for (const [dateKey, completedList] of Object.entries(updatedHistory)) {
      if (completedList.length > 0 && completedList.length >= state.habits.length) {
        // If that day was 100% completed under the old habit count, mark the new habit done too
        if (!completedList.includes(newHabitId)) {
          updatedHistory[dateKey] = [...completedList, newHabitId]
        }
      }
    }

    state = {
      ...state,
      habits: [...state.habits, newHabit],
      history: updatedHistory,
    }
    emitChange()
    persistState()
  },
  deleteHabit: (habitId: string) => {
    state = {
      ...state,
      habits: state.habits.filter((h) => h.id !== habitId),
    }
    emitChange()
    persistState()
  },
  resetToDefaults: () => {
    state = {
      ...state,
      habits: DEFAULT_HABITS,
      history: getInitialHistory(),
    }
    emitChange()
    persistState()
  },
}

export function useHabitStore() {
  useEffect(() => {
    initClientStore()
  }, [])

  return useSyncExternalStore(
    habitStore.subscribe,
    habitStore.getState,
    () => state
  )
}
