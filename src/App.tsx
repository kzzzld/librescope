import { useCallback, useEffect, useRef, useState } from 'react'
import GraphView from './components/Graph'
import { fetchGraph } from './lib/graph'
import type { Graph } from './types'

export default function App() {
  const [graph, setGraph] = useState<Graph | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const stageRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchGraph()
      .then((loaded) => {
        if (!cancelled) setGraph(loaded)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause))
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect) {
        setSize({ width: Math.round(rect.width), height: Math.round(rect.height) })
      }
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const handleHover = useCallback((id: string | null) => setHoveredId(id), [])
  const handleSelect = useCallback((id: string | null) => setSelectedId(id), [])

  const hasSize = size.width > 0 && size.height > 0

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">LibreScope</h1>
        <p className="app__hint">Drag to pan · scroll to zoom · drag a node · click to focus</p>
      </header>

      <div className="app__stage" ref={stageRef}>
        {error ? (
          <p className="app__message app__message--error">
            Could not load <code>data.json</code> — {error}
          </p>
        ) : null}
        {!error && !graph ? <p className="app__message">Loading…</p> : null}
        {graph && hasSize ? (
          <GraphView
            graph={graph}
            width={size.width}
            height={size.height}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onHover={handleHover}
            onSelect={handleSelect}
          />
        ) : null}
      </div>

      <footer className="app__legend">
        <span className="legend__item">
          <i className="legend__dot" />
          node
        </span>
        <span className="legend__item">
          <i className="legend__dot legend__dot--shared" />
          shared node (name in 2+ branches)
        </span>
        <span className="legend__item">
          <i className="legend__line" />
          parent → child edge
        </span>
      </footer>
    </div>
  )
}
