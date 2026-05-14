import { create } from 'zustand'
import { PROJECT_COLORS, type ProjectMeta } from '../lib/types'
import {
  loadProjects,
  saveProjects,
  loadActiveProjectId,
  saveActiveProjectId,
  deleteProjectCanvasData,
} from './persistence'

interface ProjectsState {
  projects: ProjectMeta[]
  activeId: string | null
  hydrated: boolean
  hydrate: () => Promise<void>
  createProject: (name?: string) => Promise<ProjectMeta>
  renameProject: (id: string, name: string) => Promise<void>
  recolorProject: (id: string, color: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setActive: (id: string | null) => Promise<void>
  touchProject: (id: string) => Promise<void>
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function pickColor(existing: ProjectMeta[]): string {
  const used = new Set(existing.map((p) => p.color))
  for (const c of PROJECT_COLORS) {
    if (!used.has(c)) return c
  }
  return PROJECT_COLORS[0]
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  activeId: null,
  hydrated: false,

  hydrate: async () => {
    const [projects, activeId] = await Promise.all([loadProjects(), loadActiveProjectId()])
    let finalProjects = projects
    let finalActive = activeId

    // Bootstrap with a default project on first run
    if (finalProjects.length === 0) {
      const now = Date.now()
      const first: ProjectMeta = {
        id: genId(),
        name: 'My First Canvas',
        color: PROJECT_COLORS[0],
        createdAt: now,
        updatedAt: now,
      }
      finalProjects = [first]
      finalActive = first.id
      await saveProjects(finalProjects)
      await saveActiveProjectId(finalActive)
    } else if (!finalActive || !finalProjects.find((p) => p.id === finalActive)) {
      finalActive = finalProjects[0].id
      await saveActiveProjectId(finalActive)
    }

    set({ projects: finalProjects, activeId: finalActive, hydrated: true })
  },

  createProject: async (name = 'Untitled') => {
    const now = Date.now()
    const project: ProjectMeta = {
      id: genId(),
      name,
      color: pickColor(get().projects),
      createdAt: now,
      updatedAt: now,
    }
    const next = [project, ...get().projects]
    await saveProjects(next)
    await saveActiveProjectId(project.id)
    set({ projects: next, activeId: project.id })
    return project
  },

  renameProject: async (id, name) => {
    const next = get().projects.map((p) =>
      p.id === id ? { ...p, name, updatedAt: Date.now() } : p,
    )
    await saveProjects(next)
    set({ projects: next })
  },

  recolorProject: async (id, color) => {
    const next = get().projects.map((p) => (p.id === id ? { ...p, color } : p))
    await saveProjects(next)
    set({ projects: next })
  },

  deleteProject: async (id) => {
    const next = get().projects.filter((p) => p.id !== id)
    await saveProjects(next)
    await deleteProjectCanvasData(id)
    let newActive = get().activeId
    if (newActive === id) {
      newActive = next[0]?.id ?? null
      await saveActiveProjectId(newActive)
    }
    set({ projects: next, activeId: newActive })
  },

  setActive: async (id) => {
    await saveActiveProjectId(id)
    set({ activeId: id })
  },

  touchProject: async (id) => {
    const next = get().projects.map((p) =>
      p.id === id ? { ...p, updatedAt: Date.now() } : p,
    )
    await saveProjects(next)
    set({ projects: next })
  },
}))
