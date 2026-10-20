'use client'

import { useEffect, useState, useMemo } from 'react'
import { Check, Flame } from 'lucide-react'

interface Habit {
  id: string
  name: string
  icon: string
}

const DEFAULT_HABITS: Habit[] = [
  { id: 'read', name: 'Read', icon: '📖' },
  { id: 'exercise', name: 'Exercise', icon: '🏃' },
  { id: 'meditate', name: 'Meditate', icon: '🧘' },
]

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getInitialHistory(): Record<string, string[]> {
  const history: Record<string, string[]> = {}
  const now = new Date()

  // Seed past 3 days with all habits done for a live realistic streak
  for (let i = 3; i >= 1; i--) {
    const past = new Date(now)
    past.setDate(past.getDate() - i)
    history[toDateKey(past)] = ['read', 'exercise', 'meditate']
  }

  // Today seeded with 1 habit done
  history[toDateKey(now)] = ['read']
  return history
}

export function HabitWidget() {
  const [mounted, setMounted] = useState(false)
  const [history, setHistory] = useState<Record<string, string[]>>({})
  const todayKey = useMemo(() => toDateKey(new Date()), [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('habit-history-v2')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setHistory(parsed)
        } else {
          const seeded = getInitialHistory()
          setHistory(seeded)
          localStorage.setItem('habit-history-v2', JSON.stringify(seeded))
        }
      } else {
        const seeded = getInitialHistory()
        setHistory(seeded)
        localStorage.setItem('habit-history-v2', JSON.stringify(seeded))
      }
    } catch {
      setHistory(getInitialHistory())
    }
    setMounted(true)
  }, [])

  function toggleHabit(habitId: string) {
    setHistory((prev) => {
      const currentToday = prev[todayKey] || []
      const nextToday = currentToday.includes(habitId)
        ? currentToday.filter((id) => id !== habitId)
        : [...currentToday, habitId]

      const nextState = {
        ...prev,
        [todayKey]: nextToday,
      }

      try {
        localStorage.setItem('habit-history-v2', JSON.stringify(nextState))
      } catch {
        // ignore localStorage errors
      }

      return nextState
    })
  }

  // Calculate current streak
  const streak = useMemo(() => {
    if (!mounted) return 3

    const isDayComplete = (dateStr: string) => {
      const doneIds = history[dateStr] || []
      return DEFAULT_HABITS.every((h) => doneIds.includes(h.id))
    }

    let count = 0
    const todayDone = isDayComplete(todayKey)
    if (todayDone) {
      count = 1
    }

    // Check consecutive past days
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
  }, [history, todayKey, mounted])

  // Current week days (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const today = new Date()
    const currentDay = today.getDay()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - currentDay)

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday)
      d.setDate(sunday.getDate() + i)
      const key = toDateKey(d)
      const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const isToday = key === todayKey
      const isComplete = DEFAULT_HABITS.every((h) => (history[key] || []).includes(h.id))
      return {
        key,
        name: WEEKDAYS[i],
        isPast,
        isToday,
        isComplete,
      }
    })
  }, [history, todayKey])

  const todayCompleted = history[todayKey] || (mounted ? [] : ['read'])
  const completedCount = DEFAULT_HABITS.filter((h) => todayCompleted.includes(h.id)).length
  const progressPercent = Math.round((completedCount / DEFAULT_HABITS.length) * 100)

  return (
    <div className="widget flex w-full flex-col gap-3 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            Habits
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground/70">
            {completedCount}/{DEFAULT_HABITS.length}
          </span>
        </div>
        <div
          className="flex items-center gap-1 rounded-full bg-signal/10 px-2 py-0.5 text-xs font-bold text-signal"
          title={`${streak} day streak`}
        >
          <Flame className="size-3.5 fill-signal text-signal animate-pulse" />
          <span>{streak}d</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-signal transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Habit Items */}
      <ul className="flex flex-col gap-1.5">
        {DEFAULT_HABITS.map((habit) => {
          const isDone = todayCompleted.includes(habit.id)
          return (
            <li key={habit.id}>
              <button
                type="button"
                onClick={() => toggleHabit(habit.id)}
                onPointerDown={(e) => e.stopPropagation()}
                className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition-all ${
                  isDone ? 'bg-muted/40' : 'hover:bg-muted/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs shrink-0">{habit.icon}</span>
                  <span
                    className={`truncate text-xs font-medium transition-colors ${
                      isDone
                        ? 'text-muted-foreground/60 line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {habit.name}
                  </span>
                </div>
                <div
                  className={`size-4 shrink-0 rounded-full border transition-all flex items-center justify-center ${
                    isDone
                      ? 'border-signal bg-signal text-white shadow-xs'
                      : 'border-muted-foreground/30 group-hover:border-foreground/60'
                  }`}
                >
                  {isDone && <Check className="size-2.5 stroke-[3]" />}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Weekly consistency mini tracker */}
      <div className="pt-1 border-t border-border/60">
        <div className="flex items-center justify-between px-1 text-center">
          {weekDays.map((w) => (
            <div key={w.key} className="flex flex-col items-center gap-1">
              <span
                className={`text-[9px] font-semibold ${
                  w.isToday ? 'text-signal' : 'text-muted-foreground/70'
                }`}
              >
                {w.name}
              </span>
              <span
                className={`size-2 rounded-full transition-all ${
                  w.isComplete
                    ? 'bg-signal'
                    : w.isToday
                    ? 'border border-signal bg-signal/20'
                    : 'bg-muted'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
