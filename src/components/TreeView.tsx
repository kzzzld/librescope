import type { OutlineNode } from '../types'

interface TreeViewProps {
  outline: OutlineNode[]
  activeId: string | null
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
}

interface TreeItemProps {
  item: OutlineNode
  /** Position in the outline, used only to build stable React keys. */
  path: string
  activeId: string | null
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
}

function TreeItem({ item, path, activeId, onSelect, onHover }: TreeItemProps) {
  const { node, children } = item
  const active = node.id === activeId

  return (
    <li className="tree__item">
      <button
        type="button"
        className={active ? 'tree__row is-active' : 'tree__row'}
        aria-current={active ? 'true' : undefined}
        onClick={() => onSelect(active ? null : node.id)}
        onMouseEnter={() => onHover(node.id)}
      >
        <span
          className={node.isShared ? 'tree__dot is-shared' : 'tree__dot'}
          aria-hidden="true"
        />
        <span className="tree__name">{node.name}</span>
      </button>

      {children.length > 0 ? (
        <ul className="tree__list">
          {children.map((child, index) => (
            <TreeItem
              key={`${path}.${index}`}
              item={child}
              path={`${path}.${index}`}
              activeId={activeId}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

/**
 * The document hierarchy as an indented outline. It mirrors the tree as written,
 * so a merged node like `rpm` appears in every branch it was written in — both
 * rows refer to the same node and highlight together.
 */
export default function TreeView({ outline, activeId, onSelect, onHover }: TreeViewProps) {
  return (
    <div className="tree" onMouseLeave={() => onHover(null)}>
      <ul className="tree__list tree__list--root">
        {outline.map((item, index) => (
          <TreeItem
            key={`root.${index}`}
            item={item}
            path={`root.${index}`}
            activeId={activeId}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </ul>
    </div>
  )
}
