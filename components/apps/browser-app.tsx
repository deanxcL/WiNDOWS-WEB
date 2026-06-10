"use client"

import { useState, useRef } from "react"
import { ArrowLeft, ArrowRight, RotateCw, Home, Lock, Plus, X, Search } from "lucide-react"

interface Tab {
  id: string
  title: string
  url: string
  // displayed in the address bar
  input: string
}

const QUICK_LINKS = [
  { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Microsoft_Windows", color: "oklch(0.5 0.02 260)" },
  { name: "Bing", url: "https://www.bing.com", color: "oklch(0.55 0.16 220)" },
  { name: "OpenStreetMap", url: "https://www.openstreetmap.org/export/embed.html", color: "oklch(0.6 0.13 145)" },
  { name: "Example", url: "https://example.com", color: "oklch(0.55 0.1 250)" },
]

function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ""
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) return `https://${trimmed}`
  return `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`
}

function newTab(): Tab {
  return { id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: "New tab", url: "", input: "" }
}

export function BrowserApp() {
  const [tabs, setTabs] = useState<Tab[]>([newTab()])
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const [reloadKey, setReloadKey] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0]

  const updateActive = (patch: Partial<Tab>) => {
    setTabs((ts) => ts.map((t) => (t.id === activeTab ? { ...t, ...patch } : t)))
  }

  const navigate = (raw: string) => {
    const url = normalizeUrl(raw)
    if (!url) return
    let title = "New tab"
    try {
      title = new URL(url).hostname.replace("www.", "")
    } catch {
      /* ignore */
    }
    updateActive({ url, input: url, title })
    setReloadKey((k) => k + 1)
  }

  const addTab = () => {
    const t = newTab()
    setTabs((ts) => [...ts, t])
    setActiveTab(t.id)
  }

  const closeTab = (id: string) => {
    setTabs((ts) => {
      const filtered = ts.filter((t) => t.id !== id)
      if (filtered.length === 0) {
        const t = newTab()
        setActiveTab(t.id)
        return [t]
      }
      if (id === activeTab) setActiveTab(filtered[filtered.length - 1].id)
      return filtered
    })
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Tab strip */}
      <div className="flex items-end gap-1 px-2 pt-1.5 bg-muted/50">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`group flex items-center gap-2 pl-3 pr-2 h-8 rounded-t-lg max-w-44 transition ${
              t.id === activeTab ? "bg-card" : "bg-foreground/5 hover:bg-foreground/10"
            }`}
          >
            <span className="text-xs truncate flex-1 text-left">{t.title}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                closeTab(t.id)
              }}
              className="p-0.5 rounded hover:bg-foreground/15 transition"
            >
              <X className="w-3 h-3" />
            </span>
          </button>
        ))}
        <button onClick={addTab} className="p-1.5 mb-0.5 rounded-md hover:bg-foreground/10 transition" aria-label="New tab">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-card border-b border-border">
        <button className="p-1.5 rounded-full hover:bg-foreground/10 transition disabled:opacity-30" aria-label="Back" disabled>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded-full hover:bg-foreground/10 transition disabled:opacity-30" aria-label="Forward" disabled>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="p-1.5 rounded-full hover:bg-foreground/10 transition"
          aria-label="Reload"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => updateActive({ url: "", input: "", title: "New tab" })}
          className="p-1.5 rounded-full hover:bg-foreground/10 transition"
          aria-label="Home"
        >
          <Home className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center gap-2 h-8 px-3 rounded-full bg-muted border border-transparent focus-within:border-primary focus-within:bg-card transition">
          {active.url ? <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
          <input
            ref={inputRef}
            value={active.input}
            onChange={(e) => updateActive({ input: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate((e.target as HTMLInputElement).value)
            }}
            placeholder="Search or enter web address"
            className="flex-1 bg-transparent outline-none text-sm text-selectable"
            aria-label="Address bar"
          />
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 min-h-0 bg-background relative">
        {active.url ? (
          <iframe
            key={`${active.id}-${reloadKey}`}
            src={active.url}
            title={active.title}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="no-referrer"
          />
        ) : (
          <StartPage onNavigate={navigate} />
        )}
        {active.url && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-popover/90 acrylic-strong text-[11px] text-muted-foreground pointer-events-none">
            Some sites may refuse to load inside a frame
          </div>
        )}
      </div>
    </div>
  )
}

function StartPage({ onNavigate }: { onNavigate: (url: string) => void }) {
  const [q, setQ] = useState("")
  return (
    <div className="h-full overflow-y-auto win-scroll flex flex-col items-center pt-20 px-6 bg-gradient-to-b from-muted/30 to-background">
      <h1 className="text-3xl font-light tracking-tight mb-1">
        <span className="text-primary font-normal">Edge</span> Start
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Search the web or pick a shortcut</p>
      <div className="w-full max-w-xl flex items-center gap-2 h-12 px-5 rounded-full bg-card border border-border shadow-sm focus-within:border-primary transition">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onNavigate(q)}
          placeholder="Search the web"
          className="flex-1 bg-transparent outline-none text-sm text-selectable"
          aria-label="Search"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 w-full max-w-xl">
        {QUICK_LINKS.map((link) => (
          <button
            key={link.name}
            onClick={() => onNavigate(link.url)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-semibold"
              style={{ background: link.color }}
            >
              {link.name[0]}
            </div>
            <span className="text-xs font-medium">{link.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
