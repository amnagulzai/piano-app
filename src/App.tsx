import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_INSTRUMENT_ID, INSTRUMENTS } from './audio/instruments'
import { useInstrument } from './audio/useInstrument'
import { setMasterVolume } from './audio/master'
import { Piano } from './piano/Piano'
import {
  MAX_SHIFT,
  MIN_SHIFT,
  SHIFT_STEP,
  buildWindow,
  clampShift,
} from './piano/keyMap'
import './App.css'

function App() {
  const [instrumentId, setInstrumentId] = useState(DEFAULT_INSTRUMENT_ID)
  const [sustain, setSustain] = useState(true)
  const [shift, setShift] = useState(0)
  const [volume, setVolume] = useState(100)
  const config = useMemo(
    () => INSTRUMENTS.find((i) => i.id === instrumentId) ?? INSTRUMENTS[0],
    [instrumentId],
  )
  const { loaded, play, stop } = useInstrument(config)

  // Some instruments (e.g. harmonium) have no sustain; keep the user's toggle
  // preference but neither apply nor allow it for those.
  const supportsSustain = config.supportsSustain !== false
  const effectiveSustain = sustain && supportsSustain

  // Master output volume (affects every instrument). Caps at unity (0 dB) so it
  // never boosts above an instrument's own level.
  useEffect(() => {
    setMasterVolume(volume)
  }, [volume])

  const onShift = useCallback((delta: number) => {
    setShift((s) => clampShift(s + delta))
  }, [])

  const keys = useMemo(() => buildWindow(shift), [shift])
  const rangeStart = keys[0].note
  const rangeEnd = keys[keys.length - 1].note

  return (
    <main className="app">
      <div className="controls">
        <div className="control-group">
          <label htmlFor="instrument">Instrument</label>
          <div className="select-wrap">
            <select
              id="instrument"
              value={instrumentId}
              onChange={(e) => setInstrumentId(e.target.value)}
            >
              {INSTRUMENTS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="divider" aria-hidden="true" />

        <div className="control-group">
          <label>Range</label>
          <div className="shifter">
            <button
              type="button"
              className="shift-btn"
              aria-label="Shift down"
              disabled={shift <= MIN_SHIFT}
              onClick={() => onShift(-SHIFT_STEP)}
            >
              ‹
            </button>
            <span className="range">
              {rangeStart} – {rangeEnd}
            </span>
            <button
              type="button"
              className="shift-btn"
              aria-label="Shift up"
              disabled={shift >= MAX_SHIFT}
              onClick={() => onShift(SHIFT_STEP)}
            >
              ›
            </button>
          </div>
        </div>

        <span className="divider" aria-hidden="true" />

        <button
          type="button"
          className={`sustain-toggle${effectiveSustain ? ' is-on' : ''}`}
          aria-pressed={effectiveSustain}
          disabled={!supportsSustain}
          title={supportsSustain ? undefined : `No sustain for ${config.name}`}
          onClick={() => setSustain((s) => !s)}
        >
          <span className="dot" aria-hidden="true" />
          Sustain
        </button>

        <span className="divider" aria-hidden="true" />

        <div className="control-group volume-group">
          <svg className="vol-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4z" />
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              d="M16.5 8.5a5 5 0 0 1 0 7"
            />
          </svg>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            aria-label="Volume"
            className="volume-slider"
            style={{
              background: `linear-gradient(to right, var(--accent) ${volume}%, rgba(255,255,255,0.12) ${volume}%)`,
            }}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </div>

        <span className={`status${loaded ? ' is-ready' : ''}`}>
          {loaded ? 'Ready' : 'Loading…'}
        </span>
      </div>

      <Piano
        play={play}
        stop={stop}
        sustain={effectiveSustain}
        keys={keys}
        onShift={onShift}
      />
    </main>
  )
}

export default App
