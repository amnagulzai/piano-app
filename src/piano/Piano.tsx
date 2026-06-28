import { useCallback, useEffect, useMemo, useState } from 'react'
import { KEYBOARD_TO_NOTE, PIANO_KEYS, type PianoKeyDef } from './keyMap'
import { PianoKey } from './PianoKey'
import './piano.css'

type PianoProps = {
  play: (note: string) => void
  stop: (note: string) => void
  /** When true, releasing a key keeps the note ringing (sustain pedal). */
  sustain: boolean
}

/** Group each white key with the black key that immediately follows it (if any). */
function useKeyLayout() {
  return useMemo(() => {
    const slots: { white: PianoKeyDef; black: PianoKeyDef | null }[] = []
    PIANO_KEYS.forEach((key, i) => {
      if (key.type !== 'white') return
      const next = PIANO_KEYS[i + 1]
      slots.push({ white: key, black: next?.type === 'black' ? next : null })
    })
    return slots
  }, [])
}

export function Piano({ play, stop, sustain }: PianoProps) {
  const slots = useKeyLayout()
  // Notes whose key is physically held (drives the pressed highlight + sound).
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())
  // Notes still ringing only because the sustain pedal is on (key released).
  // Tracked purely to release them when the pedal lifts; not shown visually.
  const [, setSustainedNotes] = useState<Set<string>>(new Set())

  const press = useCallback(
    (note: string) => {
      setActiveNotes((prev) => (prev.has(note) ? prev : new Set(prev).add(note)))
      // A re-pressed note is no longer merely sustained.
      setSustainedNotes((prev) => {
        if (!prev.has(note)) return prev
        const next = new Set(prev)
        next.delete(note)
        return next
      })
      play(note)
    },
    [play],
  )

  const release = useCallback(
    (note: string) => {
      setActiveNotes((prev) => {
        if (!prev.has(note)) return prev
        const next = new Set(prev)
        next.delete(note)
        return next
      })
      if (sustain) {
        setSustainedNotes((prev) => (prev.has(note) ? prev : new Set(prev).add(note)))
      } else {
        stop(note)
      }
    },
    [sustain, stop],
  )

  // Lifting the pedal releases every note that was only held by it.
  useEffect(() => {
    if (sustain) return
    setSustainedNotes((prev) => {
      if (prev.size === 0) return prev
      prev.forEach((note) => stop(note))
      return new Set()
    })
  }, [sustain, stop])

  // Bind the computer keyboard to the piano.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      const note = KEYBOARD_TO_NOTE[e.key.toLowerCase()]
      if (!note) return
      e.preventDefault()
      press(note)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const note = KEYBOARD_TO_NOTE[e.key.toLowerCase()]
      if (!note) return
      release(note)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [press, release])

  return (
    <div className="piano" role="group" aria-label="Virtual piano keyboard">
      {slots.map(({ white, black }) => (
        <div className="key-slot" key={white.note}>
          <PianoKey
            def={white}
            active={activeNotes.has(white.note)}
            onPress={press}
            onRelease={release}
          />
          {black && (
            <PianoKey
              def={black}
              active={activeNotes.has(black.note)}
              onPress={press}
              onRelease={release}
            />
          )}
        </div>
      ))}
    </div>
  )
}
