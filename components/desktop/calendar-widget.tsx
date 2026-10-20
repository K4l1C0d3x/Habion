'use client'

import { useNow } from '@/lib/use-now'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function CalendarWidget() {
  const { now } = useNow(60_000)
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const offset = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="widget flex aspect-square w-full flex-col p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-signal">
        {now.toLocaleDateString('en-US', { weekday: 'long' })}
      </p>
      <p className="font-display text-2xl leading-tight font-bold">{today}</p>
      <div className="mt-2 grid flex-1 grid-cols-7 content-start gap-y-0.5 text-center text-[9px] leading-4 tabular-nums">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-muted-foreground">
            {d}
          </span>
        ))}
        {cells.map((day, i) => (
          <span key={i} className="flex items-center justify-center">
            {day === today ? (
              <span className="flex size-4 items-center justify-center rounded-full bg-foreground font-bold text-background">
                {day}
              </span>
            ) : (
              <span className="text-foreground/70">{day ?? ''}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
