# Trello Clone (Next.js + TypeScript + SCSS)

A simple Trello-like board (single fixed board) with:
- Board title inline editing
- Lists: add / delete / inline edit title / drag & drop horizontally
- Cards: add / inline edit title / drag & drop within and across lists
- Comments modal for each card (view + add comments)
- Client-side persistence via `localStorage`
- Responsive layout (desktop-first, basic mobile support)

## Tech Stack
- Next.js (App Router)
- TypeScript
- SCSS (globals + CSS Modules)
- Zustand (state management)
- @dnd-kit (drag & drop)

## Getting Started

> Requires Node 18+

Install dependencies:
```bash
npm install
```

Run dev server:
```bash
npm run dev
```

Build:
```bash
npm run build
npm run start
```

## Notes
- Everything is client-side. No backend.
- Data is stored in `localStorage` under key: `trello_clone_v1`.
- If you want to reset, clear site data or remove that key from DevTools.

## Project Structure (high-level)
- `src/app` – Next.js App Router
- `src/components` – UI components (board, lists, cards, modal, shared UI)
- `src/store` – Zustand store (board + actions)
- `src/services` – storage + small utilities
- `src/lib` – pure helpers (reorder/move)
- `src/styles` – SCSS variables, mixins, globals
- `src/types` – shared TS types
