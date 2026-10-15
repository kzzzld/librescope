import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GraphView from './components/Graph'
import NodePanel from './components/NodePanel'
import SettingsDialog from './components/SettingsDialog'
import TreeView from './components/TreeView'
import { fetchGraph } from './lib/graph'
import { readStoredViewMode, storeViewMode, type ViewMode } from './preferences'
import { applyTheme, readStoredTheme } from './themes'
import type { Graph } from './types'

export default function App() {
  const [graph, setGraph] = useState<Graph | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [theme, setTheme] = useState<string>(readStoredTheme)
  const [viewMode, setViewMode] = useState<ViewMode>(readStoredViewMode)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const stageRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    storeViewMode(viewMode)
  }, [viewMode])

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

    const measure = () => {
      const rect = stage.getBoundingClientRect()
      setSize({ width: Math.round(rect.width), height: Math.round(rect.height) })
    }

    // Measure immediately: a ResizeObserver callback can be deferred, and the
    // graph must not stay hidden waiting for it.
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const selected = useMemo(
    () => (graph && selectedId ? (graph.nodes.find((node) => node.id === selectedId) ?? null) : null),
    [graph, selectedId],
  )

  const neighbours = useMemo(() => {
    if (!graph || !selected) return []
    const ids = new Set<string>()
    for (const edge of graph.edges) {
      if (edge.source.id === selected.id) ids.add(edge.target.id)
      else if (edge.target.id === selected.id) ids.add(edge.source.id)
    }
    return graph.nodes
      .filter((node) => ids.has(node.id))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [graph, selected])

  const handleHover = useCallback((id: string | null) => setHoveredId(id), [])
  const handleSelect = useCallback((id: string | null) => setSelectedId(id), [])
  const handleClose = useCallback(() => setSelectedId(null), [])
  const openSettings = useCallback(() => setSettingsOpen(true), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  const hasSize = size.width > 0 && size.height > 0

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__heading">
          <h1 className="app__title">LibreScope</h1>
          <p className="app__hint">
            {viewMode === 'graph'
              ? 'Drag to pan · scroll to zoom · drag a node · click for details'
              : 'Click a node for details'}
          </p>
        </div>
        <button
          type="button"
          className="app__settings"
          onClick={openSettings}
          aria-label="Open settings"
          title="Settings"
        >
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      <div className="app__body">
        <div className="app__stage" ref={stageRef}>
          {error ? (
            <p className="app__message app__message--error">
              Could not load <code>data.json</code> — {error}
            </p>
          ) : null}
          {!error && !graph ? <p className="app__message">Loading…</p> : null}
          {graph && viewMode === 'graph' && hasSize ? (
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
          {graph && viewMode === 'tree' ? (
            <TreeView
              outline={graph.outline}
              activeId={hoveredId ?? selectedId}
              selectedId={selectedId}
              onSelect={handleSelect}
              onHover={handleHover}
            />
          ) : null}
        </div>

        {selected ? (
          <NodePanel
            node={selected}
            neighbours={neighbours}
            onSelect={handleSelect}
            onClose={handleClose}
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
        {viewMode === 'graph' ? (
          <span className="legend__item">
            <i className="legend__line" />
            parent → child edge
          </span>
        ) : null}
      </footer>

      <SettingsDialog
        open={settingsOpen}
        onClose={closeSettings}
        theme={theme}
        onThemeChange={setTheme}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </div>
  )
}
