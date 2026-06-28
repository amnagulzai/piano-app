// Maps computer-keyboard keys to piano notes and builds the ordered list of
// piano keys for the on-screen keyboard.
//
// White keys come from the two letter rows; black keys sit on the row
// physically above each white row (number row above the top letter row,
// home row above the bottom letter row), mirroring a real piano.

/** keyboard key (from KeyboardEvent.key, lowercased) -> note name */
export const KEYBOARD_TO_NOTE: Record<string, string> = {
  // Top letter row -> white keys (lower octave, C3-E4)
  q: 'C3', w: 'D3', e: 'E3', r: 'F3', t: 'G3',
  y: 'A3', u: 'B3', i: 'C4', o: 'D4', p: 'E4',
  // Number row -> black keys (lower octave)
  '2': 'C#3', '3': 'D#3', '5': 'F#3', '6': 'G#3', '7': 'A#3', '9': 'C#4', '0': 'D#4',
  // Bottom letter row -> white keys (upper octave, F4-A5)
  z: 'F4', x: 'G4', c: 'A4', v: 'B4', b: 'C5',
  n: 'D5', m: 'E5', ',': 'F5', '.': 'G5', '/': 'A5',
  // Home row -> black keys (upper octave)
  s: 'F#4', d: 'G#4', f: 'A#4', h: 'C#5', j: 'D#5', l: 'F#5', ';': 'G#5', "'": 'A#5',
}

export type PianoKeyDef = {
  /** Note name, e.g. "C4" or "F#3". */
  note: string
  type: 'white' | 'black'
  /** Keyboard keys that trigger this note, in display form (e.g. ["B", "Q"]). */
  keys: string[]
}

const SEMITONES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/** Pretty display label for a raw keyboard key. */
function displayKey(key: string): string {
  return key.length === 1 && /[a-z]/.test(key) ? key.toUpperCase() : key
}

/** Invert KEYBOARD_TO_NOTE so we can look up which keys play a given note. */
const NOTE_TO_KEYS: Record<string, string[]> = {}
for (const [key, note] of Object.entries(KEYBOARD_TO_NOTE)) {
  ;(NOTE_TO_KEYS[note] ??= []).push(displayKey(key))
}

/** Build the chromatic list of piano keys from `start` to `end` (inclusive). */
function buildKeys(start: string, end: string): PianoKeyDef[] {
  const parse = (n: string) => {
    const m = n.match(/^([A-G]#?)(\d)$/)!
    return SEMITONES.indexOf(m[1]) + 12 * Number(m[2])
  }
  const keys: PianoKeyDef[] = []
  for (let i = parse(start); i <= parse(end); i++) {
    const pc = SEMITONES[i % 12]
    const octave = Math.floor(i / 12)
    const note = `${pc}${octave}`
    keys.push({
      note,
      type: pc.includes('#') ? 'black' : 'white',
      keys: NOTE_TO_KEYS[note] ?? [],
    })
  }
  return keys
}

/** The full on-screen keyboard: a continuous piano from C3 to A#5. */
export const PIANO_KEYS: PianoKeyDef[] = buildKeys('C3', 'A#5')
