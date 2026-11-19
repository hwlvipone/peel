import './styles.css';
import level from './data/level-1.json';
import { playPronunciation } from './audio';
import { playSfx, sfxMuted, toggleSfx } from './sfx';

type Screen = 'opening' | 'level' | 'end';
const storageKey = 'peel-level-1';
const app = document.querySelector<HTMLDivElement>('#app')!;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const target = level.targets[0];
let completed = false;
let screen: Screen = 'opening';

try {
  const saved = localStorage.getItem(storageKey);
  if (saved === 'started' || saved === 'completed') screen = 'level';
  completed = saved === 'completed';
} catch { /* Storage is optional, including in private browsing. */ }

function save(value: 'started' | 'completed') {
  try { localStorage.setItem(storageKey, value); } catch { /* Keep playing. */ }
}

const speakerIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/></svg>`;

function speaker(audio: string, pinyin: string, context: string) {
  return `<span class="audio-control"><button class="speaker" type="button" data-audio="${audio}" data-feedback="${context}" aria-label="Play pronunciation: ${pinyin}">${speakerIcon}</button><span class="audio-error" id="${context}-error" role="status" aria-live="polite"></span></span>`;
}

function sfxButton() {
  return `<button type="button" class="sfx-toggle" id="sfx-toggle" aria-label="${sfxMuted() ? 'Unmute' : 'Mute'} game sound" aria-pressed="${!sfxMuted()}"><span class="sfx-indicator" aria-hidden="true"></span>SFX ${sfxMuted() ? 'OFF' : 'ON'}</button>`;
}

function bindSfx() {
  document.querySelector('#sfx-toggle')?.addEventListener('click', () => {
    toggleSfx();
    const button = document.querySelector<HTMLButtonElement>('#sfx-toggle')!;
    button.setAttribute('aria-label', `${sfxMuted() ? 'Unmute' : 'Mute'} game sound`);
    button.setAttribute('aria-pressed', String(!sfxMuted()));
    button.innerHTML = `<span class="sfx-indicator" aria-hidden="true"></span>SFX ${sfxMuted() ? 'OFF' : 'ON'}`;
    if (!sfxMuted()) playSfx('tap');
  });
}

function renderOpening() {
  app.innerHTML = `<main class="page opening"><div class="opening-hero"><header class="opening-header"><span class="wordmark">PEEL<span class="mark-dot">.</span></span><span class="edition">ONE CHARACTER. MORE INSIDE.</span></header><section class="opening-main"><div class="title-art" aria-hidden="true"><span class="title-ring ring-one"></span><span class="title-ring ring-two"></span><span class="title-han" lang="zh-Hans">${level.parent.character}</span><span class="title-spark spark-one"></span><span class="title-spark spark-two"></span></div><div class="opening-copy"><span class="overline">A CHINESE CHARACTER PUZZLE</span><h1>Peel<span class="mark-dot">.</span></h1><p>Find the smaller characters hiding inside a larger one. Hear each one, and see what it means.</p><button type="button" class="action play-button" id="begin"><span>PLAY LEVEL 1</span><span class="button-arrow" aria-hidden="true">→</span></button><span class="opening-footnote">ONE LEVEL. MORE TO COME.</span></div></section></div><section class="how-to-play" aria-labelledby="how-to-play-heading"><h2 id="how-to-play-heading">How to play</h2><p>A large Chinese character appears with its pronunciation and a short English meaning.</p><p>Below it is a keyboard of possible characters. Tap the ones hiding inside the large character.</p><p>A right answer is collected. A miss just shakes — no lives, no timer.</p><p>When you've found them all, you'll see how the character is built.</p><p>You don't need to know Chinese to start. This is a puzzle, not a course.</p><p>Level 1 is live. More levels are on the way.</p><button type="button" class="action play-button" id="begin-after-how-to"><span>PLAY LEVEL 1</span><span class="button-arrow" aria-hidden="true">→</span></button></section></main>`;
  const startLevel = () => {
    playSfx('tap');
    screen = 'level';
    save('started');
    render();
  };
  document.querySelector('#begin')!.addEventListener('click', startLevel);
  document.querySelector('#begin-after-how-to')!.addEventListener('click', startLevel);
}

function collectedCard() {
  return `<div class="collected-card"><span class="collected-han" lang="zh-Hans">${target.character}</span><div class="collected-info"><span class="pinyin">${target.pinyin}</span><span class="gloss">${target.gloss}</span></div>${speaker(target.audio, target.pinyin, 'target')}</div>`;
}

function bindAudio() {
  document.querySelectorAll<HTMLButtonElement>('[data-audio]').forEach(button => {
    button.addEventListener('click', () => {
      const error = document.querySelector<HTMLElement>(`#${button.dataset.feedback}-error`)!;
      playPronunciation(button.dataset.audio!, message => { if (error.isConnected) error.textContent = message; });
    });
  });
}

function goNext() {
  playSfx('tap');
  screen = 'end';
  render();
}

function renderLevel() {
  app.innerHTML = `<main class="page level"><header class="hud"><span class="wordmark">PEEL<span class="mark-dot">.</span></span><span class="level-id"><span class="level-id-dot"></span>LEVEL 1</span>${sfxButton()}</header><section class="stage" aria-label="Level 1"><div class="stage-top"><span>01 / 01</span><span class="stage-progress"><span class="progress-track"><span class="progress-fill ${completed ? 'is-full' : ''}" id="progress-fill"></span></span><span id="progress-count">${completed ? '1' : '0'} / 1</span></span></div><div class="hero-group"><div class="hero-character ${completed ? 'highlight' : ''}" role="img" aria-label="${level.parent.character}, two horizontal strokes"><span class="hero-han" lang="zh-Hans">${level.parent.character}</span></div><div class="hero-meta"><span class="pinyin">${level.parent.pinyin}</span><span class="gloss">${level.parent.gloss}</span>${speaker(level.parent.audio, level.parent.pinyin, 'parent')}</div></div><p class="hint">${level.hint}</p><div class="collection-row"><span class="slot-label">COLLECT <span id="slot-count">${completed ? '1' : '0'} / 1</span></span><div class="slot ${completed ? 'is-filled' : ''}" id="slot" aria-label="Collected characters">${completed ? collectedCard() : '<span class="slot-empty" aria-hidden="true">+</span><span class="sr-only">Empty collection slot</span>'}</div></div><div class="keyboard" aria-label="Candidate characters">${level.candidates.map(character => `<button class="key ${completed && character === target.character ? 'is-locked' : ''}" type="button" data-character="${character}" aria-label="Select ${character}" ${completed && character === target.character ? 'disabled' : ''}><span lang="zh-Hans">${character}</span></button>`).join('')}</div><div class="completion ${completed ? 'is-visible' : ''}" id="completion" ${completed ? '' : 'hidden'}><div class="completion-copy"><strong>LEVEL CLEAR</strong><span>${level.completionNote}</span></div><button class="action next" id="next" type="button"><span>NEXT</span><span class="button-arrow" aria-hidden="true">→</span></button></div></section></main>`;
  bindSfx();
  bindAudio();
  document.querySelectorAll<HTMLButtonElement>('.key').forEach(key => key.addEventListener('click', () => {
    if (key.dataset.character === target.character) collect(key);
    else wrongTap(key);
  }));
  document.querySelector('#next')?.addEventListener('click', goNext);
}

function wrongTap(key: HTMLButtonElement) {
  playSfx('wrong');
  key.getAnimations().forEach(animation => animation.cancel());
  if (reducedMotion.matches) return;
  key.animate([
    { transform: 'translateX(0)', backgroundColor: 'var(--tile)' },
    { transform: 'translateX(-10px)', backgroundColor: 'var(--miss)' },
    { transform: 'translateX(9px)', backgroundColor: 'var(--miss)' },
    { transform: 'translateX(-5px)', backgroundColor: 'var(--miss)' },
    { transform: 'translateX(0)', backgroundColor: 'var(--tile)' }
  ], { duration: 165, easing: 'ease-out' });
}

function collect(key: HTMLButtonElement) {
  if (completed) return;
  completed = true;
  key.disabled = true;
  key.classList.add('is-locked');
  save('completed');
  playSfx('correct');
  document.querySelector('.hero-character')!.classList.add('highlight');
  const slot = document.querySelector<HTMLElement>('#slot')!;

  const showResult = () => {
    slot.innerHTML = collectedCard();
    slot.classList.add('is-filled');
    document.querySelector('#progress-fill')!.classList.add('is-full');
    document.querySelector('#progress-count')!.textContent = '1 / 1';
    document.querySelector('#slot-count')!.textContent = '1 / 1';
    bindAudio();
    const completion = document.querySelector<HTMLElement>('#completion')!;
    completion.hidden = false;
    completion.querySelector('#next')!.addEventListener('click', goNext);
    if (reducedMotion.matches) completion.classList.add('is-visible');
    else {
      slot.animate([{ transform: 'scale(.87)' }, { transform: 'scale(1.07)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' });
      requestAnimationFrame(() => completion.classList.add('is-visible'));
    }
    playSfx('clear');
  };

  if (reducedMotion.matches) { showResult(); return; }
  const start = key.getBoundingClientRect();
  const end = slot.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.className = 'flying-character';
  ghost.textContent = target.character;
  ghost.setAttribute('aria-hidden', 'true');
  ghost.setAttribute('lang', 'zh-Hans');
  ghost.style.left = `${start.left}px`;
  ghost.style.top = `${start.top}px`;
  ghost.style.width = `${start.width}px`;
  ghost.style.height = `${start.height}px`;
  document.body.append(ghost);
  const dx = end.left + end.width / 2 - (start.left + start.width / 2);
  const dy = end.top + end.height / 2 - (start.top + start.height / 2);
  ghost.animate([
    { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
    { transform: `translate(${dx * .48}px, ${dy * .55 - 42}px) scale(1.28) rotate(-8deg)`, opacity: 1, offset: .53 },
    { transform: `translate(${dx}px, ${dy}px) scale(.72) rotate(0deg)`, opacity: 1 }
  ], { duration: 410, easing: 'cubic-bezier(.22,.85,.3,1)' }).finished.then(() => {
    ghost.remove(); showResult();
  }).catch(() => { ghost.remove(); showResult(); });
}

function renderEnd() {
  app.innerHTML = `<main class="page end"><header class="hud"><span class="wordmark">PEEL<span class="mark-dot">.</span></span>${sfxButton()}</header><section class="end-main"><div class="end-emblem"><span lang="zh-Hans">${level.parent.character}</span><span class="end-check" aria-label="Cleared">✓</span></div><span class="overline">LEVEL 1 COMPLETE</span><h1>${level.previewEnd}</h1><p>First layer down. The next ones are on their way.</p><div class="end-badge">YOU FOUND <span lang="zh-Hans">${target.character}</span></div></section></main>`;
  bindSfx();
}

function render() {
  if (screen === 'opening') renderOpening();
  else if (screen === 'level') renderLevel();
  else renderEnd();
}

render();
