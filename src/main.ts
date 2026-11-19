import './styles.css';
import level from './data/level-1.json';
import { playPronunciation } from './audio';

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
} catch { /* Private browsing may disable storage. */ }

function save(value: 'started' | 'completed') {
  try { localStorage.setItem(storageKey, value); } catch { /* Play still works without storage. */ }
}

const speakerIcon = `<svg class="speaker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/></svg>`;

function speaker(audio: string, pinyin: string, context: string) {
  return `<span class="audio-control"><button class="speaker" type="button" data-audio="${audio}" data-feedback="${context}" aria-label="Play pronunciation: ${pinyin}">${speakerIcon}</button><span class="audio-error" id="${context}-error" role="status" aria-live="polite"></span></span>`;
}

function renderOpening() {
  app.innerHTML = `<main class="page opening"><div class="opening-content"><div class="eyebrow">A study in seeing</div><h1>Peel<span class="title-period">.</span></h1><div class="opening-rule"></div><p>Find the characters hidden inside a larger one.</p><button type="button" class="action begin" id="begin">Begin <span aria-hidden="true">↗</span></button></div><div class="folio">01 / A closer look</div></main>`;
  document.querySelector('#begin')!.addEventListener('click', () => {
    screen = 'level';
    save('started');
    render();
  });
}

function renderLevel() {
  app.innerHTML = `<main class="page level"><header class="level-header"><span class="brand">Peel<span class="brand-period">.</span></span><span class="chapter">Chapter 1 <span class="dash">—</span> Strokes</span></header><section class="play" aria-label="Level 1"><div class="hero-group"><div class="hero-character" role="img" aria-label="二, two horizontal strokes"><svg viewBox="0 0 240 240" aria-hidden="true" class="hero-svg"><path class="stroke-ink" d="M55 76 Q120 74 184 76 L179 87 Q120 85 59 87 Z M35 149 Q120 147 205 149 L198 163 Q120 160 41 163 Z"/><path class="stroke-accent" d="M55 76 Q120 74 184 76 L179 87 Q120 85 59 87 Z M35 149 Q120 147 205 149 L198 163 Q120 160 41 163 Z"/></svg></div><div class="hero-meta"><span class="pinyin">${level.parent.pinyin}</span>${speaker(level.parent.audio, level.parent.pinyin, 'parent')}<span class="meta-divider" aria-hidden="true"></span><span class="gloss">${level.parent.gloss}</span></div></div><div class="exercise"><p class="hint">${level.hint}</p><div class="collection-heading"><span>FOUND CHARACTER</span><span>01 / 01</span></div><div id="collection" class="collection ${completed ? 'is-found' : ''}" aria-label="Collected characters"><div class="slot" id="slot">${completed ? collectedCard() : '<span class="slot-mark" aria-hidden="true">+</span><span class="sr-only">Empty slot</span>'}</div></div><div class="keyboard-heading">TAP A CHARACTER</div><div class="keyboard" aria-label="Candidate characters">${level.candidates.map(character => `<button class="key ${completed && character === target.character ? 'is-locked' : ''}" type="button" data-character="${character}" aria-label="Select ${character}" ${completed && character === target.character ? 'disabled' : ''}>${character}</button>`).join('')}</div><div class="completion ${completed ? 'is-visible' : ''}" id="completion" ${completed ? '' : 'hidden'}><p>${level.completionNote}</p><button class="action next" id="next" type="button">Next <span aria-hidden="true">↗</span></button></div></div></section><footer class="level-footer"><span>Look closer.</span><span>01 — 01</span></footer></main>`;
  bindAudio();
  document.querySelectorAll<HTMLButtonElement>('.key').forEach(key => key.addEventListener('click', () => {
    if (key.dataset.character === target.character) collect(key);
    else wrongTap(key);
  }));
  document.querySelector('#next')?.addEventListener('click', () => {
    screen = 'end';
    render();
  });
}

function collectedCard() {
  return `<div class="collected-card"><span class="collected-han">${target.character}</span><div class="collected-info"><span class="pinyin">${target.pinyin}</span>${speaker(target.audio, target.pinyin, 'target')}<span class="meta-divider" aria-hidden="true"></span><span class="gloss">${target.gloss}</span></div></div>`;
}

function bindAudio() {
  document.querySelectorAll<HTMLButtonElement>('[data-audio]').forEach(button => {
    button.addEventListener('click', () => {
      const error = document.querySelector<HTMLElement>(`#${button.dataset.feedback}-error`)!;
      playPronunciation(button.dataset.audio!, message => { if (error.isConnected) error.textContent = message; });
    });
  });
}

function wrongTap(key: HTMLButtonElement) {
  key.getAnimations().forEach(animation => animation.cancel());
  if (reducedMotion.matches) return;
  key.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-5px)' }, { transform: 'translateY(0)' }], { duration: 160, easing: 'ease-out' });
}

function collect(key: HTMLButtonElement) {
  if (completed) return;
  completed = true;
  key.disabled = true;
  key.classList.add('is-locked');
  save('completed');
  const slot = document.querySelector<HTMLElement>('#slot')!;
  const hero = document.querySelector<HTMLElement>('.hero-character')!;
  hero.classList.add('highlight');

  const showResult = () => {
    slot.innerHTML = collectedCard();
    document.querySelector('#collection')!.classList.add('is-found');
    bindAudio();
    const completion = document.querySelector<HTMLElement>('#completion')!;
    completion.hidden = false;
    completion.querySelector('#next')!.addEventListener('click', () => { screen = 'end'; render(); });
    requestAnimationFrame(() => completion.classList.add('is-visible'));
  };

  if (reducedMotion.matches) { showResult(); return; }
  const start = key.getBoundingClientRect();
  const end = slot.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.className = 'flying-character';
  ghost.textContent = target.character;
  ghost.setAttribute('aria-hidden', 'true');
  ghost.style.left = `${start.left}px`;
  ghost.style.top = `${start.top}px`;
  ghost.style.width = `${start.width}px`;
  ghost.style.height = `${start.height}px`;
  document.body.append(ghost);
  const dx = end.left + 34 - (start.left + start.width / 2);
  const dy = end.top + end.height / 2 - (start.top + start.height / 2);
  const animation = ghost.animate([
    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
    { transform: `translate(${dx}px, ${dy}px) scale(1.12)`, opacity: 0 }
  ], { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  animation.finished.then(() => { ghost.remove(); showResult(); }).catch(() => { ghost.remove(); showResult(); });
}

function renderEnd() {
  app.innerHTML = `<main class="page end"><div class="end-content"><div class="eyebrow">Peel / 01</div><div class="end-han" lang="zh-Hans">二</div><div class="opening-rule"></div><h1>${level.previewEnd}</h1><p>Thanks for looking closer.</p></div><div class="folio">01 / End of preview</div></main>`;
}

function render() {
  if (screen === 'opening') renderOpening();
  else if (screen === 'level') renderLevel();
  else renderEnd();
}

render();
