import { useEffect, useRef } from 'react'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * Settings popup. Intentionally empty for now — options will be added here
 * later. Uses a native `<dialog>` so Escape-to-close, focus trapping and the
 * backdrop come from the browser rather than hand-rolled code.
 */
export default function SettingsDialog({ open, onClose }: SettingsDialogProps) {
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

        <p className="settings__empty">Nothing to configure yet.</p>
      </div>
    </dialog>
  )
}
