"use client"

import { useState, useMemo, useEffect } from "react"
import { useOS, type NoteDoc } from "@/lib/os-context"
import { FileText, Plus, Save, Trash2 } from "lucide-react"

export function NotepadApp({ payload }: { payload?: Record<string, unknown> }) {
  const { notes, saveNote, deleteNote } = useOS()
  const initialId = typeof payload?.noteId === "string" ? (payload.noteId as string) : null

  const [activeId, setActiveId] = useState<string | null>(initialId)
  const [name, setName] = useState("Untitled")
  const [content, setContent] = useState("")
  const [dirty, setDirty] = useState(false)

  const active = useMemo(() => notes.find((n) => n.id === activeId) ?? null, [notes, activeId])

  useEffect(() => {
    if (active) {
      setName(active.name)
      setContent(active.content)
      setDirty(false)
    }
  }, [active?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const newDoc = () => {
    setActiveId(null)
    setName("Untitled")
    setContent("")
    setDirty(false)
  }

  const handleSave = () => {
    const id = activeId ?? `note-${Date.now()}`
    const doc: NoteDoc = {
      id,
      name: name.trim() || "Untitled",
      content,
      updatedAt: Date.now(),
    }
    saveNote(doc)
    setActiveId(id)
    setDirty(false)
  }

  const handleDelete = (id: string) => {
    deleteNote(id)
    if (id === activeId) newDoc()
  }

  const words = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="flex h-full">
      {/* Sidebar: saved notes */}
      <aside className="w-48 shrink-0 bg-muted/40 border-r border-border flex flex-col">
        <div className="p-2">
          <button
            onClick={newDoc}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            <Plus className="w-3.5 h-3.5" /> New file
          </button>
        </div>
        <div className="flex-1 overflow-y-auto win-scroll px-1.5 pb-2 space-y-0.5">
          {notes.length === 0 && (
            <p className="text-[11px] text-muted-foreground px-2 py-3 text-center">No saved files yet</p>
          )}
          {notes
            .slice()
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveId(n.id)}
                className={`group w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition ${
                  n.id === activeId ? "bg-primary/15 text-foreground" : "hover:bg-foreground/5 text-foreground/80"
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span className="text-xs truncate flex-1">{n.name}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(n.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-destructive transition"
                >
                  <Trash2 className="w-3 h-3" />
                </span>
              </button>
            ))}
        </div>
      </aside>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-card">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setDirty(true)
            }}
            className="text-xs bg-transparent outline-none flex-1 text-selectable focus:bg-muted/50 rounded px-1.5 py-1"
            aria-label="File name"
          />
          {dirty && <span className="text-[10px] text-muted-foreground">Unsaved</span>}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md hover:bg-foreground/10 transition"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setDirty(true)
          }}
          placeholder="Start typing..."
          spellCheck={false}
          className="flex-1 w-full resize-none bg-card text-card-foreground p-4 text-sm leading-relaxed outline-none text-selectable win-scroll font-mono"
        />
        <div className="flex items-center justify-end gap-4 px-3 py-1 border-t border-border bg-muted/40 text-[11px] text-muted-foreground">
          <span>{content.length} characters</span>
          <span>{words} words</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  )
}
