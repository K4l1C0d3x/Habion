'use client'

import { useNow } from '@/lib/use-now'
import { useTheme, themeManager } from '@/lib/theme'
import { Sun, Moon } from 'lucide-react'

export function MenuBar() {
  const { now, ready } = useNow(1000)
  const theme = useTheme()

  const date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <header className="sticky top-0 z-40 flex h-9 items-center justify-between border-b border-border bg-background/80 px-4 text-[13px] backdrop-blur-md select-none transition-colors duration-200">
      <nav aria-label="Primary" className="flex items-center gap-4 sm:gap-5">
        <a href="#top" className="font-bold tracking-tight hover:opacity-80 transition-opacity">
          Habion
        </a>
        <span className="font-medium text-muted-foreground">Kalidas</span>
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode / Light Mode Toggle */}
        <button
          type="button"
          onClick={() => themeManager.toggleTheme()}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="size-3.5 text-amber-400" />
          ) : (
            <Moon className="size-3.5 text-foreground/80" />
          )}
          <span className="sr-only">Toggle theme</span>
        </button>

        <time
          className={`flex items-center gap-2 tabular-nums transition-opacity ${ready ? 'opacity-100' : 'opacity-0'}`}
          dateTime={now.toISOString()}
        >
          <span>{date.replace(',', '')}</span>
          <span>{time}</span>
        </time>
      </div>
    </header>
  )
}
