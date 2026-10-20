'use client'

import { Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Track {
  title: string
  artist: string
  album: string
  cover: string
  duration: number
}

const TRACKS: Track[] = [
  {
    title: 'Escape from LA',
    artist: 'The Weeknd',
    album: 'After Hours',
    cover: '/images/after-hours.jpg',
    duration: 356, // 5:56
  },
  {
    title: 'Heartless',
    artist: 'The Weeknd',
    album: 'After Hours',
    cover: '/images/after-hours.jpg',
    duration: 198, // 3:18
  },
  {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    cover: '/images/after-hours.jpg',
    duration: 200, // 3:20
  },
  {
    title: 'After Hours',
    artist: 'The Weeknd',
    album: 'After Hours',
    cover: '/images/after-hours.jpg',
    duration: 361, // 6:01
  },
  {
    title: 'In Your Eyes',
    artist: 'The Weeknd',
    album: 'After Hours',
    cover: '/images/after-hours.jpg',
    duration: 237, // 3:57
  },
  {
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    cover: '/images/after-hours.jpg',
    duration: 215, // 3:35
  },
]

function format(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

export function MusicWidget() {
  const [index, setIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const track = TRACKS[index]
  const duration = track.duration

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= duration) {
          setIndex((i) => (i + 1) % TRACKS.length)
          return 0
        }
        return e + 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [playing, duration])

  const skip = (dir: 1 | -1) => {
    setIndex((i) => (i + dir + TRACKS.length) % TRACKS.length)
    setElapsed(0)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setElapsed(Math.round(pct * duration))
  }

  return (
    <div className="widget group/music flex w-full flex-col gap-4 p-5 select-none">
      <div className="flex items-start gap-4">
        {/* Album Cover Art (Static, no hover scale movement) */}
        <div
          aria-hidden="true"
          className="relative flex aspect-square w-[90px] shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-md border border-black/10 dark:border-white/10 bg-black"
        >
          <img
            src={track.cover}
            alt={`${track.album} by ${track.artist}`}
            draggable={false}
            className="size-full object-cover"
          />
        </div>

        {/* Track Metadata & Controls */}
        <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
          <p className="truncate text-sm font-bold text-foreground tracking-tight">
            {track.title}
          </p>
          <p className="truncate text-[12px] font-medium text-muted-foreground">
            {track.artist} {'—'} {track.album}
          </p>

          {/* Player Playback Controls */}
          <div className="mt-2.5 flex items-center gap-5">
            <button
              type="button"
              onClick={() => skip(-1)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Previous track"
              className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <SkipBack className="size-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={playing ? 'Pause' : 'Play'}
              className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              {playing ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
            </button>
            <button
              type="button"
              onClick={() => skip(1)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Next track"
              className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <SkipForward className="size-4 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="flex flex-col gap-1.5">
        <div
          onClick={handleSeek}
          onPointerDown={(e) => e.stopPropagation()}
          className="group/seek relative h-1.5 w-full overflow-hidden rounded-full bg-muted cursor-pointer"
          role="progressbar"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={elapsed}
        >
          <div
            className="h-full rounded-full bg-signal transition-all duration-300"
            style={{ width: `${(elapsed / duration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground/80 font-medium px-0.5">
          <span>{format(elapsed)}</span>
          <span>-{format(Math.max(0, duration - elapsed))}</span>
        </div>
      </div>
    </div>
  )
}
