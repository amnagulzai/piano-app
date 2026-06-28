// Instrument registry. Each instrument is a set of pitched samples that
// Tone.Sampler pitch-shifts across the keyboard. To add a new instrument,
// drop its samples under `public/samples/<id>/` and add an entry below.

export type InstrumentConfig = {
  /** Stable id; also the folder name under `public/samples/`. */
  id: string
  /** Human-readable name shown in the instrument selector. */
  name: string
  /** URL the sample files are served from (relative to the site root). */
  baseUrl: string
  /**
   * Map of note name -> sample file. Tone.Sampler interpolates pitches
   * between these anchors, so a sparse set (minor-third spacing) is enough.
   */
  samples: Record<string, string>
  /** Release time in seconds applied when a note is let go. */
  release: number
  /**
   * Whether a sustain pedal makes sense for this instrument. Reed instruments
   * (e.g. harmonium) stop sounding the moment a key is released, so they have no
   * sustain. Defaults to true when omitted.
   */
  supportsSustain?: boolean
}

export const INSTRUMENTS: InstrumentConfig[] = [
  {
    id: 'grand-piano',
    name: 'Grand Piano',
    baseUrl: '/samples/piano/',
    // Salamander Grand Piano anchors covering the C3-A#5 range.
    samples: {
      C3: 'C3.mp3',
      'D#3': 'Ds3.mp3',
      'F#3': 'Fs3.mp3',
      A3: 'A3.mp3',
      C4: 'C4.mp3',
      'D#4': 'Ds4.mp3',
      'F#4': 'Fs4.mp3',
      A4: 'A4.mp3',
      C5: 'C5.mp3',
      'D#5': 'Ds5.mp3',
      'F#5': 'Fs5.mp3',
      A5: 'A5.mp3',
      C6: 'C6.mp3',
    },
    release: 1,
  },
  {
    id: 'harmonium',
    name: 'Harmonium',
    baseUrl: '/samples/harmonium/',
    // Indian harmonium anchors (tonejs-instruments, CC-BY 3.0) covering C2-D5.
    samples: {
      C2: 'C2.mp3',
      'D#2': 'Ds2.mp3',
      'F#2': 'Fs2.mp3',
      A2: 'A2.mp3',
      C3: 'C3.mp3',
      'D#3': 'Ds3.mp3',
      'F#3': 'Fs3.mp3',
      A3: 'A3.mp3',
      C4: 'C4.mp3',
      'D#4': 'Ds4.mp3',
      G4: 'G4.mp3',
      A4: 'A4.mp3',
      C5: 'C5.mp3',
      D5: 'D5.mp3',
    },
    release: 0.4,
    supportsSustain: false,
  },
]

export const DEFAULT_INSTRUMENT_ID = INSTRUMENTS[0].id
