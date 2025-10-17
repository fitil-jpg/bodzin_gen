'use strict';

// Import modules
import { AudioEngine } from './modules/audio-engine.js';
import { UIControls } from './modules/ui-controls.js';
import { TimelineRenderer } from './modules/timeline-renderer.js';
import { MidiHandler } from './modules/midi-handler.js';
import { StorageManager } from './modules/storage-manager.js';
import { StatusManager } from './modules/status-manager.js';
import { PresetManager } from './modules/preset-manager.js';
import { PresetLibraryUI } from './modules/preset-library-ui.js';
import { PresetManager } from './modules/preset-manager.js';
import { PresetLibraryUI } from './modules/preset-library-ui.js';
import { PatternVariationManager } from './modules/pattern-variation-manager.js';

import { 
  STEP_COUNT, 
  STEP_DURATION, 
  AUTOMATION_TRACK_DEFINITIONS,
  LFO_DEFINITIONS,
  CURVE_TYPES 
} from './utils/constants.js';
import { 
  createDefaultAutomation, 
  normalizeAutomationState,
  createSectionLayout 
} from './modules/automation-manager.js';

let appInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  appInstance = createApp();
  initializeApp(appInstance);
  window.bodzinApp = appInstance;
});

function createApp() {
  return {
    // Core modules
    audio: null,
    uiControls: null,
    timeline: null,
    midi: null,
    storage: null,
    status: null,
    presetManager: null,
    presetLibraryUI: null,
    presetManager: null,
    presetLibraryUI: null,
    patternVariation: null,
    
    // State
    controlState: {},
    automation: createDefaultAutomation(STEP_COUNT),
    automationEvent: null,
    automationStep: 0,
    activeSection: null,
    presetName: 'Deep Default',
    
    // UI elements
    presetFileInput: null,
    
    // Waveform
    waveform: {
      canvas: document.getElementById('waveform'),
      ctx: null,
      analyser: null,
      dataArray: null,
      animationId: null,
      deviceRatio: window.devicePixelRatio || 1
    }
  };
}

async function initializeApp(app) {
  // Initialize modules
  app.storage = new StorageManager();
  app.status = new StatusManager();
  app.audio = new AudioEngine().initialize();
  app.patternVariation = new PatternVariationManager(app);
  app.uiControls = new UIControls(app);
  app.timeline = new TimelineRenderer(app);
  app.midi = new MidiHandler(app);
  app.presetManager = new PresetManager(app);
  app.presetLibraryUI = new PresetLibraryUI(app);
  app.presetManager = new PresetManager(app);
  app.presetLibraryUI = new PresetLibraryUI(app);

  // Initialize timeline
  app.timeline.initialize();

  // Configure transport
  app.audio.configureTransport();

  // Load stored state
  const storedControls = app.storage.loadControlState();
  const storedPreset = app.storage.loadPresetState();
  const externalPreset = typeof preset !== 'undefined' ? preset : null;
  const defaultState = app.uiControls.buildDefaultControlState();

  app.controlState = Object.assign({}, defaultState, storedControls);
  app.automation = normalizeAutomationState(app.automation, STEP_COUNT);

  if (externalPreset && externalPreset.controls) {
    Object.assign(app.controlState, externalPreset.controls);
  }
  if (storedPreset && storedPreset.controls) {
    Object.assign(app.controlState, storedPreset.controls);
  }
  if (externalPreset && externalPreset.automation) {
    applyAutomationPreset(app, externalPreset.automation);
  }
  if (storedPreset && storedPreset.automation) {
    applyAutomationPreset(app, storedPreset.automation);
  }

  // Render UI
  app.uiControls.render();
  setupButtons(app);
  setupWaveform(app);
  setupAutomationScheduling(app);
  
  // Initialize MIDI
  await app.midi.initialize();
  
  // Initialize preset manager
  app.presetManager.initialize();
  // Setup keyboard shortcuts
  setupKeyboardShortcuts(app);
  
  // Apply initial state
  applyAutomationForStep(app, 0);
  syncSectionState(app, 0);
  app.timeline.draw();
  app.status.set('Idle');
  
  // Initialize pattern variation status
  if (app.patternVariation) {
    updatePatternStatus(app, app.patternVariation.currentPattern);
  }
}

function setupButtons(app) {
  const startBtn = document.getElementById('startButton');
  const stopBtn = document.getElementById('stopButton');
  const savePresetBtn = document.getElementById('savePresetButton');
  const loadPresetBtn = document.getElementById('loadPresetButton');
  const exportMixBtn = document.getElementById('exportMixButton');
  const exportStemsBtn = document.getElementById('exportStemsButton');
  const midiToggle = document.getElementById('midiLearnToggle');
  
  // Pattern variation buttons
  const patternABtn = document.getElementById('patternAButton');
  const patternBBtn = document.getElementById('patternBButton');
  const patternCBtn = document.getElementById('patternCButton');
  const randomizeBtn = document.getElementById('randomizePatternButton');

  startBtn?.addEventListener('click', () => startPlayback(app));
  stopBtn?.addEventListener('click', () => stopPlayback(app));
  savePresetBtn?.addEventListener('click', () => app.presetLibraryUI.showSavePresetDialog());
  loadPresetBtn?.addEventListener('click', () => app.presetLibraryUI.open());
  exportMixBtn?.addEventListener('click', () => exportMix(app));
  exportStemsBtn?.addEventListener('click', () => exportStems(app));
  midiToggle?.addEventListener('change', event => {
    const enabled = Boolean(event.target.checked);
    app.midi.setLearning(enabled);
  });
  
  // Pattern variation button handlers
  patternABtn?.addEventListener('click', () => switchPattern(app, 'A'));
  patternBBtn?.addEventListener('click', () => switchPattern(app, 'B'));
  patternCBtn?.addEventListener('click', () => switchPattern(app, 'C'));
  randomizeBtn?.addEventListener('click', () => randomizeCurrentPattern(app));
  
  // Add double-click handlers for pattern morphing
  patternABtn?.addEventListener('dblclick', () => morphToPattern(app, 'A'));
  patternBBtn?.addEventListener('dblclick', () => morphToPattern(app, 'B'));
  patternCBtn?.addEventListener('dblclick', () => morphToPattern(app, 'C'));

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json';
  fileInput.style.display = 'none';
  fileInput.addEventListener('change', event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        applyPreset(app, parsed);
        app.status.set(`Preset "${parsed.name || 'Imported'}" loaded`);
      } catch (err) {
        console.error('Preset parse failed', err);
        app.status.set('Preset load failed');
      } finally {
        fileInput.value = '';
      }
    };
    reader.readAsText(file);
  });
  document.body.appendChild(fileInput);
  app.presetFileInput = fileInput;
}

async function startPlayback(app, options = {}) {
  const startBtn = document.getElementById('startButton');
  const stopBtn = document.getElementById('stopButton');
  
  // Visual feedback
  if (startBtn) {
    startBtn.classList.add('loading');
    startBtn.disabled = true;
  }
  
  await ensureTransportRunning(app);
  
  if (startBtn) {
    startBtn.classList.remove('loading');
    startBtn.disabled = false;
  }
  
  if (stopBtn) {
    stopBtn.style.background = 'rgba(255, 73, 175, 0.1)';
    stopBtn.style.borderColor = '#ff49af';
  }
  
  if (!options.silent) {
    app.status.set('Playing');
  }
}

async function ensureTransportRunning(app) {
  if (Tone.Transport.state === 'started') {
    return false;
  }
  await Tone.start();
  await app.audio.startSequences();
  Tone.Transport.start();
  return true;
}

function stopPlayback(app) {
  const startBtn = document.getElementById('startButton');
  const stopBtn = document.getElementById('stopButton');
  
  // Visual feedback
  if (stopBtn) {
    stopBtn.style.background = 'rgba(255, 255, 255, 0.04)';
    stopBtn.style.borderColor = 'var(--border)';
  }
  
  if (startBtn) {
    startBtn.style.background = 'linear-gradient(135deg, var(--accent), #3d8bff)';
    startBtn.style.borderColor = 'rgba(73, 169, 255, 0.45)';
  }
  
  Tone.Transport.stop();
  Tone.Transport.position = 0;
  app.timeline.currentStep = 0;
  app.automationStep = 0;
  applyAutomationForStep(app, 0);
  syncSectionState(app, 0);
  app.timeline.draw();
  app.status.set('Stopped');
}

function triggerPresetLoad(app) {
  if (app.presetFileInput) {
    app.presetFileInput.click();
  }
}

function savePreset(app) {
  const name = prompt('Preset name', app.presetName || 'Deep Preset');
  if (!name) return;
  const payload = buildPresetPayload(app, name);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = slugify(name) + '.json';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  app.presetName = name;
  app.storage.savePresetState(payload);
  app.status.set(`Preset "${name}" saved`);
}

function buildPresetPayload(app, name) {
  return {
    name,
    createdAt: new Date().toISOString(),
    controls: { ...app.controlState },
    automation: {
      tracks: app.automation.tracks.map(track => ({ id: track.id, values: [...track.values] })),
      sections: app.automation.sections.map(section => ({ ...section }))
    },
    midiMappings: { ...app.midi.mappings },
    patternVariations: app.patternVariation ? app.patternVariation.getPatternForPreset() : null
  };
}

function applyPreset(app, presetData) {
  if (!presetData || typeof presetData !== 'object') return;
  if (presetData.controls) {
    Object.entries(presetData.controls).forEach(([id, value]) => {
      const control = app.uiControls.getControlDefinition(id);
      if (control) {
        app.uiControls.setControlValue(control, value, { silent: true });
      }
    });
    app.storage.saveControlState(app.controlState);
  }
  if (presetData.automation) {
    applyAutomationPreset(app, presetData.automation);
    app.timeline.draw();
  }
  if (presetData.midiMappings) {
    app.midi.mappings = { ...presetData.midiMappings };
    app.midi.saveMappings();
  }
  if (presetData.patternVariations && app.patternVariation) {
    app.patternVariation.applyPatternFromPreset(presetData.patternVariations);
  }
  if (presetData.name) {
    app.presetName = presetData.name;
  }
  app.storage.savePresetState(buildPresetPayload(app, app.presetName));
  applyAutomationForStep(app, app.timeline.currentStep);
  syncSectionState(app, app.timeline.currentStep);
}

function applyAutomationPreset(app, automationData) {
  if (!automationData) return;
  const sections = sanitizePresetSections(automationData.sections, STEP_COUNT);
  const sanitizedAutomation = { ...automationData, sections };
  app.automation = normalizeAutomationState(sanitizedAutomation, STEP_COUNT);
}

function sanitizePresetSections(sections, stepCount = STEP_COUNT) {
  const totalSteps = Math.max(Math.floor(stepCount), 0);
  const maxIndex = totalSteps - 1;
  if (totalSteps <= 0) {
    return [];
  }

  const fallbackLayout = createSectionLayout(totalSteps);
  if (!fallbackLayout.length) {
    return [];
  }

  const fallbackDefault = fallbackLayout[0];
  const fallbackColor = fallbackDefault?.color || 'rgba(255, 255, 255, 0.04)';
  const fallbackName = fallbackDefault?.name || 'Section';

  const parsedSections = Array.isArray(sections)
    ? sections
        .map(section => {
          if (!section) {
            return null;
          }
          const startValue = Number(section.start);
          const endValue = Number(section.end);
          if (!Number.isFinite(startValue) || !Number.isFinite(endValue)) {
            return null;
          }
          const startBound = Math.min(startValue, endValue);
          const endBound = Math.max(startValue, endValue);
          const start = clamp(Math.round(startBound), 0, maxIndex);
          const end = clamp(Math.round(endBound), 0, maxIndex);
          if (end < start) {
            return null;
          }
          const trimmedName = typeof section.name === 'string' ? section.name.trim() : '';
          return {
            name: trimmedName || undefined,
            color: section.color,
            start,
            end
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.start - b.start || a.end - b.end)
    : [];

  const result = [];

  const pushSection = (section) => {
    if (!result.length) {
      result.push({ ...section });
      return;
    }
    const previous = result[result.length - 1];
    if (previous.name === section.name && previous.color === section.color && previous.end + 1 >= section.start) {
      previous.end = Math.max(previous.end, section.end);
      return;
    }
    const normalizedStart = Math.max(section.start, previous.end + 1);
    const normalizedEnd = Math.max(section.end, normalizedStart);
    result.push({
      name: section.name,
      color: section.color,
      start: normalizedStart,
      end: normalizedEnd
    });
  };

  const appendFallbackRange = (from, to) => {
    if (from > to) {
      return;
    }
    fallbackLayout.forEach(fallback => {
      const overlapStart = Math.max(fallback.start, from);
      const overlapEnd = Math.min(fallback.end, to);
      if (overlapStart <= overlapEnd) {
        pushSection({
          name: fallback.name,
          color: fallback.color,
          start: overlapStart,
          end: overlapEnd
        });
      }
    });
  };

  const findFallbackForStep = (step) => {
    return fallbackLayout.find(section => step >= section.start && step <= section.end) || fallbackDefault;
  };

  let cursor = 0;
  parsedSections.forEach(section => {
    if (cursor > maxIndex) {
      return;
    }
    if (section.end < cursor) {
      return;
    }
    const safeStart = clamp(section.start, 0, maxIndex);
    const safeEnd = clamp(section.end, 0, maxIndex);
    if (safeStart > cursor) {
      appendFallbackRange(cursor, safeStart - 1);
      cursor = safeStart;
    }
    const sectionStart = Math.max(safeStart, cursor);
    const sectionEnd = Math.max(Math.min(safeEnd, maxIndex), sectionStart);
    const fallback = findFallbackForStep(sectionStart);
    const name = section.name || fallback?.name || fallbackName;
    const color = section.color || fallback?.color || fallbackColor;
    pushSection({ name, color, start: sectionStart, end: sectionEnd });
    cursor = sectionEnd + 1;
  });

  if (cursor <= maxIndex) {
    appendFallbackRange(cursor, maxIndex);
  }

  if (!result.length) {
    return fallbackLayout.map(section => ({ ...section }));
  }

  result[0].start = 0;
  result[result.length - 1].end = maxIndex;

  return result;
}

function setupWaveform(app) {
  if (!app.waveform.canvas) return;
  
  const resizeObserver = new ResizeObserver(() => {
    syncWaveformCanvas(app);
  });
  syncWaveformCanvas(app);
  resizeObserver.observe(app.waveform.canvas);
  
  // Create analyser for waveform visualization
  app.waveform.analyser = new Tone.Analyser('waveform', 1024);
  app.audio.master.connect(app.waveform.analyser);
  app.waveform.dataArray = new Uint8Array(app.waveform.analyser.size);
  
  startWaveformAnimation(app);
}

function syncWaveformCanvas(app) {
  const canvas = app.waveform.canvas;
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth * ratio;
  const height = canvas.clientHeight * ratio;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  app.waveform.deviceRatio = ratio;
}

function startWaveformAnimation(app) {
  if (app.waveform.animationId) {
    cancelAnimationFrame(app.waveform.animationId);
  }
  
  function animate() {
    if (app.waveform.analyser && app.waveform.ctx) {
      drawWaveform(app);
    }
    app.waveform.animationId = requestAnimationFrame(animate);
  }
  
  animate();
}

function drawWaveform(app) {
  const { canvas, ctx, analyser, dataArray } = app.waveform;
  if (!ctx || !analyser) return;
  
  const ratio = app.waveform.deviceRatio;
  const width = canvas.width;
  const height = canvas.height;
  
  ctx.clearRect(0, 0, width, height);
  
  analyser.getValue(dataArray);
  
  const barWidth = (width / dataArray.length) * 2.5;
  let x = 0;
  
  // Create gradient for waveform bars
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(73, 169, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(255, 73, 175, 0.6)');
  gradient.addColorStop(1, 'rgba(148, 255, 73, 0.4)');
  
  ctx.fillStyle = gradient;
  
  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = (dataArray[i] / 255) * height;
    const y = (height - barHeight) / 2;
    
    // Add some visual flair with rounded rectangles
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 2);
    ctx.fill();
    
    x += barWidth + 1;
  }
  
  // Add a subtle glow effect
  ctx.shadowColor = 'rgba(73, 169, 255, 0.3)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = 'rgba(73, 169, 255, 0.1)';
  ctx.fillRect(0, 0, width, height);
  ctx.shadowBlur = 0;
}

function setupAutomationScheduling(app) {
  if (app.automationEvent) {
    Tone.Transport.clear(app.automationEvent);
  }
  app.activeSection = null;
  app.automationEvent = Tone.Transport.scheduleRepeat(time => {
    const step = app.automationStep % STEP_COUNT;
    app.timeline.currentStep = step;
    applyAutomationForStep(app, step, time);
    syncSectionState(app, step);
    requestAnimationFrame(() => app.timeline.draw());
    app.automationStep = (step + 1) % STEP_COUNT;
  }, STEP_DURATION);
}

function getSectionForStep(app, step) {
  const sections = app.automation.sections && app.automation.sections.length
    ? app.automation.sections
    : createSectionLayout(STEP_COUNT);
  return sections.find(section => step >= section.start && step <= section.end) || null;
}

function syncSectionState(app, step) {
  const section = getSectionForStep(app, step);
  app.audio.updateSectionPlayback(section);
  updateSectionLabel(app, step, section);
}

function updateSectionLabel(app, step, sectionOverride) {
  const section = sectionOverride || getSectionForStep(app, step);
  const sectionLabelEl = document.getElementById('sectionLabel');
  if (section && sectionLabelEl) {
    sectionLabelEl.textContent = `Section: ${section.name}`;
  } else if (sectionLabelEl) {
    sectionLabelEl.textContent = 'Section: Loop';
  }
}

function applyAutomationForStep(app, step, time) {
  if (!app.automation || !app.automation.tracks) return;
  
  // Apply pattern variation if enabled
  if (app.patternVariation) {
    const currentPattern = app.patternVariation.getCurrentPattern();
    if (currentPattern) {
      // Apply pattern-specific automation values
      currentPattern.tracks.forEach(patternTrack => {
        const automationTrack = app.automation.tracks.find(track => track.id === patternTrack.id);
        if (automationTrack && patternTrack.values[step] !== undefined) {
          // Apply the pattern value with any morphing or randomization
          let value = patternTrack.values[step];
          
          // Apply morphing if enabled
          if (app.patternVariation.morphingEnabled) {
            // This could be enhanced with actual morphing logic
            const morphProgress = (step / STEP_COUNT) % 1;
            // Simple morphing example - could be more sophisticated
            value = value * (1 + Math.sin(morphProgress * Math.PI * 2) * 0.1);
          }
          
          // Apply randomization if enabled
          if (app.patternVariation.randomizationEnabled) {
            const randomFactor = (Math.random() - 0.5) * app.patternVariation.randomizationAmount;
            value = clamp(value + randomFactor, 0, 1);
          }
          
          // Apply the value to the audio engine
          applyAutomationValue(app, patternTrack.id, value);
        }
      });
    }
  } else {
    // Fallback to original automation logic
    app.automation.tracks.forEach(track => {
      if (track.values[step] !== undefined) {
        applyAutomationValue(app, track.id, track.values[step]);
      }
    });
  }
}

function applyAutomationValue(app, trackId, value) {
  // Apply automation value to the appropriate audio parameter
  // This would need to be connected to the actual audio engine parameters
  if (app.audio && app.audio.applyAutomation) {
    app.audio.applyAutomation(trackId, value);
  }
}

async function exportMix(app) {
  await captureBuses(app, [
    { node: app.audio.master, label: 'mix' }
  ]);
  app.status.set('Mix export complete');
}

async function exportStems(app) {
  await captureBuses(app, [
    { node: app.audio.buses.drums, label: 'drums' },
    { node: app.audio.buses.bass, label: 'bass' },
    { node: app.audio.buses.lead, label: 'lead' },
    { node: app.audio.buses.fx, label: 'fx' }
  ]);
  app.status.set('Stem export complete');
}

async function captureBuses(app, buses) {
  const startedByExport = await ensureTransportRunning(app);
  const duration = Tone.Time(STEP_DURATION).toSeconds() * STEP_COUNT;
  const recorders = buses.map(info => {
    const recorder = new Tone.Recorder();
    info.node.connect(recorder);
    recorder.start();
    return { info, recorder };
  });
  await wait(duration);
  await Promise.all(recorders.map(async ({ info, recorder }) => {
    const blob = await recorder.stop();
    info.node.disconnect(recorder);
    downloadBlob(blob, `bodzin-${info.label}.wav`);
  }));
  if (startedByExport) {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    app.timeline.currentStep = 0;
    applyAutomationForStep(app, 0);
    syncSectionState(app, 0);
    app.timeline.draw();
  }
}

function wait(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'preset';
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function switchPattern(app, patternId) {
  if (!app.patternVariation) return;
  
  const success = app.patternVariation.switchPattern(patternId);
  if (success) {
    updatePatternButtons(app, patternId);
    updatePatternStatus(app, patternId);
    app.status.set(`Switched to Pattern ${patternId}`);
    
    // Update automation for current step
    applyAutomationForStep(app, app.timeline.currentStep);
    syncSectionState(app, app.timeline.currentStep);
    app.timeline.draw();
  }
}

function updatePatternStatus(app, patternId) {
  const patternStatusEl = document.getElementById('patternStatus');
  if (patternStatusEl) {
    patternStatusEl.textContent = `Pattern: ${patternId}`;
    
    // Add visual feedback
    patternStatusEl.style.color = '#49a9ff';
    patternStatusEl.style.transform = 'scale(1.1)';
    setTimeout(() => {
      patternStatusEl.style.color = '';
      patternStatusEl.style.transform = '';
    }, 300);
  }
}

function updatePatternButtons(app, activePatternId) {
  const patternButtons = {
    'A': document.getElementById('patternAButton'),
    'B': document.getElementById('patternBButton'),
    'C': document.getElementById('patternCButton')
  };
  
  Object.entries(patternButtons).forEach(([patternId, button]) => {
    if (button) {
      if (patternId === activePatternId) {
        button.classList.add('btn-primary');
        button.classList.remove('btn-outline');
      } else {
        button.classList.remove('btn-primary');
        button.classList.add('btn-outline');
      }
    }
  });
}

function randomizeCurrentPattern(app) {
  if (!app.patternVariation) return;
  
  const currentPattern = app.patternVariation.getCurrentPattern();
  if (currentPattern) {
    app.patternVariation.randomizePattern(currentPattern.id, 0.3);
    app.status.set(`Randomized Pattern ${currentPattern.id}`);
    
    // Update automation for current step
    applyAutomationForStep(app, app.timeline.currentStep);
    syncSectionState(app, app.timeline.currentStep);
    app.timeline.draw();
  }
}

function setupKeyboardShortcuts(app) {
  document.addEventListener('keydown', (event) => {
    // Only handle shortcuts when not typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }
    
    switch (event.key.toLowerCase()) {
      case '1':
        switchPattern(app, 'A');
        break;
      case '2':
        switchPattern(app, 'B');
        break;
      case '3':
        switchPattern(app, 'C');
        break;
      case 'r':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          randomizeCurrentPattern(app);
        }
        break;
      case 'm':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          toggleMorphing(app);
        }
        break;
      case 'shift':
        // Hold shift for morphing mode
        if (app.patternVariation) {
          app.patternVariation.setMorphingEnabled(true);
        }
        break;
    }
  });
  
  document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift' && app.patternVariation) {
      app.patternVariation.setMorphingEnabled(false);
    }
  });
}

function toggleMorphing(app) {
  if (!app.patternVariation) return;
  
  const currentMorphing = app.patternVariation.morphingEnabled;
  app.patternVariation.setMorphingEnabled(!currentMorphing);
  app.status.set(`Pattern morphing ${!currentMorphing ? 'enabled' : 'disabled'}`);
}

function morphToPattern(app, targetPatternId) {
  if (!app.patternVariation) return;
  
  const currentPattern = app.patternVariation.getCurrentPattern();
  if (!currentPattern || currentPattern.id === targetPatternId) return;
  
  app.status.set(`Morphing from Pattern ${currentPattern.id} to Pattern ${targetPatternId}`);
  
  // Start morphing animation
  let morphProgress = 0;
  const morphDuration = 2000; // 2 seconds
  const startTime = Date.now();
  
  function morphStep() {
    const elapsed = Date.now() - startTime;
    morphProgress = Math.min(elapsed / morphDuration, 1);
    
    // Create morphed pattern
    const morphedPattern = app.patternVariation.morphBetweenPatterns(
      currentPattern.id, 
      targetPatternId, 
      morphProgress
    );
    
    if (morphedPattern) {
      // Apply morphed pattern to automation
      morphedPattern.tracks.forEach(patternTrack => {
        const automationTrack = app.automation.tracks.find(track => track.id === patternTrack.id);
        if (automationTrack) {
          automationTrack.values = [...patternTrack.values];
        }
      });
      
      // Update timeline
      app.timeline.draw();
    }
    
    if (morphProgress < 1) {
      requestAnimationFrame(morphStep);
    } else {
      // Complete morphing by switching to target pattern
      switchPattern(app, targetPatternId);
      app.status.set(`Morphing complete - now using Pattern ${targetPatternId}`);
    }
  }
  
  morphStep();
}