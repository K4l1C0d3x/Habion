import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const clientId = process.env.SPOTIFY_CLIENT_ID

  if (!clientId) {
    return new Response(
      'SPOTIFY_CLIENT_ID is not configured in .env.local. Please add it first.',
      { status: 400, headers: { 'Content-Type': 'text/plain' } }
    )
  }

  const url = new URL(request.url)
  const redirectUri = `${url.origin}/api/spotify/callback`

  const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state',
  ].join(' ')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
  })

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`)
}
