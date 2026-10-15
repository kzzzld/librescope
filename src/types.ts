import type { SimulationNodeDatum } from 'd3-force'

/**
 * A node as written in `public/data.json`: a name, optional children, and an
 * optional `id` that overrides the node's identity.
 *
 * The tree is the only source of truth — edges are never written by hand.
 */
export interface TreeNode {
  name: string
  /**
   * Identity override. Without it a node is identified by its path from the
   * root (e.g. `Desktop/Linux/Distros`). Give the same `id` to a node in two
   * places to make them one shared node (e.g. `rpm` under Fedora and openSUSE).
   */
  id?: string
  /** Prose shown in the side panel when the node is selected. */
  description?: string
  /**
   * Official website. Omit it entirely when the thing has no home page of its
   * own (the app simply shows no link). Values are plain `https://` URLs.
   */
  url?: string
  children?: TreeNode[]
}

/**
 * A node in the derived graph.
 *
 * Identity is the node's `id` when the data provides one, otherwise its path
 * from the root (`Desktop/Linux/Distros`). Two nodes sharing an `id` collapse
 * into one shared node, which is how `rpm` stays a single hub under both Fedora
 * and openSUSE while the two `Distros` nodes stay separate.
 *
 * Extends `SimulationNodeDatum` so d3-force can write `x`, `y`, `vx`, `vy`.
 */
export interface GraphNode extends SimulationNodeDatum {
  /** Identity key: the explicit `id`, or the path from the root. */
  id: string
  /** Display label, taken from the first occurrence of this node. */
  name: string
  /** Prose shown in the side panel, taken from the first occurrence. */
  description: string
  /** Official website, when the node has one. Undefined means no link. */
  url?: string
  /** Path from the root, e.g. `Desktop/Linux/Distros`. */
  path: string
  /** Distance from the root: the root is 0, its children are 1, and so on. */
  depth: number
  /** Number of distinct edges touching this node. */
  degree: number
  /** How many times the tree referenced this node (2+ means merged/shared). */
  occurrences: number
  /** True when the node was referenced from more than one place. */
  isShared: boolean
}

/**
 * An edge derived from a parent → child relationship. `source` and `target`
 * hold direct references to the node objects, so layout updates stay in sync.
 */
export interface GraphEdge {
  source: GraphNode
  target: GraphNode
}

/**
 * The document hierarchy, as the tree view renders it. A node that was merged
 * still appears in every place it was written, so `rpm` shows up under both
 * Fedora and openSUSE.
 */
export interface OutlineNode {
  node: GraphNode
  children: OutlineNode[]
}

/** The derived graph: unique nodes, their edges, and the document outline. */
export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  /** Top-level outline entries — one per root, which is one today. */
  outline: OutlineNode[]
}
