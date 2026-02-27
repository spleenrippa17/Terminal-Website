/**
 * CORE Terminal sound engine using Web Audio API
 * Deep mechanical sounds: clunks, drive whirs, relay clicks, servo noise
 * Themed for heavy 23rd-century mainframe hardware (Weyland-Yutani CORE v9.1)
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

/** Play a tone with optional frequency sweep */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sawtooth',
  volume = 0.08,
  startTime?: number,
  endFrequency?: number
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  const start = startTime ?? ctx.currentTime;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
  }

  gainNode.gain.setValueAtTime(volume, start);
  gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.01);
}

/** Generate a burst of filtered noise (for mechanical/drive sounds) */
function playNoise(
  duration: number,
  volume = 0.05,
  startTime?: number,
  lowFreq = 80,
  highFreq = 400,
  attack = 0.005,
  decay?: number
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Band-pass filter to shape the noise character
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = (lowFreq + highFreq) / 2;
  filter.Q.value = (lowFreq + highFreq) / (highFreq - lowFreq);

  const gainNode = ctx.createGain();
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  const start = startTime ?? ctx.currentTime;
  const decayTime = decay ?? duration;
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(volume, start + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.001, start + decayTime);

  source.start(start);
  source.stop(start + duration + 0.01);
}

/** Deep mechanical clunk — relay/solenoid impact */
function playClunk(startTime?: number, volume = 0.12): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = startTime ?? ctx.currentTime;

  // Low thud body
  playTone(55, 0.08, 'sine', volume, t, 30);
  // Mid transient click
  playNoise(0.025, volume * 0.6, t, 200, 1200, 0.001, 0.025);
  // Sub rumble
  playTone(40, 0.12, 'sine', volume * 0.5, t + 0.01, 25);
}

/** Drive seek noise — mechanical arm movement */
function playDriveSeek(startTime?: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = startTime ?? ctx.currentTime;

  // Whirring sweep
  playTone(180, 0.18, 'sawtooth', 0.06, t, 90);
  // Seek click at end
  playNoise(0.03, 0.08, t + 0.15, 300, 2000, 0.001, 0.03);
  // Low motor hum
  playTone(60, 0.2, 'sine', 0.04, t, 55);
}

/** Keyboard key press — deep mechanical switch clunk */
export function playKeyClick(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Vary the clunk slightly each keypress
  const pitchVariance = 0.85 + Math.random() * 0.3;
  const t = ctx.currentTime;

  // Main clunk body
  playTone(70 * pitchVariance, 0.06, 'sine', 0.1, t, 35 * pitchVariance);
  // Mechanical click transient
  playNoise(0.02, 0.09, t, 400, 2500, 0.001, 0.02);
  // Spring return resonance
  playTone(120 * pitchVariance, 0.04, 'sine', 0.04, t + 0.015, 80 * pitchVariance);
}

/** Enter key — heavy relay engage + drive access */
export function playEnter(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Heavy clunk
  playClunk(t, 0.15);
  // Drive seek after brief delay
  playDriveSeek(t + 0.05);
  // Confirmation low tone
  playTone(110, 0.15, 'sine', 0.07, t + 0.1, 90);
}

/** Error — grinding buzz + alarm tone */
export function playError(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Grinding noise burst
  playNoise(0.12, 0.14, t, 100, 800, 0.005, 0.12);
  // Low alarm tone descending
  playTone(130, 0.2, 'sawtooth', 0.1, t, 65);
  playTone(90, 0.25, 'sawtooth', 0.08, t + 0.18, 55);
  // Second grind
  playNoise(0.08, 0.1, t + 0.22, 150, 600, 0.003, 0.08);
}

/** Navigation/select — drive seek + relay click */
export function playSelect(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  playDriveSeek(t);
  // Soft relay click
  playNoise(0.02, 0.07, t + 0.12, 500, 3000, 0.001, 0.02);
  playTone(85, 0.08, 'sine', 0.06, t + 0.14, 70);
}

/** Boot sequence — full mainframe startup: power-on, drive spin-up, relay cascade */
export function playBoot(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Power relay engage — heavy clunk
  playClunk(t, 0.18);

  // Drive spin-up whir (rising pitch)
  playTone(40, 0.8, 'sawtooth', 0.07, t + 0.1, 120);
  playNoise(0.8, 0.06, t + 0.1, 60, 300, 0.05, 0.8);

  // Relay cascade — series of clunks
  [0.5, 0.7, 0.9, 1.1].forEach((delay) => {
    playClunk(t + delay, 0.1);
  });

  // Drive seek sequence
  [1.2, 1.4, 1.6].forEach((delay) => {
    playDriveSeek(t + delay);
  });

  // Final confirmation tone — low and authoritative
  playTone(55, 0.4, 'sine', 0.1, t + 1.8, 50);
  playTone(82, 0.3, 'sine', 0.08, t + 2.0, 75);
  playTone(110, 0.5, 'sine', 0.09, t + 2.2, 100);
}

/** Page load — drive access sequence */
export function playPageLoad(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Drive seek
  playDriveSeek(t);
  // Data read noise bursts
  [0.12, 0.2, 0.28].forEach((delay) => {
    playNoise(0.04, 0.06, t + delay, 200, 1500, 0.002, 0.04);
  });
  // Completion clunk
  playClunk(t + 0.35, 0.09);
  // Low confirmation tone
  playTone(82, 0.12, 'sine', 0.06, t + 0.4, 75);
}

/** Backspace — short mechanical click, slightly lighter */
export function playBackspace(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  playTone(90, 0.04, 'sine', 0.08, t, 55);
  playNoise(0.015, 0.07, t, 300, 1800, 0.001, 0.015);
}

/** Tab/autocomplete — quick drive tick */
export function playTab(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  playNoise(0.025, 0.07, t, 250, 2000, 0.001, 0.025);
  playTone(100, 0.05, 'sine', 0.05, t + 0.01, 80);
}

/** Resume audio context after user interaction */
export function resumeAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}
