# LibreScope

Explore the open-source ecosystem as an interactive node graph, in the spirit of
Obsidian's graph view. Nodes and edges are generated automatically from a single
JSON tree — you write the hierarchy, LibreScope draws the graph.

## Data

Edit `public/data.json`. It is a nested tree where each node has a `name`,
optional `children`, and an optional `id`:

```json
{
  "name": "Desktop",
  "children": [
    {
      "name": "Linux",
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
- Hover or select a node to highlight its neighbours.
