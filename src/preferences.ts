/**
 * View preferences that are not colours. The chosen view is remembered the same
 * way a theme is, in `localStorage`, and falls back to the default when storage
 * is unavailable or holds an unknown value.
 */

export type ViewMode = 'graph' | 'tree'

export const DEFAULT_VIEW_MODE: ViewMode = 'graph'

export const VIEW_MODES: ReadonlyArray<{ id: ViewMode; label: string; hint: string }> = [
  { id: 'graph', label: 'Graph', hint: 'Force-directed node graph' },
  { id: 'tree', label: 'Tree', hint: 'Indented outline' },
]

const STORAGE_KEY = 'librescope:view'

export function isViewMode(value: string | null): value is ViewMode {
  return value === 'graph' || value === 'tree'
}

export function readStoredViewMode(): ViewMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isViewMode(stored) ? stored : DEFAULT_VIEW_MODE
  } catch {
    return DEFAULT_VIEW_MODE
  }
}

export function storeViewMode(mode: ViewMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Storage can be unavailable; the choice still applies for this session.
  }
}
