import type { Graph, GraphEdge, GraphNode, TreeNode } from '../types'

const SEPARATOR = '\u0000'
const PATH_SEPARATOR = '/'

/** Identity of a tree node: its explicit `id`, or its path from the root. */
function nodeKey(node: TreeNode, name: string, parentKey: string | null): string {
  if (typeof node.id === 'string' && node.id.trim() !== '') return node.id.trim()
  return parentKey === null ? name : `${parentKey}${PATH_SEPARATOR}${name}`
}

/** Path of a tree node from the root, ignoring any `id` overrides. */
function nodePath(name: string, parentPath: string | null): string {
  return parentPath === null ? name : `${parentPath}${PATH_SEPARATOR}${name}`
}

/**
 * Derive a graph from a nested tree.
 *
 * - Identity is the node's `id` when given, otherwise its path from the root.
 *   So `Linux/Distros` and `BSD/Distros` are two nodes, while two nodes both
 *   carrying `id: "rpm"` merge into a single shared node.
 * - One edge per parent → child relationship (duplicates and self-loops dropped).
 * - `degree` counts a node's distinct edges, `depth` its distance from the root,
 *   and `isShared` marks nodes referenced from more than one place in the tree.
 */
export function buildGraph(tree: TreeNode): Graph {
  const byKey = new Map<string, GraphNode>()
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const seenEdges = new Set<string>()

  function ensure(key: string, name: string, path: string, depth: number): GraphNode {
    let node = byKey.get(key)
    if (!node) {
      node = {
        id: key,
        name,
        path,
        depth,
        degree: 0,
        occurrences: 0,
        isShared: false,
      }
      byKey.set(key, node)
      nodes.push(node)
    } else if (depth < node.depth) {
      // A merged node sits at its shallowest appearance, so it never renders
      // smaller than the level it was first seen at.
      node.depth = depth
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

  function walk(
    current: TreeNode | undefined,
    parent: GraphNode | null,
    parentKey: string | null,
    parentPath: string | null,
    depth: number,
  ): void {
    if (!current) return
    const name = typeof current.name === 'string' ? current.name.trim() : ''
    if (!name) return

    const key = nodeKey(current, name, parentKey)
    const path = nodePath(name, parentPath)
    const node = ensure(key, name, path, depth)
    node.occurrences += 1
    node.isShared = node.occurrences > 1

    if (parent) link(parent, node)
    for (const child of current.children ?? []) walk(child, node, key, path, depth + 1)
  }

  walk(tree, null, null, null, 0)
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
