import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

/* ============================================================
 * Color conversion helpers
 * ============================================================ */
type RGB = { r: number; g: number; b: number }
type HSV = { h: number; s: number; v: number }

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function hsvToRgb({ h, s, v }: HSV): RGB {
  const c = v * s
  const hp = (h % 360) / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let r1 = 0,
    g1 = 0,
    b1 = 0
  if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0]
  else if (hp < 2) [r1, g1, b1] = [x, c, 0]
  else if (hp < 3) [r1, g1, b1] = [0, c, x]
  else if (hp < 4) [r1, g1, b1] = [0, x, c]
  else if (hp < 5) [r1, g1, b1] = [x, 0, c]
  else [r1, g1, b1] = [c, 0, x]
  const m = v - c
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  }
}

function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  const v = max
  return { h, s, v }
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => clamp(n, 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/* ============================================================
 * Picker
 * ============================================================ */
interface Props {
  /** Initial hex color, e.g. "#1e9466" */
  value: string
  onChange: (hex: string, alpha: number) => void
  initialAlpha?: number
}

export default function CustomColorPicker({ value, onChange, initialAlpha = 1 }: Props) {
  // Parse initial hex → HSV
  const initial = useMemo(() => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value)
    if (!m) return { h: 150, s: 0.8, v: 0.6 }
    return rgbToHsv({
      r: parseInt(m[1], 16),
      g: parseInt(m[2], 16),
      b: parseInt(m[3], 16),
    })
  }, [value])

  const [hsv, setHsv] = useState<HSV>(initial)
  const [alpha, setAlpha] = useState(initialAlpha)

  const rgb = useMemo(() => hsvToRgb(hsv), [hsv])
  const hex = useMemo(() => rgbToHex(rgb), [rgb])

  // Notify parent whenever color changes
  useEffect(() => {
    onChange(hex, alpha)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex, alpha])

  /* ---------- SV gradient drag ---------- */
  const svRef = useRef<HTMLDivElement>(null)
  const onSvPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = svRef.current
      if (!el) return
      el.setPointerCapture(e.pointerId)
      const update = (clientX: number, clientY: number) => {
        const rect = el.getBoundingClientRect()
        const x = clamp((clientX - rect.left) / rect.width, 0, 1)
        const y = clamp((clientY - rect.top) / rect.height, 0, 1)
        setHsv((prev) => ({ ...prev, s: x, v: 1 - y }))
      }
      update(e.clientX, e.clientY)
      const onMove = (ev: PointerEvent) => update(ev.clientX, ev.clientY)
      const onUp = (ev: PointerEvent) => {
        el.releasePointerCapture(ev.pointerId)
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerup', onUp)
      }
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerup', onUp)
    },
    [],
  )

  /* ---------- RGB inputs ---------- */
  const setChannel = (key: 'r' | 'g' | 'b', val: string) => {
    const n = clamp(parseInt(val || '0', 10) || 0, 0, 255)
    const next = { ...rgb, [key]: n }
    setHsv(rgbToHsv(next))
  }

  /* ---------- Hue slider ---------- */
  const onHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHsv((prev) => ({ ...prev, h: Number(e.target.value) }))
  }

  /* ---------- Alpha slider ---------- */
  const onAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAlpha(Number(e.target.value) / 100)
  }

  const hueColor = rgbToHex(hsvToRgb({ h: hsv.h, s: 1, v: 1 }))

  return (
    <div className="space-cp-root">
      {/* SV gradient square */}
      <div
        ref={svRef}
        className="space-cp-sv"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})` }}
        onPointerDown={onSvPointerDown}
      >
        <div
          className="space-cp-sv-handle"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
          }}
        />
      </div>

      {/* Bottom row: current swatch + hue slider */}
      <div className="space-cp-row">
        <span className="space-cp-swatch" style={{ background: hex, opacity: alpha }} />
        <div className="space-cp-sliders">
          <input
            type="range"
            min={0}
            max={359}
            value={Math.round(hsv.h)}
            onChange={onHueChange}
            className="space-cp-hue"
            aria-label="Hue"
          />
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(alpha * 100)}
            onChange={onAlphaChange}
            className="space-cp-alpha"
            style={{
              backgroundImage: `linear-gradient(to right, transparent, ${hex})`,
            }}
            aria-label="Opacity"
          />
        </div>
      </div>

      {/* RGB inputs */}
      <div className="space-cp-rgb">
        {(['r', 'g', 'b'] as const).map((k) => (
          <div className="space-cp-rgb-col" key={k}>
            <input
              type="number"
              min={0}
              max={255}
              value={rgb[k]}
              onChange={(e) => setChannel(k, e.target.value)}
              className="space-cp-rgb-input"
            />
            <span className="space-cp-rgb-label">{k.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
