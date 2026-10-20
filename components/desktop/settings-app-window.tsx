'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Settings,
  Palette,
  LayoutGrid,
  Volume2,
  Info,
  Sun,
  Moon,
  RotateCcw,
  Sparkles,
  Laptop,
  Check,
} from 'lucide-react'
import { useSettingsStore, settingsStore, type SettingsTab, type WidgetVisibility } from '@/lib/settings-store'
import { useTheme, themeManager } from '@/lib/theme'
import { useFocusStore, focusStore, playFocusChime } from '@/lib/focus-store'

interface TabConfig {
  id: SettingsTab
  label: string
  icon: typeof Palette
}

const TABS: TabConfig[] = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'widgets', label: 'Widgets & Desktop', icon: LayoutGrid },
  { id: 'sound', label: 'Sound & Focus', icon: Volume2 },
  { id: 'about', label: 'About KalidasOS', icon: Info },
]

const WIDGET_LABELS: { key: keyof WidgetVisibility; label: string; desc: string }[] = [
  { key: 'clock', label: 'Analog Clock', desc: 'Live analog Miami clock with second hand' },
  { key: 'calendar', label: 'Calendar', desc: 'Interactive monthly grid with today highlight' },
  { key: 'music', label: 'Music Player', desc: 'Album track player with scrubbable timeline' },
  { key: 'weather', label: 'Weather Forecast', desc: 'Weekly temperatures and conditions' },
  { key: 'todo', label: 'Reminders & Tasks', desc: 'Task checklist connected to Reminders app' },
  { key: 'focus', label: 'Focus & Pomodoro', desc: 'Timer with 4-cycle Pomodoro loop' },
  { key: 'habit', label: 'Habit Tracker', desc: 'Daily habits with streaks and week dots' },
  { key: 'notes', label: 'Sticky Notes', desc: 'Persistent scratchpad note' },
  { key: 'apps', label: 'Daily Apps Grid', desc: 'Curated 10-tool daily stack' },
]

export function SettingsAppWindow() {
  const { isAppOpen, activeTab, widgets } = useSettingsStore()
  const theme = useTheme()
  const { soundEnabled, durations } = useFocusStore()
  const [isMaximized, setIsMaximized] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isAppOpen) {
        settingsStore.closeApp()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAppOpen])

  if (!isAppOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-200 select-none">
      {/* Background click to dismiss */}
      <div
        className="absolute inset-0"
        onClick={() => settingsStore.closeApp()}
        aria-hidden="true"
      />

      {/* Main Window */}
      <div
        ref={windowRef}
        className={`relative z-10 flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-card text-card-foreground shadow-[0_25px_50px_-12px_rgb(0_0_0/0.3),0_0_0_1px_rgb(0_0_0/0.05)] transition-all duration-300 ${
          isMaximized
            ? 'h-[85vh] w-[92vw] max-w-4xl'
            : 'h-[540px] max-h-[90vh] w-full max-w-2xl'
        }`}
      >
        {/* macOS Title Bar */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-muted/40 px-4">
          {/* Traffic Light Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => settingsStore.closeApp()}
              title="Close"
              className="group flex size-3 items-center justify-center rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-90 transition-all cursor-pointer"
            >
              <span className="text-[8px] font-bold text-black/60 opacity-0 group-hover:opacity-100">✕</span>
            </button>
            <button
              onClick={() => settingsStore.closeApp()}
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
            <Settings className="size-4 text-muted-foreground" />
            <span>System Settings</span>
          </div>

          <div className="w-12" />
        </div>

        {/* Split View Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-52 shrink-0 border-r border-border bg-muted/20 p-3 flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              {/* Profile Card */}
              <div className="flex items-center gap-2.5 rounded-xl bg-card p-2 border border-border shadow-xs">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground font-display text-sm font-black text-background">
                  K
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold leading-tight">Kalidas</p>
                  <p className="truncate text-[10px] text-muted-foreground">Head of Product</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex flex-col gap-1">
                {TABS.map(({ id, label, icon: Icon }) => {
                  const isActive = activeTab === id
                  return (
                    <button
                      key={id}
                      onClick={() => settingsStore.setActiveTab(id)}
                      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-foreground text-background shadow-xs font-semibold'
                          : 'text-foreground/80 hover:bg-muted/60'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="text-[10px] text-muted-foreground/70 px-2 py-1 text-center">
              KalidasOS v15.0 Sequoia
            </div>
          </aside>

          {/* Right Main Settings Pane */}
          <main className="flex-1 overflow-y-auto p-5 sm:p-6 bg-card">
            {/* 1. APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-lg font-bold">Appearance</h2>
                  <p className="text-xs text-muted-foreground">
                    Customize your desktop theme and visual preferences.
                  </p>
                </div>

                {/* Theme Selector Cards */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    Theme
                  </span>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    {/* Light Option */}
                    <button
                      type="button"
                      onClick={() => themeManager.setTheme('light')}
                      className={`group flex flex-col items-center gap-2.5 rounded-2xl border p-3.5 transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'border-signal bg-signal/5 ring-2 ring-signal/20 shadow-xs'
                          : 'border-border bg-muted/30 hover:border-border hover:bg-muted/60'
                      }`}
                    >
                      <div className="flex size-14 items-center justify-center rounded-xl bg-white border border-black/10 shadow-sm text-foreground">
                        <Sun className="size-7 text-amber-500" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">Light</span>
                        {theme === 'light' && <Check className="size-3.5 text-signal stroke-[3]" />}
                      </div>
                    </button>

                    {/* Dark Option */}
                    <button
                      type="button"
                      onClick={() => themeManager.setTheme('dark')}
                      className={`group flex flex-col items-center gap-2.5 rounded-2xl border p-3.5 transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'border-signal bg-signal/5 ring-2 ring-signal/20 shadow-xs'
                          : 'border-border bg-muted/30 hover:border-border hover:bg-muted/60'
                      }`}
                    >
                      <div className="flex size-14 items-center justify-center rounded-xl bg-neutral-900 border border-white/10 shadow-sm text-white">
                        <Moon className="size-7 text-sky-400" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">Dark</span>
                        {theme === 'dark' && <Check className="size-3.5 text-signal stroke-[3]" />}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Accent Color Note */}
                <div className="rounded-xl border border-border bg-muted/20 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-4 rounded-full bg-signal" />
                    <div>
                      <p className="text-xs font-semibold">Accent Color</p>
                      <p className="text-[11px] text-muted-foreground">Coral / Signal</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-md">
                    System Default
                  </span>
                </div>
              </div>
            )}

            {/* 2. WIDGETS & DESKTOP TAB */}
            {activeTab === 'widgets' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Widgets & Desktop</h2>
                    <p className="text-xs text-muted-foreground">
                      Toggle desktop widgets on or off and manage layout.
                    </p>
                  </div>
                  <button
                    onClick={() => settingsStore.resetDesktopLayout()}
                    title="Reset all dragged items back to origin"
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset Layout</span>
                  </button>
                </div>

                {/* Widgets List */}
                <div className="flex flex-col divide-y divide-border/60 rounded-2xl border border-border bg-muted/20 overflow-hidden">
                  {WIDGET_LABELS.map(({ key, label, desc }) => {
                    const isVisible = widgets[key]
                    return (
                      <div key={key} className="flex items-center justify-between p-3">
                        <div className="min-w-0 pr-4">
                          <p className="text-xs font-semibold text-foreground">{label}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
                        </div>
                        {/* macOS Style Toggle Switch */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isVisible}
                          onClick={() => settingsStore.toggleWidget(key)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isVisible ? 'bg-signal' : 'bg-muted-foreground/30'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              isVisible ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. SOUND & FOCUS TAB */}
            {activeTab === 'sound' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-lg font-bold">Sound & Focus</h2>
                  <p className="text-xs text-muted-foreground">
                    Configure audio notifications and focus session settings.
                  </p>
                </div>

                {/* Chime Notification Box */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">Session Completion Chime</p>
                      <p className="text-[11px] text-muted-foreground">
                        Play harmonized bell chime when focus sessions finish.
                      </p>
                    </div>
                    {/* Toggle switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={soundEnabled}
                      onClick={() => focusStore.toggleSound()}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        soundEnabled ? 'bg-signal' : 'bg-muted-foreground/30'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          soundEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-border/60">
                    <button
                      onClick={() => playFocusChime()}
                      className="flex items-center gap-1.5 text-xs text-signal font-semibold hover:underline cursor-pointer"
                    >
                      <Volume2 className="size-3.5" />
                      <span>Preview Sound Chime</span>
                    </button>
                  </div>
                </div>

                {/* Default Duration Selector */}
                <div className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/20 p-4">
                  <p className="text-xs font-semibold">Default Focus Duration</p>
                  <p className="text-[11px] text-muted-foreground">
                    Choose standard duration for your Pomodoro deep work blocks.
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[15, 25, 45, 60].map((m) => (
                      <button
                        key={m}
                        onClick={() => focusStore.setFocusDuration(m)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          durations.focus === m
                            ? 'bg-foreground text-background shadow-xs font-bold'
                            : 'bg-card border border-border hover:border-foreground/30 text-foreground'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-150">
                <div className="flex flex-col items-center text-center py-4">
                  <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-neutral-800 to-neutral-950 text-white shadow-md mb-3 border border-white/10">
                    <Laptop className="size-10 text-signal" />
                  </div>
                  <h2 className="text-xl font-bold">KalidasOS Sequoia</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Version 15.0 (Build 24A348)</p>
                </div>

                <div className="divide-y divide-border/60 rounded-2xl border border-border bg-muted/20 text-xs">
                  <div className="flex justify-between p-3">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-semibold">Head of Product & Engineering</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-muted-foreground">Focus</span>
                    <span className="font-semibold">AI Agent Loops & Platform Graphs</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-muted-foreground">Community</span>
                    <span className="font-semibold">Engineering & Product Lead</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-muted-foreground">Stack</span>
                    <span className="font-semibold">Next.js 16 • React 19 • Tailwind CSS</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
