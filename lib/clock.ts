"use client"

import { useState, useEffect } from "react"

export function useClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

export function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

export function formatDate(d: Date) {
  return d.toLocaleDateString([], { month: "numeric", day: "numeric", year: "numeric" })
}

export function formatBigTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
}

export function formatLongDate(d: Date) {
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
}
