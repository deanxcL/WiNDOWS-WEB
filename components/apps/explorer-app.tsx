"use client"

import { useState } from "react"
import { useOS } from "@/lib/os-context"
import {
  Folder,
  FileText,
  ChevronRight,
  Monitor,
  Download,
  ImageIcon,
  Music,
  Video,
  HardDrive,
  Home,
  FileSpreadsheet,
} from "lucide-react"

interface FsNode {
  name: string
  type: "folder" | "file"
  kind?: string
  size?: string
  children?: Record<string, FsNode>
}

const TREE: Record<string, FsNode> = {
  Desktop: { name: "Desktop", type: "folder", children: {} },
  Documents: {
    name: "Documents",
    type: "folder",
    children: {
      "Resume.txt": { name: "Resume.txt", type: "file", kind: "Text Document", size: "4 KB" },
      "Budget.xlsx": { name: "Budget.xlsx", type: "file", kind: "Spreadsheet", size: "18 KB" },
      Projects: {
        name: "Projects",
        type: "folder",
        children: {
          "ideas.txt": { name: "ideas.txt", type: "file", kind: "Text Document", size: "2 KB" },
        },
      },
    },
  },
  Downloads: {
    name: "Downloads",
    type: "folder",
    children: {
      "setup.exe": { name: "setup.exe", type: "file", kind: "Application", size: "42 MB" },
      "photo.png": { name: "photo.png", type: "file", kind: "PNG Image", size: "1.2 MB" },
    },
  },
  Pictures: {
    name: "Pictures",
    type: "folder",
    children: {
      "wallpaper.png": { name: "wallpaper.png", type: "file", kind: "PNG Image", size: "3.4 MB" },
      "screenshot.png": { name: "screenshot.png", type: "file", kind: "PNG Image", size: "880 KB" },
    },
  },
  Music: { name: "Music", type: "folder", children: {} },
  Videos: { name: "Videos", type: "folder", children: {} },
}

const QUICK = [
  { key: "Home", label: "Home", Icon: Home },
  { key: "Desktop", label: "Desktop", Icon: Monitor },
  { key: "Downloads", label: "Downloads", Icon: Download },
  { key: "Documents", label: "Documents", Icon: FileText },
  { key: "Pictures", label: "Pictures", Icon: ImageIcon },
  { key: "Music", label: "Music", Icon: Music },
  { key: "Videos", label: "Videos", Icon: Video },
]

function fileIcon(kind?: string) {
  if (kind?.includes("Image")) return ImageIcon
  if (kind?.includes("Spreadsheet")) return FileSpreadsheet
  return FileText
}

export function ExplorerApp() {
  const { launch, saveNote, notes } = useOS()
  // path is an array of segment keys, [] = Home
  const [path, setPath] = useState<string[]>([])

  const resolve = (segments: string[]): Record<string, FsNode> => {
    if (segments.length === 0) return TREE
    let node: FsNode | undefined = TREE[segments[0]]
    for (let i = 1; i < segments.length && node; i++) {
      node = node.children?.[segments[i]]
    }
    return node?.children ?? {}
  }

  const entries = resolve(path)
  const isHome = path.length === 0

  const openItem = (key: string, node: FsNode) => {
    if (node.type === "folder") {
      setPath([...path, key])
    } else if (node.kind === "Text Document") {
      // open a real note in Notepad
      const existing = notes.find((n) => n.name === node.name)
      const id = existing?.id ?? `note-fs-${key}`
      if (!existing) {
        saveNote({
          id,
          name: node.name,
          content: `This is ${node.name}, opened from File Explorer.\n\nYou can edit and save it — your changes persist locally.`,
          updatedAt: Date.now(),
        })
      }
      launch("notepad", { noteId: id })
    }
  }

  return (
    <div className="flex h-full bg-card">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-muted/40 border-r border-border overflow-y-auto win-scroll py-2">
        {QUICK.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setPath(key === "Home" ? [] : [key])}
            className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-sm transition ${
              (key === "Home" && isHome) || path[0] === key ? "bg-foreground/8" : "hover:bg-foreground/5"
            }`}
          >
            <Icon className="w-4 h-4 text-primary" />
            {label}
          </button>
        ))}
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2.5 px-4 py-1.5 text-sm">
            <HardDrive className="w-4 h-4 text-muted-foreground" />
            This PC
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-3 h-9 border-b border-border text-xs">
          <button onClick={() => setPath([])} className="px-1.5 py-1 rounded hover:bg-foreground/10 transition">
            This PC
          </button>
          {path.map((seg, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <button
                onClick={() => setPath(path.slice(0, i + 1))}
                className="px-1.5 py-1 rounded hover:bg-foreground/10 transition"
              >
                {seg}
              </button>
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto win-scroll p-3">
          {Object.keys(entries).length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Folder className="w-12 h-12 mb-2 opacity-40" />
              <p className="text-sm">This folder is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1">
              {Object.entries(entries)
                .sort((a, b) => {
                  if (a[1].type !== b[1].type) return a[1].type === "folder" ? -1 : 1
                  return a[0].localeCompare(b[0])
                })
                .map(([key, node]) => {
                  const Icon = node.type === "folder" ? Folder : fileIcon(node.kind)
                  return (
                    <button
                      key={key}
                      onDoubleClick={() => openItem(key, node)}
                      onClick={(e) => {
                        if (e.detail === 1 && node.type === "folder") return
                      }}
                      className="flex flex-col items-center gap-1 p-3 rounded-md hover:bg-primary/10 focus:bg-primary/15 transition outline-none"
                      title={`${node.name}${node.size ? ` — ${node.size}` : ""}`}
                    >
                      <Icon
                        className="w-9 h-9"
                        style={{ color: node.type === "folder" ? "oklch(0.7 0.13 80)" : "var(--primary)" }}
                        fill={node.type === "folder" ? "oklch(0.8 0.12 85)" : "none"}
                      />
                      <span className="text-xs text-center line-clamp-2 leading-tight">{node.name}</span>
                    </button>
                  )
                })}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center px-3 h-6 border-t border-border text-[11px] text-muted-foreground">
          {Object.keys(entries).length} items
        </div>
      </div>
    </div>
  )
}
