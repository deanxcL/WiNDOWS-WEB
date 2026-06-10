"use client"

import { useState } from "react"
import { useOS, type AppId } from "@/lib/os-context"
import { AppTile } from "@/components/app-icons"
import { Window } from "@/components/window"
import { NotepadApp } from "@/components/apps/notepad-app"
import { TerminalApp } from "@/components/apps/terminal-app"
import { BrowserApp } from "@/components/apps/browser-app"
import { SettingsApp } from "@/components/apps/settings-app"
import { ExplorerApp } from "@/components/apps/explorer-app"
import { AboutApp } from "@/components/apps/about-app"
import { RefreshCw, Palette, Monitor } from "lucide-react"

const DESKTOP_ICONS: AppId[] = ["explorer", "browser", "notepad", "terminal", "settings", "about"]
const LABELS: Record<AppId, string> = {
  explorer: "This PC",
  browser: "Microsoft Edge",
  notepad: "Notepad",
  terminal: "Terminal",
  settings: "Settings",
  about: "About",
}

function renderApp(appId: AppId, payload?: Record<string, unknown>) {
  switch (appId) {
    case "notepad":
      return <NotepadApp payload={payload} />
    case "terminal":
      return <TerminalApp />
    case "browser":
      return <BrowserApp />
    case "settings":
      return <SettingsApp />
    case "explorer":
      return <ExplorerApp />
    case "about":
      return <AboutApp />
  }
}

export function Desktop() {
  const { windows, launch, settings, setSettings } = useOS()
  const [selected, setSelected] = useState<AppId | null>(null)
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)

  const wallpaper =
    settings.wallpaper === "flow"
      ? "url(/wallpaper-dark.png)"
      : settings.wallpaper === "solid"
        ? "linear-gradient(135deg, oklch(0.5 0.16 250), oklch(0.45 0.14 230))"
        : settings.theme === "dark"
          ? "url(/wallpaper-dark.png)"
          : "url(/wallpaper-light.png)"

  return (
    <div
      className="absolute inset-0 bottom-12 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: wallpaper }}
      onClick={() => {
        setSelected(null)
        setMenu(null)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        setMenu({ x: e.clientX, y: e.clientY })
      }}
    >
      {/* Desktop icons */}
      <div className="grid grid-flow-col grid-rows-[repeat(auto-fill,88px)] gap-1 p-2 w-fit">
        {DESKTOP_ICONS.map((appId) => (
          <button
            key={appId}
            onClick={(e) => {
              e.stopPropagation()
              setSelected(appId)
            }}
            onDoubleClick={() => launch(appId)}
            className="w-20 h-20 flex flex-col items-center justify-center gap-1 rounded p-1 transition"
            style={{
              background: selected === appId ? "color-mix(in oklab, var(--primary) 35%, transparent)" : "transparent",
              outline: selected === appId ? "1px solid color-mix(in oklab, var(--primary) 60%, transparent)" : "none",
            }}
          >
            <AppTile appId={appId} size={38} />
            <span
              className="text-[11px] text-center leading-tight line-clamp-2 text-white"
              style={{ textShadow: "0 1px 3px rgb(0 0 0 / 0.8)" }}
            >
              {LABELS[appId]}
            </span>
          </button>
        ))}
      </div>

      {/* Windows */}
      {windows.map((win) => (
        <Window key={win.id} win={win}>
          {renderApp(win.appId, win.payload)}
        </Window>
      ))}

      {/* Desktop context menu */}
      {menu && (
        <div
          className="fixed z-[60] w-56 rounded-lg acrylic-strong win-shadow border border-border p-1 text-sm animate-flyout"
          style={{ left: Math.min(menu.x, window.innerWidth - 240), top: Math.min(menu.y, window.innerHeight - 200) }}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem
            Icon={RefreshCw}
            label="Refresh"
            onClick={() => {
              setMenu(null)
            }}
          />
          <MenuItem
            Icon={Palette}
            label="Personalize"
            onClick={() => {
              launch("settings")
              setMenu(null)
            }}
          />
          <MenuItem
            Icon={Monitor}
            label={`Switch to ${settings.theme === "dark" ? "Light" : "Dark"} mode`}
            onClick={() => {
              setSettings({ theme: settings.theme === "dark" ? "light" : "dark" })
              setMenu(null)
            }}
          />
        </div>
      )}
    </div>
  )
}

function MenuItem({ Icon, label, onClick }: { Icon: typeof RefreshCw; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-foreground/8 transition text-left"
    >
      <Icon className="w-4 h-4 text-muted-foreground" />
      {label}
    </button>
  )
}
