import { useCallback, useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import type { InstrumentConfig } from './instruments'
import { installAudioUnlock, unlockAudio } from './audioUnlock'

type UseInstrument = {
  /** True once all samples for the current instrument are decoded and ready. */
  loaded: boolean
  /** Attack a note (e.g. "C4"). Starts the AudioContext on first call. */
  play: (note: string) => Promise<void>
  /** Release a previously attacked note. */
  stop: (note: string) => void
}

/**
 * Builds a Tone.Sampler for the given instrument and exposes play/stop.
 * Rebuilds (and disposes the old sampler) whenever the instrument changes.
 */
export function useInstrument(config: InstrumentConfig): UseInstrument {
  const samplerRef = useRef<Tone.Sampler | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Prime audio on the first interaction anywhere (key, control, or keypress).
  useEffect(() => installAudioUnlock(), [])

  useEffect(() => {
    setLoaded(false)
    const sampler = new Tone.Sampler({
      urls: config.samples,
      baseUrl: config.baseUrl,
      release: config.release,
      onload: () => setLoaded(true),
    }).toDestination()
    samplerRef.current = sampler

    return () => {
      sampler.dispose()
      samplerRef.current = null
    }
  }, [config])

  const play = useCallback(async (note: string) => {
    // Browsers require a user gesture before audio can start; on mobile this
    // also routes audio past the iOS mute switch. Resolves immediately once
    // audio is already running.
    await unlockAudio()
    samplerRef.current?.triggerAttack(note)
  }, [])

  const stop = useCallback((note: string) => {
    samplerRef.current?.triggerRelease(note)
  }, [])

  return { loaded, play, stop }
}
