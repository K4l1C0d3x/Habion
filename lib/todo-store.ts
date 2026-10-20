'use client'

import { useSyncExternalStore, useEffect } from 'react'

export type TodoCategory = 'today' | 'work' | 'personal' | 'important'
export type TodoFilter = TodoCategory | 'all' | 'completed'

export interface TodoItem {
  id: string
  text: string
  done: boolean
  category: TodoCategory
  createdAt: number
}

export interface TodoState {
  todos: TodoItem[]
  isAppOpen: boolean
  activeFilter: TodoFilter
  searchQuery: string
}

const STORAGE_KEY = 'desktop_todos_v1'

const DEFAULT_TODOS: TodoItem[] = [
  { id: '1', text: 'Review QA agent eval metrics', done: false, category: 'today', createdAt: 1 },
  { id: '2', text: 'Finalize product architecture specs', done: false, category: 'work', createdAt: 2 },
  { id: '3', text: 'Team 1:1 with frontend leads', done: false, category: 'today', createdAt: 3 },
  { id: '4', text: 'Write release notes for v2.4', done: true, category: 'work', createdAt: 4 },
  { id: '5', text: 'Order new desk plant', done: false, category: 'personal', createdAt: 5 },
]

function loadInitialTodos(): TodoItem[] {
  if (typeof window === 'undefined') return DEFAULT_TODOS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every((p) => p && typeof p.text === 'string')) {
        return parsed
      }
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_TODOS
}

let state: TodoState = {
  todos: DEFAULT_TODOS,
  isAppOpen: false,
  activeFilter: 'today',
  searchQuery: '',
}

let isInitialized = false

function initClientStore() {
  if (isInitialized || typeof window === 'undefined') return
  isInitialized = true
  const saved = loadInitialTodos()
  if (saved !== DEFAULT_TODOS) {
    state = { ...state, todos: saved }
    emitChange()
  }
}

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function saveTodos(todos: TodoItem[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // ignore storage errors
    }
  }
}

export const todoStore = {
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
  setActiveFilter: (filter: TodoFilter) => {
    state = { ...state, activeFilter: filter }
    emitChange()
  },
  setSearchQuery: (query: string) => {
    state = { ...state, searchQuery: query }
    emitChange()
  },
  addTodo: (text: string, category: TodoCategory = 'today') => {
    const trimmed = text.trim()
    if (!trimmed) return
    const newTodo: TodoItem = {
      id: String(Date.now()),
      text: trimmed,
      done: false,
      category,
      createdAt: Date.now(),
    }
    const updated = [newTodo, ...state.todos]
    state = { ...state, todos: updated }
    saveTodos(updated)
    emitChange()
  },
  toggleTodo: (id: string) => {
    const updated = state.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    state = { ...state, todos: updated }
    saveTodos(updated)
    emitChange()
  },
  removeTodo: (id: string) => {
    const updated = state.todos.filter((t) => t.id !== id)
    state = { ...state, todos: updated }
    saveTodos(updated)
    emitChange()
  },
  clearCompleted: () => {
    const updated = state.todos.filter((t) => !t.done)
    state = { ...state, todos: updated }
    saveTodos(updated)
    emitChange()
  },
  resetToDefaults: () => {
    state = { ...state, todos: DEFAULT_TODOS }
    saveTodos(DEFAULT_TODOS)
    emitChange()
  },
}

export function useTodoStore() {
  useEffect(() => {
    initClientStore()
  }, [])

  return useSyncExternalStore(
    todoStore.subscribe,
    todoStore.getState,
    () => state // SSR fallback
  )
}
