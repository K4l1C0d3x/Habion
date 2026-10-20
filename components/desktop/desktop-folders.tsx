import { DraggableItem } from './draggable-item'

const FOLDERS = ['QA Agent Loop', 'Eleyyva', 'Engineering', 'Product Mgmt', 'Customer Success']

export function DesktopFolders() {
  return (
    <nav aria-label="Desktop folders">
      <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-4 lg:overflow-visible lg:pb-0">
        {FOLDERS.map((label) => (
          <li key={label} className="group flex w-24 flex-col items-center gap-1 rounded-lg p-1 text-center">
            <DraggableItem className="flex flex-col items-center gap-1">
              <FolderIcon />
              <span className="rounded-md bg-card/80 px-1.5 py-0.5 text-[13px] leading-snug font-medium text-pretty group-hover:bg-folder/20">
                {label}
              </span>
            </DraggableItem>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function FolderIcon() {
  return (
    <span aria-hidden="true" className="relative block h-14 w-16 transition-transform group-hover:-translate-y-0.5">
      <span className="absolute top-1 left-0 h-3 w-7 rounded-t-md bg-folder-tab" />
      <span className="absolute inset-x-0 top-2.5 bottom-0 rounded-md bg-folder-tab" />
      <span className="absolute inset-x-0 top-4 bottom-0 rounded-md bg-folder shadow-[inset_0_1px_0_rgb(255_255_255/0.5)]" />
    </span>
  )
}
