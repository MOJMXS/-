import { useMemo, useState } from 'react'
import { Plus, Search, Trash2, Pencil, Check, X, PanelLeftClose } from 'lucide-react'
import { useProjectsStore } from '../store/projectsStore'
import { PROJECT_COLORS } from '../lib/types'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const projects = useProjectsStore((s) => s.projects)
  const activeId = useProjectsStore((s) => s.activeId)
  const createProject = useProjectsStore((s) => s.createProject)
  const renameProject = useProjectsStore((s) => s.renameProject)
  const recolorProject = useProjectsStore((s) => s.recolorProject)
  const deleteProject = useProjectsStore((s) => s.deleteProject)
  const setActive = useProjectsStore((s) => s.setActive)

  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [colorPickerId, setColorPickerId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt)
    if (!q) return sorted
    return sorted.filter((p) => p.name.toLowerCase().includes(q))
  }, [projects, query])

  const startEdit = (id: string, current: string) => {
    setEditingId(id)
    setEditingName(current)
  }

  const commitEdit = async () => {
    if (editingId && editingName.trim()) {
      await renameProject(editingId, editingName.trim())
    }
    setEditingId(null)
    setEditingName('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleDelete = async (id: string, name: string) => {
    if (projects.length === 1) {
      alert('You must keep at least one project.')
      return
    }
    if (confirm(`Delete project "${name}"? This cannot be undone.`)) {
      await deleteProject(id)
    }
  }

  const handleSelect = async (id: string) => {
    await setActive(id)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-canvas-border bg-canvas-panel shadow-2xl transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-canvas-accent" />
          <span className="text-sm font-semibold tracking-tight">Space</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => createProject('Untitled')}
            className="rounded-md p-1.5 text-canvas-muted hover:bg-canvas-hover hover:text-canvas-text"
            title="New project"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-canvas-muted hover:bg-canvas-hover hover:text-canvas-text"
            title="Close"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-md bg-canvas-hover px-2 py-1.5">
          <Search size={14} className="text-canvas-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects"
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-canvas-muted"
          />
        </div>
      </div>

      {/* List */}
      <div className="thin-scroll flex-1 overflow-y-auto px-2 pb-3">
        {filtered.length === 0 && (
          <div className="px-2 py-6 text-center text-xs text-canvas-muted">
            No projects match.
          </div>
        )}
        {filtered.map((p) => {
          const isActive = p.id === activeId
          const isEditing = editingId === p.id
          return (
            <div
              key={p.id}
              className={`group relative mb-0.5 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'bg-canvas-active text-canvas-text'
                  : 'text-canvas-muted hover:bg-canvas-hover hover:text-canvas-text'
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setColorPickerId(colorPickerId === p.id ? null : p.id)
                }}
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-transparent hover:ring-canvas-border"
                style={{ backgroundColor: p.color }}
                title="Change color"
              />

              {isEditing ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  onBlur={commitEdit}
                  className="flex-1 rounded bg-canvas-bg px-1 py-0.5 text-sm outline-none ring-1 ring-canvas-border"
                />
              ) : (
                <button
                  onClick={() => handleSelect(p.id)}
                  className="flex-1 truncate text-left"
                  title={p.name}
                >
                  {p.name}
                </button>
              )}

              {!isEditing && (
                <div className="hidden items-center gap-0.5 group-hover:flex">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startEdit(p.id, p.name)
                    }}
                    className="rounded p-1 text-canvas-muted hover:bg-canvas-bg hover:text-canvas-text"
                    title="Rename"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(p.id, p.name)
                    }}
                    className="rounded p-1 text-canvas-muted hover:bg-canvas-bg hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}

              {isEditing && (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={commitEdit}
                    className="rounded p-1 text-canvas-muted hover:text-canvas-accent"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="rounded p-1 text-canvas-muted hover:text-red-400"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Color picker popover */}
              {colorPickerId === p.id && (
                <div
                  className="absolute left-2 top-9 z-50 flex gap-1 rounded-md border border-canvas-border bg-canvas-panel p-1.5 shadow-lg"
                  onMouseLeave={() => setColorPickerId(null)}
                >
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        recolorProject(p.id, c)
                        setColorPickerId(null)
                      }}
                      className="h-4 w-4 rounded-full ring-2 ring-transparent hover:ring-canvas-text"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer hint */}
      <div className="border-t border-canvas-border px-3 py-2 text-[10px] text-canvas-muted">
        {projects.length} project{projects.length === 1 ? '' : 's'} · stored locally
      </div>
      </aside>
    </>
  )
}
