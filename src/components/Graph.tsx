import { useCallback, useEffect, useMemo, useRef } from 'react'
import { select } from 'd3-selection'
import { drag as d3Drag, type D3DragEvent } from 'd3-drag'
import { zoom as d3Zoom } from 'd3-zoom'
import type { Simulation } from 'd3-force'
import type { Graph, GraphEdge, GraphNode } from '../types'
import { createSimulation, nodeRadius, reheat, setCenter, settle } from '../lib/force'

interface GraphViewProps {
  graph: Graph
  width: number
  height: number
  hoveredId: string | null
  selectedId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
}

export default function GraphView({
  graph,
  width,
  height,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
}: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const viewportRef = useRef<SVGGElement | null>(null)
  const nodeEls = useRef(new Map<string, SVGGElement>())
  const edgeEls = useRef(new Map<number, SVGLineElement>())
  const simRef = useRef<Simulation<GraphNode, GraphEdge> | null>(null)

  // Read the current size inside effects without making them re-run on resize.
  const sizeRef = useRef({ width, height })
  sizeRef.current = { width, height }
  const sizedOnce = useRef(false)

  /** The node the view is focused on: hover wins over selection. */
  const activeId = hoveredId ?? selectedId

  const neighbours = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const node of graph.nodes) map.set(node.id, new Set())
    for (const edge of graph.edges) {
      map.get(edge.source.id)?.add(edge.target.id)
      map.get(edge.target.id)?.add(edge.source.id)
    }
    return map
  }, [graph])

  /** Push simulation coordinates into the DOM without touching React state. */
  const paint = useCallback(() => {
    for (const node of graph.nodes) {
      const el = nodeEls.current.get(node.id)
      if (el) el.setAttribute('transform', `translate(${node.x ?? 0},${node.y ?? 0})`)
    }
    graph.edges.forEach((edge, index) => {
      const el = edgeEls.current.get(index)
      if (!el) return
      el.setAttribute('x1', String(edge.source.x ?? 0))
      el.setAttribute('y1', String(edge.source.y ?? 0))
      el.setAttribute('x2', String(edge.target.x ?? 0))
      el.setAttribute('y2', String(edge.target.y ?? 0))
    })
  }, [graph])

  // Create the simulation for a graph and paint every tick.
  useEffect(() => {
    if (!graph.nodes.length) return
    const { width: w, height: h } = sizeRef.current
    if (w === 0 || h === 0) return

    const simulation = createSimulation(graph, { width: w, height: h })
    simRef.current = simulation
    simulation.on('tick', paint)
    paint()

    return () => {
      simulation.on('tick', null)
      simulation.stop()
      simRef.current = null
    }
  }, [graph, paint])

  // Re-centre on viewport changes, but not on the very first measurement.
  useEffect(() => {
    const simulation = simRef.current
    if (!simulation) return
    if (!sizedOnce.current) {
      sizedOnce.current = true
      return
    }
    setCenter(simulation, { width, height })
  }, [width, height])

  // Node dragging: pin the node under the pointer, let it settle on release.
  useEffect(() => {
    const simulation = simRef.current
    if (!simulation) return

    const drag = d3Drag<SVGGElement, GraphNode>()
      .on('start', (event: D3DragEvent<SVGGElement, GraphNode, GraphNode>) => {
        reheat(simulation)
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      })
      .on('drag', (event: D3DragEvent<SVGGElement, GraphNode, GraphNode>) => {
        event.subject.fx = event.x
        event.subject.fy = event.y
      })
      .on('end', (event: D3DragEvent<SVGGElement, GraphNode, GraphNode>) => {
        event.subject.fx = null
        event.subject.fy = null
        settle(simulation)
      })

    const nodes = graph.nodes
    for (const node of nodes) {
      const el = nodeEls.current.get(node.id)
      if (el) select<SVGGElement, GraphNode>(el).datum(node).call(drag)
    }

    return () => {
      for (const node of nodes) {
        const el = nodeEls.current.get(node.id)
        if (el) select(el).on('.drag', null)
      }
    }
  }, [graph])

  // Pan and zoom the viewport group.
  useEffect(() => {
    const svg = svgRef.current
    const viewport = viewportRef.current
    if (!svg || !viewport) return

    const zoom = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        viewport.setAttribute('transform', event.transform.toString())
      })

    select(svg).call(zoom)

    return () => {
      select(svg).on('.zoom', null)
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      className="graph"
      width={width}
      height={height}
      role="img"
      aria-label="Open source ecosystem graph"
      onMouseLeave={() => onHover(null)}
      onClick={(event) => {
        if (event.target === svgRef.current) onSelect(null)
      }}
    >
      <g ref={viewportRef}>
        <g className="graph__edges">
          {graph.edges.map((edge, index) => {
            const highlighted = activeId === edge.source.id || activeId === edge.target.id
            const dimmed = activeId !== null && !highlighted
            return (
              <line
                key={`${edge.source.id}->${edge.target.id}`}
                ref={(el) => {
                  if (el) edgeEls.current.set(index, el)
                  else edgeEls.current.delete(index)
                }}
                className={[
                  'graph__edge',
                  highlighted && 'is-hi',
                  dimmed && 'is-dim',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            )
          })}
        </g>
        <g className="graph__nodes">
          {graph.nodes.map((node) => {
            const radius = nodeRadius(node)
            const active = activeId === node.id
            const dimmed =
              activeId !== null && !active && !neighbours.get(activeId)?.has(node.id)
            return (
              <g
                key={node.id}
                ref={(el) => {
                  if (el) nodeEls.current.set(node.id, el)
                  else nodeEls.current.delete(node.id)
                }}
                className={[
                  'graph__node',
                  node.isShared && 'is-shared',
                  active && 'is-active',
                  dimmed && 'is-dim',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => onHover(node.id)}
                onClick={(event) => {
                  event.stopPropagation()
                  onSelect(node.id === selectedId ? null : node.id)
                }}
              >
                <circle r={radius} />
                <text className="graph__label" x={0} y={radius + 13}>
                  {node.name}
                </text>
              </g>
            )
          })}
        </g>
      </g>
    </svg>
  )
}
