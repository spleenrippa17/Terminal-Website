/**
 * Retro DOS sound engine using Web Audio API
 * Generates procedural 8-bit style sounds
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.08,
  startTime?: number
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  const start = startTime ?? ctx.currentTime;
  gainNode.gain.setValueAtTime(volume, start);
  gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);

  oscillator.start(start);
  oscillator.stop(start + duration);
}

/** Keyboard click sound - short high-pitched tick */
export function playKeyClick(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Random slight pitch variation for realism
  const freq = 800 + Math.random() * 400;
  playTone(freq, 0.04, 'square', 0.06);
}

/** Enter/confirm sound - ascending two-tone beep */
export function playEnter(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  playTone(440, 0.08, 'square', 0.1);
  playTone(880, 0.12, 'square', 0.1, ctx.currentTime + 0.08);
}

/** Error sound - descending buzz */
export function playError(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  playTone(200, 0.15, 'sawtooth', 0.12);
  playTone(150, 0.2, 'sawtooth', 0.1, ctx.currentTime + 0.15);
}

/** Navigation/menu select sound - short blip */
export function playSelect(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  playTone(660, 0.06, 'square', 0.1);
  playTone(880, 0.08, 'square', 0.08, ctx.currentTime + 0.06);
}

/** Boot/startup sound sequence */
export function playBoot(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [
    { freq: 220, dur: 0.1, delay: 0 },
    { freq: 330, dur: 0.1, delay: 0.12 },
    { freq: 440, dur: 0.1, delay: 0.24 },
    { freq: 660, dur: 0.15, delay: 0.36 },
    { freq: 880, dur: 0.2, delay: 0.52 },
  ];

  notes.forEach(({ freq, dur, delay }) => {
    playTone(freq, dur, 'square', 0.08, ctx.currentTime + delay);
  });
}

/** Page load sound - quick ascending arpeggio */
export function playPageLoad(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [440, 550, 660, 880];
  notes.forEach((freq, i) => {
    playTone(freq, 0.08, 'square', 0.07, ctx.currentTime + i * 0.05);
  });
}

/** Backspace sound */
export function playBackspace(): void {
  playTone(300, 0.05, 'square', 0.05);
}

/** Tab/autocomplete sound */
export function playTab(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  playTone(550, 0.05, 'square', 0.07);
  playTone(660, 0.05, 'square', 0.06, ctx.currentTime + 0.05);
}

/** Resume audio context after user interaction */
export function resumeAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}
