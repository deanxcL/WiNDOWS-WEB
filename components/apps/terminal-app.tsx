"use client"

import { useState, useRef, useEffect } from "react"
import { useOS } from "@/lib/os-context"

interface Line {
  type: "input" | "output"
  text: string
}

const FS: Record<string, string[]> = {
  "C:\\Users\\User": ["Desktop", "Documents", "Downloads", "Pictures", "readme.txt"],
  "C:\\Users\\User\\Documents": ["projects", "notes.txt", "budget.xlsx"],
  "C:\\Users\\User\\Desktop": ["shortcut.lnk"],
}

export function TerminalApp() {
  const { settings, setSettings, lock } = useOS()
  const [cwd, setCwd] = useState("C:\\Users\\User")
  const [lines, setLines] = useState<Line[]>([
    { type: "output", text: "Windows Terminal [Version 11.0.22631.1]" },
    { type: "output", text: "(c) Microsoft Corporation. All rights reserved.\n" },
  ])
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  const print = (text: string) => setLines((l) => [...l, { type: "output", text }])

  const run = (raw: string) => {
    const cmd = raw.trim()
    setLines((l) => [...l, { type: "input", text: `${cwd}> ${raw}` }])
    if (!cmd) return
    setHistory((h) => [...h, cmd])
    setHistIdx(-1)

    const [name, ...args] = cmd.split(/\s+/)
    switch (name.toLowerCase()) {
      case "help":
        print(
          [
            "Available commands:",
            "  help         Show this help message",
            "  echo [text]  Print text",
            "  dir / ls     List directory contents",
            "  cd [dir]     Change directory",
            "  cls / clear  Clear the screen",
            "  date         Show current date and time",
            "  whoami       Show current user",
            "  ver          Show OS version",
            "  theme [light|dark]  Switch theme",
            "  lock         Lock the PC",
            "  exit         (use the X button to close)",
          ].join("\n"),
        )
        break
      case "echo":
        print(args.join(" "))
        break
      case "dir":
      case "ls": {
        const items = FS[cwd]
        if (items) print(items.map((i) => (i.includes(".") ? `        ${i}` : `<DIR>   ${i}`)).join("\n"))
        else print("Directory is empty.")
        break
      }
      case "cd": {
        const target = args[0]
        if (!target || target === "~") {
          setCwd("C:\\Users\\User")
        } else if (target === "..") {
          const parts = cwd.split("\\")
          if (parts.length > 1) setCwd(parts.slice(0, -1).join("\\") || "C:")
        } else {
          const next = `${cwd}\\${target}`
          if (FS[next] || (FS[cwd] && FS[cwd].includes(target))) setCwd(next)
          else print(`The system cannot find the path specified: ${target}`)
        }
        break
      }
      case "cls":
      case "clear":
        setLines([])
        break
      case "date":
        print(new Date().toString())
        break
      case "whoami":
        print(`desktop-pc\\${settings.userName.toLowerCase()}`)
        break
      case "ver":
        print("Microsoft Windows [Version 11.0.22631.1]")
        break
      case "theme":
        if (args[0] === "light" || args[0] === "dark") {
          setSettings({ theme: args[0] })
          print(`Theme switched to ${args[0]}.`)
        } else print("Usage: theme [light|dark]")
        break
      case "lock":
        lock()
        break
      default:
        print(`'${name}' is not recognized as an internal or external command.\nType 'help' for a list of commands.`)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      run(input)
      setInput("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length) {
        const idx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1)
        setHistIdx(idx)
        setInput(history[idx])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (histIdx >= 0 && histIdx < history.length - 1) {
        setHistIdx(histIdx + 1)
        setInput(history[histIdx + 1])
      } else {
        setHistIdx(-1)
        setInput("")
      }
    }
  }

  return (
    <div
      className="h-full bg-[#0c0c0c] text-[#cccccc] font-mono text-[13px] flex flex-col cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto win-scroll p-3 space-y-0.5">
        {lines.map((line, i) => (
          <pre
            key={i}
            className={`whitespace-pre-wrap break-words text-selectable ${
              line.type === "input" ? "text-[#cccccc]" : "text-[#cccccc]"
            }`}
          >
            {line.text}
          </pre>
        ))}
        <div className="flex items-center">
          <span className="text-[#16c60c] shrink-0">{cwd}&gt;&nbsp;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoFocus
            className="flex-1 bg-transparent outline-none text-[#cccccc] caret-[#cccccc] text-selectable"
            aria-label="Terminal input"
          />
        </div>
      </div>
    </div>
  )
}
