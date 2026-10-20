'use client'

import { useEffect, useState } from 'react'

export function NotesWidget() {
  const [text, setText] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('notes-widget')
      if (saved) setText(saved)
    } catch {
      // ignore storage errors
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem('notes-widget', text)
    } catch {
      // ignore storage errors
    }
  }, [text, mounted])

  return (
    <div className="widget flex w-full flex-col gap-2 p-4">
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Notes
      </span>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Write a note…"
        maxLength={5000}
        className="min-h-[120px] flex-1 resize-none rounded-md bg-muted p-2 text-xs outline-none"
      />
    </div>
  )
}