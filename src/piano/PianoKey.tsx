import type { PianoKeyDef } from './keyMap'

type PianoKeyProps = {
  def: PianoKeyDef
  active: boolean
  onPress: (note: string) => void
  onRelease: (note: string) => void
}

export function PianoKey({ def, active, onPress, onRelease }: PianoKeyProps) {
  const { note, type, keys } = def

  return (
    <button
      type="button"
      className={`key key-${type}${active ? ' is-active' : ''}`}
      // Pointer events give us press/hold/release plus drag-off to stop.
      onPointerDown={(e) => {
        e.preventDefault()
        onPress(note)
      }}
      onPointerUp={() => onRelease(note)}
      onPointerLeave={() => active && onRelease(note)}
      aria-label={note}
      aria-pressed={active}
    >
      <span className="key-labels">
        {keys.length > 0 && <span className="key-trigger">{keys.join(' ')}</span>}
        <span className="key-note">{note}</span>
      </span>
    </button>
  )
}
