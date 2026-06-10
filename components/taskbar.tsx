"use client"

import { useState } from "react"
import { useOS, type AppId } from "@/lib/os-context"
import { AppTile } from "@/components/app-icons"
import { useClock, formatTime, formatDate } from "@/lib/clock"
import { Search, Wifi, Volume2, BatteryFull, Sun, Moon, Bell } from "lucide-react"

const PINNED: AppId[] = ["explorer", "browser", "notepad", "terminal", "settings"]

function StartLogo() {
  return (
    <div className="grid grid-cols-2 gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="w-[9px] h-[9px] rounded-[1px]" style={{ background: "oklch(0.6 0.13 235)" }} />
      ))}
    </div>
  )
}

export function Taskbar() {
  const { windows, launch, focusWindow, minimizeWindow, activeId, startOpen, setStartOpen, settings, setSettings } =
    useOS()
  const now = useClock()
  const [quickOpen, setQuickOpen] = useState(false)

  // Build the set of icons to show: pinned apps + any running app not pinned
  const runningAppIds = Array.from(new Set(windows.map((w) => w.appId)))
  const shownApps: AppId[] = [...PINNED, ...runningAppIds.filter((a) => !PINNED.includes(a))]

  const appIsRunning = (appId: AppId) => windows.some((w) => w.appId === appId)
  const appIsActive = (appId: AppId) => windows.some((w) => w.id === activeId && w.appId === appId)

  const onIconClick = (appId: AppId) => {
    const wins = windows.filter((w) => w.appId === appId)
    if (wins.length === 0) {
      launch(appId)
    } else {
      const top = wins.reduce((a, b) => (a.zIndex > b.zIndex ? a : b))
      if (activeId === top.id && !top.minimized) minimizeWindow(top.id)
      else focusWindow(top.id)
    }
  }

  return (
    <>
      {quickOpen && <div className="fixed inset-0 z-40" onClick={() => setQuickOpen(false)} />}

      <div className="fixed bottom-0 left-0 right-0 h-12 acrylic border-t border-border z-50 flex items-center justify-between px-2">
        {/* Left spacer (weather widget area) */}
        <div className="w-40 hidden sm:flex items-center gap-2 px-3 py-1 rounded-md hover:bg-foreground/8 transition cursor-default">
          <span className="text-xs text-muted-foreground truncate">
            {now ? now.toLocaleDateString([], { weekday: "short" }) : ""} · Web OS
          </span>
        </div>

        {/* Center cluster */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          {/* Start */}
          <button
            onClick={() => setStartOpen(!startOpen)}
            className={`h-10 w-10 flex items-center justify-center rounded-md transition ${
              startOpen ? "bg-foreground/12" : "hover:bg-foreground/8"
            }`}
            aria-label="Start"
          >
            <StartLogo />
          </button>

          {/* Search */}
          <button
            onClick={() => setStartOpen(true)}
            className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-foreground/8 transition"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* App icons */}
          {shownApps.map((appId) => {
            const running = appIsRunning(appId)
            const active = appIsActive(appId)
            return (
              <button
                key={appId}
                onClick={() => onIconClick(appId)}
                className={`relative h-10 w-10 flex items-center justify-center rounded-md transition ${
                  active ? "bg-foreground/12" : "hover:bg-foreground/8"
                }`}
                aria-label={appId}
              >
                <AppTile appId={appId} size={24} />
                {running && (
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all"
                    style={{
                      width: active ? 16 : 6,
                      background: "var(--primary)",
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* System tray */}
        <div className="ml-auto flex items-center">
          <button
            onClick={() => setQuickOpen((v) => !v)}
            className="flex items-center gap-2 px-2.5 h-9 rounded-md hover:bg-foreground/8 transition"
            aria-label="Quick settings"
          >
            <Wifi className="w-4 h-4" />
            <Volume2 className="w-4 h-4" />
            <BatteryFull className="w-4 h-4" />
          </button>
          <button
            className="flex flex-col items-end px-2.5 h-9 justify-center rounded-md hover:bg-foreground/8 transition leading-tight"
            aria-label="Date and time"
            onClick={() => setQuickOpen((v) => !v)}
          >
            <span className="text-[11px]">{now ? formatTime(now) : "--:--"}</span>
            <span className="text-[11px]">{now ? formatDate(now) : ""}</span>
          </button>
        </div>
      </div>

      {/* Quick settings flyout */}
      {quickOpen && (
        <div className="fixed bottom-[60px] right-2 z-50 w-80 rounded-xl acrylic-strong win-shadow border border-border p-4 animate-flyout">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <QuickToggle label="Wi-Fi" sub="Web Net" Icon={Wifi} active />
            <QuickToggle
              label={settings.theme === "dark" ? "Dark" : "Light"}
              sub="Theme"
              Icon={settings.theme === "dark" ? Moon : Sun}
              active
              onClick={() => setSettings({ theme: settings.theme === "dark" ? "light" : "dark" })}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 shrink-0" />
              <input type="range" defaultValue={70} className="flex-1 accent-[var(--primary)]" aria-label="Volume" />
            </div>
            <div className="flex items-center gap-3">
              <Sun className="w-4 h-4 shrink-0" />
              <input type="range" defaultValue={90} className="flex-1 accent-[var(--primary)]" aria-label="Brightness" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BatteryFull className="w-4 h-4" /> 100%
            </span>
            <span className="flex items-center gap-1.5">
              <Bell className="w-4 h-4" /> No new notifications
            </span>
          </div>
        </div>
      )}
    </>
  )
}

function QuickToggle({
  label,
  sub,
  Icon,
  active,
  onClick,
}: {
  label: string
  sub: string
  Icon: typeof Wifi
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg transition text-left"
      style={{
        background: active ? "var(--primary)" : "var(--muted)",
        color: active ? "var(--primary-foreground)" : "var(--foreground)",
      }}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium truncate">{label}</p>
        <p className="text-[10px] opacity-80 truncate">{sub}</p>
      </div>
    </button>
  )
}
