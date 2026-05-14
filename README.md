# Space — Personal Canvas

A Higgsfield-style infinite canvas web app for personal use: organize information, sketch ideas, and manage projects on multiple boards. Dark theme, runs entirely in your browser with local IndexedDB persistence.

## Tech

- React 18 + Vite + TypeScript
- `tldraw` (infinite canvas engine, dark theme)
- Zustand (project list state)
- IndexedDB via `idb-keyval` (local-only storage)
- TailwindCSS + lucide-react

## Features (MVP)

- Multiple projects in a left sidebar (create, rename, recolor, delete, search)
- Each project has its own infinite canvas with full tldraw toolset:
  select, hand, draw, sticky note, shapes, text, arrow, eraser, frames
- Pages inside a project (native tldraw feature)
- Editable project name in top bar
- Export current canvas as PNG
- All data persisted locally in your browser (IndexedDB) — no server, no account

## Run

```powershell
npm install
npm run dev
```

Then open the URL Vite prints (default: <http://localhost:5173>).

## Build

```powershell
npm run build
npm run preview
```

## Data storage

Everything is stored in your browser's IndexedDB under these keys:

- `space:projects` — list of project metadata
- `space:activeProjectId` — last opened project
- `TLDRAW_DOCUMENT_v2space-<projectId>...` — canvas data per project (managed by tldraw)

Clearing your browser's site data will erase all projects. A future iteration can add export/import (JSON) and optional cloud sync.

## Keyboard shortcuts (from tldraw)

- `V` select · `H` hand · `D`/`P` draw · `T` text · `R` rectangle · `O` ellipse · `A` arrow · `N` sticky note
- `Cmd/Ctrl + Z` undo · `Cmd/Ctrl + Shift + Z` redo
- `Cmd/Ctrl + /` cheatsheet
