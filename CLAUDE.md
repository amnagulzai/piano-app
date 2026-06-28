# CLAUDE.md

Guidance for working in this repo.

## What this is

An interactive virtual **grand piano** — React 19 + Vite + TypeScript. Played
with the mouse/touch or the computer keyboard. High-quality piano sound that
works **offline**. Deployed to GitHub (`amnagulzai/piano-app`); can auto-deploy
to Vercel on push (static Vite app, framework auto-detected, no config needed).

## Architecture

**Audio layer** (`src/audio/`)
- `instruments.ts` — `InstrumentConfig` type + `INSTRUMENTS` registry. Adding an
  instrument = drop samples under `public/samples/<id>/` and add one registry
  entry; it appears in the selector automatically.
- `useInstrument.ts` — builds a `Tone.Sampler` from a config; exposes
  `play(note)` / `stop(note)` / `loaded`. Rebuilds (and disposes) on instrument
  change.
- `audioUnlock.ts` — mobile audio fix. `unlockAudio()` sets
  `navigator.audioSession.type = 'playback'` (so iOS ignores the mute switch)
  and resumes the AudioContext; must be called from a user gesture.
  `installAudioUnlock()` primes audio on the first interaction anywhere.

**Piano layer** (`src/piano/`)
- `keyMap.ts` — the core model (see below). `buildWindow(shift)`,
  `groupKeys()`, `clampShift()`, `MIN_SHIFT`/`MAX_SHIFT`, `SHIFT_STEP`.
- `Piano.tsx` — rendering, pointer + keyboard input, sustain logic, arrow-key
  shifting. Receives the prebuilt `keys` array from `App`.
- `PianoKey.tsx` — one white or black key.
- `piano.css` — keyboard styling.

`App.tsx` owns `instrumentId`, `sustain`, and `shift` state, builds the window
(`buildWindow(shift)`), and renders the glass toolbar (instrument select, range
shifter `‹ ›`, sustain toggle, status).

## Key model (important, non-obvious)

The keyboard is a **diatonic sliding window**, NOT a fixed mapping or a
transpose:
- White letter keys (`Q–P`, `Z–/`) always land on **natural notes** → always
  rendered white. The number row (`1`–`0`) and home row (`A–;` + `'`) are the
  **black keys** (sharps between adjacent whites) → always rendered black. This
  invariant must hold at every shift.
- A black key plays nothing where no sharp exists (no black between B–C or E–F).
- **Arrow keys / `‹ ›` buttons** slide the window one diatonic (white-key) step.
  Left: every white key drops to the next lower natural (C3→B2→A2…) and blacks
  become the sharps below the new whites. Clamped to A0–C8.
- At window edges, an **unlabelled context white key** is added so an edge black
  key straddles between two whites (no tuck / no half-cut). These context keys
  have no keyboard shortcut but are mouse/touch playable.
- Notes are unique within the window, so active/highlight state is tracked by
  note name. Held/sustained notes are released whenever the window shifts.

## Sound samples

Salamander Grand Piano `.mp3` samples are bundled in `public/samples/piano/`
(minor-third spacing, ~13 files; `Tone.Sampler` interpolates between them). They
are committed so the app works offline — do not delete them. Note files use `s`
for sharps (e.g. `Ds3.mp3` = D#3).

## Dev / verify

- `npm run dev` (http://localhost:5173), `npm run build` (tsc + vite), always
  build before committing.
- No automated test suite. Verify UI/behavior by driving the running dev server
  with Playwright and **looking at screenshots** (light + dark, desktop +
  mobile). Playwright's bundled Chromium is installed; run throwaway scripts
  from the npx cache dir (`~/.npm/_npx/<hash>/`) so `import 'playwright'`
  resolves, then delete them.
- Audio output can't be verified headless; verify the gesture-unlock path runs
  without errors and assert on classes/labels instead.

## Tooling notes

- `gh` CLI is installed at `~/bin/gh` (not on default PATH) — prefix commands
  with `export PATH="$HOME/bin:$PATH"`. Git uses gh as its credential helper.
- No Homebrew; install CLIs by downloading release binaries to `~/bin`.
- `.claude/` is gitignored (local settings).

## Conventions

- Match the existing code style; keep comments at the altitude of *why*.
- Respect explicit UI decisions already made: no page title/description; the
  controls toolbar sits at the top; the piano is centered with symmetric margins
  on wide screens and stacks into 3 rows on mobile (≤720px).
