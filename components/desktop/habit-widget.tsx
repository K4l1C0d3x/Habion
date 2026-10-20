'use client'

import { useMemo } from 'react'
import { Check, Flame, ArrowUpRight } from 'lucide-react'
import {
  useHabitStore,
  habitStore,
  calculateStreak,
  toDateKey,
} from '@/lib/habit-store'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function HabitWidget() {
  const { habits, history } = useHabitStore()
  const todayKey = useMemo(() => toDateKey(new Date()), [])

  // Calculate current streak
  const streak = useMemo(() => {
    return calculateStreak(habits, history, todayKey)
  }, [habits, history, todayKey])

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
      const dayDoneList = history[key] || []
      const isComplete = habits.length > 0 && habits.every((h) => dayDoneList.includes(h.id))
      return {
        key,
        name: WEEKDAYS[i],
        isPast,
        isToday,
        isComplete,
      }
    })
  }, [history, habits, todayKey])

  const todayCompleted = history[todayKey] || []
  const completedCount = habits.filter((h) => todayCompleted.includes(h.id)).length
  const progressPercent = habits.length ? Math.round((completedCount / habits.length) * 100) : 0

  // Display top 3 habits in widget to maintain clean macOS widget grid layout
  const visibleHabits = habits.slice(0, 3)
  const remainingCount = habits.length - visibleHabits.length

  return (
    <div className="widget group/habit flex w-full flex-col gap-3 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          onClick={() => habitStore.openApp()}
          className="flex items-center gap-2 min-w-0 cursor-pointer"
          title="Open Habits Studio"
        >
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase hover:text-foreground transition-colors shrink-0">
            Habits
          </span>

          {/* Streak icon badge on the left */}
          <div
            className="flex items-center gap-1 rounded-full bg-signal/10 px-1.5 py-0.5 text-[11px] font-bold text-signal shrink-0"
            title={`${streak} day streak`}
          >
            <Flame className="size-3 fill-signal text-signal animate-pulse" />
            <span>{streak}d</span>
          </div>

          <span className="text-[10px] font-semibold text-muted-foreground/70 shrink-0">
            {completedCount}/{habits.length}
          </span>
        </div>

        {/* Open Habits App Arrow (only visible on hover) */}
        <button
          type="button"
          onClick={() => habitStore.openApp()}
          onPointerDown={(e) => e.stopPropagation()}
          title="Open Habits & Routines App"
          className="flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground opacity-0 group-hover/habit:opacity-100 transition-opacity cursor-pointer shrink-0"
        >
          <ArrowUpRight className="size-3.5" />
        </button>
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
        {visibleHabits.map((habit) => {
          const isDone = todayCompleted.includes(habit.id)
          return (
            <li key={habit.id}>
              <button
                type="button"
                onClick={() => habitStore.toggleHabit(habit.id, todayKey)}
                onPointerDown={(e) => e.stopPropagation()}
                className={`group/item flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition-all cursor-pointer ${
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
                      : 'border-muted-foreground/30 group-hover/item:border-foreground/60'
                  }`}
                >
                  {isDone && <Check className="size-2.5 stroke-[3]" />}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {/* If more habits exist, show quick jump to app */}
      {remainingCount > 0 && (
        <button
          type="button"
          onClick={() => habitStore.openApp()}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-left text-[10px] font-semibold text-signal hover:underline px-1 -mt-1 cursor-pointer"
        >
          +{remainingCount} more in Habits App →
        </button>
      )}

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
