import { Desktop } from '@/components/desktop/desktop'
import { DesktopWallpaper } from '@/components/desktop/desktop-wallpaper'
import { Dock } from '@/components/desktop/dock'
import { MenuBar } from '@/components/desktop/menu-bar'
import { TodoAppWindow } from '@/components/desktop/todo-app-window'
import { FocusAppWindow } from '@/components/desktop/focus-app-window'
import { HabitAppWindow } from '@/components/desktop/habit-app-window'
import { SettingsAppWindow } from '@/components/desktop/settings-app-window'
import { PhotosAppWindow } from '@/components/desktop/photos-app-window'

export default function Page() {
  return (
    <>
      <DesktopWallpaper />
      <MenuBar />
      <main className="relative z-10 pb-28 lg:pb-0">
        <Desktop />
      </main>
      <TodoAppWindow />
      <FocusAppWindow />
      <HabitAppWindow />
      <PhotosAppWindow />
      <SettingsAppWindow />
      <Dock />
    </>
  )
}
