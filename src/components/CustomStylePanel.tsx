import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DefaultColorStyle,
  DefaultSizeStyle,
  useEditor,
  useDefaultColorTheme,
  useRelevantStyles,
  useValue,
} from 'tldraw'
import { Eraser } from 'lucide-react'
import CustomColorPicker from './CustomColorPicker'
import { CUSTOM_COLOR_ID, setCustomDrawColor } from '../lib/customColor'

/**
 * A minimal style panel matching the Higgsfield reference design:
 *   [ pen-size variants ] | [ color dots ] | [ eraser ]
 *
 * Positioned as a horizontal pill, fixed at bottom-center,
 * just above the main toolbar.
 */

// Subset of tldraw colors to show, in the order they appear in the reference image
const COLORS: Array<{ id: string; label: string }> = [
  { id: 'white', label: 'White' },
  { id: 'red', label: 'Red' },
  { id: 'orange', label: 'Orange' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'light-green', label: 'Light green' },
  { id: 'green', label: 'Green' },
  { id: 'light-blue', label: 'Light blue' },
  { id: 'blue', label: 'Blue' },
  { id: 'violet', label: 'Violet' },
  { id: 'light-violet', label: 'Light violet' },
]

const SIZES: Array<{ id: 's' | 'm' | 'l' | 'xl'; dot: number }> = [
  { id: 's', dot: 4 },
  { id: 'm', dot: 8 },
]

export default function CustomStylePanel() {
  const editor = useEditor()
  const styles = useRelevantStyles()
  const theme = useDefaultColorTheme()

  const currentTool: string = useValue(
    'current tool',
    () => editor.getCurrentToolId(),
    [editor],
  )

  const setStyle = useCallback(
    (style: typeof DefaultColorStyle | typeof DefaultSizeStyle, value: string) => {
      editor.run(() => {
        editor.markHistoryStoppingPoint('style change')
        if (editor.isIn('select')) {
          editor.setStyleForSelectedShapes(style as never, value as never)
        }
        editor.setStyleForNextShapes(style as never, value as never)
        editor.updateInstanceState({ isChangingStyle: true })
      })
    },
    [editor],
  )

  const activateEraser = useCallback(() => {
    editor.setCurrentTool('eraser')
  }, [editor])

  // Only show for the pen (draw) tool, per user preference
  if (currentTool !== 'draw') return null
  if (!styles) return null

  const color = styles.get(DefaultColorStyle)
  const size = styles.get(DefaultSizeStyle)

  const hasColor = color !== undefined
  const hasSize = size !== undefined
  if (!hasColor && !hasSize) return null

  const currentColor = color?.type === 'shared' ? (color.value as string) : null
  const currentSize = size?.type === 'shared' ? (size.value as string) : null

  const getColorHex = (name: string): string => {
    const entry = (theme as Record<string, unknown>)[name]
    if (entry && typeof entry === 'object' && 'solid' in entry) {
      return (entry as { solid: string }).solid
    }
    return '#ffffff'
  }

  return (
    <div className="space-style-pill">
      {hasSize && (
        <div className="space-style-group">
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              onPointerDown={() => setStyle(DefaultSizeStyle, s.id)}
              data-active={currentSize === s.id}
              className="space-style-btn"
              title={`Size ${s.id.toUpperCase()}`}
              aria-label={`Size ${s.id}`}
            >
              <span
                className="space-pen-dot"
                style={{
                  width: s.dot,
                  height: s.dot,
                  background: currentColor ? getColorHex(currentColor) : '#f2f2f2',
                }}
              />
            </button>
          ))}
        </div>
      )}

      {hasSize && hasColor && <div className="space-style-sep" />}

      {hasColor && (
        <div className="space-style-group">
          {COLORS.map((c) => {
            const fill = getColorHex(c.id)
            const isActive = currentColor === c.id
            return (
              <button
                key={c.id}
                type="button"
                onPointerDown={() => setStyle(DefaultColorStyle, c.id)}
                data-active={isActive}
                className="space-color-btn"
                title={c.label}
                aria-label={c.label}
              >
                <span
                  className="space-color-dot"
                  style={{ background: fill }}
                />
              </button>
            )
          })}
        </div>
      )}

      <div className="space-style-sep" />

      {hasColor && (
        <CustomColorButton
          apply={(id) => setStyle(DefaultColorStyle, id)}
          editorRefresh={() => {
            // Force tldraw to re-render shapes with the updated palette slot
            editor.updateInstanceState({ isChangingStyle: true })
            requestAnimationFrame(() =>
              editor.updateInstanceState({ isChangingStyle: false }),
            )
          }}
        />
      )}

      <button
        type="button"
        onPointerDown={activateEraser}
        data-active={currentTool === 'eraser'}
        className="space-style-btn"
        title="Eraser (E)"
        aria-label="Eraser"
      >
        <Eraser size={14} />
      </button>
    </div>
  )
}

/* =====================================================================
 * Custom color (rainbow) button + popover picker
 * ===================================================================== */
interface CustomColorButtonProps {
  apply: (paletteId: string) => void
  editorRefresh: () => void
}

function CustomColorButton({ apply, editorRefresh }: CustomColorButtonProps) {
  const [open, setOpen] = useState(false)
  const [hex, setHex] = useState('#1e9466')
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const onChange = useCallback(
    (next: string) => {
      setHex(next)
      // Mutate the reserved palette slot to render in this exact hex,
      // then apply that style id so the next pen stroke uses it.
      setCustomDrawColor(next)
      apply(CUSTOM_COLOR_ID)
      editorRefresh()
    },
    [apply, editorRefresh],
  )

  return (
    <div className="space-cp-wrap" ref={wrapperRef}>
      <button
        type="button"
        title="Custom draw color"
        aria-label="Custom draw color"
        onPointerDown={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="space-color-btn space-rainbow-btn"
        data-active={open}
      >
        <span className="space-rainbow-dot" />
      </button>
      {open && (
        <div className="space-cp-popover" onPointerDown={(e) => e.stopPropagation()}>
          <CustomColorPicker value={hex} onChange={(h) => onChange(h)} />
          <div className="space-cp-tooltip">Custom draw color</div>
        </div>
      )}
    </div>
  )
}
