import { useEffect, useRef, useState } from 'react'
import { Download, PanelLeft } from 'lucide-react'
import { useProjectsStore } from '../store/projectsStore'
import type { Editor } from 'tldraw'

interface Props {
  editor: Editor | null
  onOpenSidebar: () => void
}

export default function FloatingHeader({ editor, onOpenSidebar }: Props) {
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
    <>
      {/* Top-left: sidebar toggle + project name */}
      <div className="pointer-events-none fixed left-3 top-3 z-20 flex items-center gap-2">
        <button
          onClick={onOpenSidebar}
          className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-canvas-panel/80 text-canvas-muted shadow-lg ring-1 ring-canvas-border backdrop-blur transition-colors hover:bg-canvas-active hover:text-canvas-text"
          title="Open projects"
          aria-label="Open projects"
        >
          <PanelLeft size={15} />
        </button>

        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-canvas-panel/80 px-3 py-1.5 ring-1 ring-canvas-border backdrop-blur">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
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
              className="w-40 bg-transparent text-xs outline-none"
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="max-w-[200px] truncate text-xs font-medium text-canvas-text hover:text-canvas-accent"
              title="Click to rename"
            >
              {active.name}
            </button>
          )}
        </div>
      </div>

      {/* Top-right: export */}
      <div className="pointer-events-none fixed right-3 top-3 z-20 flex items-center gap-2">
        <button
          onClick={handleExportPng}
          className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-canvas-panel/80 px-3 py-1.5 text-xs text-canvas-muted shadow-lg ring-1 ring-canvas-border backdrop-blur transition-colors hover:bg-canvas-active hover:text-canvas-text"
          title="Export as PNG"
        >
          <Download size={13} />
          Export
        </button>
      </div>
    </>
  )
}
