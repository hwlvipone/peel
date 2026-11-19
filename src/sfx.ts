const storageKey = 'peel-sfx-muted';
let muted = false;

try { muted = localStorage.getItem(storageKey) === 'true'; } catch { /* Storage is optional. */ }

const files = {
  tap: '/audio/ui-tap.mp3',
  correct: '/audio/ui-correct.mp3',
  wrong: '/audio/ui-wrong.mp3',
  clear: '/audio/ui-clear.mp3'
} as const;

export function sfxMuted() { return muted; }

export function toggleSfx() {
  muted = !muted;
  try { localStorage.setItem(storageKey, String(muted)); } catch { /* Keep playing. */ }
}

export function playSfx(name: keyof typeof files) {
  if (muted) return;
  try {
    const audio = new Audio(files[name]);
    void audio.play().catch(() => { /* SFX failure never blocks gameplay. */ });
  } catch { /* SFX failure never blocks gameplay. */ }
}
