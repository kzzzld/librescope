import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
} from 'd3-force'
import type { Graph, GraphEdge, GraphNode } from '../types'

/** Visual radius of a node: bigger hubs get bigger circles. */
export function nodeRadius(node: GraphNode): number {
  return 6 + node.degree * 2.4
}

export interface SimulationSize {
  width: number
  height: number
}

/**
 * Build the d3-force simulation for a graph.
 *
 * The simulation owns the mutable layout fields on each node (`x`, `y`, `vx`,
 * `vy`). It runs on its own; callers wire `simulation.on('tick', ...)` to paint
 * those positions, and reheating is handled by `reheat` while dragging.
 */
export function createSimulation(
  graph: Graph,
  { width, height }: SimulationSize,
): Simulation<GraphNode, GraphEdge> {
  const link = forceLink<GraphNode, GraphEdge>(graph.edges)
    .id((node) => node.id)
    .distance(90)
    .strength(0.1)

  return forceSimulation<GraphNode>(graph.nodes)
    .force('link', link)
    .force('charge', forceManyBody<GraphNode>().strength(-300))
    .force('collide', forceCollide<GraphNode>().radius((node) => nodeRadius(node) + 8).strength(0.9))
    .force('x', forceX<GraphNode>(width / 2).strength(0.045))
    .force('y', forceY<GraphNode>(height / 2).strength(0.045))
    .alphaDecay(0.0228)
}

/** Keep the graph centred after the viewport changes size. */
export function setCenter(
  simulation: Simulation<GraphNode, GraphEdge>,
  { width, height }: SimulationSize,
): void {
  simulation.force('x', forceX<GraphNode>(width / 2).strength(0.045))
  simulation.force('y', forceY<GraphNode>(height / 2).strength(0.045))
  simulation.alpha(0.3).restart()
}

/**
 * Wake the simulation back up while a node is being dragged, and let it settle
 * once the drag ends (`settle` releases the pinned position).
 */
export function reheat(simulation: Simulation<GraphNode, GraphEdge>): void {
  simulation.alphaTarget(0.3).restart()
}

export function settle(simulation: Simulation<GraphNode, GraphEdge>): void {
  simulation.alphaTarget(0)
}
