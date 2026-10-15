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

## Docker

```bash
docker compose up --build   # http://localhost:8080
```

The `Dockerfile` is two stages: Node builds the site, then nginx serves the
result, so the runtime image carries no toolchain. `docker build -t librescope .`
works too if you'd rather not use Compose.

## Nix

**Development shell**

```bash
nix develop     # a shell with Node and npm
npm install
npm run dev
```

**Build**

```bash
nix build       # result/share/librescope
```

Dependencies are taken from `package-lock.json` via `importNpmLock`, so there is
no `npmDepsHash` to refresh when dependencies move.

**Deploy on NixOS**

The flake exports a NixOS module. Add this repository as an input and import it:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    librescope.url = "git+ssh://forgejo@git.kzzzl.xyz/kzzzl/LibreScope.git";
  };

  outputs = { self, nixpkgs, librescope, ... }: {
    nixosConfigurations.vps = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        ./configuration.nix
        librescope.nixosModules.default
        {
          services.librescope = {
            enable = true;
            hostName = "librescope.example.com";
            enableACME = true;
            forceSSL = true;
          };
        }
      ];
    };
  };
}
```

Options: `enable`, `package`, `hostName`, `port` (default 5555), `enableACME`,
`forceSSL`, `openFirewall`. Leave `hostName`/`enableACME` out for plain HTTP on
`port`; set them for a certificate. `enableACME` needs two other things in the
system configuration:

```nix
security.acme = {
  acceptTerms = true;                          # required by the ACME module
  defaults.email = "you@example.com";
};
```

Then point a DNS record at the VPS, make sure ports 80 and 443 reach it (the
module opens them in the firewall itself), and rebuild on the box:

```bash
sudo nixos-rebuild switch --flake ~/nix#vps
```

Two practical notes. `nixos-rebuild` fetches the flake as root, so root needs
read access to a private repository — a deploy key on the forge, a public repo,
or a local clone referenced with `url = "path:/srv/librescope"`. And the input is
pinned in your config's `flake.lock`, so use `nix flake update librescope` to
pick up new commits rather than expecting them automatically.

If you'd rather not pull a second nixpkgs, add
`inputs.librescope.inputs.nixpkgs.follows = "nixpkgs"` — your own nixpkgs then
builds the app, which requires it to be recent enough to provide
`importNpmLock`.

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

## Views

Settings → **Layout** switches between two ways of reading the same data:

- **Graph** — the force-directed node graph.
- **Tree** — the hierarchy as an indented outline, matching how it is written in
  `data.json`.

They share selection: clicking a row in the tree opens the same side panel, and a
merged node like `rpm` appears in both of its branches and highlights in both.
In the tree, a node's **name selects** it while its **dot folds that branch
away** and back. The chosen view is remembered in `localStorage`.

## Themes

Settings offers a colour scheme: LibreScope Dark (the default), Catppuccin Mocha
and Latte, Tokyo Night, Solarized Dark and Light, Gruvbox Dark, Nord, Dracula,
One Dark, One Light and Rosé Pine. Your choice is remembered in `localStorage`.

A theme is a `:root[data-theme='…']` block in `src/style.css` that sets seven
base colours, plus an entry in `src/themes.ts` for the picker. Everything else —
borders, graph edges, body text, hover tints, the modal scrim — is derived from
those seven, so a new theme is a short block and nothing else needs touching.

## License

MIT — see [LICENSE](LICENSE).
