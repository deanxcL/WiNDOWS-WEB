"use client"

import { useState } from "react"
import { useOS, type AppId, APP_META } from "@/lib/os-context"
import { AppTile } from "@/components/app-icons"
import { Search, Power, Lock, RotateCcw, User } from "lucide-react"

const PINNED: AppId[] = ["notepad", "browser", "settings", "terminal", "explorer", "about"]
const RECOMMENDED: { appId: AppId; sub: string }[] = [
  { appId: "notepad", sub: "Recently added" },
  { appId: "browser", sub: "Recently added" },
  { appId: "settings", sub: "Recently added" },
  { appId: "explorer", sub: "Recently added" },
]

export function StartMenu() {
  const { launch, settings, lock, setStartOpen } = useOS()
  const [query, setQuery] = useState("")
  const [powerOpen, setPowerOpen] = useState(false)

  const filtered = PINNED.filter((a) => APP_META[a].title.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setStartOpen(false)} />
      <div
        className="fixed left-1/2 -translate-x-1/2 bottom-[60px] z-50 w-[640px] max-w-[94vw] h-[640px] max-h-[80vh] rounded-xl acrylic-strong win-shadow border border-border flex flex-col p-6 animate-flyout"
        role="menu"
        aria-label="Start menu"
      >
        {/* Search */}
        <div className="flex items-center gap-2 h-10 px-4 rounded-full bg-card border border-border mb-5">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for apps, settings, and documents"
            className="flex-1 bg-transparent outline-none text-sm text-selectable"
            aria-label="Search"
          />
        </div>

        {/* Pinned */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Pinned</h2>
        </div>
        <div className="grid grid-cols-6 gap-2 mb-6">
          {filtered.map((appId) => (
            <button
              key={appId}
              onClick={() => launch(appId)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-foreground/8 transition"
            >
              <AppTile appId={appId} size={40} />
              <span className="text-[11px] text-center leading-tight line-clamp-2">{APP_META[appId].title}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-6 text-sm text-muted-foreground text-center py-8">No results</p>
          )}
        </div>

        {/* Recommended */}
        {!query && (
          <>
            <h2 className="text-sm font-semibold mb-3">Recommended</h2>
            <div className="grid grid-cols-2 gap-2">
              {RECOMMENDED.map(({ appId, sub }) => (
                <button
                  key={appId}
                  onClick={() => launch(appId)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/8 transition text-left"
                >
                  <AppTile appId={appId} size={32} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{APP_META[appId].title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
          <button
            onClick={() => launch("settings")}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-foreground/8 transition"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
              {settings.userName[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
            </div>
            <span className="text-sm font-medium">{settings.userName}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setPowerOpen((v) => !v)}
              className="p-2 rounded-md hover:bg-foreground/8 transition"
              aria-label="Power"
            >
              <Power className="w-4 h-4" />
            </button>
            {powerOpen && (
              <div className="absolute bottom-11 right-0 w-44 rounded-lg acrylic-strong win-shadow border border-border p-1 animate-flyout">
                <button
                  onClick={() => {
                    setStartOpen(false)
                    lock()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-foreground/8 transition text-sm"
                >
                  <Lock className="w-4 h-4" /> Lock
                </button>
                <button
                  onClick={() => {
                    setStartOpen(false)
                    lock()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-foreground/8 transition text-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Sign out
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-foreground/8 transition text-sm"
                >
                  <Power className="w-4 h-4" /> Restart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
