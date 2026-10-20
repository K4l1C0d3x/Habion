'use client'

import type { PointerEvent, ReactNode } from 'react'
import { useRef, useState } from 'react'

export function DraggableItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const start = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    const target = event.target as HTMLElement
    if (target.closest('button, input, textarea, a, [role="button"]')) return
    start.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    setOffset({
      x: start.current.offsetX + event.clientX - start.current.x,
      y: start.current.offsetY + event.clientY - start.current.y,
    })
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <div
      className={`touch-none cursor-grab active:cursor-grabbing ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
    >
      {children}
    </div>
  )
}
