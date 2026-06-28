import { useMemo, useState } from 'react'
import { DEFAULT_INSTRUMENT_ID, INSTRUMENTS } from './audio/instruments'
import { useInstrument } from './audio/useInstrument'
import { Piano } from './piano/Piano'
import './App.css'

function App() {
  const [instrumentId, setInstrumentId] = useState(DEFAULT_INSTRUMENT_ID)
  const [sustain, setSustain] = useState(false)
  const config = useMemo(
    () => INSTRUMENTS.find((i) => i.id === instrumentId) ?? INSTRUMENTS[0],
    [instrumentId],
  )
  const { loaded, play, stop } = useInstrument(config)

  return (
    <main className="app">
      <header className="app-header">
        <h1>Virtual Piano</h1>
        <p>
          Play with your mouse or computer keyboard across two octaves (C3–A5)
          — the top two rows are the lower octave, the bottom two the upper.
        </p>
      </header>

      <div className="controls">
        <label htmlFor="instrument">Instrument</label>
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
        <button
          type="button"
          className={`sustain-toggle${sustain ? ' is-on' : ''}`}
          aria-pressed={sustain}
          onClick={() => setSustain((s) => !s)}
        >
          Sustain: {sustain ? 'On' : 'Off'}
        </button>

        <span className={`status${loaded ? ' is-ready' : ''}`}>
          {loaded ? 'Ready' : 'Loading samples…'}
        </span>
      </div>

      <Piano play={play} stop={stop} sustain={sustain} />
    </main>
  )
}

export default App
