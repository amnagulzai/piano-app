import * as Tone from 'tone'

type AudioSessionNavigator = Navigator & {
  audioSession?: { type: string }
}

/**
 * Prepare audio for playback. Must be called from within a user-gesture
 * handler (pointer/touch/key) so mobile browsers allow audio to start.
 * Safe to call repeatedly — the work is effectively idempotent.
 */
export async function unlockAudio(): Promise<void> {
  // iOS silences Web Audio when the hardware ring/silent switch is on unless
  // the audio session is set to the "playback" category. Newer Safari exposes
  // this via navigator.audioSession; it's a no-op elsewhere.
  const nav = navigator as AudioSessionNavigator
  if (nav.audioSession) {
    try {
      nav.audioSession.type = 'playback'
    } catch {
      // Experimental API — ignore if it throws.
    }
  }

  // Resume the AudioContext. This must be initiated inside the gesture, so we
  // call it synchronously (before any await) when the context isn't running.
  if (Tone.getContext().state !== 'running') {
    await Tone.start()
  }
}

/**
 * Resume audio on the first user interaction anywhere on the page, so audio is
 * primed even if the first tap lands on a control rather than a piano key.
 * Returns a cleanup function that removes the listeners.
 */
export function installAudioUnlock(): () => void {
  const events = ['pointerdown', 'touchend', 'mousedown', 'keydown'] as const
  const handler = () => {
    void unlockAudio()
  }
  events.forEach((e) => window.addEventListener(e, handler, { passive: true }))
  return () => events.forEach((e) => window.removeEventListener(e, handler))
}
