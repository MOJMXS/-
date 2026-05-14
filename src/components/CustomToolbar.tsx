import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowShapeKindStyle,
  AssetRecordType,
  MediaHelpers,
  createShapeId,
  useEditor,
  useValue,
} from 'tldraw'
import {
  MousePointer2,
  Hand,
  ThumbsUp,
  MessageCircle,
  Plus,
  Image as ImageIcon,
} from 'lucide-react'
import CustomStylePanel from './CustomStylePanel'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * Custom bottom toolbar matching the reference design exactly:
 *  [ Select | Hand | Pen | Sticky | Shape | T | Arrow | 👍 | 💬 | + ]
 *
 * Each button is a circular dark icon; the active tool is highlighted white.
 */
export default function CustomToolbar() {
  const editor = useEditor()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentTool = useValue(
    'current tool id',
    () => editor.getCurrentToolId(),
    [editor],
  )

  const useTool = useCallback(
    (id: string) => () => editor.setCurrentTool(id),
    [editor],
  )

  /** Drop a text shape with the given emoji near the viewport center. */
  const dropEmoji = useCallback(
    (emoji: string) => {
      const center = editor.getViewportPageBounds().center
      const id = createShapeId()
      editor.createShape({
        id,
        type: 'text',
        x: center.x - 40,
        y: center.y - 40,
        props: {
          richText: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: emoji }],
              },
            ],
          },
          size: 'xl',
          autoSize: true,
        },
      })
      editor.setCurrentTool('select')
      editor.select(id)
    },
    [editor],
  )

  const onPickImage = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      try {
        const size = await MediaHelpers.getImageSize(file)
        const dataUrl = await blobToDataUrl(file)
        const assetId = AssetRecordType.createId()
        editor.createAssets([
          {
            id: assetId,
            type: 'image',
            typeName: 'asset',
            props: {
              name: file.name,
              src: dataUrl,
              w: size.w,
              h: size.h,
              mimeType: file.type,
              isAnimated: false,
            },
            meta: {},
          },
        ])
        const center = editor.getViewportPageBounds().center
        editor.createShape({
          type: 'image',
          x: center.x - size.w / 2,
          y: center.y - size.h / 2,
          props: { assetId, w: size.w, h: size.h },
        })
      } catch (err) {
        console.error('Failed to insert image', err)
      }
    },
    [editor],
  )

  type Btn = {
    key: string
    title: string
    active: boolean
    onClick: () => void
    icon: React.ReactNode
  }

  const buttons: Btn[] = [
    {
      key: 'select',
      title: 'Select (V)',
      active: currentTool === 'select',
      onClick: useTool('select'),
      icon: <MousePointer2 size={19} strokeWidth={1.75} />,
    },
    {
      key: 'hand',
      title: 'Hand (H)',
      active: currentTool === 'hand',
      onClick: useTool('hand'),
      icon: <Hand size={19} strokeWidth={1.75} />,
    },
    {
      key: 'draw',
      title: 'Pen (D)',
      active: currentTool === 'draw',
      onClick: useTool('draw'),
      icon: <PenIcon />,
    },
    {
      key: 'note',
      title: 'Sticky note (N)',
      active: currentTool === 'note',
      onClick: useTool('note'),
      icon: <StickyIcon />,
    },
    {
      key: 'geo',
      title: 'Shape (R)',
      active: currentTool === 'geo',
      onClick: useTool('geo'),
      icon: <BlobIcon />,
    },
    {
      key: 'text',
      title: 'Text (T)',
      active: currentTool === 'text',
      onClick: useTool('text'),
      icon: <TextT />,
    },
    {
      key: 'thumbsup',
      title: 'Add 👍',
      active: false,
      onClick: () => dropEmoji('👍'),
      icon: <ThumbsUp size={18} strokeWidth={1.75} />,
    },
    {
      key: 'comment',
      title: 'Add comment note',
      active: false,
      onClick: () => {
        editor.setCurrentTool('note')
      },
      icon: <MessageCircle size={18} strokeWidth={1.75} />,
    },
    {
      key: 'plus',
      title: 'Insert image',
      active: false,
      onClick: onPickImage,
      icon: <Plus size={19} strokeWidth={2} />,
    },
  ]

  return (
    <div className="space-toolbar-stack">
      <CustomStylePanel />
      <div className="space-toolbar">
        {buttons.slice(0, 6).map((b) => (
          <button
            key={b.key}
            type="button"
            title={b.title}
            aria-label={b.title}
            data-active={b.active}
            onPointerDown={b.onClick}
            className="space-toolbar-btn"
          >
            {b.icon}
          </button>
        ))}
        <ArrowMenuButton />
        {buttons.slice(6).map((b) => (
          <button
            key={b.key}
            type="button"
            title={b.title}
            aria-label={b.title}
            data-active={b.active}
            onPointerDown={b.onClick}
            className="space-toolbar-btn"
          >
            {b.icon}
          </button>
        ))}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
    </div>
  )
}

/* ----- Inline custom icons (colored / shaped to match the reference) ----- */

function PenIcon() {
  // White-tipped marker, angled like the reference
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 18l-2 3 3-2 10-10-1-1z"
        fill="#f5f5f5"
        stroke="#f5f5f5"
        strokeWidth="0.6"
      />
      <rect
        x="14.5"
        y="4.8"
        width="5.5"
        height="3.6"
        rx="0.8"
        transform="rotate(45 17.2 6.6)"
        fill="#d4d4d4"
      />
    </svg>
  )
}

function StickyIcon() {
  // Yellow folded square sticky note
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 4h12l4 4v12H4z"
        fill="#facc15"
      />
      <path d="M16 4v4h4" fill="#eab308" />
    </svg>
  )
}

function BlobIcon() {
  // Green organic blob with small white highlight (matches reference)
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 7c2-3 7-4 10-2 3 2 3 6 1 9-1 2-3 3-6 3-4 0-7-2-8-5-1-2 1-3 3-5z"
        fill="#22c55e"
      />
      <circle cx="16.2" cy="9.4" r="1.7" fill="#ffffff" fillOpacity="0.85" />
    </svg>
  )
}

function TextT() {
  return (
    <span
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontWeight: 700,
        fontSize: 20,
        lineHeight: 1,
        color: '#e5e5e5',
      }}
    >
      T
    </span>
  )
}

// Image icon kept exported for potential future use (unused currently)
export { ImageIcon }

/* =====================================================================
 * Arrow tool button with sub-menu (Elbow / Curved / Straight / Line)
 * ===================================================================== */
type ArrowVariant = 'elbow' | 'curved' | 'straight' | 'line'

function ArrowMenuButton() {
  const editor = useEditor()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [variant, setVariant] = useState<ArrowVariant>('straight')

  const currentTool = useValue(
    'current tool id',
    () => editor.getCurrentToolId(),
    [editor],
  )
  const isToolActive = currentTool === 'arrow' || currentTool === 'line'

  // Close popover on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
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

  const apply = useCallback(
    (v: ArrowVariant) => {
      setVariant(v)
      setOpen(false)
      if (v === 'line') {
        editor.setCurrentTool('line')
        return
      }
      editor.setCurrentTool('arrow')
      editor.run(() => {
        editor.markHistoryStoppingPoint('arrow kind change')
        const kind = v === 'elbow' ? 'elbow' : 'arc'
        editor.setStyleForNextShapes(ArrowShapeKindStyle, kind)
        if (editor.isIn('select')) {
          editor.setStyleForSelectedShapes(ArrowShapeKindStyle, kind)
        }
      })
    },
    [editor],
  )

  const handleMainClick = useCallback(() => {
    // Toggle the popover. Also activate the tool with current variant.
    setOpen((v) => !v)
    if (variant === 'line') editor.setCurrentTool('line')
    else editor.setCurrentTool('arrow')
  }, [editor, variant])

  return (
    <div className="space-arrow-wrap" ref={wrapRef}>
      <button
        type="button"
        title="Arrow (A)"
        aria-label="Arrow"
        data-active={isToolActive}
        onPointerDown={(e) => {
          e.stopPropagation()
          handleMainClick()
        }}
        className="space-toolbar-btn"
      >
        <ArrowIcon variant={variant} />
      </button>

      {open && (
        <div className="space-arrow-menu" onPointerDown={(e) => e.stopPropagation()}>
          {(
            [
              { id: 'elbow', label: 'Elbow' },
              { id: 'curved', label: 'Curved' },
              { id: 'straight', label: 'Straight' },
              { id: 'line', label: 'Line' },
            ] as Array<{ id: ArrowVariant; label: string }>
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onPointerDown={() => apply(opt.id)}
              data-active={variant === opt.id}
              className="space-arrow-btn"
              title={opt.label}
              aria-label={opt.label}
            >
              <ArrowIcon variant={opt.id} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Inline SVGs for the four arrow variants — clean, line-only, white. */
function ArrowIcon({ variant }: { variant: ArrowVariant }) {
  const stroke = '#e5e5e5'
  const sw = 1.85
  switch (variant) {
    case 'elbow':
      // Right-angle arrow going up then right (like the reference "Elbow")
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 19 V9 H17"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 5 L17 9 L13 13"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'curved':
      // Diagonal curved arrow up-right
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 19 C 9 19, 16 16, 18 6"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M14 6 L18 6 L18 10"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      )
    case 'straight':
      // Straight diagonal arrow up-right (with arrowhead)
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 19 L18 6"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <path
            d="M11 6 L18 6 L18 13"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'line':
      // Plain diagonal line, no arrowhead
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 19 L19 5"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      )
  }
}
