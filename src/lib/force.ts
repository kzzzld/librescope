import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
} from 'd3-force'
import type { Graph, GraphEdge, GraphNode } from '../types'

/** Golden angle, used to spread seeded nodes evenly without clumping. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/** Visual radius of a node: bigger hubs get bigger circles. */
export function nodeRadius(node: GraphNode): number {
  return 6 + node.degree * 2.4
}

export interface SimulationSize {
  width: number
  height: number
}

/**
 * Give any node without a position a spot on a phyllotaxis spiral around the
 * centre, so the layout starts centred instead of collapsing at the origin.
 * Nodes that already have coordinates (e.g. after a resize) are left alone.
 */
function seedPositions(graph: Graph, { width, height }: SimulationSize): void {
  const count = graph.nodes.length
  const spread = Math.min(width, height) * 0.34
  graph.nodes.forEach((node, index) => {
    if (Number.isFinite(node.x) && Number.isFinite(node.y)) return
    const angle = index * GOLDEN_ANGLE
    const radius = spread * Math.sqrt((index + 0.5) / count)
    node.x = width / 2 + Math.cos(angle) * radius
    node.y = height / 2 + Math.sin(angle) * radius
  })
}

/**
 * Build the d3-force simulation for a graph.
 *
 * The simulation owns the mutable layout fields on each node (`x`, `y`, `vx`,
 * `vy`). It runs on its own; callers wire `simulation.on('tick', ...)` to paint
 * those positions. `forceCenter` keeps the graph's centre pinned to the middle
 * of the viewport, so the layout never drifts off-screen while it cools down.
 */
export function createSimulation(
  graph: Graph,
  { width, height }: SimulationSize,
): Simulation<GraphNode, GraphEdge> {
  seedPositions(graph, { width, height })

  const link = forceLink<GraphNode, GraphEdge>(graph.edges)
    .id((node) => node.id)
    .distance(100)
    .strength(0.09)

  return forceSimulation<GraphNode>(graph.nodes)
    .force('link', link)
    .force('charge', forceManyBody<GraphNode>().strength(-380))
    .force(
      'collide',
      forceCollide<GraphNode>()
        .radius((node) => nodeRadius(node) + 10)
        .strength(0.9),
    )
    .force('center', forceCenter<GraphNode>(width / 2, height / 2))
    .alphaDecay(0.02)
}

/** Keep the graph centred after the viewport changes size. */
export function setCenter(
  simulation: Simulation<GraphNode, GraphEdge>,
  { width, height }: SimulationSize,
): void {
  simulation.force('center', forceCenter<GraphNode>(width / 2, height / 2))
  simulation.alpha(0.3).restart()
}

/**
 * Wake the simulation back up while a node is being dragged, and let it settle
 * once the drag ends.
 */
export function reheat(simulation: Simulation<GraphNode, GraphEdge>): void {
  simulation.alphaTarget(0.3).restart()
}

export function settle(simulation: Simulation<GraphNode, GraphEdge>): void {
  simulation.alphaTarget(0)
}
