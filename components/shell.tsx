"use client"

import { useOS } from "@/lib/os-context"
import { Desktop } from "@/components/desktop"
import { Taskbar } from "@/components/taskbar"
import { StartMenu } from "@/components/start-menu"
import { LockScreen, BootScreen } from "@/components/lock-screen"

export function Shell() {
  const { booting, locked, startOpen } = useOS()

  if (booting) return <BootScreen />
  if (locked) return <LockScreen />

  return (
    <main className="fixed inset-0 overflow-hidden">
      <Desktop />
      {startOpen && <StartMenu />}
      <Taskbar />
    </main>
  )
}
