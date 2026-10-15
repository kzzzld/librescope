import { useEffect, useRef } from 'react'
import { THEMES } from '../themes'
import { VIEW_MODES, type ViewMode } from '../preferences'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
  theme: string
  onThemeChange: (id: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

/**
 * Settings popup. Uses a native `<dialog>` so Escape-to-close, focus trapping
 * and the backdrop come from the browser rather than hand-rolled code.
 */
export default function SettingsDialog({
  open,
  onClose,
  theme,
  onThemeChange,
  viewMode,
  onViewModeChange,
}: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="settings"
      aria-labelledby="settings-title"
      onClose={onClose}
      onClick={(event) => {
        // A click on the ::backdrop targets the dialog element itself.
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="settings__panel">
        <header className="settings__header">
          <h2 className="settings__title" id="settings-title">
            Settings
          </h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </header>

        <section className="settings__section">
          <h3 className="settings__section-title" id="settings-layout">
            Layout
          </h3>
          <div
            className="choice-grid"
            role="radiogroup"
            aria-labelledby="settings-layout"
          >
            {VIEW_MODES.map((mode) => {
              const active = mode.id === viewMode
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={active ? 'choice is-active' : 'choice'}
                  onClick={() => onViewModeChange(mode.id)}
                >
                  <span className="choice__label">{mode.label}</span>
                  <span className="choice__hint">{mode.hint}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="settings__section">
          <h3 className="settings__section-title" id="settings-theme">
            Color scheme
          </h3>
          <div className="theme-grid" role="radiogroup" aria-labelledby="settings-theme">
            {THEMES.map((option) => {
              const active = option.id === theme
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={active ? 'theme-option is-active' : 'theme-option'}
                  onClick={() => onThemeChange(option.id)}
                >
                  <span className="theme-option__swatches" aria-hidden="true">
                    {option.swatches.map((color) => (
                      <span
                        key={color}
                        className="theme-option__swatch"
                        style={{ background: color }}
                      />
                    ))}
                  </span>
                  <span className="theme-option__label">{option.label}</span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </dialog>
  )
}
