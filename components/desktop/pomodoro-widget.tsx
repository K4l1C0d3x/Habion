'use client'

import { Play, Pause, RotateCcw, ArrowUpRight } from 'lucide-react'
import { useFocusStore, focusStore } from '@/lib/focus-store'

export function PomodoroWidget() {
  const { mode, seconds, running, durations, completedCycles } = useFocusStore()

  const currentDurationTotal = durations[mode] * 60
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const progress = Math.min(1, Math.max(0, 1 - seconds / currentDurationTotal))

  const isBreak = mode !== 'focus'
  const strokeClass =
    mode === 'focus'
      ? 'stroke-signal'
      : mode === 'shortBreak'
      ? 'stroke-emerald-500'
      : 'stroke-blue-500'

  return (
    <div className="widget group/focus flex w-full flex-col gap-2.5 p-4 select-none">
      {/* Header with Title and Open App Arrow */}
      <div className="flex items-center justify-between">
        <div
          onClick={() => focusStore.openApp()}
          className="flex items-center gap-1.5 cursor-pointer"
          title="Open Focus App"
        >
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase hover:text-foreground transition-colors">
            {isBreak ? 'Break' : 'Focus'}
          </span>
          {/* Active 4-cycle dots */}
          <div className="flex items-center gap-1 pl-1">
            {Array.from({ length: 4 }).map((_, i) => {
              const isDone = (completedCycles % 4) > i || (completedCycles > 0 && completedCycles % 4 === 0)
              return (
                <span
                  key={i}
                  className={`size-1.5 rounded-full transition-all ${
                    isDone ? 'bg-signal' : 'bg-muted-foreground/30'
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* Open Full App Arrow (visible only on hover) */}
        <button
          type="button"
          onClick={() => focusStore.openApp()}
          onPointerDown={(e) => e.stopPropagation()}
          title="Open Focus App"
          className="flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground opacity-0 group-hover/focus:opacity-100 transition-opacity cursor-pointer"
        >
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      {/* Circular Timer Ring */}
      <div className="flex flex-col items-center py-0.5">
        <div className="relative flex size-28 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              className="stroke-muted/80"
              strokeWidth="5"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              className={`${strokeClass} transition-[stroke-dashoffset] duration-500 ease-linear`}
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progress)}
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="font-mono text-2xl font-black tabular-nums tracking-tight">
              {String(mins).padStart(2, '0')}
              <span className={running ? 'animate-pulse opacity-70' : ''}>:</span>
              {String(secs).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground capitalize">
              {mode === 'shortBreak' ? 'Short' : mode === 'longBreak' ? 'Long' : 'Work'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => focusStore.toggleStartPause()}
          onPointerDown={(e) => e.stopPropagation()}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer ${
            running
              ? 'bg-muted text-foreground hover:bg-muted/80'
              : 'bg-foreground text-background hover:opacity-90 active:scale-95'
          }`}
        >
          {running ? (
            <>
              <Pause className="size-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="size-3.5 fill-current" />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => focusStore.reset()}
          onPointerDown={(e) => e.stopPropagation()}
          title="Reset timer"
          className="flex size-8 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
