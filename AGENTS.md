# AGENTS.md

Guidance for agents working in this repository.

## Project

LibreScope is a web app for exploring the open-source ecosystem as an interactive
node graph (Obsidian graph-view style). Data lives in a single JSON tree; edges are
derived automatically from the hierarchy rather than being written by hand.

## Git policy (important)

- **Commit after every change. Do not ask for permission to commit.**
- **Never push.** Do not run `git push` unless the user explicitly asks for it in
  the current message. Committing locally is always fine; publishing is not.
- Use small, focused commits with a conventional prefix:
  `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`, `test:`.
- Stage only the files you actually changed. Never commit `node_modules` or `dist`.
- Do not rewrite history (`rebase`, `reset --hard`, `commit --amend`) on commits
  that already exist unless the user asks.

## Stack

- React + TypeScript, bundled with Vite.
- Graph rendering is hand-rolled SVG driven by `d3-force` (layout), `d3-zoom`
  (pan/zoom) and `d3-drag` (node dragging).
- The force simulation ticks mutate SVG attributes via refs; React state is
  reserved for hover/selection. Do not push per-tick positions into React state.

## Data format (`public/data.json`)

A nested tree of nodes. Each node has a `name`, optional `children`, and
optional `id` and `description`:

```json
{
  "name": "Desktop",
  "description": "What Desktop means in this graph.",
  "children": [
    { "name": "Linux", "children": [{ "name": "Init Systems", "children": [] }] },
    { "name": "rpm", "id": "rpm" }
  ]
}
```

Rules:

- **Identity is the path from the root** (`Desktop/Linux/Distros`), so two nodes
  with the same name in different branches stay separate. `Linux/Distros` and
  `BSD/Distros` are two nodes, both labelled `Distros`.
- **An explicit `id` overrides the path.** Give the same `id` to a node in two
  places to merge them into one shared node — that is how `rpm` stays a single
  hub under both Fedora and openSUSE.
- **`description` is optional prose** shown in the side panel when the node is
  selected. A sentence or two is plenty. For a merged node the first occurrence
  wins.
- One edge per **parent → child** relationship. Edges are never written by hand.
- Renaming a `name` changes its path, so it re-wires that branch.

## Commands

```bash
npm install     # install dependencies
npm run dev     # start the Vite dev server
npm run build   # type-check and build to dist/
npm run preview # preview the production build
```
