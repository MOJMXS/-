import { useCallback, useMemo } from 'react'
import { Tldraw, type Editor, type TLComponents } from 'tldraw'
import { useProjectsStore } from '../store/projectsStore'
import { projectPersistenceKey } from '../store/persistence'
import CustomToolbar from './CustomToolbar'
import CustomLeftRail from './CustomLeftRail'

const EmptyStylePanel = () => null
const EmptyHelperButtons = () => null

interface CanvasViewProps {
  projectId: string
  onMount: (editor: Editor) => void
}

export default function CanvasView({ projectId, onMount }: CanvasViewProps) {
  const touchProject = useProjectsStore((s) => s.touchProject)

  const handleMount = useCallback(
    (editor: Editor) => {
      onMount(editor)
      // Keep pen/highlight stroke thickness constant on screen across zoom.
      // tldraw ships this behavior as a user preference; just enable it.
      editor.user.updateUserPreferences({ isDynamicSizeMode: true })
      // Mark project as updated on first interaction
      const dispose = editor.store.listen(
        () => {
          touchProject(projectId)
        },
        { source: 'user', scope: 'document' },
      )
      // Cleanup tracked by tldraw on unmount
      return () => dispose()
    },
    [projectId, onMount, touchProject],
  )

  const components: TLComponents = useMemo(
    () => ({
      StylePanel: EmptyStylePanel,
      Toolbar: CustomToolbar,
      NavigationPanel: CustomLeftRail,
      HelperButtons: EmptyHelperButtons,
    }),
    [],
  )

  return (
    <div className="relative h-full w-full">
      <Tldraw
        key={projectId}
        persistenceKey={projectPersistenceKey(projectId)}
        onMount={handleMount}
        components={components}
        inferDarkMode
      />
    </div>
  )
}
