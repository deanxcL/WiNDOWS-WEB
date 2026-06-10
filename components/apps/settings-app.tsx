"use client"

import { useState } from "react"
import { useOS } from "@/lib/os-context"
import { Monitor, Palette, Info, User, Check, Sun, Moon } from "lucide-react"

const ACCENTS: { id: "blue" | "teal" | "green" | "orange" | "red"; label: string; color: string }[] = [
  { id: "blue", label: "Blue", color: "oklch(0.55 0.16 250)" },
  { id: "teal", label: "Teal", color: "oklch(0.6 0.12 200)" },
  { id: "green", label: "Green", color: "oklch(0.6 0.14 150)" },
  { id: "orange", label: "Orange", color: "oklch(0.68 0.16 55)" },
  { id: "red", label: "Red", color: "oklch(0.58 0.2 25)" },
]

const WALLPAPERS: { id: "bloom" | "flow" | "solid"; label: string }[] = [
  { id: "bloom", label: "Bloom" },
  { id: "flow", label: "Flow (dark)" },
  { id: "solid", label: "Solid color" },
]

type Section = "personalization" | "system" | "accounts" | "about"

export function SettingsApp() {
  const { settings, setSettings } = useOS()
  const [section, setSection] = useState<Section>("personalization")

  const nav: { id: Section; label: string; Icon: typeof Monitor }[] = [
    { id: "system", label: "System", Icon: Monitor },
    { id: "personalization", label: "Personalization", Icon: Palette },
    { id: "accounts", label: "Accounts", Icon: User },
    { id: "about", label: "About", Icon: Info },
  ]

  return (
    <div className="flex h-full bg-card">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-muted/40 border-r border-border flex flex-col">
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            {settings.userName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{settings.userName}</p>
            <p className="text-[11px] text-muted-foreground truncate">Local Account</p>
          </div>
        </div>
        <nav className="px-2 space-y-0.5">
          {nav.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition relative ${
                section === id ? "bg-foreground/8 font-medium" : "hover:bg-foreground/5"
              }`}
            >
              {section === id && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-primary" />}
              <Icon className="w-4 h-4 text-primary" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto win-scroll p-6">
        {section === "personalization" && (
          <Section title="Personalization">
            <Card title="Theme mode" desc="Choose Light or Dark across the system">
              <div className="flex gap-3">
                <ThemeOption
                  active={settings.theme === "light"}
                  onClick={() => setSettings({ theme: "light" })}
                  Icon={Sun}
                  label="Light"
                />
                <ThemeOption
                  active={settings.theme === "dark"}
                  onClick={() => setSettings({ theme: "dark" })}
                  Icon={Moon}
                  label="Dark"
                />
              </div>
            </Card>

            <Card title="Accent color" desc="Used for highlights, the Start button and active windows">
              <div className="flex flex-wrap gap-3">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSettings({ accent: a.id })}
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition hover:scale-105"
                    style={{
                      background: a.color,
                      outline: settings.accent === a.id ? "2px solid var(--foreground)" : "none",
                      outlineOffset: 2,
                    }}
                    aria-label={a.label}
                  >
                    {settings.accent === a.id && <Check className="w-5 h-5 text-white" />}
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Background" desc="Pick your desktop wallpaper">
              <div className="grid grid-cols-3 gap-3">
                {WALLPAPERS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSettings({ wallpaper: w.id })}
                    className="rounded-lg overflow-hidden border-2 transition text-left"
                    style={{ borderColor: settings.wallpaper === w.id ? "var(--primary)" : "transparent" }}
                  >
                    <div
                      className="aspect-video bg-cover bg-center"
                      style={{
                        backgroundImage:
                          w.id === "bloom"
                            ? "url(/wallpaper-light.png)"
                            : w.id === "flow"
                              ? "url(/wallpaper-dark.png)"
                              : "linear-gradient(135deg, oklch(0.55 0.16 250), oklch(0.5 0.14 230))",
                      }}
                    />
                    <p className="text-xs px-2 py-1.5 bg-muted/50">{w.label}</p>
                  </button>
                ))}
              </div>
            </Card>
          </Section>
        )}

        {section === "system" && (
          <Section title="System">
            <Card title="Display" desc="Resolution, brightness and night light">
              <Row label="Display resolution" value="Adaptive (browser window)" />
              <Row label="Scale" value="100%" />
              <Row label="Orientation" value="Landscape" />
            </Card>
            <Card title="Power" desc="Battery and sleep settings">
              <Row label="Power mode" value="Balanced" />
              <Row label="Screen turns off" value="Never" />
            </Card>
          </Section>
        )}

        {section === "accounts" && (
          <Section title="Accounts">
            <Card title="Your info" desc="Manage your account name">
              <label className="block text-xs text-muted-foreground mb-1.5">Display name</label>
              <input
                value={settings.userName}
                onChange={(e) => setSettings({ userName: e.target.value.slice(0, 24) })}
                className="w-full max-w-xs px-3 py-2 rounded-md bg-muted border border-border outline-none focus:border-primary text-sm text-selectable"
                aria-label="User name"
              />
            </Card>
          </Section>
        )}

        {section === "about" && (
          <Section title="About">
            <Card title="Device specifications" desc="">
              <Row label="Device name" value="DESKTOP-PC" />
              <Row label="Processor" value="Web Virtual CPU @ 60fps" />
              <Row label="Installed RAM" value="∞ GB (browser managed)" />
              <Row label="System type" value="Web-based operating system" />
            </Card>
            <Card title="Windows specifications" desc="">
              <Row label="Edition" value="Windows 11 Web Edition" />
              <Row label="Version" value="23H2" />
              <Row label="OS build" value="22631.replica" />
              <Row label="Experience" value="v0 Feature Experience Pack" />
            </Card>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-5">{title}</h1>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/40 border border-border p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium">{title}</h2>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-selectable">{value}</span>
    </div>
  )
}

function ThemeOption({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  Icon: typeof Sun
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition w-28"
      style={{ borderColor: active ? "var(--primary)" : "var(--border)" }}
    >
      <Icon className="w-6 h-6 text-primary" />
      <span className="text-sm">{label}</span>
    </button>
  )
}
