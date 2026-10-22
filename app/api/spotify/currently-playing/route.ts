import { NextResponse } from 'next/server'
import { getCurrentlyPlaying } from '@/lib/spotify'

export const dynamic = 'force-dynamic'

export async function GET() {
  const isConfigured = Boolean(
    process.env.SPOTIFY_CLIENT_ID &&
    process.env.SPOTIFY_CLIENT_SECRET &&
    process.env.SPOTIFY_REFRESH_TOKEN
  )

  if (!isConfigured) {
    return NextResponse.json({
      configured: false,
      isPlaying: false,
    })
  }

  try {
    const response = await getCurrentlyPlaying()

    if (!response) {
      return NextResponse.json({
        configured: true,
        isPlaying: false,
      })
    }

    if (response.status === 204 || response.status > 400) {
      return NextResponse.json({
        configured: true,
        isPlaying: false,
      })
    }

    const song = await response.json()

    if (!song || !song.item) {
      return NextResponse.json({
        configured: true,
        isPlaying: false,
      })
    }

    const isPlaying = song.is_playing ?? false
    const title = song.item.name
    const artist = song.item.artists?.map((a: { name: string }) => a.name).join(', ') ?? 'Unknown Artist'
    const album = song.item.album?.name ?? ''
    const albumImageUrl = song.item.album?.images?.[0]?.url ?? null
    const songUrl = song.item.external_urls?.spotify ?? null
    const progressMs = song.progress_ms ?? 0
    const durationMs = song.item.duration_ms ?? 0

    return NextResponse.json({
      configured: true,
      isPlaying,
      title,
      artist,
      album,
      albumImageUrl,
      songUrl,
      progressMs,
      durationMs,
    })
  } catch (error) {
    console.error('[Spotify API Route Error]:', error)
    return NextResponse.json({
      configured: true,
      isPlaying: false,
      error: 'Failed to fetch Spotify data',
    })
  }
}
