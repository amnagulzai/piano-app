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

The two letter rows are the white keys; the rows physically above them are the
black keys, mirroring a real piano.

| Computer keys | Notes |
| --- | --- |
| Top letter row `Q W E R T Y U I O P` | White keys C3–E4 (lower octave) |
| Number row `2 3 5 6 7 9 0` | Black keys C#3–D#4 |
| Bottom letter row `Z X C V B N M , . /` | White keys F4–A5 (upper octave) |
| Home row `S D F H J L ;` and `'` | Black keys F#4–A#5 |

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
