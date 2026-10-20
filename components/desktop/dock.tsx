'use client'

import { Folder, Heart, Sparkles, ListTodo, Timer as TimerIcon, Settings as SettingsIcon, Flame } from 'lucide-react'
import { useTodoStore, todoStore } from '@/lib/todo-store'
import { useFocusStore, focusStore } from '@/lib/focus-store'
import { useHabitStore, habitStore } from '@/lib/habit-store'
import { useSettingsStore, settingsStore } from '@/lib/settings-store'
import { usePhotoStore, photoStore } from '@/lib/photo-store'
import { useNow } from '@/lib/use-now'

const TILE = 'relative flex size-12 items-center justify-center rounded-xl shadow-sm transition-transform hover:-translate-y-1.5 cursor-pointer'

export function Dock() {
  const { isAppOpen: isTodoOpen } = useTodoStore()
  const { isAppOpen: isFocusOpen } = useFocusStore()
  const { isAppOpen: isHabitOpen } = useHabitStore()
  const { isAppOpen: isSettingsOpen } = useSettingsStore()
  const { isAppOpen: isPhotoOpen } = usePhotoStore()
  const { now } = useNow(60_000)

  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const dayNumber = now.getDate()

  return (
    <nav aria-label="Dock" className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 select-none">
      <ul className="widget flex items-center gap-2 rounded-2xl bg-card/85 p-2 backdrop-blur-xl border border-black/5 shadow-[0_12px_32px_-8px_rgb(0_0_0/0.15)]">
        {/* Finder / Kalidas Monogram */}
        <li>
          <a
            href="#top"
            aria-label="Home"
            className={`${TILE} bg-card font-display text-xl font-black ring-1 ring-border text-foreground hover:bg-muted/40`}
          >
            {'K'}
          </a>
        </li>

        <li aria-hidden="true" className="h-8 w-px bg-border/80" />

        {/* Reminders / To-Do App */}
        <li className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={() => todoStore.toggleApp()}
            title="Reminders (To-Do App)"
            className={`${TILE} bg-gradient-to-b from-amber-400 to-orange-500 text-white`}
          >
            <ListTodo aria-hidden="true" className="size-5.5 stroke-[2.2]" />
            <span className="sr-only">Reminders</span>
          </button>
          {isTodoOpen && (
            <span className="absolute -bottom-1 size-1 rounded-full bg-foreground/80" />
          )}
        </li>

        {/* Focus App */}
        <li className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={() => focusStore.toggleApp()}
            title="Focus & Flow (Pomodoro App)"
            className={`${TILE} bg-gradient-to-b from-rose-500 to-red-600 text-white`}
          >
            <TimerIcon aria-hidden="true" className="size-5.5 stroke-[2.2]" />
            <span className="sr-only">Focus</span>
          </button>
          {isFocusOpen && (
            <span className="absolute -bottom-1 size-1 rounded-full bg-foreground/80" />
          )}
        </li>

        {/* Habits App */}
        <li className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={() => habitStore.toggleApp()}
            title="Habits & Routines Studio"
            className={`${TILE} bg-gradient-to-b from-amber-500 to-orange-600 text-white`}
          >
            <Flame aria-hidden="true" className="size-5.5 fill-current" />
            <span className="sr-only">Habits</span>
          </button>
          {isHabitOpen && (
            <span className="absolute -bottom-1 size-1 rounded-full bg-foreground/80" />
          )}
        </li>

        {/* Settings App */}
        <li className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={() => settingsStore.toggleApp()}
            title="System Settings"
            className={`${TILE} bg-gradient-to-b from-neutral-400 to-neutral-600 dark:from-neutral-600 dark:to-neutral-800 text-white shadow-sm`}
          >
            <SettingsIcon aria-hidden="true" className="size-5.5 stroke-[2.2]" />
            <span className="sr-only">Settings</span>
          </button>
          {isSettingsOpen && (
            <span className="absolute -bottom-1 size-1 rounded-full bg-foreground/80" />
          )}
        </li>

        {/* Work */}
        <li>
          <button
            type="button"
            title="Work Projects"
            className={`${TILE} bg-gradient-to-b from-sky-400 to-blue-600 text-white`}
          >
            <Folder aria-hidden="true" className="size-5 fill-current" />
            <span className="sr-only">Work</span>
          </button>
        </li>

        {/* Achievements */}
        <li>
          <button
            type="button"
            title="Achievements"
            className={`${TILE} bg-gradient-to-b from-fuchsia-400 to-violet-600 text-white`}
          >
            <Sparkles aria-hidden="true" className="size-5 fill-current" />
            <span className="sr-only">Achievements</span>
          </button>
        </li>

        {/* Photos & Framing Studio */}
        <li className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={() => photoStore.toggleApp()}
            title="Photos & Framing Studio"
            className={`${TILE} bg-gradient-to-b from-rose-400 to-pink-600 text-white`}
          >
            <Heart aria-hidden="true" className="size-5 fill-current" />
            <span className="sr-only">Photos</span>
          </button>
          {isPhotoOpen && (
            <span className="absolute -bottom-1 size-1 rounded-full bg-foreground/80" />
          )}
        </li>

        {/* Dynamic Live Calendar Tile */}
        <li>
          <div
            title={`Calendar: ${now.toLocaleDateString('en-US', { dateStyle: 'full' })}`}
            className={`${TILE} flex-col bg-card ring-1 ring-border`}
          >
            <span className="text-[9px] leading-none font-bold text-signal">{dayName}</span>
            <span className="font-display text-xl leading-none font-bold text-foreground">
              {dayNumber}
            </span>
          </div>
        </li>
      </ul>
    </nav>
  )
}
