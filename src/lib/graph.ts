import type { Graph, GraphEdge, GraphNode, TreeNode } from '../types'

const SEPARATOR = '\u0000'

/**
 * Derive a graph from a nested tree.
 *
 * - One node per unique name; repeated names merge into a single shared node.
 * - One edge per parent → child relationship (duplicates and self-loops dropped).
 * - Every node's `degree` counts its distinct edges, and `isShared` marks names
 *   that appear in more than one branch.
 */
export function buildGraph(tree: TreeNode): Graph {
  const byName = new Map<string, GraphNode>()
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const seenEdges = new Set<string>()

  function ensure(name: string): GraphNode {
    let node = byName.get(name)
    if (!node) {
      node = { id: name, name, degree: 0, occurrences: 0, isShared: false }
      byName.set(name, node)
      nodes.push(node)
    }
    return node
  }

  function link(parent: GraphNode, child: GraphNode): void {
    if (parent === child) return // no self-loops
    const key = `${parent.id}${SEPARATOR}${child.id}`
    if (seenEdges.has(key)) return // no duplicate edges
    seenEdges.add(key)
    edges.push({ source: parent, target: child })
    parent.degree += 1
    child.degree += 1
  }

  function walk(current: TreeNode | undefined, parent: GraphNode | null): void {
    if (!current) return
    const name = typeof current.name === 'string' ? current.name.trim() : ''
    if (!name) return

    const node = ensure(name)
    node.occurrences += 1
    node.isShared = node.occurrences > 1

    if (parent) link(parent, node)
    for (const child of current.children ?? []) walk(child, node)
  }

  walk(tree, null)
  return { nodes, edges }
}

/** Fetch the tree from `url` and derive its graph. */
export async function fetchGraph(url = './data.json'): Promise<Graph> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`)
  }
  const tree = (await response.json()) as TreeNode
  return buildGraph(tree)
}
