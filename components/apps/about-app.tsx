"use client"

import { Monitor } from "lucide-react"
import { useOS } from "@/lib/os-context"

export function AboutApp() {
  const { settings } = useOS()
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-card">
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
        <Monitor className="w-8 h-8 text-primary-foreground" />
      </div>
      <h1 className="text-xl font-semibold mb-1">Windows 11</h1>
      <p className="text-sm text-muted-foreground mb-6">Web Edition · Replica</p>
      <div className="w-full max-w-xs space-y-2 text-sm">
        {[
          ["Edition", "Windows 11 Web"],
          ["Version", "23H2"],
          ["Build", "22631.replica"],
          ["Signed in as", settings.userName],
          ["Theme", settings.theme === "dark" ? "Dark" : "Light"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-border pb-1.5">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium text-selectable">{v}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-6 max-w-xs text-pretty">
        A functional recreation built with Next.js & React. Not affiliated with Microsoft.
      </p>
    </div>
  )
}
