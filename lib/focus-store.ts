'use client'

import { useSyncExternalStore, useEffect } from 'react'

export type FocusMode = 'focus' | 'shortBreak' | 'longBreak'

export interface FocusDurations {
  focus: number
  shortBreak: number
  longBreak: number
}

export interface FocusState {
  isAppOpen: boolean
  mode: FocusMode
  seconds: number
  running: boolean
  soundEnabled: boolean
  durations: FocusDurations
  completedCycles: number
  totalFocusedMinutes: number
}

const DEFAULT_DURATIONS: FocusDurations = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
}

let timerInterval: ReturnType<typeof setInterval> | null = null
let endTime: number | null = null
let originalTitle = typeof document !== 'undefined' ? document.title : ''

export function playFocusChime() {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    // Two warm harmonizing bell tones (F#5 and C#6)
    const tones = [739.99, 1108.73]
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.09)

      gain.gain.setValueAtTime(0.25, now + idx * 0.09)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 1.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.09)
      osc.stop(now + idx * 0.09 + 1.2)
    })
  } catch {
    // ignore audio autoplay errors
  }
}

function loadInitialState(): Partial<FocusState> {
  if (typeof window === 'undefined') return {}
  try {
    const savedDurations = localStorage.getItem('focus_durations')
    const savedSound = localStorage.getItem('focus_sound')
    const savedCycles = localStorage.getItem('focus_cycles')
    const savedMinutes = localStorage.getItem('focus_minutes')

    return {
      durations: savedDurations ? JSON.parse(savedDurations) : DEFAULT_DURATIONS,
      soundEnabled: savedSound !== null ? savedSound === 'true' : true,
      completedCycles: savedCycles ? Number(savedCycles) : 0,
      totalFocusedMinutes: savedMinutes ? Number(savedMinutes) : 0,
    }
  } catch {
    return {}
  }
}

let state: FocusState = {
  isAppOpen: false,
  mode: 'focus',
  seconds: DEFAULT_DURATIONS.focus * 60,
  running: false,
  soundEnabled: true,
  durations: DEFAULT_DURATIONS,
  completedCycles: 0,
  totalFocusedMinutes: 0,
}

let isFocusInitialized = false

function initFocusClient() {
  if (isFocusInitialized || typeof window === 'undefined') return
  isFocusInitialized = true
  const saved = loadInitialState()
  if (Object.keys(saved).length > 0) {
    state = {
      ...state,
      ...saved,
      seconds: saved.durations && !state.running ? saved.durations.focus * 60 : state.seconds,
    }
    emitChange()
  }
}

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function updateTitle(remaining: number, modeLabel: string) {
  if (typeof document === 'undefined') return
  if (!originalTitle) originalTitle = document.title || 'Kalidas'
  const timeStr = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
  document.title = `(${timeStr}) ${modeLabel} | Kalidas`
}

function restoreTitle() {
  if (typeof document !== 'undefined' && originalTitle) {
    document.title = originalTitle
  }
}

function tick() {
  if (!endTime) return
  const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000))
  const modeLabel = state.mode === 'focus' ? 'Focus' : 'Break'
  updateTitle(remaining, modeLabel)

  if (remaining <= 0) {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = null
    endTime = null
    restoreTitle()

    if (state.soundEnabled) {
      playFocusChime()
    }

    if (state.mode === 'focus') {
      const nextCycles = state.completedCycles + 1
      const nextMinutes = state.totalFocusedMinutes + state.durations.focus
      const nextMode: FocusMode = nextCycles % 4 === 0 ? 'longBreak' : 'shortBreak'
      const nextSeconds = state.durations[nextMode] * 60

      state = {
        ...state,
        running: false,
        completedCycles: nextCycles,
        totalFocusedMinutes: nextMinutes,
        mode: nextMode,
        seconds: nextSeconds,
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('focus_cycles', String(nextCycles))
          localStorage.setItem('focus_minutes', String(nextMinutes))
        } catch {
          // ignore
        }
      }
    } else {
      state = {
        ...state,
        running: false,
        mode: 'focus',
        seconds: state.durations.focus * 60,
      }
    }
    emitChange()
  } else {
    state = { ...state, seconds: remaining }
    emitChange()
  }
}

export const focusStore = {
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
  start: () => {
    if (state.running) return
    const secs = state.seconds > 0 ? state.seconds : state.durations[state.mode] * 60
    endTime = Date.now() + secs * 1000
    state = { ...state, running: true, seconds: secs }
    emitChange()
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(tick, 500)
  },
  pause: () => {
    if (!state.running) return
    if (endTime) {
      state.seconds = Math.max(0, Math.round((endTime - Date.now()) / 1000))
    }
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = null
    endTime = null
    restoreTitle()
    state = { ...state, running: false }
    emitChange()
  },
  toggleStartPause: () => {
    if (state.running) {
      focusStore.pause()
    } else {
      focusStore.start()
    }
  },
  reset: () => {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = null
    endTime = null
    restoreTitle()
    const resetSeconds = state.durations[state.mode] * 60
    state = { ...state, running: false, seconds: resetSeconds }
    emitChange()
  },
  setMode: (mode: FocusMode) => {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = null
    endTime = null
    restoreTitle()
    const secs = state.durations[mode] * 60
    state = { ...state, mode, running: false, seconds: secs }
    emitChange()
  },
  setFocusDuration: (minutes: number) => {
    const nextDurations = { ...state.durations, focus: minutes }
    state = {
      ...state,
      durations: nextDurations,
      seconds: state.mode === 'focus' && !state.running ? minutes * 60 : state.seconds,
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('focus_durations', JSON.stringify(nextDurations))
      } catch {
        // ignore
      }
    }
    emitChange()
  },
  toggleSound: () => {
    const next = !state.soundEnabled
    state = { ...state, soundEnabled: next }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('focus_sound', String(next))
      } catch {
        // ignore
      }
    }
    if (next) playFocusChime()
    emitChange()
  },
}

export function useFocusStore() {
  useEffect(() => {
    initFocusClient()
  }, [])

  return useSyncExternalStore(
    focusStore.subscribe,
    focusStore.getState,
    () => state
  )
}
