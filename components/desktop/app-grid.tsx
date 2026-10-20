const CDN = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

type App = { name: string; slug?: string; tile?: string }

const APPS: App[] = [
  { name: 'Notion', slug: 'notion' },
  { name: 'Cursor', slug: 'cursor/light' },
  { name: 'Granola', slug: 'granola/light' },
  { name: 'Terminal' },
  { name: 'Claude', slug: 'claude' },
  { name: 'ChatGPT', slug: 'openai/light' },
  { name: 'LinkedIn', slug: 'linkedin' },
  { name: 'Gmail', slug: 'gmail' },
  { name: 'Google Calendar', slug: 'google-calendar' },
  { name: 'X', slug: 'x' },
]

export function AppGrid() {
  return (
    <section aria-label="Tools I use every day" className="widget w-fit p-4">
      <ul className="grid grid-cols-5 gap-3">
        {APPS.map((app) => (
          <li key={app.name}>
            <span
              title={app.name}
              className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-card shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.04)] transition-transform hover:-translate-y-0.5"
            >
              {app.slug ? (
                <img src={`${CDN}/${app.slug.includes('/') ? app.slug : `${app.slug}/default`}.svg`} alt={app.name} className="size-8" loading="lazy" />
              ) : (
                <span className="flex size-full items-start bg-foreground p-1.5 font-mono text-[10px] leading-none text-background">
                  <span className="sr-only">{app.name}</span>
                  <span aria-hidden="true">{'>_'}</span>
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
