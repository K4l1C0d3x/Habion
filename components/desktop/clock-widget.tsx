'use client'

import { useNow } from '@/lib/use-now'

function getZonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return { h: get('hour') % 12, m: get('minute'), s: get('second') }
}

export function ClockWidget() {
  const { now, ready } = useNow(1000)
  const { h, m, s } = getZonedParts(now, 'America/New_York')

  const hourDeg = h * 30 + m * 0.5
  const minuteDeg = m * 6 + s * 0.1
  const secondDeg = s * 6

  return (
    <div
      className="widget flex aspect-square w-full items-center justify-center p-4"
      role="img"
      aria-label={`Analog clock showing the time in Miami: ${now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
      })}`}
    >
      <div className="relative aspect-square w-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute inset-0 flex justify-center"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <span className={`mt-1 block rounded-full bg-muted-foreground/70 ${i % 3 === 0 ? 'h-1.5 w-1' : 'h-1 w-px'}`} />
          </span>
        ))}
        <span className="absolute inset-x-0 top-[26%] text-center text-[11px] font-medium tracking-wide text-muted-foreground">
          MIAMI
        </span>
        <div className={`absolute inset-0 transition-opacity ${ready ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
          <Hand deg={hourDeg} className="h-[28%] w-[3px] bg-foreground" />
          <Hand deg={minuteDeg} className="h-[40%] w-[3px] bg-foreground" />
          <Hand deg={secondDeg} className="h-[42%] w-px bg-signal" />
          <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
        </div>
      </div>
    </div>
  )
}

function Hand({ deg, className }: { deg: number; className: string }) {
  return (
    <span
      className={`absolute bottom-1/2 left-1/2 origin-bottom rounded-full ${className}`}
      style={{ transform: `translateX(-50%) rotate(${deg}deg)` }}
    />
  )
}
