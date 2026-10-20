import { Cloud, Sun } from 'lucide-react'

const FORECAST = [
  { day: 'We', sunny: true, temp: 31 },
  { day: 'Th', sunny: true, temp: 33 },
  { day: 'Fr', sunny: false, temp: 29 },
  { day: 'Sa', sunny: false, temp: 28 },
  { day: 'Su', sunny: true, temp: 30 },
  { day: 'Mo', sunny: true, temp: 32 },
  { day: 'Tu', sunny: false, temp: 27 },
]

export function WeatherWidget() {
  return (
    <section aria-label="Madrid weekly forecast" className="widget flex w-full flex-col gap-4 p-5">
      <h2 className="text-[13px] font-medium">Madrid</h2>
      <ul className="grid grid-cols-7 text-center text-[11px]">
        {FORECAST.map((f) => (
          <li key={f.day} className="flex flex-col items-center gap-2">
            <span className="text-muted-foreground">{f.day}</span>
            {f.sunny ? (
              <Sun className="size-4 text-amber-400" aria-label="Sunny" />
            ) : (
              <Cloud className="size-4 fill-muted-foreground/50 text-muted-foreground/60" aria-label="Cloudy" />
            )}
            <span className="tabular-nums">{f.temp}°</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
