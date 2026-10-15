# LibreScope

Explore the open-source ecosystem as an interactive node graph, in the spirit of
Obsidian's graph view. Nodes and edges are generated automatically from a single
JSON tree — you write the hierarchy, LibreScope draws the graph.

## Data

Edit `public/data.json`. It is a nested tree where each node has a `name`,
optional `children`, and an optional `id`, `description` and `url`:

```json
{
  "name": "Desktop",
  "description": "Desktop computing, and the two families under it.",
  "children": [
    {
      "name": "Linux",
      "url": "https://www.kernel.org/",
      "children": [{ "name": "Init Systems", "children": [{ "name": "systemd" }] }]
    }
  ]
}
```

- A node is identified by its **path from the root** (`Desktop/Linux/Distros`),
  so the same name in two branches stays as two separate nodes — `Distros` under
  Linux and `Distros` under BSD are distinct.
- Add an **`id`** to override that and merge nodes across branches. `rpm` carries
  `"id": "rpm"` under both Fedora and openSUSE, which makes it one shared hub.
- Add a **`description`** to show prose in the side panel for that node.
- Add a **`url`** to show a website link in the side panel. Omit it when the
  thing has no site of its own — the panel then simply shows no link.
- Every parent → child pair becomes an edge. You never write edges yourself.

Because the graph is built from the file itself, no rebuild is needed: edit
`public/data.json`, save, and the running dev server picks it up.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the production build |

## Interactions

- Drag the background to pan, scroll to zoom.
- Drag a node to move it; the simulation rebalances around it.
- Hover a node to highlight its neighbours.
- Click a node to open a side panel with its description, its website (when it
  has one) and its connections; click a connection in the panel to jump to it, or
  press × to close.
- Node size follows hierarchy depth: the root is largest, leaves are smallest.
- Open **Settings** from the gear button in the header. Escape, the × button or a
  click outside close it.

## Themes

Settings offers a colour scheme: LibreScope Dark (the default), Catppuccin Mocha
and Latte, Tokyo Night, Solarized Dark and Light, Gruvbox Dark, Nord, Dracula,
One Dark, One Light and Rosé Pine. Your choice is remembered in `localStorage`.

A theme is a `:root[data-theme='…']` block in `src/style.css` that sets seven
base colours, plus an entry in `src/themes.ts` for the picker. Everything else —
borders, graph edges, body text, hover tints, the modal scrim — is derived from
those seven, so a new theme is a short block and nothing else needs touching.
