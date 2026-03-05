/**
 * Audio player utility for playing MP3/OGG files in the terminal.
 * Uses HTML5 Audio API for file playback.
 */

let currentAudio: HTMLAudioElement | null = null;
let onEndedCallback: (() => void) | null = null;

/**
 * Play an audio file from the given URL/path.
 * Automatically stops any currently playing audio.
 */
export function playAudioFile(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Stop any currently playing audio
    stopAudio();

    try {
      currentAudio = new Audio(src);
      
      currentAudio.addEventListener('ended', () => {
        currentAudio = null;
        onEndedCallback?.();
        resolve();
      });

      currentAudio.addEventListener('error', (e) => {
        currentAudio = null;
        reject(new Error(`Failed to load audio: ${src}`));
      });

      currentAudio.play().catch((err) => {
        currentAudio = null;
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Stop the currently playing audio.
 */
export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * Check if audio is currently playing.
 */
export function isPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}

/**
 * Get the currently playing audio source (if any).
 */
export function getCurrentSource(): string | null {
  return currentAudio?.src || null;
}

/**
 * Set a callback to be called when audio finishes playing.
 */
export function setOnEnded(callback: (() => void) | null): void {
  onEndedCallback = callback;
}
