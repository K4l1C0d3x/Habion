'use client'

import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useEffect, useState } from 'react'

const TRACKS = [
  { title: 'Psycho Killer', artist: 'Talking Heads', album: 'Talking Heads: 77' },
  { title: 'Once in a Lifetime', artist: 'Talking Heads', album: 'Remain in Light' },
  { title: 'This Must Be the Place', artist: 'Talking Heads', album: 'Speaking in Tongues' },
]
const DURATION = 30

function format(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

export function MusicWidget() {
  const [index, setIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const track = TRACKS[index]

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= DURATION) {
          setIndex((i) => (i + 1) % TRACKS.length)
          return 0
        }
        return e + 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [playing])

  const skip = (dir: 1 | -1) => {
    setIndex((i) => (i + dir + TRACKS.length) % TRACKS.length)
    setElapsed(0)
  }

  return (
    <div className="widget flex w-full flex-col gap-4 p-5">
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="flex aspect-square w-[90px] shrink-0 items-start overflow-hidden rounded-lg bg-album p-1 shadow-sm"
        >
          <span className="font-serif text-[10px] leading-none font-bold whitespace-nowrap text-album-ink italic">
            {track.album.toUpperCase()}
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-1 pt-1">
          <p className="truncate font-semibold">{track.title}</p>
          <p className="truncate text-[13px] text-muted-foreground">
            {track.artist} {'—'} {track.album}
          </p>
          <div className="mt-2 flex items-center gap-6">
            <button
              type="button"
              onClick={() => skip(-1)}
              aria-label="Previous track"
              className="rounded text-foreground/80 hover:text-foreground"
            >
              <SkipBack className="size-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause' : 'Play'}
              className="rounded text-foreground hover:scale-105"
            >
              {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
            </button>
            <button
              type="button"
              onClick={() => skip(1)}
              aria-label="Next track"
              className="rounded text-foreground/80 hover:text-foreground"
            >
              <SkipForward className="size-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={DURATION}
          aria-valuenow={elapsed}
        >
          <div
            className="h-full rounded-full bg-foreground/60 transition-[width] duration-1000 ease-linear"
            style={{ width: `${(elapsed / DURATION) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>{format(elapsed)}</span>
          <span>-{format(DURATION - elapsed)}</span>
        </div>
      </div>
    </div>
  )
}
