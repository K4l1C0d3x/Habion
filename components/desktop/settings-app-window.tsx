'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Settings,
  Palette,
  Wallpaper,
  LayoutGrid,
  Volume2,
  Info,
  Sun,
  Moon,
  RotateCcw,
  Sparkles,
  Laptop,
  Check,
  Bookmark,
  History,
  Upload,
  Trash2,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react'
import { useSettingsStore, settingsStore, type SettingsTab, type WidgetVisibility } from '@/lib/settings-store'
import { useWallpaperStore, wallpaperStore, PRESET_WALLPAPERS, processWallpaperFile, type WallpaperFit } from '@/lib/wallpaper-store'
import { useTheme, themeManager } from '@/lib/theme'
import { useFocusStore, focusStore, playFocusChime } from '@/lib/focus-store'

interface TabConfig {
  id: SettingsTab
  label: string
  icon: typeof Palette
}

const TABS: TabConfig[] = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'wallpaper', label: 'Wallpaper', icon: Wallpaper },
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
  { key: 'habitStreak', label: 'Habit Streak Card', desc: 'GitHub-style 140-day consistency heatmap card' },
  { key: 'photo', label: 'Photo & Framing', desc: 'Interactive photo album with crop studio' },
  { key: 'notes', label: 'Sticky Notes', desc: 'Persistent scratchpad note' },
  { key: 'apps', label: 'Daily Apps Grid', desc: 'Curated 10-tool daily stack' },
]

export function SettingsAppWindow() {
  const { isAppOpen, activeTab, widgets, widgetPositions, savedStage, savedStageDate } = useSettingsStore()
  const theme = useTheme()
  const { soundEnabled, durations } = useFocusStore()
  const { currentWallpaperId, customWallpaperData, customWallpaperName, blur, dim, fit } = useWallpaperStore()
  const [isMaximized, setIsMaximized] = useState(false)
  const [saveNotice, setSaveNotice] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setUploadError(null)
    try {
      const dataUrl = await processWallpaperFile(file)
      wallpaperStore.setCustomWallpaper(dataUrl, file.name)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Failed to load wallpaper')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

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

                {/* Quick Link to Wallpaper */}
                <div className="rounded-2xl border border-border bg-muted/10 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Wallpaper className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Desktop Wallpaper</p>
                      <p className="text-[11px] text-muted-foreground">
                        {currentWallpaperId === 'custom'
                          ? `Custom: ${customWallpaperName || 'Uploaded Image'}`
                          : currentWallpaperId === 'default'
                          ? 'Default Minimalist'
                          : PRESET_WALLPAPERS.find((p) => p.id === currentWallpaperId)?.name || 'Preset'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => settingsStore.setActiveTab('wallpaper')}
                    className="rounded-xl bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Change Wallpaper
                  </button>
                </div>
              </div>
            )}

            {/* 2. WALLPAPER TAB */}
            {activeTab === 'wallpaper' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-lg font-bold">Desktop Wallpaper</h2>
                  <p className="text-xs text-muted-foreground">
                    Upload your own photo or choose from curated macOS-style gradient presets.
                  </p>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* Custom Wallpaper Upload Card */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      Custom Upload
                    </span>
                    {customWallpaperData && (
                      <span className="text-[10px] font-medium text-signal">
                        Active Upload
                      </span>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/20 p-4 flex flex-col gap-4">
                    {customWallpaperData ? (
                      <div className="flex items-center gap-4">
                        <div
                          className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border shadow-xs bg-muted/50"
                          style={{
                            backgroundImage: `url(${customWallpaperData})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">
                            {customWallpaperName || 'Custom Uploaded Photo'}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {currentWallpaperId === 'custom' ? 'Currently applied on your desktop' : 'Saved in browser memory'}
                          </p>
                          <div className="flex items-center gap-2 mt-2.5">
                            {currentWallpaperId !== 'custom' && (
                              <button
                                type="button"
                                onClick={() => wallpaperStore.setPreset('custom')}
                                className="rounded-lg bg-foreground text-background px-2.5 py-1 text-[11px] font-semibold hover:opacity-90 transition-all cursor-pointer"
                              >
                                Apply
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold hover:bg-muted transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Upload className="size-3" />
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => wallpaperStore.removeCustomWallpaper()}
                              className="rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/15 px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Delete uploaded wallpaper"
                            >
                              <Trash2 className="size-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border p-6 hover:border-signal/50 hover:bg-muted/40 transition-all cursor-pointer text-center"
                      >
                        <div className="flex size-11 items-center justify-center rounded-full bg-muted group-hover:bg-signal/10 group-hover:text-signal transition-colors text-muted-foreground">
                          <Upload className="size-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">
                            {isUploading ? 'Compressing & uploading...' : 'Upload Wallpaper from Computer'}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            JPG, PNG, WebP up to high resolution. Automatically optimized for your display.
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded-lg">
                        {uploadError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preset Wallpapers Grid */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      macOS Curated Presets
                    </span>
                    <button
                      type="button"
                      onClick={() => wallpaperStore.setPreset('default')}
                      className="text-[11px] text-muted-foreground hover:text-foreground font-medium underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Reset to Default
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PRESET_WALLPAPERS.map((preset) => {
                      const isSelected = currentWallpaperId === preset.id
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => wallpaperStore.setPreset(preset.id)}
                          className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-signal ring-2 ring-signal/30 shadow-xs'
                              : 'border-border hover:border-border/80 hover:shadow-xs'
                          }`}
                        >
                          <div
                            className="h-16 w-full relative transition-transform duration-300 group-hover:scale-105"
                            style={{
                              background: preset.value || 'var(--card)',
                            }}
                          >
                            {preset.id === 'default' && (
                              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60 text-[10px] font-medium bg-muted/20">
                                Clean System
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-signal text-white shadow-xs">
                                <Check className="size-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-card">
                            <p className="text-[11px] font-bold truncate">{preset.name}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Wallpaper Customization Controls (Blur & Dim) */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-bold">Display & Backdrop Effects</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    {/* Background Fit */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground">Scaling Fit</span>
                        <span className="font-semibold uppercase text-[10px]">{fit}</span>
                      </div>
                      <div className="flex gap-1 bg-muted p-0.5 rounded-lg border border-border">
                        {(['cover', 'contain'] as WallpaperFit[]).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => wallpaperStore.setFit(mode)}
                            className={`flex-1 text-[10px] font-semibold capitalize py-1 rounded-md transition-all cursor-pointer ${
                              fit === mode
                                ? 'bg-card text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Blur Slider */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground">Backdrop Blur</span>
                        <span className="font-semibold">{blur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="2"
                        value={blur}
                        onChange={(e) => wallpaperStore.setBlur(Number(e.target.value))}
                        className="w-full accent-signal cursor-pointer"
                      />
                    </div>

                    {/* Dim Overlay Slider */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground">Vignette Dim</span>
                        <span className="font-semibold">{dim}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="70"
                        step="5"
                        value={dim}
                        onChange={(e) => wallpaperStore.setDim(Number(e.target.value))}
                        className="w-full accent-signal cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. WIDGETS & DESKTOP TAB */}
            {activeTab === 'widgets' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-lg font-bold">Widgets & Desktop</h2>
                  <p className="text-xs text-muted-foreground">
                    Configure desktop widgets and manage your custom stage layout.
                  </p>
                </div>

                {/* Stage & Layout Memory Card */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-signal/10 text-signal">
                        <Bookmark className="size-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-foreground">Desktop Stage & Positions</h3>
                        <p className="text-[11px] text-muted-foreground">
                          {Object.keys(widgetPositions).length > 0
                            ? `${Object.keys(widgetPositions).length} widgets arranged in custom positions`
                            : 'Widgets are currently aligned to default grid'}
                        </p>
                      </div>
                    </div>

                    {savedStageDate && (
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/50">
                        Saved: {savedStageDate}
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                    {/* 1. Save Stage Button */}
                    <button
                      type="button"
                      onClick={() => {
                        settingsStore.saveCurrentStage()
                        setSaveNotice(true)
                        setTimeout(() => setSaveNotice(false), 2500)
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-signal px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    >
                      {saveNotice ? (
                        <>
                          <Check className="size-3.5 stroke-[3]" />
                          <span>Stage Saved!</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="size-3.5" />
                          <span>Save Current Stage</span>
                        </>
                      )}
                    </button>

                    {/* 2. Restore Saved Stage Button */}
                    <button
                      type="button"
                      disabled={!savedStage}
                      onClick={() => settingsStore.restoreSavedStage()}
                      title={savedStage ? 'Restore your saved stage snapshot' : 'No stage saved yet'}
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <History className="size-3.5 text-muted-foreground" />
                      <span>Restore Saved Stage</span>
                    </button>

                    {/* 3. Reset to Default Button */}
                    <button
                      type="button"
                      onClick={() => {
                        settingsStore.resetDesktopLayout()
                      }}
                      title="Reset all dragged widgets back to default coordinates"
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Reset to Default</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                    Widget positions are automatically remembered as you drag them. Click <span className="font-semibold text-foreground">Save Current Stage</span> to preserve a permanent checkpoint, or <span className="font-semibold text-foreground">Reset to Default</span> to restore the original macOS layout.
                  </p>
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
