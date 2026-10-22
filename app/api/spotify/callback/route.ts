import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return new Response(`Spotify Auth Error: ${error}`, { status: 400 })
  }

  if (!code) {
    return new Response('Missing code parameter', { status: 400 })
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return new Response('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env.local', {
      status: 500,
    })
  }

  const redirectUri = `${url.origin}/api/spotify/callback`
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    const data = await tokenResponse.json()

    if (!tokenResponse.ok) {
      return new Response(
        `Failed to exchange token: ${data.error_description || JSON.stringify(data)}`,
        { status: 500 }
      )
    }

    const refreshToken = data.refresh_token

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Spotify Connection Successful</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 16px;
      box-sizing: border-box;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 32px;
      max-width: 540px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
    }
    h1 {
      margin-top: 0;
      font-size: 22px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #1ed760;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.5;
    }
    .code-box {
      background: #0f172a;
      border: 1px solid #475569;
      border-radius: 8px;
      padding: 12px;
      font-family: monospace;
      font-size: 13px;
      word-break: break-all;
      color: #38bdf8;
      margin: 16px 0;
      user-select: all;
    }
    button {
      background: #1ed760;
      color: #000;
      border: none;
      padding: 10px 18px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background: #1aba53;
    }
    .note {
      font-size: 12px;
      color: #64748b;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>✓ Spotify Connected</h1>
    <p>Copy your <strong>SPOTIFY_REFRESH_TOKEN</strong> below and paste it into your <code>.env.local</code> file:</p>
    <div class="code-box" id="token">${refreshToken}</div>
    <button onclick="navigator.clipboard.writeText(document.getElementById('token').innerText); this.innerText = 'Copied!';">Copy Refresh Token</button>
    <p class="note">After adding it to <code>.env.local</code>, restart your Next.js server. Your music widget will now show your live Spotify playback!</p>
  </div>
</body>
</html>`

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (err: any) {
    return new Response(`Error: ${err.message}`, { status: 500 })
  }
}
