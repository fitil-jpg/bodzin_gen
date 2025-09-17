'use strict';

const STEP_COUNT = 16;
const LEVELS = 4;
const STEP_SYMBOLS = ['\u00b7', '\u25d4', '\u25d1', '\u25cf'];
const LEVEL_LABELS = ['Rest', 'Pulse', 'Accent', 'Lead'];

const TRACK_META = {
  lead: {
    label: 'Lead Synth',
    description:
      'A melodic lane with four velocity layers. Tap steps to cycle through intensities.'
  },
  hats: {
    label: 'Hi-Hats',
    description:
      'Tight 16-step hat editor. Use it to sculpt movement and energy in the groove.'
  }
};

const DEFAULT_SIDECHAIN = {
  duck_amount: 0.5,
  duck_attack_ms: 30,
  duck_release_ms: 250
};

const SIDECHAIN_PARAMS = [
  {
    id: 'duck_amount',
    label: 'Duck Amount',
    min: 0,
    max: 1,
    step: 0.01,
    format: value => `${Math.round(value * 100)}%`
  },
  {
    id: 'duck_attack_ms',
    label: 'Attack (ms)',
    min: 5,
    max: 150,
    step: 1,
    format: value => `${Math.round(value)} ms`
  },
  {
    id: 'duck_release_ms',
    label: 'Release (ms)',
    min: 50,
    max: 600,
    step: 1,
    format: value => `${Math.round(value)} ms`
  }
];

const SONG_TEMPLATES = {
  Intro: {
    description: 'Slow build with gentle sidechain and sparse hats for tension.',
    lead: [0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0],
    hats: [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    sidechain: { duck_amount: 0.35, duck_attack_ms: 42, duck_release_ms: 320 }
  },
  Build: {
    description: 'Add energy with rising lead accents and syncopated hats.',
    lead: [0, 3, 0, 1, 0, 2, 0, 1, 0, 3, 0, 2, 0, 2, 0, 3],
    hats: [1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0],
    sidechain: { duck_amount: 0.55, duck_attack_ms: 35, duck_release_ms: 260 }
  },
  Drop: {
    description: 'Maximum impact: heavy ducking, active lead, relentless hats.',
    lead: [3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 1, 0, 3, 0, 2, 0],
    hats: [2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 3, 2],
    sidechain: { duck_amount: 0.72, duck_attack_ms: 20, duck_release_ms: 220 }
  },
  Outro: {
    description: 'Wind-down with relaxed pump and decaying melodic phrases.',
    lead: [0, 2, 0, 1, 0, 1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 1],
    hats: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    sidechain: { duck_amount: 0.45, duck_attack_ms: 40, duck_release_ms: 360 }
  }
};

const state = {
  sidechain: { ...DEFAULT_SIDECHAIN },
  sequences: {
    lead: new Array(STEP_COUNT).fill(0),
    hats: new Array(STEP_COUNT).fill(0)
  },
  template: 'Intro'
};

initializeStateFromTemplate(state.template);

const sidechainRefs = new Map();
const sequenceButtons = { lead: [], hats: [] };
let statePreviewEl = null;
let templateDescriptionEl = null;
let templateSelectEl = null;
let statusEl = null;
let statusTimer = null;

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  injectStyles();
  document.body.classList.add('bodzin-shell');
  const root = document.createElement('div');
  root.id = 'app';
  document.body.appendChild(root);

  root.appendChild(createHeader());
  createStatusBar(root);
  createSidechainSection(root);
  createSequencerSection(root, 'lead');
  createSequencerSection(root, 'hats');
  createTemplateSection(root);
  createStatePreview(root);

  updateSidechainUI();
  renderSequence('lead');
  renderSequence('hats');
  updateTemplateDescription();
  updateStatePreview();
  showStatus(`${state.template} template loaded`);

  window.bodzinApp = {
    state,
    randomizeSequence,
    mutateSequence,
    applySongTemplate,
    setSidechainValue
  };
}

function injectStyles() {
  if (document.getElementById('bodzin-app-styles')) return;
  const style = document.createElement('style');
  style.id = 'bodzin-app-styles';
  style.textContent = `
    :root { color-scheme: dark; }
    body.bodzin-shell {
      margin: 0;
      min-height: 100vh;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      background: radial-gradient(circle at top, #1c2140 0%, #050510 60%);
      color: #f5f6ff;
    }
    #app {
      max-width: 960px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    header.hero {
      text-align: center;
      padding: 1rem 1.5rem 0.5rem;
    }
    header.hero h1 {
      margin: 0;
      font-size: 2.2rem;
      letter-spacing: 0.06em;
    }
    header.hero p {
      margin: 0.5rem 0 0;
      color: rgba(214, 219, 255, 0.75);
    }
    section.card {
      background: rgba(18, 20, 40, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 18px;
      padding: 1.5rem;
      box-shadow: 0 22px 45px rgba(5, 6, 20, 0.45);
    }
    section.card h2 {
      margin-top: 0;
      font-size: 1.35rem;
      letter-spacing: 0.04em;
    }
    section.card p {
      color: rgba(216, 220, 255, 0.8);
      line-height: 1.55;
    }
    .status {
      min-height: 1.25rem;
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #a6b4ff;
      opacity: 0.85;
      padding: 0 0.5rem;
    }
    .sidechain-controls {
      display: grid;
      gap: 1rem;
    }
    .control-row {
      display: grid;
      grid-template-columns: minmax(160px, 1fr) minmax(160px, 2fr) 80px;
      gap: 1rem;
      align-items: center;
    }
    .control-row span.label {
      font-weight: 600;
      letter-spacing: 0.04em;
    }
    .control-row input[type="range"] {
      width: 100%;
      accent-color: #7685ff;
    }
    .control-row .control-value {
      text-align: right;
      font-variant-numeric: tabular-nums;
      color: rgba(219, 224, 255, 0.9);
    }
    .sequence-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(2.5rem, 1fr));
      gap: 0.4rem;
      margin: 1.1rem 0 1.5rem;
    }
    .step-button {
      height: 2.6rem;
      border-radius: 0.85rem;
      border: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(118, 133, 255, 0.08);
      color: #f5f6ff;
      font-size: 1.05rem;
      transition: transform 0.12s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .step-button[data-level="0"] {
      background: rgba(118, 133, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.35);
      box-shadow: none;
    }
    .step-button[data-level="1"] {
      background: rgba(118, 133, 255, 0.18);
    }
    .step-button[data-level="2"] {
      background: rgba(118, 133, 255, 0.32);
      box-shadow: 0 6px 16px rgba(118, 133, 255, 0.24);
    }
    .step-button[data-level="3"] {
      background: rgba(118, 133, 255, 0.48);
      border-color: rgba(163, 172, 255, 0.75);
      box-shadow: 0 8px 22px rgba(118, 133, 255, 0.35);
    }
    .step-button:hover {
      transform: translateY(-2px);
    }
    .step-button:focus-visible {
      outline: 2px solid #9ea9ff;
      outline-offset: 2px;
    }
    .sequence-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }
    .sequence-actions button {
      flex: 1 1 160px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(158, 169, 255, 0.12);
      padding: 0.55rem 1.2rem;
      color: #dbe0ff;
      letter-spacing: 0.05em;
      font-size: 0.78rem;
      text-transform: uppercase;
    }
    .sequence-actions button.primary {
      background: linear-gradient(120deg, rgba(118, 133, 255, 0.65), rgba(171, 104, 255, 0.65));
      color: white;
      border-color: transparent;
    }
    .sequence-actions button:focus-visible {
      outline: 2px solid rgba(158, 169, 255, 0.9);
      outline-offset: 2px;
    }
    .template-select {
      margin-top: 1rem;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .template-select label {
      font-weight: 600;
      letter-spacing: 0.04em;
    }
    .template-select select {
      flex: 1 1 200px;
      background: rgba(10, 12, 32, 0.8);
      color: #f0f2ff;
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.6rem 0.9rem;
      font-size: 0.95rem;
    }
    .template-description {
      margin-top: 0.75rem;
      font-size: 0.95rem;
      color: rgba(222, 224, 255, 0.88);
    }
    details.state-debug {
      background: rgba(14, 18, 35, 0.55);
      border-radius: 1rem;
      padding: 1rem 1.25rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    details.state-debug summary {
      cursor: pointer;
      font-weight: 600;
      letter-spacing: 0.04em;
    }
    details.state-debug pre {
      margin: 0.75rem 0 0;
      max-height: 240px;
      overflow: auto;
      background: rgba(0, 0, 0, 0.35);
      padding: 0.75rem;
      border-radius: 0.75rem;
      font-size: 0.85rem;
    }
    @media (max-width: 720px) {
      header.hero h1 {
        font-size: 1.8rem;
      }
      .control-row {
        grid-template-columns: 1fr;
      }
      .sequence-actions button {
        flex-basis: 130px;
      }
      .sequence-grid {
        grid-template-columns: repeat(auto-fit, minmax(2.1rem, 1fr));
      }
    }
  `;
  document.head.appendChild(style);
}

function createHeader() {
  const header = document.createElement('header');
  header.className = 'hero';

  const title = document.createElement('h1');
  title.textContent = 'Bodzin Generator Toolkit';

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Shape the pump, sketch melodic ideas, and jump between song blueprints instantly.';

  header.append(title, subtitle);
  return header;
}

function createStatusBar(root) {
  statusEl = document.createElement('div');
  statusEl.className = 'status';
  statusEl.setAttribute('aria-live', 'polite');
  root.appendChild(statusEl);
}

function createSidechainSection(root) {
  const section = document.createElement('section');
  section.className = 'card';

  const heading = document.createElement('h2');
  heading.textContent = 'Sidechain Ducking';
  const description = document.createElement('p');
  description.textContent = 'Fine-tune the sidechain compressor that glues the mix. Amount controls reduction depth, attack shapes onset, and release defines how quickly the groove breathes back in.';

  const controlWrap = document.createElement('div');
  controlWrap.className = 'sidechain-controls';

  SIDECHAIN_PARAMS.forEach(param => {
    const row = document.createElement('label');
    row.className = 'control-row';
    row.setAttribute('for', param.id);

    const labelSpan = document.createElement('span');
    labelSpan.className = 'label';
    labelSpan.textContent = param.label;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = param.id;
    slider.min = String(param.min);
    slider.max = String(param.max);
    slider.step = String(param.step);
    slider.value = String(state.sidechain[param.id]);

    const valueEl = document.createElement('span');
    valueEl.className = 'control-value';
    valueEl.textContent = formatValue(param, state.sidechain[param.id]);

    slider.addEventListener('input', event => {
      setSidechainValue(param.id, event.target.value, { silent: true });
    });

    slider.addEventListener('change', event => {
      setSidechainValue(param.id, event.target.value);
    });

    row.append(labelSpan, slider, valueEl);
    controlWrap.appendChild(row);
    sidechainRefs.set(param.id, { input: slider, valueEl, param });
  });

  section.append(heading, description, controlWrap);
  root.appendChild(section);
}

function createSequencerSection(root, track) {
  const meta = TRACK_META[track] || { label: track, description: '' };
  const section = document.createElement('section');
  section.className = 'card';

  const heading = document.createElement('h2');
  heading.textContent = `${meta.label} Pattern`;
  const description = document.createElement('p');
  description.textContent = meta.description;

  const grid = document.createElement('div');
  grid.className = 'sequence-grid';

  const buttons = [];
  for (let i = 0; i < STEP_COUNT; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'step-button';
    btn.dataset.track = track;
    btn.dataset.index = String(i);
    btn.addEventListener('click', () => {
      const current = state.sequences[track][i] || 0;
      const next = (current + 1) % LEVELS;
      setStepValue(track, i, next);
    });
    buttons.push(btn);
    grid.appendChild(btn);
  }
  sequenceButtons[track] = buttons;

  const actions = document.createElement('div');
  actions.className = 'sequence-actions';

  const randomBtn = document.createElement('button');
  randomBtn.type = 'button';
  randomBtn.textContent = 'Randomize';
  randomBtn.classList.add('primary');
  randomBtn.addEventListener('click', () => randomizeSequence(track));

  const mutateBtn = document.createElement('button');
  mutateBtn.type = 'button';
  mutateBtn.textContent = 'Mutate';
  mutateBtn.addEventListener('click', () => mutateSequence(track));

  actions.append(randomBtn, mutateBtn);

  section.append(heading, description, grid, actions);
  root.appendChild(section);
}

function createTemplateSection(root) {
  const section = document.createElement('section');
  section.className = 'card';

  const heading = document.createElement('h2');
  heading.textContent = 'Song Templates';
  const description = document.createElement('p');
  description.textContent = 'Jump-start your arrangement with curated templates. Each snapshot wires lead and hat sequences while dialing in sidechain contour.';

  const selectWrap = document.createElement('div');
  selectWrap.className = 'template-select';

  const label = document.createElement('label');
  label.setAttribute('for', 'template-select');
  label.textContent = 'Template';

  templateSelectEl = document.createElement('select');
  templateSelectEl.id = 'template-select';

  Object.keys(SONG_TEMPLATES).forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    templateSelectEl.appendChild(option);
  });

  templateSelectEl.value = state.template;
  templateSelectEl.addEventListener('change', event => {
    applySongTemplate(event.target.value);
  });

  selectWrap.append(label, templateSelectEl);

  templateDescriptionEl = document.createElement('p');
  templateDescriptionEl.className = 'template-description';

  section.append(heading, description, selectWrap, templateDescriptionEl);
  root.appendChild(section);
}

function createStatePreview(root) {
  const details = document.createElement('details');
  details.className = 'state-debug';

  const summary = document.createElement('summary');
  summary.textContent = 'State Inspector';

  statePreviewEl = document.createElement('pre');
  statePreviewEl.textContent = '';

  details.append(summary, statePreviewEl);
  root.appendChild(details);
}

function updateSidechainUI(targetId) {
  if (targetId) {
    const entry = sidechainRefs.get(targetId);
    if (!entry) return;
    const value = state.sidechain[targetId];
    entry.input.value = String(value);
    entry.valueEl.textContent = formatValue(entry.param, value);
    return;
  }
  sidechainRefs.forEach((entry, id) => {
    const value = state.sidechain[id];
    entry.input.value = String(value);
    entry.valueEl.textContent = formatValue(entry.param, value);
  });
}

function setSidechainValue(id, value, options = {}) {
  const { silent = false } = options;
  const param = SIDECHAIN_PARAMS.find(p => p.id === id);
  if (!param) return;
  const numeric = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(numeric)) return;
  const clamped = clamp(numeric, param.min, param.max);
  const normalized = param.step >= 1 ? Math.round(clamped) : parseFloat(clamped.toFixed(3));
  state.sidechain[id] = normalized;
  updateSidechainUI(id);
  updateStatePreview();
  if (!silent) {
    showStatus(`${param.label} → ${formatValue(param, normalized)}`);
  }
}

function renderSequence(track) {
  const seq = state.sequences[track];
  const buttons = sequenceButtons[track] || [];
  buttons.forEach((btn, index) => {
    const level = seq[index] || 0;
    btn.dataset.level = String(level);
    btn.textContent = STEP_SYMBOLS[level] || STEP_SYMBOLS[0];
    btn.setAttribute('aria-pressed', level > 0 ? 'true' : 'false');
    btn.title = `${TRACK_META[track]?.label || track} step ${index + 1}: ${LEVEL_LABELS[level]}`;
  });
}

function setStepValue(track, index, value, options = {}) {
  const { silent = false } = options;
  const seq = state.sequences[track];
  if (!seq) return;
  const next = clamp(Math.round(value), 0, LEVELS - 1);
  seq[index] = next;
  renderSequence(track);
  updateStatePreview();
  if (!silent) {
    const label = TRACK_META[track]?.label || track;
    showStatus(`${label} step ${index + 1} → ${LEVEL_LABELS[next]}`);
  }
}

function randomizeSequence(track) {
  const seq = state.sequences[track];
  if (!seq) return;
  for (let i = 0; i < STEP_COUNT; i += 1) {
    seq[i] = Math.floor(Math.random() * LEVELS);
  }
  renderSequence(track);
  updateStatePreview();
  const label = TRACK_META[track]?.label || track;
  showStatus(`${label} randomized`);
}

function mutateSequence(track) {
  const seq = state.sequences[track];
  if (!seq) return;
  const pivot = Math.floor(Math.random() * STEP_COUNT);
  const delta = Math.random() < 0.5 ? -1 : 1;
  seq[pivot] = clamp((seq[pivot] || 0) + delta, 0, LEVELS - 1);
  if (Math.random() < 0.4) {
    const neighbor = (pivot + (Math.random() < 0.5 ? -1 : 1) + STEP_COUNT) % STEP_COUNT;
    const neighborDelta = Math.random() < 0.5 ? -1 : 1;
    seq[neighbor] = clamp((seq[neighbor] || 0) + neighborDelta, 0, LEVELS - 1);
  }
  renderSequence(track);
  updateStatePreview();
  const label = TRACK_META[track]?.label || track;
  showStatus(`${label} mutated`);
}

function applySongTemplate(name, options = {}) {
  const template = SONG_TEMPLATES[name];
  if (!template) return;
  const { silent = false } = options;
  state.template = name;
  state.sequences.lead = toStepArray(template.lead);
  state.sequences.hats = toStepArray(template.hats);
  Object.assign(state.sidechain, DEFAULT_SIDECHAIN, template.sidechain || {});
  if (templateSelectEl && templateSelectEl.value !== name) {
    templateSelectEl.value = name;
  }
  updateSidechainUI();
  renderSequence('lead');
  renderSequence('hats');
  updateTemplateDescription();
  updateStatePreview();
  if (!silent) {
    showStatus(`${name} template loaded`);
  }
}

function updateTemplateDescription() {
  if (!templateDescriptionEl) return;
  const template = SONG_TEMPLATES[state.template];
  if (!template) {
    templateDescriptionEl.textContent = '';
    return;
  }
  const sidechain = template.sidechain || {};
  templateDescriptionEl.textContent = `${state.template}: ${template.description} (Duck ${formatValue(SIDECHAIN_PARAMS[0], sidechain.duck_amount ?? state.sidechain.duck_amount)}, Attack ${formatValue(SIDECHAIN_PARAMS[1], sidechain.duck_attack_ms ?? state.sidechain.duck_attack_ms)}, Release ${formatValue(SIDECHAIN_PARAMS[2], sidechain.duck_release_ms ?? state.sidechain.duck_release_ms)})`;
}

function updateStatePreview() {
  if (!statePreviewEl) return;
  const snapshot = {
    template: state.template,
    sidechain: { ...state.sidechain },
    sequences: {
      lead: [...state.sequences.lead],
      hats: [...state.sequences.hats]
    }
  };
  statePreviewEl.textContent = JSON.stringify(snapshot, null, 2);
}

function initializeStateFromTemplate(name) {
  const template = SONG_TEMPLATES[name];
  if (!template) {
    state.sequences.lead.fill(0);
    state.sequences.hats.fill(0);
    Object.assign(state.sidechain, DEFAULT_SIDECHAIN);
    return;
  }
  state.sequences.lead = toStepArray(template.lead);
  state.sequences.hats = toStepArray(template.hats);
  Object.assign(state.sidechain, DEFAULT_SIDECHAIN, template.sidechain || {});
}

function toStepArray(source) {
  const arr = new Array(STEP_COUNT).fill(0);
  if (!Array.isArray(source)) {
    return arr;
  }
  const limit = Math.min(source.length, STEP_COUNT);
  for (let i = 0; i < limit; i += 1) {
    const value = Number(source[i]);
    arr[i] = Number.isFinite(value) ? clamp(Math.round(value), 0, LEVELS - 1) : 0;
  }
  return arr;
}

function formatValue(param, value) {
  if (typeof param?.format === 'function') {
    return param.format(Number(value));
  }
  const decimals = param?.step && param.step < 1 ? Math.min(4, `${param.step}`.split('.')[1]?.length || 0) : 0;
  return Number(value).toFixed(decimals);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function showStatus(message) {
  if (!statusEl) return;
  statusEl.textContent = message;
  if (statusTimer) {
    clearTimeout(statusTimer);
  }
  statusTimer = setTimeout(() => {
    statusEl.textContent = '';
  }, 2200);
}

if (typeof module !== 'undefined') {
  module.exports = {
    state,
    randomizeSequence,
    mutateSequence,
    applySongTemplate,
    setSidechainValue,
    toStepArray,
    formatValue
  };
}
