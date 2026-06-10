"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"

export type AppId = "notepad" | "browser" | "settings" | "terminal" | "explorer" | "about"

export interface WindowState {
  id: string
  appId: AppId
  title: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  minimized: boolean
  maximized: boolean
  // restore bounds when un-maximizing
  prevBounds?: { x: number; y: number; width: number; height: number }
  // arbitrary launch payload (e.g. open a specific note)
  payload?: Record<string, unknown>
}

export interface NoteDoc {
  id: string
  name: string
  content: string
  updatedAt: number
}

type Theme = "light" | "dark"
type Accent = "blue" | "teal" | "green" | "orange" | "red"
type Wallpaper = "bloom" | "flow" | "solid"

interface Settings {
  theme: Theme
  accent: Accent
  wallpaper: Wallpaper
  userName: string
}

interface OSContextValue {
  // session
  locked: boolean
  unlock: () => void
  lock: () => void
  booting: boolean

  // windows
  windows: WindowState[]
  launch: (appId: AppId, payload?: Record<string, unknown>) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  updateBounds: (id: string, bounds: Partial<Pick<WindowState, "x" | "y" | "width" | "height">>) => void
  activeId: string | null

  // settings
  settings: Settings
  setSettings: (patch: Partial<Settings>) => void

  // notepad docs
  notes: NoteDoc[]
  saveNote: (note: NoteDoc) => void
  deleteNote: (id: string) => void

  // start menu / search
  startOpen: boolean
  setStartOpen: (v: boolean) => void
}

const OSContext = createContext<OSContextValue | null>(null)

const STORAGE_KEY = "win11-os-state-v1"

const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  accent: "blue",
  wallpaper: "bloom",
  userName: "User",
}

const APP_META: Record<AppId, { title: string; w: number; h: number }> = {
  notepad: { title: "Notepad", w: 720, h: 520 },
  browser: { title: "Microsoft Edge", w: 980, h: 640 },
  settings: { title: "Settings", w: 880, h: 600 },
  terminal: { title: "Terminal", w: 760, h: 480 },
  explorer: { title: "File Explorer", w: 880, h: 560 },
  about: { title: "About this PC", w: 480, h: 420 },
}

export function OSProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [locked, setLocked] = useState(true)
  const [booting, setBooting] = useState(true)
  const [windows, setWindows] = useState<WindowState[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS)
  const [notes, setNotes] = useState<NoteDoc[]>([])
  const [startOpen, setStartOpen] = useState(false)
  const zCounter = useRef(10)

  // Boot sequence
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2200)
    return () => clearTimeout(t)
  }, [])

  // Load persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.settings) setSettingsState({ ...DEFAULT_SETTINGS, ...parsed.settings })
        if (Array.isArray(parsed.notes)) setNotes(parsed.notes)
      }
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  // Persist settings + notes
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, notes }))
    } catch {
      /* ignore */
    }
  }, [settings, notes, hydrated])

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === "dark") root.classList.add("dark")
    else root.classList.remove("dark")
  }, [settings.theme])

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState((s) => ({ ...s, ...patch }))
  }, [])

  const focusWindow = useCallback((id: string) => {
    zCounter.current += 1
    const z = zCounter.current
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, zIndex: z, minimized: false } : w)))
    setActiveId(id)
  }, [])

  const launch = useCallback(
    (appId: AppId, payload?: Record<string, unknown>) => {
      setStartOpen(false)
      // Singleton apps: focus existing instead of duplicating (except notepad)
      const singleton = appId !== "notepad"
      setWindows((ws) => {
        if (singleton) {
          const existing = ws.find((w) => w.appId === appId)
          if (existing) {
            zCounter.current += 1
            setActiveId(existing.id)
            return ws.map((w) =>
              w.id === existing.id
                ? { ...w, minimized: false, zIndex: zCounter.current, payload: payload ?? w.payload }
                : w,
            )
          }
        }
        const meta = APP_META[appId]
        zCounter.current += 1
        const id = `${appId}-${Date.now()}`
        const offset = (ws.length % 6) * 28
        const vw = typeof window !== "undefined" ? window.innerWidth : 1280
        const vh = typeof window !== "undefined" ? window.innerHeight : 800
        const width = Math.min(meta.w, vw - 80)
        const height = Math.min(meta.h, vh - 120)
        const newWin: WindowState = {
          id,
          appId,
          title: meta.title,
          x: Math.max(20, (vw - width) / 2 - 80 + offset),
          y: Math.max(20, (vh - height) / 2 - 60 + offset),
          width,
          height,
          zIndex: zCounter.current,
          minimized: false,
          maximized: false,
          payload,
        }
        setActiveId(id)
        return [...ws, newWin]
      })
    },
    [],
  )

  const closeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.filter((w) => w.id !== id))
    setActiveId((cur) => (cur === id ? null : cur))
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
    setActiveId((cur) => (cur === id ? null : cur))
  }, [])

  const toggleMaximize = useCallback((id: string) => {
    setWindows((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w
        if (w.maximized) {
          const pb = w.prevBounds ?? { x: 80, y: 60, width: w.width, height: w.height }
          return { ...w, maximized: false, ...pb }
        }
        return {
          ...w,
          maximized: true,
          prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
        }
      }),
    )
  }, [])

  const updateBounds = useCallback(
    (id: string, bounds: Partial<Pick<WindowState, "x" | "y" | "width" | "height">>) => {
      setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...bounds } : w)))
    },
    [],
  )

  const saveNote = useCallback((note: NoteDoc) => {
    setNotes((ns) => {
      const exists = ns.some((n) => n.id === note.id)
      if (exists) return ns.map((n) => (n.id === note.id ? note : n))
      return [...ns, note]
    })
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((ns) => ns.filter((n) => n.id !== id))
  }, [])

  const unlock = useCallback(() => setLocked(false), [])
  const lock = useCallback(() => {
    setLocked(true)
    setStartOpen(false)
  }, [])

  const value: OSContextValue = {
    locked,
    unlock,
    lock,
    booting,
    windows,
    launch,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    updateBounds,
    activeId,
    settings,
    setSettings,
    notes,
    saveNote,
    deleteNote,
    startOpen,
    setStartOpen,
  }

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>
}

export function useOS() {
  const ctx = useContext(OSContext)
  if (!ctx) throw new Error("useOS must be used within OSProvider")
  return ctx
}

export { APP_META }
