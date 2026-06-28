// The on-screen piano is a window of white keys (the two letter rows) with the
// black keys (number row + home row) sitting in the gaps between them. It can
// be slid up/down a *diatonic* step (one white key) at a time. White letter
// keys always land on natural notes, so they stay white; the black keys are the
// sharps between adjacent whites — which only exist where there is one (there is
// no black key between B-C or E-F), so a black key plays nothing at those gaps.

export type PianoKeyDef = {
  /** Note name, e.g. "C4" or "F#3". */
  note: string
  type: 'white' | 'black'
  /** Keyboard keys that trigger this key, in display form (e.g. ["Q"]). */
  keys: string[]
  /** Raw keyboard key (lowercased) that triggers it, if any. */
  key?: string
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
// Semitone offset of each natural note within an octave (C D E F G A B).
const WHITE_SEMITONES = [0, 2, 4, 5, 7, 9, 11]

/** MIDI note number -> name, e.g. 60 -> "C4". */
export function midiToNote(midi: number): string {
  return NOTE_NAMES[midi % 12] + (Math.floor(midi / 12) - 1)
}

/** Pretty display label for a raw keyboard key. */
function displayKey(key: string): string {
  return key.length === 1 && /[a-z]/.test(key) ? key.toUpperCase() : key
}

/** MIDI number of the white key at "white position" w (w = 0 is C3). */
function whiteMidi(w: number): number {
  const idx = ((w % 7) + 7) % 7
  const octave = 3 + Math.floor(w / 7)
  return 12 * (octave + 1) + WHITE_SEMITONES[idx]
}

/** Whether a black key (sharp) exists immediately below white position w. */
function hasBlackBelow(w: number): boolean {
  const idx = ((w % 7) + 7) % 7
  return idx !== 0 && idx !== 3 // nothing below C or F (the B-C and E-F gaps)
}

// White keys: the two letter rows (top then bottom), 20 contiguous naturals.
const TOP_ROW = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
const BOTTOM_ROW = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
// Black keys: the row above each white row. Each sits to the *left* of a white
// key (the sharp below it). The trailing apostrophe is left of the key after /.
const NUMBER_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
const HOME_ROW = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';']
const APOS = "'"

export const SHIFT_STEP = 1 // one diatonic (white-key) step

/**
 * Build the ordered list of keys for the window at the given shift. `shift` is
 * the white position of the first letter key (Q): 0 = C3, -1 = B2, +1 = D3, …
 */
export function buildWindow(shift: number): PianoKeyDef[] {
  const keys: PianoKeyDef[] = []

  const pushWhite = (w: number, key?: string) => {
    keys.push({
      note: midiToNote(whiteMidi(w)),
      type: 'white',
      keys: key ? [displayKey(key)] : [],
      key,
    })
  }
  // The black key just below white position w, if one exists. Returns whether
  // it was added.
  const pushBlackBelow = (w: number, key: string) => {
    if (!hasBlackBelow(w)) return false
    keys.push({
      note: midiToNote(whiteMidi(w) - 1),
      type: 'black',
      keys: [displayKey(key)],
      key,
    })
    return true
  }

  // A leading/trailing black key needs a white on both sides to straddle, so add
  // an unlabelled context white at the edge when the edge black is present.
  if (hasBlackBelow(shift)) pushWhite(shift - 1)
  for (let t = 0; t < TOP_ROW.length; t++) {
    pushBlackBelow(shift + t, NUMBER_ROW[t])
    pushWhite(shift + t, TOP_ROW[t])
  }
  for (let b = 0; b < BOTTOM_ROW.length; b++) {
    pushBlackBelow(shift + 10 + b, HOME_ROW[b])
    pushWhite(shift + 10 + b, BOTTOM_ROW[b])
  }
  if (pushBlackBelow(shift + 20, APOS)) pushWhite(shift + 20)

  return keys
}

/** Lowest / highest sounding MIDI note of the window at a given shift. */
function lowestMidi(shift: number): number {
  return whiteMidi(hasBlackBelow(shift) ? shift - 1 : shift)
}
function highestMidi(shift: number): number {
  return whiteMidi(hasBlackBelow(shift + 20) ? shift + 20 : shift + 19)
}

// Keep the window within a standard 88-key piano: A0 (21) to C8 (108).
function computeShiftLimits(): [number, number] {
  let min = 0
  let max = 0
  for (let s = -60; s <= 60; s++) {
    if (lowestMidi(s) >= 21 && highestMidi(s) <= 108) {
      min = Math.min(min, s)
      max = Math.max(max, s)
    }
  }
  return [min, max]
}
export const [MIN_SHIFT, MAX_SHIFT] = computeShiftLimits()

/** Clamp a shift so the window stays within the piano range. */
export function clampShift(shift: number): number {
  return Math.max(MIN_SHIFT, Math.min(MAX_SHIFT, shift))
}

/**
 * Split the window into up to three balanced groups for layout. Cuts only fall
 * between two white keys (no black key straddles a group boundary), so the
 * groups render flush as one keyboard on wide screens and stack into rows on
 * mobile.
 */
export function groupKeys(keys: PianoKeyDef[]): PianoKeyDef[][] {
  const len = keys.length
  const targets = [Math.round(len / 3), Math.round((2 * len) / 3)]
  const groups: PianoKeyDef[][] = []
  let current: PianoKeyDef[] = []

  keys.forEach((key, i) => {
    current.push(key)
    const canCut =
      key.type === 'white' && i + 1 < len && keys[i + 1].type === 'white'
    if (groups.length < targets.length && i + 1 >= targets[groups.length] && canCut) {
      groups.push(current)
      current = []
    }
  })
  if (current.length) groups.push(current)
  return groups
}
