'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  LocateFixed,
  MapPin,
  Search,
  Sun,
  X,
} from 'lucide-react'

interface WeatherLocation {
  name: string
  lat: number
  lon: number
}

interface DayForecast {
  date: string
  day: string
  code: number
  tempC: number
}

interface GeoSearchResult {
  id: number
  name: string
  country?: string
  admin1?: string
  latitude: number
  longitude: number
}

const STORAGE_LOCATION_KEY = 'desktop_weather_location_v1'
const STORAGE_UNIT_KEY = 'desktop_weather_unit_v1'

const FALLBACK_LOCATION: WeatherLocation = {
  name: 'Madrid',
  lat: 40.4168,
  lon: -3.7038,
}

function formatTemp(tempC: number, unit: 'C' | 'F'): number {
  return unit === 'F' ? Math.round((tempC * 9) / 5 + 32) : Math.round(tempC)
}

function getDayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return ''
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)
}

function getWeatherVisual(code: number) {
  if (code === 0 || code === 1) {
    return {
      label: code === 0 ? 'Clear sky' : 'Mainly clear',
      Icon: Sun,
      className: 'text-amber-400',
    }
  }
  if (code === 2) {
    return {
      label: 'Partly cloudy',
      Icon: CloudSun,
      className: 'text-amber-400',
    }
  }
  if (code === 45 || code === 48) {
    return {
      label: 'Foggy',
      Icon: CloudFog,
      className: 'text-muted-foreground/80',
    }
  }
  if ((code >= 51 && code <= 57)) {
    return {
      label: 'Drizzle',
      Icon: CloudDrizzle,
      className: 'text-sky-400',
    }
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      label: 'Rain',
      Icon: CloudRain,
      className: 'text-blue-400',
    }
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return {
      label: 'Snow',
      Icon: CloudSnow,
      className: 'text-cyan-300',
    }
  }
  if (code >= 95) {
    return {
      label: 'Thunderstorm',
      Icon: CloudLightning,
      className: 'text-yellow-400',
    }
  }
  return {
    label: 'Cloudy',
    Icon: Cloud,
    className: 'fill-muted-foreground/50 text-muted-foreground/60',
  }
}

async function fetchOpenMeteoForecast(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
    lat
  )}&longitude=${encodeURIComponent(
    lon
  )}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max&timezone=auto&forecast_days=7`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch weather')
  const data = await res.json()

  const times: string[] = data?.daily?.time ?? []
  const codes: number[] = data?.daily?.weather_code ?? []
  const temps: number[] = data?.daily?.temperature_2m_max ?? []

  const forecast: DayForecast[] = times.slice(0, 7).map((dateStr, i) => ({
    date: dateStr,
    day: getDayLabel(dateStr),
    code: Number(codes[i] ?? 3),
    tempC: Number(temps[i] ?? 25),
  }))

  return {
    currentTempC:
      typeof data?.current?.temperature_2m === 'number'
        ? data.current.temperature_2m
        : forecast[0]?.tempC ?? null,
    currentCode:
      typeof data?.current?.weather_code === 'number'
        ? data.current.weather_code
        : forecast[0]?.code ?? 0,
    forecast,
  }
}

export function WeatherWidget() {
  const [location, setLocation] = useState<WeatherLocation | null>(null)
  const [unit, setUnit] = useState<'C' | 'F'>('C')
  const [currentTempC, setCurrentTempC] = useState<number | null>(null)
  const [forecast, setForecast] = useState<DayForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Search UI state
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoSearchResult[]>([])
  const [searchingApi, setSearchingApi] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Initialize location & unit on mount
  useEffect(() => {
    let active = true

    try {
      const savedUnit = localStorage.getItem(STORAGE_UNIT_KEY)
      if (savedUnit === 'F' || savedUnit === 'C') setUnit(savedUnit)

      const savedLoc = localStorage.getItem(STORAGE_LOCATION_KEY)
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc)
        if (parsed && typeof parsed.name === 'string' && typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
          setLocation(parsed)
          return () => {
            active = false
          }
        }
      }
    } catch {
      // ignore storage errors
    }

    // Auto-detect city via IP geolocation
    fetch('https://get.geojs.io/v1/ip/geo.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Geo lookup failed'))))
      .then((geo) => {
        if (!active) return
        const lat = Number(geo.latitude)
        const lon = Number(geo.longitude)
        const name = geo.city || geo.region || geo.country || FALLBACK_LOCATION.name
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          setLocation({ name, lat, lon })
        } else {
          setLocation(FALLBACK_LOCATION)
        }
      })
      .catch(() => {
        if (active) setLocation(FALLBACK_LOCATION)
      })

    return () => {
      active = false
    }
  }, [])

  // Fetch live weather whenever location changes + refresh every 30 min
  useEffect(() => {
    if (!location) return
    let active = true

    const loadWeather = async () => {
      try {
        setError(false)
        const data = await fetchOpenMeteoForecast(location.lat, location.lon)
        if (!active) return
        setCurrentTempC(data.currentTempC)
        setForecast(data.forecast)
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadWeather()
    const timer = setInterval(loadWeather, 30 * 60 * 1000)

    return () => {
      active = false
      clearInterval(timer)
    }
  }, [location])

  // Focus input when search opens
  useEffect(() => {
    if (isSearching) {
      setTimeout(() => searchInputRef.current?.focus(), 30)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isSearching])

  // Debounced city search
  useEffect(() => {
    const trimmed = query.trim()
    if (!isSearching || trimmed.length < 2) {
      setResults([])
      return
    }

    let active = true
    setSearchingApi(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            trimmed
          )}&count=5&language=en&format=json`
        )
        const data = await res.json()
        if (active) setResults(Array.isArray(data?.results) ? data.results : [])
      } catch {
        if (active) setResults([])
      } finally {
        if (active) setSearchingApi(false)
      }
    }, 280)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, isSearching])

  const selectCity = (item: GeoSearchResult) => {
    const next: WeatherLocation = {
      name: item.name,
      lat: item.latitude,
      lon: item.longitude,
    }
    setLoading(true)
    setLocation(next)
    setIsSearching(false)
    try {
      localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  const handleDetectMyLocation = () => {
    setLoading(true)
    setIsSearching(false)

    const fallbackToIp = () => {
      fetch('https://get.geojs.io/v1/ip/geo.json')
        .then((r) => r.json())
        .then((geo) => {
          const lat = Number(geo.latitude)
          const lon = Number(geo.longitude)
          const next: WeatherLocation = {
            name: geo.city || geo.region || FALLBACK_LOCATION.name,
            lat: Number.isFinite(lat) ? lat : FALLBACK_LOCATION.lat,
            lon: Number.isFinite(lon) ? lon : FALLBACK_LOCATION.lon,
          }
          setLocation(next)
          try {
            localStorage.removeItem(STORAGE_LOCATION_KEY)
          } catch {
            // ignore
          }
        })
        .catch(() => setLoading(false))
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude
          let cityName = 'Local'
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            )
            const geo = await res.json()
            cityName = geo.city || geo.locality || geo.principalSubdivision || 'Local'
          } catch {
            // fallback name
          }
          const next: WeatherLocation = { name: cityName, lat, lon }
          setLocation(next)
          try {
            localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(next))
          } catch {
            // ignore
          }
        },
        () => fallbackToIp(),
        { timeout: 6000 }
      )
    } else {
      fallbackToIp()
    }
  }

  const toggleUnit = () => {
    const next = unit === 'C' ? 'F' : 'C'
    setUnit(next)
    try {
      localStorage.setItem(STORAGE_UNIT_KEY, next)
    } catch {
      // ignore
    }
  }

  return (
    <section
      aria-label={`${location?.name || 'Local'} weekly forecast`}
      className="widget group/weather relative flex w-full flex-col gap-3.5 p-4 select-none"
    >
      {/* Header */}
      {isSearching ? (
        <div
          className="relative flex items-center gap-1.5"
          data-no-drag
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsSearching(false)
              if (e.key === 'Enter' && results[0]) selectCity(results[0])
            }}
            placeholder="Search city..."
            className="h-5 flex-1 min-w-0 bg-transparent text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            type="button"
            onClick={handleDetectMyLocation}
            title="Use my current location"
            className="flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <LocateFixed className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsSearching(false)}
            title="Cancel"
            className="flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-3.5" />
          </button>

          {/* Floating Search Dropdown */}
          {(results.length > 0 || searchingApi) && (
            <div className="absolute top-7 left-0 right-0 z-30 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur-xl">
              {searchingApi && results.length === 0 ? (
                <div className="px-2.5 py-1.5 text-[11px] text-muted-foreground">
                  Searching...
                </div>
              ) : (
                results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectCity(item)}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-muted transition-colors cursor-pointer"
                  >
                    <span className="font-medium truncate text-foreground">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate ml-2 shrink-0">
                      {[item.admin1, item.country].filter(Boolean).join(', ')}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              data-no-drag
              onClick={() => setIsSearching(true)}
              onPointerDown={(e) => e.stopPropagation()}
              title="Change city"
              className="group/city flex items-center gap-1 min-w-0 rounded-md px-1 -ml-1 py-0.5 hover:bg-muted/70 transition-colors cursor-pointer"
            >
              <MapPin className="size-3 shrink-0 text-signal" />
              <h2 className="truncate text-[13px] font-semibold text-foreground">
                {location?.name || 'Loading...'}
              </h2>
            </button>
            {currentTempC !== null && (
              <span className="text-[12px] font-bold tabular-nums text-muted-foreground shrink-0">
                {formatTemp(currentTempC, unit)}°
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-medium text-muted-foreground">
              7-Day
            </span>
            <button
              type="button"
              data-no-drag
              onClick={toggleUnit}
              onPointerDown={(e) => e.stopPropagation()}
              title="Toggle °C / °F"
              className="rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              °{unit}
            </button>
          </div>
        </div>
      )}

      {/* 7-Day Forecast Grid */}
      {loading && forecast.length === 0 ? (
        <div className="grid grid-cols-7 gap-1 text-center py-0.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
              <div className="h-3 w-4 rounded bg-muted" />
              <div className="size-4 rounded-full bg-muted" />
              <div className="h-3 w-5 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : error && forecast.length === 0 ? (
        <div className="flex items-center justify-between py-2 text-[11px] text-muted-foreground">
          <span>Unable to load live weather</span>
          <button
            type="button"
            data-no-drag
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setLocation((prev) => (prev ? { ...prev } : FALLBACK_LOCATION))}
            className="text-signal font-semibold hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-7 text-center text-[11px]">
          {forecast.map((f, idx) => {
            const { label, Icon, className } = getWeatherVisual(f.code)
            return (
              <li
                key={f.date}
                title={`${f.day}: ${label}, ${formatTemp(f.tempC, unit)}°${unit}`}
                className="flex flex-col items-center gap-2"
              >
                <span className={idx === 0 ? 'font-bold text-signal' : 'text-muted-foreground'}>
                  {f.day}
                </span>
                <Icon className={`size-4 ${className}`} aria-label={label} />
                <span className="tabular-nums font-medium">
                  {formatTemp(f.tempC, unit)}°
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
