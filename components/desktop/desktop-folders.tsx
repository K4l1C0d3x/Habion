'use client'

import { useState, useEffect, useRef } from 'react'
import { FolderOpen, Edit3 } from 'lucide-react'
import { DraggableItem } from './draggable-item'

export function DesktopFolders() {
  const [folderName, setFolderName] = useState('Desktop')
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState('Desktop')
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })

  const inputRef = useRef<HTMLInputElement>(null)
  const lastClickRef = useRef<number>(0)
  const lastClickPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  // Load saved folder name from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('desktop_folder_name')
      if (saved && saved.trim()) {
        setFolderName(saved.trim())
        setTempName(saved.trim())
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  // Auto-focus and select text when entering rename mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  // Close context menu on outside click or escape
  useEffect(() => {
    if (!showMenu) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowMenu(false)
    }
    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showMenu])

  function handleStartRename(e?: React.MouseEvent | React.SyntheticEvent) {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setShowMenu(false)
    setTempName(folderName)
    setIsEditing(true)
  }

  function handleSaveRename() {
    const trimmed = tempName.trim() || 'Desktop'
    setFolderName(trimmed)
    setIsEditing(false)
    try {
      localStorage.setItem('desktop_folder_name', trimmed)
    } catch {
      // ignore
    }
  }

  function handleCancelRename() {
    setTempName(folderName)
    setIsEditing(false)
  }

  // Intercept double-click on pointerdown before drag capture can swallow it
  function handleFolderPointerDown(e: React.PointerEvent) {
    const now = Date.now()
    const dx = Math.abs(e.clientX - lastClickPos.current.x)
    const dy = Math.abs(e.clientY - lastClickPos.current.y)

    if (now - lastClickRef.current < 450 && dx < 15 && dy < 15) {
      // Double click detected!
      e.stopPropagation()
      e.preventDefault()
      handleStartRename(e)
      lastClickRef.current = 0
      return
    }

    lastClickRef.current = now
    lastClickPos.current = { x: e.clientX, y: e.clientY }
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setMenuPos({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  return (
    <>
      <nav aria-label="Desktop folders">
        <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-4 lg:overflow-visible lg:pb-0">
          <li
            onContextMenu={handleContextMenu}
            className="group/folder flex w-28 flex-col items-center gap-1 rounded-lg p-1 text-center select-none"
          >
            <DraggableItem id="folder-desktop" className="flex flex-col items-center gap-1.5">
              {/* Folder Icon - Double click anywhere on icon enters rename mode */}
              <div
                onPointerDown={handleFolderPointerDown}
                onDoubleClick={handleStartRename}
                title="Double-click to rename"
                className="cursor-pointer transition-transform active:scale-95"
              >
                <FolderIcon />
              </div>

              {/* Folder Name Label / Inline Rename Input (No pen/pencil icon) */}
              {isEditing ? (
                <div
                  data-no-drag="true"
                  className="w-full px-1 z-30"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSaveRename()
                      } else if (e.key === 'Escape') {
                        e.preventDefault()
                        handleCancelRename()
                      }
                    }}
                    onBlur={handleSaveRename}
                    className="w-full rounded border border-blue-500 bg-background px-1.5 py-0.5 text-center text-[12px] font-medium text-foreground shadow-sm outline-none ring-2 ring-blue-500"
                  />
                </div>
              ) : (
                <div
                  data-no-drag="true"
                  onPointerDown={handleFolderPointerDown}
                  onDoubleClick={handleStartRename}
                  title="Double-click to rename"
                  className="rounded-md bg-card/85 px-2 py-0.5 text-[13px] leading-snug font-medium text-pretty hover:bg-card border border-transparent hover:border-border cursor-pointer transition-colors max-w-full"
                >
                  <span className="truncate">{folderName}</span>
                </div>
              )}
            </DraggableItem>
          </li>
        </ul>
      </nav>

      {/* Right-Click Context Menu */}
      {showMenu && (
        <div
          ref={menuRef}
          style={{ top: menuPos.y, left: menuPos.x }}
          className="fixed z-50 flex min-w-36 flex-col overflow-hidden rounded-xl border border-border bg-card/95 p-1 text-xs shadow-xl backdrop-blur-md animate-in fade-in duration-100 select-none"
        >
          <button
            type="button"
            onClick={handleStartRename}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium hover:bg-muted text-foreground transition-colors cursor-pointer text-left"
          >
            <Edit3 className="size-3.5 text-muted-foreground" />
            <span>Rename</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMenu(false)
              alert(`Folder "${folderName}" is empty.`)
            }}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium hover:bg-muted text-foreground transition-colors cursor-pointer text-left"
          >
            <FolderOpen className="size-3.5 text-muted-foreground" />
            <span>Open</span>
          </button>
        </div>
      )}
    </>
  )
}

function FolderIcon() {
  return (
    <span aria-hidden="true" className="relative block h-14 w-16 transition-transform group-hover/folder:-translate-y-0.5">
      <span className="absolute top-1 left-0 h-3 w-7 rounded-t-md bg-folder-tab" />
      <span className="absolute inset-x-0 top-2.5 bottom-0 rounded-md bg-folder-tab" />
      <span className="absolute inset-x-0 top-4 bottom-0 rounded-md bg-folder shadow-[inset_0_1px_0_rgb(255_255_255/0.5)]" />
    </span>
  )
}
