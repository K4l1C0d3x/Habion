'use client'

import { AppGrid } from './app-grid'
import { DraggableItem } from './draggable-item'
import { CalendarWidget } from './calendar-widget'
import { ClockWidget } from './clock-widget'
import { DesktopFolders } from './desktop-folders'
import { HabitWidget } from './habit-widget'
import { MusicWidget } from './music-widget'
import { NotesWidget } from './notes-widget'
import { PhotoWidget } from './photo-widget'
import { PomodoroWidget } from './pomodoro-widget'
import { TodoWidget } from './todo-widget'
import { WeatherWidget } from './weather-widget'
import { useSettingsStore } from '@/lib/settings-store'

export function Desktop() {
  const { widgets, resetLayoutKey } = useSettingsStore()

  return (
    <section id="top" aria-labelledby="hero-title" className="px-3 pt-10 pb-8 lg:p-0">
      <div key={resetLayoutKey} className="relative flex flex-col gap-8 lg:block lg:h-[max(920px,calc(100svh-2.25rem))]">
        <div className="flex flex-col items-center gap-6 text-center lg:pointer-events-none lg:absolute lg:inset-0 lg:justify-center lg:pb-16">
          <h1
            id="hero-title"
            className="font-display text-5xl leading-[1.05] font-extrabold tracking-tight text-balance md:text-6xl xl:text-7xl"
          >
            {"I'm Kalidas."}
            <br />
            {'I lead product & engineering.'}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground md:text-xl">
            Managing engineers, customers, and building agent loops and graphs to make every person in my team more
            efficient.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:contents">
          {widgets.clock && (
            <div className="lg:absolute lg:top-20 lg:left-3 lg:w-[188px]">
              <DraggableItem><ClockWidget /></DraggableItem>
            </div>
          )}
          {widgets.calendar && (
            <div className="lg:absolute lg:top-20 lg:left-[224px] lg:w-[188px]">
              <DraggableItem><CalendarWidget /></DraggableItem>
            </div>
          )}
          {widgets.music && (
            <div className="col-span-2 lg:absolute lg:top-16 lg:left-[450px] lg:w-[400px]">
              <DraggableItem><MusicWidget /></DraggableItem>
            </div>
          )}
          {widgets.weather && (
            <div className="col-span-2 lg:absolute lg:top-[330px] lg:left-3 lg:w-[400px]">
              <DraggableItem><WeatherWidget /></DraggableItem>
            </div>
          )}
          {widgets.todo && (
            <div className="col-span-2 sm:col-span-1 lg:absolute lg:top-[506px] lg:left-[220px] lg:w-[220px]">
              <DraggableItem><TodoWidget /></DraggableItem>
            </div>
          )}
          <div className="col-span-2 sm:col-span-1 lg:absolute lg:top-[506px] lg:left-3 lg:w-[186px]">
            <DraggableItem>
              <PhotoWidget />
            </DraggableItem>
          </div>
          {widgets.focus && (
            <div className="col-span-2 sm:col-span-1 lg:absolute lg:top-[330px] lg:left-[420px] lg:w-[200px]">
              <DraggableItem><PomodoroWidget /></DraggableItem>
            </div>
          )}
          {widgets.notes && (
            <div className="col-span-2 sm:col-span-1 lg:absolute lg:top-[506px] lg:left-[450px] lg:w-[240px]">
              <DraggableItem><NotesWidget /></DraggableItem>
            </div>
          )}
          {widgets.habit && (
            <div className="col-span-2 sm:col-span-1 lg:absolute lg:top-[680px] lg:left-3 lg:w-[220px]">
              <DraggableItem><HabitWidget /></DraggableItem>
            </div>
          )}
        </div>

        {widgets.apps && (
          <div className="flex justify-center lg:absolute lg:top-[630px] lg:right-[20%]">
            <DraggableItem><AppGrid /></DraggableItem>
          </div>
        )}

        <div className="lg:absolute lg:top-20 lg:right-10">
          <DesktopFolders />
        </div>
      </div>
    </section>
  )
}
