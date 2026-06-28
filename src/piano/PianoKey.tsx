import type { PianoKeyDef } from './keyMap'

type PianoKeyProps = {
  def: PianoKeyDef
  active: boolean
  /** A black key with no white key to its left straddles the left edge instead. */
  edge?: 'left'
  onPress: (note: string) => void
  onRelease: (note: string) => void
}

export function PianoKey({ def, active, edge, onPress, onRelease }: PianoKeyProps) {
  const { note, type, keys } = def

  return (
    <button
      type="button"
      className={`key key-${type}${active ? ' is-active' : ''}${
        edge === 'left' ? ' key-black--left' : ''
      }`}
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
