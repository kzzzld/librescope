# AGENTS.md

Guidance for agents working in this repository.

## Introduction

LibreScope is deliberately code-light: the app is a generic viewer and nearly
all of its substance lives in `public/data.json`. **When asked to extend, fix or
enrich the graph, your first move is to add to `public/data.json` — not to write
more code.**

Adding a topic is a data edit, not a programming task: put it under the right
parent, give it a `name` and a `description`, and add an `id` only when it must
merge with a node elsewhere. Reach for `src/` only when the request genuinely
cannot be expressed as data — a new interaction, a new field, a layout change.

Either way, commit the change.

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
- App chrome lives in `src/components/`: `NodePanel.tsx` is the node side panel
  and `SettingsDialog.tsx` is the settings popup, opened from the header gear.
- There are two views of the same `Graph`, switched in Settings → Layout:
  `Graph.tsx` (force-directed SVG) and `TreeView.tsx` (indented outline built
  from `graph.outline`). Both read the same data and share hover/selection, which
  `App.tsx` owns. The chosen view sits in `src/preferences.ts` and is remembered
  in `localStorage`.

## Theming

Colour schemes are data plus CSS, and adding one is deliberately small.

1. Add a `:root[data-theme='<id>']` block to `src/style.css` setting the seven
   base tokens only: `--bg`, `--surface`, `--fg`, `--muted`, `--accent`, `--node`
   and `--node-shared`. Add `color-scheme: light` for light themes.
2. Add an entry to `THEMES` in `src/themes.ts` — `id`, `label`, and four preview
   swatches (`background`, `node`, `shared node`, `text`).

Do not hardcode colours in component CSS; use a token. Everything else
(`--border`, `--edge`, `--text-body`, hover/soft tints, `--backdrop`, `--shadow`)
is derived from the seven in `:root` with `color-mix`, so it follows the active
theme automatically. The picker writes `<html data-theme="…">` and remembers the
choice in `localStorage` (`src/themes.ts`).

## Data format (`public/data.json`)

A nested tree of nodes. Each node has a `name`, optional `children`, and
optional `id`, `description` and `url`:

```json
{
  "name": "Desktop",
  "description": "What Desktop means in this graph.",
  "children": [
    {
      "name": "Linux",
      "description": "The kernel and its ecosystem.",
      "url": "https://www.kernel.org/",
      "children": []
    },
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
- **`url` is the official website**, shown as a link in the side panel. It is
  optional: **if the thing has no website of its own, leave the key out** rather
  than pointing at a wiki, a search result or a placeholder. Use a full
  `https://` URL, and prefer the project's own home over a GitHub mirror unless
  the repository really is its home. Verify the URL resolves before committing.
- One edge per **parent → child** relationship. Edges are never written by hand.
- Renaming a `name` changes its path, so it re-wires that branch.

### Adding content

To add a topic — a language, a package manager, a distro, a project:

1. Find the parent it belongs under. Identity is the path, so **where you put it
   is its name in the graph** (`Desktop/Linux/Distros/Debian`).
2. Add `{ "name": "...", "description": "..." }` to that parent's `children`,
   creating `children` if it has none. Match the existing 2-space indentation and
   comma style.
3. Write the `description` as one or two sentences of plain prose: what the thing
   is and why it belongs here. No marketing, no bullet lists.
4. Add `"url"` if it has a website of its own. Omit the key when it does not —
   never invent one. Check the URL resolves before committing.
5. Add `"id": "..."` only when the same thing genuinely belongs to two branches
   and should be one shared node, like `rpm`.
6. Confirm the JSON still parses (`node -e "JSON.parse(require('fs').readFileSync('public/data.json'))"`),
   then commit.

Do not add edges — they come from the tree structure. Do not invent fields: the
whole vocabulary is `name`, `id`, `description`, `url` and `children`.

## Packaging

- `Dockerfile` builds the site with Node and serves `dist/` from nginx, in two
  stages so the runtime image has no toolchain. If you change the container port,
  keep `EXPOSE` and the mapping in `docker-compose.yml` in step.
- `flake.nix` provides three things: a dev shell (`nix develop`), the package
  (`nix build` — a static site, built with `buildNpmPackage`), and
  `nixosModules.default`, which serves that build with nginx on
  `services.librescope.port` (default 5555). Dependencies come from
  `package-lock.json` through `importNpmLock`, so there is no `npmDepsHash` to
  refresh when they move.
- Neither needs any change to the app: the build is a plain static site, and Vite
  copies `public/data.json` into `dist/` on its own.

## Commands

```bash
npm install     # install dependencies
npm run dev     # start the Vite dev server
npm run build   # type-check and build to dist/
npm run preview # preview the production build
```
