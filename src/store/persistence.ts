import { get, set, del, keys } from 'idb-keyval'
import type { ProjectMeta } from '../lib/types'

const PROJECTS_KEY = 'space:projects'
const ACTIVE_PROJECT_KEY = 'space:activeProjectId'

export async function loadProjects(): Promise<ProjectMeta[]> {
  const v = await get<ProjectMeta[]>(PROJECTS_KEY)
  return v ?? []
}

export async function saveProjects(projects: ProjectMeta[]): Promise<void> {
  await set(PROJECTS_KEY, projects)
}

export async function loadActiveProjectId(): Promise<string | null> {
  const v = await get<string>(ACTIVE_PROJECT_KEY)
  return v ?? null
}

export async function saveActiveProjectId(id: string | null): Promise<void> {
  if (id === null) {
    await del(ACTIVE_PROJECT_KEY)
  } else {
    await set(ACTIVE_PROJECT_KEY, id)
  }
}

/** Delete all tldraw persistence keys for a given project. */
export async function deleteProjectCanvasData(projectId: string): Promise<void> {
  const allKeys = await keys()
  const prefix = `TLDRAW_DOCUMENT_v2space-${projectId}`
  for (const k of allKeys) {
    if (typeof k === 'string' && k.startsWith(prefix)) {
      await del(k)
    }
  }
}

export function projectPersistenceKey(projectId: string): string {
  return `space-${projectId}`
}
