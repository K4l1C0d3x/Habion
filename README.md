# Habion

A macOS-inspired desktop productivity workspace built with **Next.js 16**, **React 19**, and **Tailwind CSS**.

Habion blends desktop windowing paradigms with personal productivity widgets — featuring draggable workspace cards, habit trackers with contribution streak heatmaps, Spotify real-time playback integration, focus timer sessions, a framed photo gallery studio, and custom wallpaper theming.

---

## ✨ Features

- **🖥️ macOS Desktop Experience**
  - Interactive top Menu Bar with live date/time, battery, sound, and quick controls.
  - Floating macOS-style Dock with animated bouncy hover states and active app indicator dots.
  - Draggable desktop widgets with boundary constraints and custom positioning persistence.
  - Interactive Desktop Folders with preview modal.

- **📊 Habit Tracker & Contribution Streak Grid**
  - 20-week daily contribution matrix (GitHub-style habit heatmap with glow effects).
  - Streak analytics (current streak, longest streak, completion rates).
  - Category breakdown (Productivity, Fitness, Learning, Wellness, Mindset).
  - History backfill support when creating new habits to preserve streaks.

- **⏱️ Focus & Pomodoro Studio**
  - Customizable focus sessions, short breaks, and long breaks.
  - Ambient audio soundscapes (Rain, Cafe, White Noise, Ocean, Campfire).
  - Task tagging and session milestone logging.

- **🎵 Music Player & Spotify Live API**
  - Built-in audio track player with animated equalizer.
  - Optional OAuth integration with the **Spotify Web API** to show live playback status ("LIVE ON SPOTIFY" pill, album art, track details, direct track links).

- **🖼️ Photo & Framing Studio**
  - Interactive gallery window with framing presets (Polaroid, Gallery Wood, Minimalist, Matte).
  - Filter adjustments (B&W, Vintage, Warm, Cool, High Contrast).
  - Desktop photo widget syncs with your selected framed memory.

- **✅ Todo App**
  - Organize tasks across projects, priorities, and deadlines.
  - Interactive desktop mini-widget and full window application.

- **🎨 Dynamic Wallpaper Engine & Appearance Settings**
  - Switch wallpapers on the fly (Dynamic Gradients, macOS Sequoia, Minimalist Dark, Cyber Neon, Studio Glow).
  - Widget visibility toggle panel in Settings.
  - Light / Dark / System theme switching.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [tw-animate-css](https://github.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: Reactive lightweight external stores (`useSyncExternalStore` + `localStorage` persistence)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18.0 or newer recommended)
- [pnpm](https://pnpm.io/) installed (`npm install -g pnpm`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/K4l1C0d3x/Habion.git
   cd Habion
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **(Optional) Configure Spotify Integration:**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Add your credentials from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):
   ```env
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token_here
   ```
   *Note: If Spotify credentials are not provided, the music widget runs in local ambient player mode.*

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```text
├── app/
│   ├── api/spotify/       # Spotify OAuth login, callback, and currently-playing routes
│   ├── globals.css        # Tailwind styles, color themes & typography
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Main desktop viewport composition
├── components/
│   ├── desktop/           # Desktop windows, dock, menu bar & draggable widgets
│   │   ├── desktop.tsx
│   │   ├── dock.tsx
│   │   ├── menu-bar.tsx
│   │   ├── habit-widget.tsx & habit-app-window.tsx
│   │   ├── focus-app-window.tsx & pomodoro-widget.tsx
│   │   ├── music-widget.tsx
│   │   ├── photos-app-window.tsx & photo-widget.tsx
│   │   ├── settings-app-window.tsx
│   │   ├── todo-app-window.tsx & todo-widget.tsx
│   │   └── draggable-item.tsx
│   └── ui/                # Base design system primitives (shadcn-compatible)
├── lib/                   # Stores (Habits, Focus, Photos, Settings, Wallpapers, Spotify API)
├── public/                # Static assets, wallpapers, and sample imagery
└── package.json
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts local Next.js development server with Turbopack |
| `pnpm build` | Compiles optimized production build |
| `pnpm start` | Runs the production server |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
