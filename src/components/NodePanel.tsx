import type { GraphNode } from '../types'

interface NodePanelProps {
  node: GraphNode
  neighbours: GraphNode[]
  onSelect: (id: string | null) => void
  onClose: () => void
}

/** Hostname without a leading `www.`, used as a tidy link label. */
function linkLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Side panel describing the selected node and linking to its neighbours. */
export default function NodePanel({ node, neighbours, onSelect, onClose }: NodePanelProps) {
  const breadcrumb = node.path.split('/').join(' › ')

  return (
    <aside className="panel" aria-label={`Details for ${node.name}`}>
      <button
        type="button"
        className="icon-button panel__close"
        onClick={onClose}
        aria-label="Close panel"
      >
        ×
      </button>

      <h2 className="panel__name">{node.name}</h2>
      <p className="panel__path">{breadcrumb}</p>

      {node.isShared ? (
        <p className="panel__badge">Shared — appears in {node.occurrences} places</p>
      ) : null}

      <p className="panel__description">{node.description || 'No description yet.'}</p>

      {node.url ? (
        <a
          className="panel__website"
          href={node.url}
          target="_blank"
          rel="noreferrer noopener"
          title={node.url}
        >
          {linkLabel(node.url)}
          <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
          </svg>
        </a>
      ) : null}

      {neighbours.length > 0 ? (
        <section className="panel__section">
          <h3 className="panel__section-title">
            Connections
            <span className="panel__count">{neighbours.length}</span>
          </h3>
          <ul className="panel__list">
            {neighbours.map((neighbour) => (
              <li key={neighbour.id}>
                <button
                  type="button"
                  className="panel__link"
                  onClick={() => onSelect(neighbour.id)}
                >
                  {neighbour.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  )
}
