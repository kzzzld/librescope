import type { SimulationNodeDatum } from 'd3-force'

/**
 * A node as written in `public/data.json`: a name and optional children.
 * The tree is the only source of truth — edges are never written by hand.
 */
export interface TreeNode {
  name: string
  children?: TreeNode[]
}

/**
 * A node in the derived graph. One per unique name in the tree, so a repeated
 * name (e.g. `rpm` under Fedora and openSUSE) becomes a single shared node.
 *
 * Extends `SimulationNodeDatum` so d3-force can write `x`, `y`, `vx`, `vy`.
 */
export interface GraphNode extends SimulationNodeDatum {
  /** Identity of the node — its unique name. */
  id: string
  name: string
  /** Number of distinct edges touching this node. */
  degree: number
  /** How many times the name appears in the tree (2+ means shared). */
  occurrences: number
  /** True when the name appears in more than one branch. */
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

/** The derived graph: unique nodes plus their automatically created edges. */
export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
