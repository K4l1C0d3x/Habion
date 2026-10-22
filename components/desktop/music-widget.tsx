'use client'

import { ExternalLink, Pause, Play, Radio, SkipBack, SkipForward } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Track {
  title: string
  artist: string
  album: string
  cover: string
  duration: number
}

interface SpotifyPlayback {
  configured: boolean
  isPlaying: boolean
  title?: string
  artist?: string
  album?: string
  albumImageUrl?: string | null
  songUrl?: string | null
  progressMs?: number
  durationMs?: number
}

const MOCK_TRACKS: Track[] = [
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

function formatSeconds(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function SpotifyIcon({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.218.358-.684.471-1.042.253-2.858-1.747-6.455-2.142-10.693-1.173-.409.094-.817-.162-.911-.571-.094-.409.162-.817.571-.911 4.636-1.059 8.625-.615 11.822 1.341.358.218.471.684.253 1.042zm1.467-3.262c-.275.448-.863.59-1.311.315-3.272-2.011-8.26-2.594-12.13-1.419-.504.153-1.036-.134-1.189-.638-.153-.504.134-1.036.638-1.189 4.417-1.34 9.923-.692 13.677 1.62.448.275.59.863.315 1.311zm.126-3.41c-3.924-2.33-10.395-2.545-14.15-1.405-.601.182-1.24-.162-1.422-.763-.182-.601.162-1.24.763-1.422 4.316-1.31 11.455-1.06 15.98 1.626.541.321.718 1.021.397 1.562-.321.541-1.021.718-1.562.397z" />
    </svg>
  )
}

export function MusicWidget() {
  // Spotify Live State
  const [spotifyData, setSpotifyData] = useState<SpotifyPlayback | null>(null)
  const [spotifyElapsed, setSpotifyElapsed] = useState(0)

  // Local Mock State (Fallback)
  const [mockIndex, setMockIndex] = useState(0)
  const [mockElapsed, setMockElapsed] = useState(0)
  const [mockPlaying, setMockPlaying] = useState(false)

  // Polling Spotify
  useEffect(() => {
    let isMounted = true

    const fetchSpotify = async () => {
      try {
        const res = await fetch('/api/spotify/currently-playing', { cache: 'no-store' })
        if (!res.ok) return
        const data: SpotifyPlayback = await res.json()
        if (!isMounted) return

        setSpotifyData(data)
        if (data.isPlaying && typeof data.progressMs === 'number') {
          setSpotifyElapsed(Math.floor(data.progressMs / 1000))
        }
      } catch (err) {
        // Silently fallback if server or Spotify API is unreachable
      }
    }

    fetchSpotify()
    const pollInterval = setInterval(fetchSpotify, 2500)

    return () => {
      isMounted = false
      clearInterval(pollInterval)
    }
  }, [])

  // Smooth local increment while Spotify is actively playing
  useEffect(() => {
    if (!spotifyData?.isPlaying || !spotifyData.durationMs) return

    const durationSec = Math.floor(spotifyData.durationMs / 1000)
    const timer = setInterval(() => {
      setSpotifyElapsed((prev) => {
        if (prev + 1 >= durationSec) return prev
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [spotifyData?.isPlaying, spotifyData?.durationMs])

  // Mock player timer
  const mockTrack = MOCK_TRACKS[mockIndex]
  useEffect(() => {
    if (spotifyData?.isPlaying || !mockPlaying) return

    const timer = setInterval(() => {
      setMockElapsed((e) => {
        if (e + 1 >= mockTrack.duration) {
          setMockIndex((i) => (i + 1) % MOCK_TRACKS.length)
          return 0
        }
        return e + 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [spotifyData?.isPlaying, mockPlaying, mockTrack.duration])

  const isLiveSpotify = Boolean(spotifyData?.isPlaying && spotifyData.title)

  // Spotify active track values
  const currentTitle = isLiveSpotify ? spotifyData!.title! : mockTrack.title
  const currentArtist = isLiveSpotify ? spotifyData!.artist! : mockTrack.artist
  const currentAlbum = isLiveSpotify ? (spotifyData!.album || 'Spotify') : mockTrack.album
  const currentCover = isLiveSpotify ? (spotifyData!.albumImageUrl || '/images/after-hours.jpg') : mockTrack.cover
  const currentDuration = isLiveSpotify ? Math.max(1, Math.floor((spotifyData!.durationMs || 0) / 1000)) : mockTrack.duration
  const currentElapsed = isLiveSpotify ? Math.min(spotifyElapsed, currentDuration) : mockElapsed

  const skipMock = (dir: 1 | -1) => {
    setMockIndex((i) => (i + dir + MOCK_TRACKS.length) % MOCK_TRACKS.length)
    setMockElapsed(0)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLiveSpotify) return // Live Spotify seek is read-only from player
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setMockElapsed(Math.round(pct * currentDuration))
  }

  return (
    <div className="widget group/music flex w-full flex-col gap-4 p-5 select-none">
      {/* Header bar with Status / Spotify pill */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          {isLiveSpotify ? (
            <span className="flex items-center gap-1.5 text-emerald-500 font-semibold text-[11px] tracking-wide">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <SpotifyIcon className="size-3.5 fill-emerald-500" />
              LIVE ON SPOTIFY
            </span>
          ) : spotifyData?.configured ? (
            <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <SpotifyIcon className="size-3.5 fill-muted-foreground" />
              Spotify Idle
            </span>
          ) : (
            <a
              href="/api/spotify/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-emerald-500 transition-colors"
              title="Click to connect your Spotify account"
            >
              <SpotifyIcon className="size-3 fill-current" />
              Connect Spotify
            </a>
          )}
        </div>

        {isLiveSpotify && spotifyData?.songUrl && (
          <a
            href={spotifyData.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            title="Open track on Spotify"
          >
            <span>Open</span>
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      <div className="flex items-start gap-4">
        {/* Album Cover Art */}
        <div
          aria-hidden="true"
          className="relative flex aspect-square w-[90px] shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-md border border-black/10 dark:border-white/10 bg-black"
        >
          <img
            src={currentCover}
            alt={`${currentAlbum} by ${currentArtist}`}
            draggable={false}
            className="size-full object-cover transition-opacity duration-300"
          />
        </div>

        {/* Track Metadata & Controls */}
        <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
          <p
            className="truncate text-sm font-bold text-foreground tracking-tight"
            title={currentTitle}
          >
            {currentTitle}
          </p>
          <p
            className="truncate text-[12px] font-medium text-muted-foreground"
            title={`${currentArtist} — ${currentAlbum}`}
          >
            {currentArtist} {currentAlbum ? `— ${currentAlbum}` : ''}
          </p>

          {/* Player Playback Controls */}
          <div className="mt-2.5 flex items-center gap-5">
            {isLiveSpotify ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                  <Radio className="size-3 animate-pulse" />
                  Synced with Spotify
                </span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => skipMock(-1)}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label="Previous track"
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <SkipBack className="size-4 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => setMockPlaying((p) => !p)}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label={mockPlaying ? 'Pause' : 'Play'}
                  className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  {mockPlaying ? (
                    <Pause className="size-4 fill-current" />
                  ) : (
                    <Play className="size-4 fill-current" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => skipMock(1)}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label="Next track"
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <SkipForward className="size-4 fill-current" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="flex flex-col gap-1.5">
        <div
          onClick={handleSeek}
          onPointerDown={(e) => e.stopPropagation()}
          className={`group/seek relative h-1.5 w-full overflow-hidden rounded-full bg-muted ${
            isLiveSpotify ? 'cursor-default' : 'cursor-pointer'
          }`}
          role="progressbar"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={currentDuration}
          aria-valuenow={currentElapsed}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isLiveSpotify ? 'bg-emerald-500' : 'bg-signal'
            }`}
            style={{ width: `${Math.min(100, (currentElapsed / currentDuration) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground/80 font-medium px-0.5">
          <span>{formatSeconds(currentElapsed)}</span>
          <span>-{formatSeconds(Math.max(0, currentDuration - currentElapsed))}</span>
        </div>
      </div>
    </div>
  )
}
