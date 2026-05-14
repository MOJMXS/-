import { useEffect, useState } from 'react'
import type { Editor } from 'tldraw'
import Sidebar from './components/Sidebar'
import FloatingHeader from './components/FloatingHeader'
import CanvasView from './components/CanvasView'
import { useProjectsStore } from './store/projectsStore'

export default function App() {
  const hydrate = useProjectsStore((s) => s.hydrate)
  const hydrated = useProjectsStore((s) => s.hydrated)
  const activeId = useProjectsStore((s) => s.activeId)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Reset editor reference when switching projects
  useEffect(() => {
    setEditor(null)
  }, [activeId])

  // Keyboard shortcut: Cmd/Ctrl + B to toggle sidebar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setSidebarOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!hydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-canvas-bg text-canvas-muted">
        <div className="text-sm">Loading…</div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-canvas-bg">
      {/* Full-screen canvas */}
      {activeId ? (
        <CanvasView projectId={activeId} onMount={setEditor} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-canvas-muted">
          Select or create a project to begin.
        </div>
      )}

      {/* Floating overlays */}
      <FloatingHeader editor={editor} onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  )
}
