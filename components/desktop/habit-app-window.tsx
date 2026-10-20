'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Flame,
  Check,
  Plus,
  Trash2,
  Search,
  Sparkles,
  RotateCcw,
  Activity,
  Heart,
  Brain,
  BookOpen,
  Zap,
  Calendar,
} from 'lucide-react'
import {
  useHabitStore,
  habitStore,
  calculateStreak,
  toDateKey,
  type HabitCategory,
  type Habit,
} from '@/lib/habit-store'

interface CategoryMeta {
  id: 'all' | HabitCategory
  label: string
  icon: typeof Flame
  color: string
}

const CATEGORIES: CategoryMeta[] = [
  { id: 'all', label: 'All Habits', icon: Sparkles, color: 'text-signal' },
  { id: 'health', label: 'Health & Fitness', icon: Heart, color: 'text-emerald-500' },
  { id: 'productivity', label: 'Productivity', icon: Zap, color: 'text-amber-500' },
  { id: 'mindset', label: 'Mindset & Wellness', icon: Brain, color: 'text-purple-500' },
  { id: 'learning', label: 'Learning & Growth', icon: BookOpen, color: 'text-blue-500' },
]

const QUICK_EMOJIS = ['📖', '🏃', '🧘', '💧', '💻', '✍️', '🥗', '💤', '🎯', '🏋️', '🍎', '🎨']
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function HabitAppWindow() {
  const { habits, history, isAppOpen, activeFilter } = useHabitStore()
  const [newHabitName, setNewHabitName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('✨')
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>('productivity')
  const [searchQuery, setSearchQuery] = useState('')
  const [isMaximized, setIsMaximized] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)

  const todayKey = useMemo(() => toDateKey(), [])
  const todayCompleted = history[todayKey] || []
  const currentStreak = useMemo(() => calculateStreak(habits, history, todayKey), [habits, history, todayKey])

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isAppOpen) {
        habitStore.closeApp()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAppOpen])

  // Filtered habits
  const displayedHabits = useMemo(() => {
    return habits.filter((habit) => {
      if (activeFilter !== 'all' && habit.category !== activeFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return habit.name.toLowerCase().includes(query) || habit.category.toLowerCase().includes(query)
      }
      return true
    })
  }, [habits, activeFilter, searchQuery])

  // Category count map
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: habits.length }
    for (const cat of ['health', 'productivity', 'mindset', 'learning'] as HabitCategory[]) {
      counts[cat] = habits.filter((h) => h.category === cat).length
    }
    return counts
  }, [habits])

  // 7-day overview
  const past7Days = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      const key = toDateKey(d)
      const dayDoneList = history[key] || []
      const isComplete = habits.length > 0 && habits.every((h) => dayDoneList.includes(h.id))
      const completedRatio = habits.length > 0 ? dayDoneList.length / habits.length : 0
      return {
        key,
        dayName: WEEKDAYS[d.getDay()],
        dayNum: d.getDate(),
        isToday: key === todayKey,
        isComplete,
        ratio: completedRatio,
        doneCount: dayDoneList.length,
      }
    })
  }, [history, habits, todayKey])

  function handleCreateHabit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!newHabitName.trim()) return

    const cat = activeFilter === 'all' ? selectedCategory : activeFilter
    habitStore.addHabit(newHabitName, selectedEmoji, cat)
    setNewHabitName('')
  }

  if (!isAppOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div
        className="absolute inset-0"
        onClick={() => habitStore.closeApp()}
        aria-hidden="true"
      />

      {/* Main Window */}
      <div
        ref={windowRef}
        className={`relative z-10 flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-card text-card-foreground shadow-[0_25px_50px_-12px_rgb(0_0_0/0.3),0_0_0_1px_rgb(0_0_0/0.05)] transition-all duration-300 ${
          isMaximized
            ? 'h-[88vh] w-[94vw] max-w-5xl'
            : 'h-[580px] max-h-[92vh] w-full max-w-3xl'
        }`}
      >
        {/* macOS Title Bar */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-muted/40 px-4 select-none">
          {/* Traffic Light Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => habitStore.closeApp()}
              title="Close"
              className="group flex size-3 items-center justify-center rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-90 transition-all cursor-pointer"
            >
              <span className="text-[8px] font-bold text-black/60 opacity-0 group-hover:opacity-100">✕</span>
            </button>
            <button
              onClick={() => habitStore.closeApp()}
              title="Minimize"
              className="group flex size-3 items-center justify-center rounded-full bg-[#febc2e] border border-[#d89e24] hover:brightness-90 transition-all cursor-pointer"
            >
              <span className="text-[8px] font-bold text-black/60 opacity-0 group-hover:opacity-100">−</span>
            </button>
            <button
              onClick={() => setIsMaximized((m) => !m)}
              title={isMaximized ? 'Restore' : 'Maximize'}
              className="group flex size-3 items-center justify-center rounded-full bg-[#28c840] border border-[#1aab29] hover:brightness-90 transition-all cursor-pointer"
            >
              <span className="text-[7px] font-bold text-black/60 opacity-0 group-hover:opacity-100">⤢</span>
            </button>
          </div>

          {/* Window Title with Flame */}
          <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
            <Flame className="size-4 text-signal fill-signal animate-pulse" />
            <span>Habits & Routines Studio</span>
          </div>

          {/* Search bar */}
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2 size-3 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits…"
              className="h-7 w-32 md:w-44 rounded-md bg-muted/70 pl-7 pr-2 text-xs outline-none focus:bg-background focus:ring-1 focus:ring-border transition-all"
            />
          </div>
        </div>

        {/* Window Content: 2-Column Split */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-56 shrink-0 border-r border-border bg-muted/20 p-3 flex flex-col justify-between">
            <div className="flex flex-col gap-1">
              <span className="px-2 pb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Categories
              </span>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isActive = activeFilter === cat.id
                const count = categoryCounts[cat.id] || 0
                return (
                  <button
                    key={cat.id}
                    onClick={() => habitStore.setActiveFilter(cat.id)}
                    className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-foreground text-background shadow-xs font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`size-3.5 ${isActive ? 'text-background' : cat.color}`} />
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <span
                      className={`text-[10px] tabular-nums rounded-full px-1.5 py-0.2 ${
                        isActive
                          ? 'bg-background/20 text-background'
                          : 'bg-muted-foreground/15 text-muted-foreground'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Streak & Consistency Quick Card */}
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Current Streak
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-signal">
                  <Flame className="size-3.5 fill-signal text-signal" />
                  {currentStreak} days
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Today Done</span>
                <span className="font-bold text-foreground">
                  {todayCompleted.length}/{habits.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-signal transition-all duration-300"
                  style={{
                    width: `${habits.length ? Math.round((todayCompleted.length / habits.length) * 100) : 0}%`,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset habits back to default 3 routine presets?')) {
                    habitStore.resetToDefaults()
                  }
                }}
                className="mt-1 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <RotateCcw className="size-2.5" />
                <span>Reset to Presets</span>
              </button>
            </div>
          </div>

          {/* Right Main Panel */}
          <div className="flex flex-1 flex-col overflow-hidden bg-card">
            {/* 7-Day Consistency Matrix Banner */}
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/10 px-5 py-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-signal" />
                <span className="text-xs font-bold text-foreground">Last 7 Days Matrix</span>
              </div>
              <div className="flex items-center gap-3">
                {past7Days.map((d) => (
                  <div key={d.key} className="flex flex-col items-center gap-1">
                    <span
                      className={`text-[9px] font-bold ${
                        d.isToday ? 'text-signal' : 'text-muted-foreground'
                      }`}
                    >
                      {d.dayName}
                    </span>
                    <div
                      title={`${d.key}: ${d.doneCount}/${habits.length} completed`}
                      className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        d.isComplete
                          ? 'bg-signal text-white shadow-xs'
                          : d.ratio > 0
                          ? 'border-2 border-signal text-signal bg-signal/15'
                          : d.isToday
                          ? 'border border-dashed border-signal text-foreground'
                          : 'bg-muted text-muted-foreground/60'
                      }`}
                    >
                      {d.isComplete ? '✓' : d.dayNum}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create New Habit Bar */}
            <form onSubmit={handleCreateHabit} className="border-b border-border p-4 bg-muted/5">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  {/* Emoji selector trigger */}
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
                    {QUICK_EMOJIS.slice(0, 8).map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setSelectedEmoji(em)}
                        className={`size-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                          selectedEmoji === em
                            ? 'bg-foreground text-background scale-110 shadow-xs'
                            : 'bg-muted/70 hover:bg-muted text-foreground'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>

                  {/* Category Pill selector */}
                  {activeFilter === 'all' && (
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as HabitCategory)}
                      className="h-7 rounded-lg border border-border bg-muted/60 px-2 text-xs font-medium text-foreground outline-none cursor-pointer focus:ring-1 focus:ring-border"
                    >
                      <option value="productivity">Productivity</option>
                      <option value="health">Health</option>
                      <option value="mindset">Mindset</option>
                      <option value="learning">Learning</option>
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-lg shadow-xs">
                    {selectedEmoji}
                  </div>
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="Create a new habit (e.g. 10 pages reading, Cold shower, 20 pullups)…"
                    className="h-9 flex-1 rounded-xl bg-muted/60 px-3.5 text-xs outline-none focus:bg-background focus:ring-1 focus:ring-border transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newHabitName.trim()}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-signal px-4 text-xs font-bold text-white shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[2.5]" />
                    <span>Add Habit</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Habit Items List */}
            <div className="flex-1 overflow-y-auto p-4">
              {displayedHabits.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-6">
                  <Sparkles className="size-8 stroke-[1.5] text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-semibold text-foreground">No habits found</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    {searchQuery
                      ? 'No habits match your search query.'
                      : 'Create your first daily routine habit above to build momentum!'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {displayedHabits.map((habit) => {
                    const isDone = todayCompleted.includes(habit.id)
                    return (
                      <div
                        key={habit.id}
                        className={`group relative flex items-center justify-between rounded-xl border p-3 transition-all ${
                          isDone
                            ? 'border-signal/30 bg-signal/5'
                            : 'border-border bg-card hover:bg-muted/30'
                        }`}
                      >
                        {/* Habit Info */}
                        <div
                          onClick={() => habitStore.toggleHabit(habit.id, todayKey)}
                          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                        >
                          {/* Checkbox button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              habitStore.toggleHabit(habit.id, todayKey)
                            }}
                            className={`flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all cursor-pointer ${
                              isDone
                                ? 'border-signal bg-signal text-white shadow-xs scale-105'
                                : 'border-muted-foreground/40 group-hover:border-foreground/80'
                            }`}
                          >
                            {isDone && <Check className="size-3.5 stroke-[3]" />}
                          </button>

                          {/* Emoji Icon */}
                          <span className="text-xl select-none">{habit.icon}</span>

                          {/* Habit Name & Category */}
                          <div className="flex flex-col min-w-0 pr-2">
                            <span
                              className={`truncate text-sm font-semibold transition-all ${
                                isDone ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'
                              }`}
                            >
                              {habit.name}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground capitalize">
                              {habit.category}
                            </span>
                          </div>
                        </div>

                        {/* Actions & Mini History */}
                        <div className="flex items-center gap-3 shrink-0">
                          {/* Mini Past 5 days status */}
                          <div className="hidden sm:flex items-center gap-1 pr-2">
                            {past7Days.slice(-5).map((d) => {
                              const dayDone = (history[d.key] || []).includes(habit.id)
                              return (
                                <span
                                  key={d.key}
                                  title={`${d.key}: ${dayDone ? 'Completed' : 'Missed'}`}
                                  className={`size-2 rounded-full ${
                                    dayDone ? 'bg-signal' : 'bg-muted-foreground/25'
                                  }`}
                                />
                              )
                            })}
                          </div>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => habitStore.deleteHabit(habit.id)}
                            title="Delete habit"
                            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
