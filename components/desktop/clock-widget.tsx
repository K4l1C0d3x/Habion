'use client'

import { useNow } from '@/lib/use-now'

export function ClockWidget() {
  const { now, ready } = useNow(1000)

  // Use the user's actual local system time
  const hours = now.getHours()
  const h = hours % 12
  const m = now.getMinutes()
  const s = now.getSeconds()

  // Proportional analog angles
  const hourDeg = (h + m / 60) * 30
  const minuteDeg = (m + s / 60) * 6
  const secondDeg = s * 6

  const digitalTime = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div
      className="widget flex aspect-square w-full items-center justify-center p-4 select-none"
      role="img"
      aria-label={`Analog clock showing accurate local time: ${digitalTime}`}
    >
      <div className="relative aspect-square w-full">
        {/* 12 Hour Dial Markers */}
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute inset-0 flex justify-center"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <span
              className={`mt-1 block rounded-full ${
                i % 3 === 0
                  ? 'h-2 w-1 bg-foreground'
                  : 'h-1.5 w-0.5 bg-muted-foreground/60'
              }`}
            />
          </span>
        ))}

        {/* Dial Subtitle */}
        <span className="absolute inset-x-0 top-[26%] text-center text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          LOCAL
        </span>

        {/* Exact Digital Readout */}
        <span className="absolute inset-x-0 bottom-[24%] text-center text-[11px] font-mono font-bold tracking-tight text-foreground tabular-nums">
          {ready ? digitalTime : '--:--'}
        </span>

        {/* Analog Hands */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        >
          {/* Hour Hand */}
          <Hand deg={hourDeg} className="h-[28%] w-[3.5px] bg-foreground shadow-sm" />
          {/* Minute Hand */}
          <Hand deg={minuteDeg} className="h-[40%] w-[2.5px] bg-foreground/90 shadow-sm" />
          {/* Second Hand (Signal Red) */}
          <Hand deg={secondDeg} className="h-[43%] w-[1.5px] bg-signal shadow-xs" />
          {/* Center Pin */}
          <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal ring-2 ring-background" />
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
