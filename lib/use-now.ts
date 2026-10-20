'use client'

import { useEffect, useState } from 'react'

const FALLBACK_DATE = new Date('2026-10-20T13:22:00')

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<Date>(FALLBACK_DATE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setNow(new Date())
    setReady(true)
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return { now, ready }
}
