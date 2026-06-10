"use client"

import { useState } from "react"
import { useOS } from "@/lib/os-context"
import { useClock, formatBigTime, formatLongDate } from "@/lib/clock"
import { ChevronRight, Wifi, Volume2, BatteryFull } from "lucide-react"

export function LockScreen() {
  const { unlock, settings } = useOS()
  const now = useClock()
  const [stage, setStage] = useState<"clock" | "login">("clock")
  const [password, setPassword] = useState("")

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-cover bg-center text-white"
      style={{ backgroundImage: "url(/lockscreen.png)" }}
      onClick={() => stage === "clock" && setStage("login")}
    >
      <div className="absolute inset-0 bg-black/25" />

      {stage === "clock" ? (
        <div className="relative z-10 text-center cursor-pointer select-none">
          <p className="text-8xl font-light tracking-tight drop-shadow-lg">{now ? formatBigTime(now) : "--:--"}</p>
          <p className="text-2xl font-light mt-1 drop-shadow-lg">{now ? formatLongDate(now) : ""}</p>
          <p className="text-sm mt-10 opacity-80 animate-pulse">Click anywhere to sign in</p>
        </div>
      ) : (
        <div
          className="relative z-10 flex flex-col items-center animate-flyout"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-28 h-28 rounded-full bg-white/15 backdrop-blur flex items-center justify-center mb-4 border border-white/20">
            <span className="text-5xl font-light">{settings.userName[0]?.toUpperCase()}</span>
          </div>
          <h2 className="text-2xl font-semibold mb-6 drop-shadow">{settings.userName}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              unlock()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PIN (press Enter)"
              className="h-9 w-56 px-3 rounded-md bg-white/15 backdrop-blur border border-white/30 outline-none placeholder:text-white/60 text-sm text-selectable focus:bg-white/25 transition text-center"
              aria-label="Password"
            />
            <button
              type="submit"
              aria-label="Sign in"
              className="h-9 w-9 flex items-center justify-center rounded-full bg-white/15 backdrop-blur border border-white/30 hover:bg-white/30 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
          <p className="text-xs mt-3 opacity-70">No password required — just press Enter</p>
        </div>
      )}

      {/* bottom-right status */}
      <div className="absolute bottom-6 right-8 z-10 flex items-center gap-4 opacity-90">
        <Wifi className="w-5 h-5" />
        <Volume2 className="w-5 h-5" />
        <BatteryFull className="w-5 h-5" />
      </div>
    </div>
  )
}

export function BootScreen() {
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black text-white">
      {/* Windows logo */}
      <div className="grid grid-cols-2 gap-1.5 mb-16">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-10 h-10 rounded-sm" style={{ background: "oklch(0.6 0.13 235)" }} />
        ))}
      </div>
      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
    </div>
  )
}
