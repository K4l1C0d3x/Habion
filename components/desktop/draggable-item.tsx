'use client'

import type { PointerEvent, ReactNode } from 'react'
import { useRef, useState, useEffect } from 'react'
import { useSettingsStore, settingsStore } from '@/lib/settings-store'

export function DraggableItem({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  const { widgetPositions, resetLayoutKey } = useSettingsStore()
  const initialOffset = (id && widgetPositions[id]) ? widgetPositions[id] : { x: 0, y: 0 }
  const [offset, setOffset] = useState(initialOffset)
  const offsetRef = useRef(initialOffset)

  // Synchronize when resetLayoutKey changes or saved stage is restored
  useEffect(() => {
    if (id) {
      const pos = widgetPositions[id] || { x: 0, y: 0 }
      setOffset(pos)
      offsetRef.current = pos
    } else {
      setOffset({ x: 0, y: 0 })
      offsetRef.current = { x: 0, y: 0 }
    }
  }, [id, resetLayoutKey, widgetPositions])

  const start = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
  const boundsRef = useRef({
    minOffsetX: -Infinity,
    maxOffsetX: Infinity,
    minOffsetY: -Infinity,
    maxOffsetY: Infinity,
  })

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    const target = event.target as HTMLElement
    if (target.closest('button, input, textarea, a, select, [role="button"], [data-no-drag]')) return

    start.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y }

    // Calculate window boundary limits so widgets cannot be dragged off-screen
    const rect = event.currentTarget.getBoundingClientRect()
    const baseLeft = rect.left - offset.x
    const baseTop = rect.top - offset.y
    const width = rect.width
    const height = rect.height

    const PADDING_X = 8
    const PADDING_TOP = 40 // Keep below the top menu bar (36px)
    const PADDING_BOTTOM = 8 // Allow dragging all the way to the screen bottom edge (beside the dock)

    const minX = PADDING_X
    const maxX = window.innerWidth - PADDING_X
    const minY = PADDING_TOP
    const maxY = window.innerHeight - PADDING_BOTTOM

    const minOffsetX = minX - baseLeft
    const maxOffsetX = Math.max(minOffsetX + 120, maxX - baseLeft - width)
    const minOffsetY = minY - baseTop
    const maxOffsetY = Math.max(minOffsetY + 100, maxY - baseTop - height)

    boundsRef.current = {
      minOffsetX,
      maxOffsetX,
      minOffsetY,
      maxOffsetY,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return

    const rawX = start.current.offsetX + event.clientX - start.current.x
    const rawY = start.current.offsetY + event.clientY - start.current.y

    const clampedX = Math.min(Math.max(rawX, boundsRef.current.minOffsetX), boundsRef.current.maxOffsetX)
    const clampedY = Math.min(Math.max(rawY, boundsRef.current.minOffsetY), boundsRef.current.maxOffsetY)

    const next = { x: clampedX, y: clampedY }
    offsetRef.current = next
    setOffset(next)
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
      if (id) {
        settingsStore.setWidgetPosition(id, offsetRef.current)
      }
    }
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
