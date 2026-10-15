/**
 * Colour schemes.
 *
 * The colours themselves live in `src/style.css`, one `:root[data-theme='…']`
 * block per theme. This file is only the catalogue the settings dialog renders,
 * plus the small bit of persistence around it. Adding a theme means adding a
 * block in the CSS and an entry here.
 */
export interface ThemeOption {
  id: string
  label: string
  /** Preview swatches: [background, node, shared node, text]. */
  swatches: [string, string, string, string]
}

export const DEFAULT_THEME_ID = 'librescope-dark'

export const THEMES: ThemeOption[] = [
  {
    id: 'librescope-dark',
    label: 'LibreScope Dark',
    swatches: ['#0e1116', '#4c8bf5', '#e0a94a', '#e6e9ef'],
  },
  {
    id: 'catppuccin-mocha',
    label: 'Catppuccin Mocha',
    swatches: ['#1e1e2e', '#89b4fa', '#fab387', '#cdd6f4'],
  },
  {
    id: 'catppuccin-latte',
    label: 'Catppuccin Latte',
    swatches: ['#eff1f5', '#1e66f5', '#fe640b', '#4c4f69'],
  },
  {
    id: 'tokyo-night',
    label: 'Tokyo Night',
    swatches: ['#1a1b26', '#7aa2f7', '#ff9e64', '#c0caf5'],
  },
  {
    id: 'solarized-dark',
    label: 'Solarized Dark',
    swatches: ['#002b36', '#268bd2', '#b58900', '#93a1a1'],
  },
  {
    id: 'solarized-light',
    label: 'Solarized Light',
    swatches: ['#fdf6e3', '#268bd2', '#cb4b16', '#586e75'],
  },
  {
    id: 'gruvbox-dark',
    label: 'Gruvbox Dark',
    swatches: ['#282828', '#83a598', '#fabd2f', '#ebdbb2'],
  },
  {
    id: 'nord',
    label: 'Nord',
    swatches: ['#2e3440', '#88c0d0', '#d08770', '#eceff4'],
  },
  {
    id: 'dracula',
    label: 'Dracula',
    swatches: ['#282a36', '#bd93f9', '#ffb86c', '#f8f8f2'],
  },
  {
    id: 'one-dark',
    label: 'One Dark',
    swatches: ['#282c34', '#61afef', '#d19a66', '#abb2bf'],
  },
  {
    id: 'one-light',
    label: 'One Light',
    swatches: ['#fafafa', '#4078f2', '#986801', '#383a42'],
  },
  {
    id: 'rose-pine',
    label: 'Rosé Pine',
    swatches: ['#191724', '#c4a7e7', '#f6c177', '#e0def4'],
  },
]

const STORAGE_KEY = 'librescope:theme'

export function isKnownTheme(id: string | null): id is string {
  return id !== null && THEMES.some((theme) => theme.id === id)
}

/** The saved theme, or the default when there is none or storage is blocked. */
export function readStoredTheme(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isKnownTheme(stored) ? stored : DEFAULT_THEME_ID
  } catch {
    return DEFAULT_THEME_ID
  }
}

/** Put the theme on `<html data-theme>` and remember it. */
export function applyTheme(id: string): void {
  document.documentElement.dataset.theme = id
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Storage can be unavailable (private mode, sandboxed frames). The theme
    // still applies for this session, it just will not be remembered.
  }
}
