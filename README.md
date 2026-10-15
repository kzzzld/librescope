# LibreScope

Explore the open-source ecosystem as an interactive node graph, in the spirit of
Obsidian's graph view. Nodes and edges are generated automatically from a single
JSON tree — you write the hierarchy, LibreScope draws the graph.

## Data

Edit `public/data.json`. It is a nested tree where each node has a `name` and
optional `children`:

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

- One node per unique name; a repeated name (like `rpm` under Fedora and openSUSE)
  becomes a single shared node.
- Every parent → child pair becomes an edge. You never write edges yourself.

Because the graph is built from the file names, no rebuild is needed: edit
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
