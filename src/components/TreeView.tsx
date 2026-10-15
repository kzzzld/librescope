import { useState } from 'react'
import type { OutlineNode } from '../types'

interface TreeViewProps {
  outline: OutlineNode[]
  /** Node to highlight: hover wins over selection. */
  activeId: string | null
  /** The selection itself, used to decide whether a click clears it. */
  selectedId: string | null
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
}

interface TreeItemProps {
  item: OutlineNode
  /** Position in the outline, used only to build stable React keys. */
  path: string
  activeId: string | null
  selectedId: string | null
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
}

function TreeItem({
  item,
  path,
  activeId,
  selectedId,
  onSelect,
  onHover,
}: TreeItemProps) {
  const { node, children } = item
  const [collapsed, setCollapsed] = useState(false)
  const active = node.id === activeId
  const selected = node.id === selectedId
  const hasChildren = children.length > 0

  const dotClass = [
    'tree__dot',
    node.isShared && 'is-shared',
    hasChildren && collapsed && 'is-collapsed',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <li className="tree__item">
      <div
        className={active ? 'tree__row is-active' : 'tree__row'}
        onMouseEnter={() => onHover(node.id)}
      >
        {hasChildren ? (
          <button
            type="button"
            className="tree__toggle"
            onClick={() => setCollapsed((value) => !value)}
            aria-expanded={!collapsed}
            aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${node.name}`}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <span className={dotClass} aria-hidden="true" />
          </button>
        ) : (
          <span className="tree__toggle" aria-hidden="true">
            <span className={dotClass} />
          </span>
        )}

        <button
          type="button"
          className="tree__label"
          aria-current={active ? 'true' : undefined}
          onClick={() => onSelect(selected ? null : node.id)}
        >
          {node.name}
        </button>
      </div>

      {hasChildren ? (
        <ul className="tree__list" hidden={collapsed}>
          {children.map((child, index) => (
            <TreeItem
              key={`${path}.${index}`}
              item={child}
              path={`${path}.${index}`}
              activeId={activeId}
              selectedId={selectedId}
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
 *
 * The dot collapses a node and hides its descendants; the name selects it.
 * Children stay mounted while hidden, so collapsing a branch and reopening it
 * keeps the collapse state deeper down.
 */
export default function TreeView({
  outline,
  activeId,
  selectedId,
  onSelect,
  onHover,
}: TreeViewProps) {
  return (
    <div className="tree" onMouseLeave={() => onHover(null)}>
      <ul className="tree__list tree__list--root">
        {outline.map((item, index) => (
          <TreeItem
            key={`root.${index}`}
            item={item}
            path={`root.${index}`}
            activeId={activeId}
            selectedId={selectedId}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </ul>
    </div>
  )
}
