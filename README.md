# Virtual Piano

An interactive virtual grand piano you can play with your mouse or computer
keyboard. Built with React, TypeScript, and Vite, with high-quality grand
piano sound that works **offline**.

## Features

- 🎹 **Playable keyboard** spanning C3–A#5 (20 white + 15 black keys), played
  with the mouse or the computer keyboard.
- 🔊 **Real grand piano sound, offline** — Salamander Grand Piano samples are
  bundled locally and played through [Tone.js](https://tonejs.github.io/)'s
  `Sampler`, which pitch-shifts between samples. No network needed at runtime.
- ✨ **Visual feedback** — each key shows its keyboard letter and note name and
  highlights while pressed.
- 🎚️ **Toggleable sustain pedal** — when on, notes keep ringing after the key
  is released.
- 🎛️ **Instrument-ready architecture** — sound sits behind an instrument
  registry, so new instruments are just a sample set plus one config entry.

## Keyboard mapping

The two letter rows are the white keys; the rows above them are the black keys,
mirroring a real piano. White letter keys always land on natural notes (so they
stay white) and black keys are the sharps between them.

| Computer keys | Role |
| --- | --- |
| Top letter row `Q W E R T Y U I O P` | White keys |
| Bottom letter row `Z X C V B N M , . /` | White keys |
| Number row `1`–`0` | Black keys (above the top row) |
| Home row `A S D F G H J K L ;` and `'` | Black keys (above the bottom row) |

At the default position `Q` is C3. A black key plays nothing where no sharp
exists (there is none between B–C or E–F).

### Sliding the range

Use **← / →** (or the **‹ ›** range buttons in the toolbar) to slide the whole
keyboard a diatonic step at a time. Each press shifts every key to the next
lower/higher natural note — e.g. `Q`: C3 → B2 → A2, with the black keys becoming
the sharps below the new white notes. The white/black layout never changes; only
the notes do. The range is clamped to a standard 88-key piano (A0–C8).

Audio unlocks on your first interaction (a browser requirement), so the first
click or key press is what starts the sound.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check and build for production
npm run preview  # preview the production build
```

## Project structure

```
src/
  audio/
    instruments.ts    # instrument registry + config types
    useInstrument.ts  # builds a Tone.Sampler and exposes play/stop
  piano/
    keyMap.ts         # keyboard -> note mapping and the on-screen key layout
    Piano.tsx         # keyboard rendering, input handling, sustain logic
    PianoKey.tsx      # a single white or black key
    piano.css         # keyboard styles
  App.tsx             # header, instrument selector, sustain toggle
public/
  samples/piano/      # bundled Salamander grand piano samples (offline)
```

## Adding another instrument

1. Drop its samples under `public/samples/<id>/`.
2. Add an entry to the `INSTRUMENTS` array in `src/audio/instruments.ts`.

It will then appear in the instrument selector automatically.

## Credits

Bundled instrument samples (both [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/)):

- **Grand Piano** — [Salamander Grand Piano](https://archive.org/details/SalamanderGrandPianoV3)
  by Alexander Holm.
- **Harmonium** — Indian harmonium from
  [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments)
  (CC0 recording from Yale's Euterpea Studio, Freesound #330410).
