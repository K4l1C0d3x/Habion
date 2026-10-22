'use client'

import { AppGrid } from './app-grid'
import { DraggableItem } from './draggable-item'
import { CalendarWidget } from './calendar-widget'
import { ClockWidget } from './clock-widget'
import { DesktopFolders } from './desktop-folders'
import { HabitWidget } from './habit-widget'
import { HabitStreakCard } from './habit-streak-card'
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
    <section id="top" aria-label="Desktop workspace" className="px-3 pt-6 pb-8 lg:p-0">
      <div key={resetLayoutKey} className="relative flex flex-col gap-8 lg:block lg:h-[calc(100svh-2.25rem)]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:contents">
          {widgets.clock && (
            <div className="lg:absolute lg:top-20 lg:left-3 lg:w-[188px]">
              <DraggableItem id="clock"><ClockWidget /></DraggableItem>
            </div>
          )}
          {widgets.calendar && (
            <div className="lg:absolute lg:top-20 lg:left-[224px] lg:w-[188px]">
              <DraggableItem id="calendar"><CalendarWidget /></DraggableItem>
            </div>
          )}
          {widgets.music && (
            <div className="col-span-2 lg:absolute lg:top-16 lg:left-[450px] lg:w-[400px]">
              <DraggableItem id="music"><MusicWidget /></DraggableItem>
            </div>
          )}
          {widgets.weather && (
            <div className="col-span-2 lg:absolute lg:top-[330px] lg:left-3 lg:w-[320px]">
              <DraggableItem id="weather"><WeatherWidget /></DraggableItem>
            </div>
          )}
          {widgets.focus && (
            <div className="col-span-2 sm:col-span-1 lg:absolute lg:top-[330px] lg:left-[420px] lg:w-[200px]">
              <DraggableItem id="focus"><PomodoroWidget /></DraggableItem>
            </div>
          )}
          {widgets.habit && (
            <div className="col-span-2 sm:col-span-1 lg:absolute lg:top-[330px] lg:left-[636px] lg:w-[220px]">
              <DraggableItem id="habit"><HabitWidget /></DraggableItem>
            </div>
          )}
          {widgets.habitStreak !== false && (
            <div className="col-span-2 lg:absolute lg:top-[330px] lg:left-[872px] lg:w-[460px]">
              <DraggableItem id="habitStreak"><HabitStreakCard /></DraggableItem>
            </div>
          )}
          {widgets.photo !== false && (
            <div className="col-span-2 sm:col-span-1 lg:absolute lg:top-[506px] lg:left-3 lg:w-[186px]">
              <DraggableItem id="photo">
                <PhotoWidget />
              </DraggableItem>
            </div>
          )}
          {widgets.todo && (
            <div className="col-span-2 sm:col-span-1 lg:absolute lg:top-[506px] lg:left-[220px] lg:w-[220px]">
              <DraggableItem id="todo"><TodoWidget /></DraggableItem>
            </div>
          )}
          {widgets.notes && (
            <div className="col-span-2 sm:col-span-1 lg:absolute lg:top-[506px] lg:left-[450px] lg:w-[240px]">
              <DraggableItem id="notes"><NotesWidget /></DraggableItem>
            </div>
          )}
        </div>

        {widgets.apps && (
          <div className="flex justify-center lg:absolute lg:top-[515px] lg:left-[706px]">
            <DraggableItem id="apps"><AppGrid /></DraggableItem>
          </div>
        )}

        <div className="lg:absolute lg:top-20 lg:right-10">
          <DesktopFolders />
        </div>
      </div>
    </section>
  )
}
