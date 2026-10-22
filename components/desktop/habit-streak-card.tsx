'use client'

import { useMemo, useState } from 'react'
import { Flame, ArrowUpRight, Sparkles } from 'lucide-react'
import {
  useHabitStore,
  habitStore,
  calculateStreak,
  toDateKey,
} from '@/lib/habit-store'

/**
 * HabitStreakCard
 * Matches the user-provided heat grid layout (matrix of rounded green-glowing cells),
 * showing daily consistency across weeks just like GitHub / Habit tracking apps.
 */
export function HabitStreakCard() {
  const { habits, history } = useHabitStore()
  const [hoveredCell, setHoveredCell] = useState<{
    dateStr: string
    count: number
    total: number
    percent: number
  } | null>(null)

  const todayKey = useMemo(() => toDateKey(new Date()), [])

  const streak = useMemo(() => {
    return calculateStreak(habits, history, todayKey)
  }, [habits, history, todayKey])

  // Build a matrix of 7 rows (days: Sun-Sat) x 20 columns
  // Exactly 20 columns fits cleanly inside any standard widget width
  const { columns, totalActiveDays, totalCompletions } = useMemo(() => {
    const today = new Date()
    const currentDayOfWeek = today.getDay() // 0 is Sunday, 6 is Saturday

    const numColumns = 20
    const totalDays = (numColumns - 1) * 7 + (currentDayOfWeek + 1)

    // Find the start date (Sunday `numColumns - 1` weeks ago)
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - (totalDays - 1))

    let activeCount = 0
    let completionsCount = 0

    const cols: Array<
      Array<{
        dateKey: string
        date: Date
        ratio: number
        doneCount: number
        totalCount: number
        isToday: boolean
        isFuture: boolean
      }>
    > = []

    let cur = new Date(startDate)

    for (let c = 0; c < numColumns; c++) {
      const colDays = []
      for (let r = 0; r < 7; r++) {
        const isFuture = cur > today
        const key = toDateKey(cur)
        const isToday = key === todayKey
        const doneList = history[key] || []
        const doneCount = doneList.length
        const totalCount = habits.length
        const ratio = totalCount > 0 ? doneCount / totalCount : 0

        if (!isFuture && doneCount > 0) {
          activeCount++
          completionsCount += doneCount
        }

        colDays.push({
          dateKey: key,
          date: new Date(cur),
          ratio,
          doneCount,
          totalCount,
          isToday,
          isFuture,
        })

        cur.setDate(cur.getDate() + 1)
      }
      cols.push(colDays)
    }

    return {
      columns: cols,
      totalActiveDays: activeCount,
      totalCompletions: completionsCount,
    }
  }, [history, habits, todayKey])

  /**
   * Heatmap color mapping based on completion ratio:
   * Level 0 (empty): dark sleek background
   * Level 1 (1%-33%): dark emerald
   * Level 2 (34%-66%): medium emerald
   * Level 3 (67%-99%): bright vivid mint
   * Level 4 (100%): maximum neon glow green (#00e575)
   */
  const getCellColorClass = (ratio: number, isFuture: boolean, isToday: boolean) => {
    if (isFuture) {
      return 'bg-[#181b1d]/40 border border-white/[0.03]'
    }
    if (ratio === 0) {
      return 'bg-[#181b1d] hover:bg-[#25282a] border border-white/[0.04]'
    }
    if (ratio <= 0.34) {
      return 'bg-[#064e3b] text-emerald-200 border border-[#065f46]'
    }
    if (ratio <= 0.67) {
      return 'bg-[#059669] text-white shadow-[0_0_8px_rgba(5,150,105,0.4)]'
    }
    if (ratio < 1) {
      return 'bg-[#10b981] text-white shadow-[0_0_10px_rgba(16,185,129,0.55)]'
    }
    // 100% complete
    return 'bg-[#00e575] text-black shadow-[0_0_12px_rgba(0,229,117,0.7)]'
  }

  return (
    <div className="widget group/streak flex w-full flex-col justify-between gap-3 rounded-2xl bg-[#0e1011]/95 text-white p-4 shadow-[0_16px_36px_-10px_rgb(0_0_0/0.45)] border border-white/10 backdrop-blur-xl select-none transition-all duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div
          onClick={() => habitStore.openApp()}
          className="flex items-center gap-2.5 cursor-pointer"
          title="Open Habits Studio"
        >
          <div className="flex size-7.5 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#00e575]">
            <Flame className="size-4 fill-[#00e575]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-100 tracking-tight">
                Habit Streak Grid
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold text-[#00e575]">
                {streak} days
              </span>
            </div>
            <p className="text-[10px] text-neutral-400">
              {hoveredCell ? (
                <span className="text-emerald-400 font-medium">
                  {hoveredCell.dateStr} • {hoveredCell.count}/{hoveredCell.total} habits ({hoveredCell.percent}%)
                </span>
              ) : (
                <span>{totalActiveDays} active days • {totalCompletions} completed</span>
              )}
            </p>
          </div>
        </div>

        {/* Hover Action to open Habits Studio */}
        <button
          type="button"
          onClick={() => habitStore.openApp()}
          onPointerDown={(e) => e.stopPropagation()}
          title="Open Habits Studio"
          className="flex size-6 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 opacity-0 group-hover/streak:opacity-100 transition-opacity cursor-pointer shrink-0"
        >
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      {/* Grid Heatmap Visual Container - Fixed aspect ratio & never overflows */}
      <div className="w-full py-1">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-full">
          {columns.map((col, colIdx) =>
            col.map((cell, rowIdx) => {
              const cellClasses = getCellColorClass(cell.ratio, cell.isFuture, cell.isToday)
              const percent = Math.round(cell.ratio * 100)
              const formattedDate = cell.date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })

              return (
                <div
                  key={`${colIdx}-${rowIdx}-${cell.dateKey}`}
                  onMouseEnter={() => {
                    if (!cell.isFuture) {
                      setHoveredCell({
                        dateStr: formattedDate,
                        count: cell.doneCount,
                        total: cell.totalCount,
                        percent,
                      })
                    }
                  }}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`aspect-square w-full rounded-[3.5px] transition-all duration-200 cursor-pointer ${cellClasses} ${
                    cell.isToday ? 'ring-1.5 ring-white ring-offset-1 ring-offset-[#0e1011]' : ''
                  } hover:scale-125 hover:z-10`}
                />
              )
            })
          )}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-neutral-400">
        <span className="flex items-center gap-1 font-medium">
          <Sparkles className="size-3 text-[#00e575]" />
          Consistency Matrix
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-neutral-500">Less</span>
          <div className="size-2.5 rounded-[3px] bg-[#181b1d] border border-white/5" />
          <div className="size-2.5 rounded-[3px] bg-[#064e3b]" />
          <div className="size-2.5 rounded-[3px] bg-[#059669]" />
          <div className="size-2.5 rounded-[3px] bg-[#10b981]" />
          <div className="size-2.5 rounded-[3px] bg-[#00e575] shadow-[0_0_6px_rgba(0,229,117,0.8)]" />
          <span className="text-[9px] text-neutral-500">100%</span>
        </div>
      </div>
    </div>
  )
}
