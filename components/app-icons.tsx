"use client"

import type { AppId } from "@/lib/os-context"
import { FileText, Globe, Settings, SquareTerminal, Folder, Monitor, type LucideIcon } from "lucide-react"

export const APP_ICONS: Record<AppId, { Icon: LucideIcon; color: string; bg: string }> = {
  notepad: { Icon: FileText, color: "oklch(0.99 0 0)", bg: "oklch(0.6 0.13 250)" },
  browser: { Icon: Globe, color: "oklch(0.99 0 0)", bg: "oklch(0.55 0.16 230)" },
  settings: { Icon: Settings, color: "oklch(0.99 0 0)", bg: "oklch(0.5 0.02 260)" },
  terminal: { Icon: SquareTerminal, color: "oklch(0.99 0 0)", bg: "oklch(0.28 0.01 260)" },
  explorer: { Icon: Folder, color: "oklch(0.4 0.1 250)", bg: "oklch(0.85 0.1 90)" },
  about: { Icon: Monitor, color: "oklch(0.99 0 0)", bg: "oklch(0.55 0.16 250)" },
}

export function AppTile({ appId, size = 28 }: { appId: AppId; size?: number }) {
  const { Icon, color, bg } = APP_ICONS[appId]
  const radius = Math.round(size * 0.22)
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: bg,
        borderRadius: radius,
        boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.12)",
      }}
    >
      <Icon style={{ width: size * 0.58, height: size * 0.58, color }} strokeWidth={2} />
    </div>
  )
}
