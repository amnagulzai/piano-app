import * as Tone from 'tone'

/**
 * Set the master output volume from a 0–100 slider value. 100 = unity (0 dB),
 * 0 = muted. Uses a gain→dB curve so the slider feels roughly perceptual.
 */
export function setMasterVolume(percent: number): void {
  const volume = Tone.getDestination().volume
  volume.value = percent <= 0 ? -Infinity : Tone.gainToDb(percent / 100)
}
