import { useCallback } from 'react'
import { useEditor, useValue } from 'tldraw'
import { Undo2, Redo2, Maximize, Plus, Minus } from 'lucide-react'

/**
 * Bottom-left vertical rail: Undo / Redo / Fit / Zoom in / Zoom out.
 * Visually consistent with the main toolbar pill (dark, rounded).
 */
export default function CustomLeftRail() {
  const editor = useEditor()

  const canUndo = useValue('can undo', () => editor.getCanUndo(), [editor])
  const canRedo = useValue('can redo', () => editor.getCanRedo(), [editor])

  const undo = useCallback(() => editor.undo(), [editor])
  const redo = useCallback(() => editor.redo(), [editor])
  const fit = useCallback(() => editor.zoomToFit({ animation: { duration: 220 } }), [editor])
  const zoomIn = useCallback(
    () => editor.zoomIn(undefined, { animation: { duration: 120 } }),
    [editor],
  )
  const zoomOut = useCallback(
    () => editor.zoomOut(undefined, { animation: { duration: 120 } }),
    [editor],
  )

  return (
    <div className="space-left-rail">
      <button
        type="button"
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
        disabled={!canUndo}
        onPointerDown={undo}
        className="space-rail-btn"
      >
        <Undo2 size={17} strokeWidth={1.85} />
      </button>
      <button
        type="button"
        title="Redo (Ctrl+Shift+Z)"
        aria-label="Redo"
        disabled={!canRedo}
        onPointerDown={redo}
        className="space-rail-btn"
      >
        <Redo2 size={17} strokeWidth={1.85} />
      </button>

      <div className="space-rail-sep" />

      <button
        type="button"
        title="Zoom to fit (Shift+1)"
        aria-label="Zoom to fit"
        onPointerDown={fit}
        className="space-rail-btn"
      >
        <Maximize size={16} strokeWidth={1.85} />
      </button>

      <div className="space-rail-sep" />

      <button
        type="button"
        title="Zoom in (Ctrl+=)"
        aria-label="Zoom in"
        onPointerDown={zoomIn}
        className="space-rail-btn"
      >
        <Plus size={17} strokeWidth={2} />
      </button>
      <button
        type="button"
        title="Zoom out (Ctrl+-)"
        aria-label="Zoom out"
        onPointerDown={zoomOut}
        className="space-rail-btn"
      >
        <Minus size={17} strokeWidth={2} />
      </button>
    </div>
  )
}
