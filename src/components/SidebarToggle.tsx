import { PanelLeft } from 'lucide-react'

interface Props {
  onClick: () => void
}

export default function SidebarToggle({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-canvas-panel/80 text-canvas-muted shadow-lg ring-1 ring-canvas-border backdrop-blur transition-colors hover:bg-canvas-active hover:text-canvas-text"
      title="Open projects"
      aria-label="Open projects"
    >
      <PanelLeft size={15} />
    </button>
  )
}
