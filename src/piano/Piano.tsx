import { useCallback, useEffect, useMemo, useState } from 'react'
import { SHIFT_STEP, groupKeys, type PianoKeyDef } from './keyMap'
import { PianoKey } from './PianoKey'
import './piano.css'

type PianoProps = {
  play: (note: string) => void
  stop: (note: string) => void
  /** When true, releasing a key keeps the note ringing (sustain pedal). */
  sustain: boolean
  /** The ordered keys of the current window (already shifted). */
  keys: PianoKeyDef[]
  /** Slide the window by a number of diatonic steps. */
  onShift: (delta: number) => void
}

type Slot = {
  white: PianoKeyDef
  blackRight: PianoKeyDef | null
  /** A leading black key (window starts on a black note) straddling the left. */
  blackLeft: PianoKeyDef | null
}

/** Turn an ordered group of keys into white-anchored slots with their blacks. */
function toSlots(group: PianoKeyDef[]): Slot[] {
  const slots: Slot[] = []
  let pendingLeft: PianoKeyDef | null = null
  for (const key of group) {
    if (key.type === 'black') {
      if (slots.length > 0) slots[slots.length - 1].blackRight = key
      else pendingLeft = key
    } else {
      slots.push({ white: key, blackRight: null, blackLeft: pendingLeft })
      pendingLeft = null
    }
  }
  return slots
}

export function Piano({ play, stop, sustain, keys, onShift }: PianoProps) {
  const octaves = useMemo(() => groupKeys(keys).map(toSlots), [keys])
  const keyToNote = useMemo(() => {
    const map: Record<string, string> = {}
    for (const k of keys) if (k.key) map[k.key] = k.note
    return map
  }, [keys])

  // Notes whose key is physically held (drives the pressed highlight + sound).
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())
  // Notes still ringing only because the sustain pedal is on (key released).
  const [, setSustainedNotes] = useState<Set<string>>(new Set())

  const press = useCallback(
    (note: string) => {
      setActiveNotes((prev) => (prev.has(note) ? prev : new Set(prev).add(note)))
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

  // Sliding the window remaps keys to new notes; release everything sounding so
  // a held/sustained note can't get stuck.
  useEffect(() => {
    const releaseAll = (prev: Set<string>) => {
      if (prev.size === 0) return prev
      prev.forEach((note) => stop(note))
      return new Set<string>()
    }
    setActiveNotes(releaseAll)
    setSustainedNotes(releaseAll)
  }, [keyToNote, stop])

  // Bind the computer keyboard: letters play notes, arrows slide the window.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onShift(-SHIFT_STEP)
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        onShift(SHIFT_STEP)
        return
      }
      const note = keyToNote[e.key.toLowerCase()]
      if (!note) return
      e.preventDefault()
      press(note)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const note = keyToNote[e.key.toLowerCase()]
      if (note) release(note)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [press, release, onShift, keyToNote])

  return (
    <div className="piano" role="group" aria-label="Virtual piano keyboard">
      {octaves.map((slots, i) => (
        <div className="octave" key={i} style={{ flexGrow: slots.length }}>
          {slots.map(({ white, blackRight, blackLeft }) => (
            <div className="key-slot" key={white.note}>
              {blackLeft && (
                <PianoKey
                  def={blackLeft}
                  edge="left"
                  active={activeNotes.has(blackLeft.note)}
                  onPress={press}
                  onRelease={release}
                />
              )}
              <PianoKey
                def={white}
                active={activeNotes.has(white.note)}
                onPress={press}
                onRelease={release}
              />
              {blackRight && (
                <PianoKey
                  def={blackRight}
                  active={activeNotes.has(blackRight.note)}
                  onPress={press}
                  onRelease={release}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
