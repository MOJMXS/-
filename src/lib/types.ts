export interface ProjectMeta {
  id: string
  name: string
  color: string
  createdAt: number
  updatedAt: number
}

export const PROJECT_COLORS = [
  '#22c55e', // green (default)
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#737373', // neutral
] as const
