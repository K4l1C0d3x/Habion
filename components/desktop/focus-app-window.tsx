'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Brain,
  Coffee,
  Sparkles,
  Trophy,
  Clock,
  Bell,
  Timer as TimerIcon,
} from 'lucide-react'
import { useFocusStore, focusStore, type FocusMode, playFocusChime } from '@/lib/focus-store'

export function FocusAppWindow() {
  const {
    isAppOpen,
    mode,
    seconds,
    running,
    soundEnabled,
    durations,
    completedCycles,
    totalFocusedMinutes,
  } = useFocusStore()

  const [isMaximized, setIsMaximized] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isAppOpen) {
        focusStore.closeApp()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAppOpen])

  if (!isAppOpen) return null

  const currentDurationTotal = durations[mode] * 60
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const progress = Math.min(1, Math.max(0, 1 - seconds / currentDurationTotal))

  const strokeColor =
    mode === 'focus'
      ? 'stroke-signal'
      : mode === 'shortBreak'
      ? 'stroke-emerald-500'
      : 'stroke-blue-500'

  const activeColor =
    mode === 'focus'
      ? 'text-signal'
      : mode === 'shortBreak'
      ? 'text-emerald-500'
      : 'text-blue-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-200 select-none">
      {/* Background click to dismiss */}
      <div
        className="absolute inset-0"
        onClick={() => focusStore.closeApp()}
        aria-hidden="true"
      />

      {/* Main Window */}
      <div
        ref={windowRef}
        className={`relative z-10 flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-card text-card-foreground shadow-[0_25px_50px_-12px_rgb(0_0_0/0.3),0_0_0_1px_rgb(0_0_0/0.05)] transition-all duration-300 ${
          isMaximized
            ? 'h-[85vh] w-[92vw] max-w-4xl'
            : 'h-[540px] max-h-[90vh] w-full max-w-xl'
        }`}
      >
        {/* macOS Title Bar */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-muted/40 px-4">
          {/* Traffic Light Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => focusStore.closeApp()}
              title="Close"
              className="group flex size-3 items-center justify-center rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-90 transition-all cursor-pointer"
            >
              <span className="text-[8px] font-bold text-black/60 opacity-0 group-hover:opacity-100">✕</span>
            </button>
            <button
              onClick={() => focusStore.closeApp()}
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

          {/* Window Title */}
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/85">
            <TimerIcon className="size-4 text-signal" />
            <span>Focus & Flow</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => focusStore.toggleSound()}
            title={soundEnabled ? 'Chime sound is ON' : 'Chime sound is MUTED'}
            className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="size-3.5 text-signal" />
                <span className="text-[11px] font-medium hidden sm:inline">Chime</span>
              </>
            ) : (
              <>
                <VolumeX className="size-3.5" />
                <span className="text-[11px] font-medium hidden sm:inline">Muted</span>
              </>
            )}
          </button>
        </div>

        {/* Window Content */}
        <div className="flex flex-1 flex-col overflow-y-auto p-5 sm:p-7 gap-5">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-center">
            <div className="flex rounded-xl bg-muted/60 p-1 text-xs font-semibold max-w-sm w-full">
              {(
                [
                  { id: 'focus', label: 'Focus', icon: Brain },
                  { id: 'shortBreak', label: 'Short Break', icon: Coffee },
                  { id: 'longBreak', label: 'Long Break', icon: Sparkles },
                ] as { id: FocusMode; label: string; icon: typeof Brain }[]
              ).map(({ id, label, icon: Icon }) => {
                const isActive = mode === id
                return (
                  <button
                    key={id}
                    onClick={() => focusStore.setMode(id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all text-center cursor-pointer ${
                      isActive
                        ? 'bg-card text-foreground shadow-xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Large Timer Display */}
          <div className="flex flex-col items-center justify-center gap-4 py-2">
            <div className="relative flex size-44 sm:size-48 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90 size-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  className="stroke-muted/70"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  className={`${strokeColor} transition-[stroke-dashoffset] duration-500 ease-linear`}
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - progress)}
                  strokeLinecap="round"
                />
              </svg>

              <div className="flex flex-col items-center justify-center text-center">
                <span className="font-mono text-4xl sm:text-5xl font-black tabular-nums tracking-tight">
                  {String(mins).padStart(2, '0')}
                  <span className={running ? 'animate-pulse opacity-70' : ''}>:</span>
                  {String(secs).padStart(2, '0')}
                </span>
                <span className={`text-xs font-semibold mt-1 uppercase tracking-wider ${activeColor}`}>
                  {mode === 'focus' ? 'Deep Work' : mode === 'shortBreak' ? 'Short Rest' : 'Recharge'}
                </span>

                {/* 4-cycle loop dots */}
                <div className="mt-2 flex items-center gap-1.5">
                  {Array.from({ length: 4 }).map((_, i) => {
                    const isDone = (completedCycles % 4) > i || (completedCycles > 0 && completedCycles % 4 === 0)
                    return (
                      <span
                        key={i}
                        className={`size-2 rounded-full transition-all ${
                          isDone ? 'bg-signal shadow-xs' : 'bg-muted-foreground/30'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Play/Pause & Reset Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => focusStore.toggleStartPause()}
                className={`flex items-center justify-center gap-2 rounded-xl px-7 py-2.5 text-sm font-bold transition-all shadow-sm cursor-pointer ${
                  running
                    ? 'bg-muted text-foreground hover:bg-muted/80'
                    : 'bg-foreground text-background hover:opacity-90 active:scale-95'
                }`}
              >
                {running ? (
                  <>
                    <Pause className="size-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="size-4 fill-current" />
                    <span>Start Focus</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => focusStore.reset()}
                title="Reset timer"
                className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>
          </div>

          {/* Focus Presets Grid */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-muted/20 p-4">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Focus Presets
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[15, 25, 45, 60].map((preset) => (
                <button
                  key={preset}
                  onClick={() => focusStore.setFocusDuration(preset)}
                  className={`flex flex-col items-center justify-center py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    durations.focus === preset
                      ? 'bg-foreground text-background shadow-xs font-bold'
                      : 'bg-card border border-border/80 hover:border-foreground/30 text-foreground'
                  }`}
                >
                  <span className="text-sm font-bold">{preset}m</span>
                  <span className="text-[10px] opacity-70">
                    {preset === 25 ? 'Standard' : preset === 45 ? 'Deep' : preset === 60 ? 'Extended' : 'Quick'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Analytics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-signal/15 text-signal">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  Focused Today
                </p>
                <p className="text-base font-bold text-foreground">
                  {totalFocusedMinutes} <span className="text-xs font-normal text-muted-foreground">mins</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                <Trophy className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  Completed Cycles
                </p>
                <p className="text-base font-bold text-foreground">
                  {completedCycles} <span className="text-xs font-normal text-muted-foreground">sessions</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
