import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { useProjectsStore } from '../store/projectsStore'
import type { Editor } from 'tldraw'

interface TopBarProps {
  editor: Editor | null
}

export default function TopBar({ editor }: TopBarProps) {
  const activeId = useProjectsStore((s) => s.activeId)
  const projects = useProjectsStore((s) => s.projects)
  const renameProject = useProjectsStore((s) => s.renameProject)

  const active = projects.find((p) => p.id === activeId)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(active?.name ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(active?.name ?? '')
    setEditing(false)
  }, [active?.id, active?.name])

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commit = async () => {
    const trimmed = draft.trim()
    if (active && trimmed && trimmed !== active.name) {
      await renameProject(active.id, trimmed)
    } else {
      setDraft(active?.name ?? '')
    }
    setEditing(false)
  }

  const handleExportPng = async () => {
    if (!editor || !active) return
    const shapeIds = editor.getCurrentPageShapeIds()
    if (shapeIds.size === 0) {
      alert('Canvas is empty — nothing to export.')
      return
    }
    try {
      const result = await editor.toImage([...shapeIds], {
        format: 'png',
        background: true,
        padding: 32,
      })
      const url = URL.createObjectURL(result.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${active.name.replace(/[^\w\-]+/g, '_')}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Export failed. See console.')
    }
  }

  if (!active) return null

  return (
    <header className="z-20 flex h-11 shrink-0 items-center justify-between border-b border-canvas-border bg-canvas-panel/90 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: active.color }}
        />
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(active.name)
                setEditing(false)
              }
            }}
            className="rounded bg-canvas-hover px-2 py-0.5 text-sm outline-none ring-1 ring-canvas-border"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-medium hover:text-canvas-accent"
            title="Click to rename"
          >
            {active.name}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleExportPng}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-canvas-muted hover:bg-canvas-hover hover:text-canvas-text"
          title="Export PNG"
        >
          <Download size={14} />
          Export
        </button>
      </div>
    </header>
  )
}
