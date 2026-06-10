"use client"

import type React from "react"
import { useRef, useCallback } from "react"
import { useOS, type WindowState } from "@/lib/os-context"
import { AppTile } from "@/components/app-icons"
import { Minus, Square, X, Copy } from "lucide-react"

const TASKBAR_H = 48
const MIN_W = 360
const MIN_H = 240

export function Window({ win, children }: { win: WindowState; children: React.ReactNode }) {
  const { focusWindow, closeWindow, minimizeWindow, toggleMaximize, updateBounds, activeId } = useOS()
  const dragState = useRef<{
    mode: "move" | "resize"
    edge?: string
    startX: number
    startY: number
    origX: number
    origY: number
    origW: number
    origH: number
  } | null>(null)

  const isActive = activeId === win.id

  const onPointerDownHeader = useCallback(
    (e: React.PointerEvent) => {
      if (win.maximized) return
      if ((e.target as HTMLElement).closest("[data-no-drag]")) return
      focusWindow(win.id)
      dragState.current = {
        mode: "move",
        startX: e.clientX,
        startY: e.clientY,
        origX: win.x,
        origY: win.y,
        origW: win.width,
        origH: win.height,
      }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [win, focusWindow],
  )

  const onPointerDownResize = useCallback(
    (edge: string) => (e: React.PointerEvent) => {
      if (win.maximized) return
      e.stopPropagation()
      focusWindow(win.id)
      dragState.current = {
        mode: "resize",
        edge,
        startX: e.clientX,
        startY: e.clientY,
        origX: win.x,
        origY: win.y,
        origW: win.width,
        origH: win.height,
      }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [win, focusWindow],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const ds = dragState.current
      if (!ds) return
      const dx = e.clientX - ds.startX
      const dy = e.clientY - ds.startY
      const maxX = window.innerWidth
      const maxY = window.innerHeight - TASKBAR_H

      if (ds.mode === "move") {
        const nx = Math.min(Math.max(ds.origX + dx, -ds.origW + 80), maxX - 80)
        const ny = Math.min(Math.max(ds.origY + dy, 0), maxY - 40)
        updateBounds(win.id, { x: nx, y: ny })
      } else if (ds.edge) {
        let { origX: nx, origY: ny, origW: nw, origH: nh } = ds
        if (ds.edge.includes("e")) nw = Math.max(MIN_W, ds.origW + dx)
        if (ds.edge.includes("s")) nh = Math.max(MIN_H, ds.origH + dy)
        if (ds.edge.includes("w")) {
          nw = Math.max(MIN_W, ds.origW - dx)
          nx = ds.origX + (ds.origW - nw)
        }
        if (ds.edge.includes("n")) {
          nh = Math.max(MIN_H, ds.origH - dy)
          ny = ds.origY + (ds.origH - nh)
        }
        updateBounds(win.id, { x: nx, y: ny, width: nw, height: nh })
      }
    },
    [win.id, updateBounds],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragState.current = null
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }, [])

  const bounds = win.maximized
    ? { left: 0, top: 0, width: "100%", height: `calc(100% - ${TASKBAR_H}px)` }
    : { left: win.x, top: win.y, width: win.width, height: win.height }

  const edges = ["n", "s", "e", "w", "ne", "nw", "se", "sw"]
  const cursors: Record<string, string> = {
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    nw: "nwse-resize",
    se: "nwse-resize",
  }

  return (
    <div
      role="dialog"
      aria-label={win.title}
      className="absolute flex flex-col overflow-hidden acrylic-strong win-shadow animate-win-open"
      style={{
        ...bounds,
        zIndex: win.zIndex,
        display: win.minimized ? "none" : "flex",
        borderRadius: win.maximized ? 0 : 10,
        border: isActive ? "1px solid color-mix(in oklab, var(--primary) 40%, transparent)" : "1px solid var(--border)",
      }}
      onPointerDown={() => focusWindow(win.id)}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between h-9 pl-3 pr-0 shrink-0 cursor-default"
        onPointerDown={onPointerDownHeader}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="flex items-center gap-2 min-w-0 pointer-events-none">
          <AppTile appId={win.appId} size={16} />
          <span className="text-xs font-medium truncate text-foreground/90">{win.title}</span>
        </div>
        <div className="flex items-center h-full" data-no-drag>
          <button
            aria-label="Minimize"
            onClick={() => minimizeWindow(win.id)}
            className="h-9 w-11 flex items-center justify-center hover:bg-foreground/10 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            aria-label="Maximize"
            onClick={() => toggleMaximize(win.id)}
            className="h-9 w-11 flex items-center justify-center hover:bg-foreground/10 transition-colors"
          >
            {win.maximized ? <Copy className="w-3 h-3 -scale-x-100" /> : <Square className="w-3 h-3" />}
          </button>
          <button
            aria-label="Close"
            onClick={() => closeWindow(win.id)}
            className="h-9 w-11 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
            style={{ borderTopRightRadius: win.maximized ? 0 : 9 }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 bg-card text-card-foreground overflow-hidden">{children}</div>

      {/* Resize handles */}
      {!win.maximized &&
        edges.map((edge) => (
          <div
            key={edge}
            onPointerDown={onPointerDownResize(edge)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="absolute"
            style={{
              cursor: cursors[edge],
              ...(edge === "n" && { top: -3, left: 8, right: 8, height: 6 }),
              ...(edge === "s" && { bottom: -3, left: 8, right: 8, height: 6 }),
              ...(edge === "e" && { right: -3, top: 8, bottom: 8, width: 6 }),
              ...(edge === "w" && { left: -3, top: 8, bottom: 8, width: 6 }),
              ...(edge === "ne" && { top: -3, right: -3, width: 12, height: 12 }),
              ...(edge === "nw" && { top: -3, left: -3, width: 12, height: 12 }),
              ...(edge === "se" && { bottom: -3, right: -3, width: 12, height: 12 }),
              ...(edge === "sw" && { bottom: -3, left: -3, width: 12, height: 12 }),
            }}
          />
        ))}
    </div>
  )
}
