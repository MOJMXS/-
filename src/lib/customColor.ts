import { DefaultColorThemePalette } from 'tldraw'

/**
 * Reserves one palette slot ('light-red') for the user's custom draw color.
 * When the user picks a hex from the color picker, we mutate this slot in
 * tldraw's color palette so any shape drawn with style='light-red' renders
 * using that exact hex.
 *
 * Known limitation: all shapes previously drawn with a custom color share the
 * latest hex (since they all use the same palette slot). For a personal canvas
 * this is acceptable; per-shape custom colors would require a custom shape util.
 */
export const CUSTOM_COLOR_ID = 'light-red' as const

export function setCustomDrawColor(hex: string): void {
  const slots = [
    DefaultColorThemePalette.lightMode[CUSTOM_COLOR_ID],
    DefaultColorThemePalette.darkMode[CUSTOM_COLOR_ID],
  ]
  for (const c of slots) {
    if (!c) continue
    c.solid = hex
    c.fill = hex
    c.semi = hex
    c.pattern = hex
    if (c.note) c.note.fill = hex
    if (c.highlight) c.highlight.srgb = hex
  }
}
