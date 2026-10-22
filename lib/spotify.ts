const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN

const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing'
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'

export async function getAccessToken() {
  if (!client_id || !client_secret || !refresh_token) {
    return null
  }

  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64')

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[Spotify] Failed to refresh token:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    return data.access_token as string
  } catch (error) {
    console.error('[Spotify] Error fetching access token:', error)
    return null
  }
}

export async function getCurrentlyPlaying() {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    return null
  }

  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })
}
