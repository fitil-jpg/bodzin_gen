'use strict';

// Import modules
import { AudioEngine } from './modules/audio-engine.js';
import { UIControls } from './modules/ui-controls.js';
import { TimelineRenderer } from './modules/timeline-renderer.js';
import { MidiHandler } from './modules/midi-handler.js';
import { StorageManager } from './modules/storage-manager.js';
import { StatusManager } from './modules/status-manager.js';
import { CurveEditor } from './modules/curve-editor.js';
import { LFOManager } from './modules/lfo-manager.js';
import { EQVisualizer } from './modules/eq-visualizer.js';
import { PatternChainManager } from './modules/pattern-chain-manager.js';
import { PatternVariationManager } from './modules/pattern-variation-manager.js';
import { CommunityPresetManager } from './modules/community-preset-manager.js';
import { PresetVersioning } from './modules/preset-versioning.js';
import { SearchFilter } from './modules/search-filter.js';
import { PatternMorphing } from './modules/pattern-morphing.js';
import { MobileGestures } from './modules/mobile-gestures.js';
import { PresetManager } from './modules/preset-manager.js';
import { PresetLibraryUI } from './modules/preset-library-ui.js';

import { 
  STEP_COUNT, 
  STEP_DURATION, 
  AUTOMATION_TRACK_DEFINITIONS,
  LFO_DEFINITIONS,
  CURVE_TYPES,
  CONTROL_SCHEMA
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
  window.communityPresetManager = appInstance.communityPresets;
  
  // Attempt to start audio automatically on load to trigger browser prompt
  // If blocked by autoplay policies, fallback handlers below will handle it
  attemptAutoStartAudio(appInstance);

  // Add user interaction handler to enable audio context
  setupUserInteractionHandler(appInstance);
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
    curveEditor: null,
    lfo: null,
    communityPresets: null,
    searchFilter: null,
    patternMorphing: null,
    patternChain: null,
    mobileGestures: null,
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
    audioContextStarted: false,
    
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
    },
    
    // EQ Visualizer
    eqVisualizer: null
  };
}

function setupUserInteractionHandler(app) {
  // Check if browser supports required audio APIs
  if (!window.AudioContext && !window.webkitAudioContext) {
    showUnsupportedBrowserMessage();
    return;
  }
  
  // Show audio permission request UI
  showAudioPermissionRequest(app);
  
  // Function to handle first user interaction
  const handleFirstInteraction = async () => {
    if (app.audioContextStarted) return;
    
    try {
      // Start the audio context
      if (Tone.context.state !== 'running') {
        await app.audio.startAudioContext();
        app.audioContextStarted = true;
        console.log('Audio context started successfully');
        
        // Initialize audio engine now that audio context is running
        await app.audio.initializeAudio();
        
        // Initialize waveform analyser now that audio context is running
        initializeWaveformAnalyser(app);
        
        // Hide permission request and show ready status
        hideAudioPermissionRequest();
        app.status.set('Audio ready - click Start to begin');
      }
    } catch (error) {
      console.error('Failed to start audio context:', error);
      app.status.set('Audio initialization failed - try refreshing the page');
    }
  };
  
  // Add event listeners for user interaction
  const interactionEvents = ['click', 'touchstart', 'keydown'];
  
  interactionEvents.forEach(eventType => {
    document.addEventListener(eventType, handleFirstInteraction, { once: true });
  });
  
  // Also handle the start button specifically
  const startBtn = document.getElementById('startButton');
  if (startBtn) {
    startBtn.addEventListener('click', handleFirstInteraction, { once: true });
  }
}

function showAudioPermissionRequest(app) {
  // Create permission request overlay
  const overlay = document.createElement('div');
  overlay.id = 'audio-permission-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    backdrop-filter: blur(10px);
    animation: fadeIn 0.3s ease-out;
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    #audio-permission-overlay .btn-primary {
      animation: pulse 2s infinite;
    }
  `;
  document.head.appendChild(style);
  
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
    border: 1px solid #333;
    border-radius: 16px;
    padding: 40px;
    max-width: 450px;
    text-align: center;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7);
    animation: slideIn 0.4s ease-out;
    position: relative;
  `;
  
  const icon = document.createElement('div');
  icon.innerHTML = '🔊';
  icon.style.cssText = `
    font-size: 64px;
    margin-bottom: 20px;
    filter: drop-shadow(0 4px 8px rgba(73, 169, 255, 0.3));
  `;
  
  const title = document.createElement('h2');
  title.textContent = 'Audio Permission Required';
  title.style.cssText = `
    color: #fff;
    margin: 0 0 16px 0;
    font-size: 28px;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  `;
  
  const message = document.createElement('p');
  message.textContent = 'This application needs permission to play audio. Please click "Allow Audio" to continue.';
  message.style.cssText = `
    color: #ccc;
    margin: 0 0 32px 0;
    line-height: 1.6;
    font-size: 16px;
  `;
  
  const button = document.createElement('button');
  button.textContent = 'Allow Audio';
  button.className = 'btn btn-primary';
  button.style.cssText = `
    padding: 14px 32px;
    font-size: 18px;
    font-weight: 600;
    margin-top: 8px;
    min-width: 160px;
  `;
  
  const loadingSpinner = document.createElement('div');
  loadingSpinner.style.cssText = `
    display: none;
    width: 20px;
    height: 20px;
    border: 2px solid #ffffff40;
    border-top: 2px solid #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  `;
  
  // Add spinner animation
  const spinnerStyle = document.createElement('style');
  spinnerStyle.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(spinnerStyle);
  
  button.addEventListener('click', async () => {
    try {
      // Show loading state
      button.style.display = 'none';
      loadingSpinner.style.display = 'block';
      message.textContent = 'Requesting audio permission...';
      
      // Request audio permission explicitly
      await requestAudioPermission(app);
      overlay.remove();
    } catch (error) {
      console.error('Audio permission denied:', error);
      message.textContent = 'Audio permission was denied. Please refresh the page and try again.';
      message.style.color = '#ff6b6b';
      button.style.display = 'block';
      loadingSpinner.style.display = 'none';
      button.textContent = 'Try Again';
    }
  });
  
  dialog.appendChild(icon);
  dialog.appendChild(title);
  dialog.appendChild(message);
  dialog.appendChild(loadingSpinner);
  dialog.appendChild(button);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

function hideAudioPermissionRequest() {
  const overlay = document.getElementById('audio-permission-overlay');
  if (overlay) {
    overlay.remove();
  }
}

function showUnsupportedBrowserMessage() {
  const overlay = document.createElement('div');
  overlay.id = 'unsupported-browser-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
    border: 1px solid #333;
    border-radius: 16px;
    padding: 40px;
    max-width: 450px;
    text-align: center;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7);
  `;
  
  const icon = document.createElement('div');
  icon.innerHTML = '⚠️';
  icon.style.cssText = `
    font-size: 64px;
    margin-bottom: 20px;
  `;
  
  const title = document.createElement('h2');
  title.textContent = 'Unsupported Browser';
  title.style.cssText = `
    color: #fff;
    margin: 0 0 16px 0;
    font-size: 28px;
    font-weight: 700;
  `;
  
  const message = document.createElement('p');
  message.textContent = 'Your browser does not support the required audio features. Please use a modern browser like Chrome, Firefox, Safari, or Edge.';
  message.style.cssText = `
    color: #ccc;
    margin: 0 0 32px 0;
    line-height: 1.6;
    font-size: 16px;
  `;
  
  dialog.appendChild(icon);
  dialog.appendChild(title);
  dialog.appendChild(message);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

async function requestAudioPermission(app) {
  try {
    // Method 1: Try to create and start an audio context directly
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Try to resume the context (this will trigger permission request in some browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Create a short audio buffer to ensure permission is granted
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
    
    // Wait a moment to ensure the audio plays
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Close the temporary context
    await audioContext.close();
    
    // Now start the app's audio context
    await app.audio.startAudioContext();
    
  } catch (error) {
    // Method 2: If direct audio context fails, try with Tone.js
    console.log('Direct audio context failed, trying Tone.js approach...');
    
    try {
      // Start Tone.js directly - this should trigger browser permission
      await Tone.start();
      
      // Now start the app's audio context
      await app.audio.startAudioContext();
      
    } catch (toneError) {
      console.error('Both audio permission methods failed:', toneError);
      throw new Error('Unable to get audio permission. Please check your browser settings and try again.');
    }
// Best-effort autoplay attempt to restore browser prompt behavior
async function attemptAutoStartAudio(app) {
  try {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      // Some browsers may allow start immediately; ensure we initialize if so
      if (Tone.context.state === 'running') {
        app.audioContextStarted = true;
        await app.audio.initializeAudio();
        initializeWaveformAnalyser(app);
        app.status.set('Audio ready - click Start to begin');
      }
    }
  } catch (e) {
    // Autoplay likely blocked by browser; user gesture handler will take over
    console.log('Autoplay blocked; waiting for user interaction');
  }
}

async function initializeApp(app) {
  // Initialize modules
  app.storage = new StorageManager();
  app.status = new StatusManager();
  app.audio = new AudioEngine().initialize();
  app.patternChain = new PatternChainManager(app.audio);
  app.patternVariation = new PatternVariationManager(app);
  app.uiControls = new UIControls(app);
  app.timeline = new TimelineRenderer(app);
  app.midi = new MidiHandler(app);
  app.curveEditor = new CurveEditor(app);
  app.lfo = new LFOManager(app).initialize();
  app.communityPresets = new CommunityPresetManager(app);
  app.presetVersioning = new PresetVersioning();
  app.searchFilter = new SearchFilter(app);
  app.patternMorphing = new PatternMorphing(app);
  app.mobileGestures = new MobileGestures(app);
  app.presetManager = new PresetManager(app);
  app.presetLibraryUI = new PresetLibraryUI(app);
  app.presetManager = new PresetManager(app);
  app.presetLibraryUI = new PresetLibraryUI(app);

  // Initialize timeline
  app.timeline.initialize();

  // Initialize curve editor
  app.curveEditor.initialize();
  // Initialize community presets
  app.communityPresets.initialize();

  // Configure transport
  app.audio.configureTransport();

  // Load stored state
  const storedControls = app.storage.loadControlState();
  const storedPreset = app.storage.loadPresetState();
  const externalPreset = typeof preset !== 'undefined' ? preset : null;
  const defaultState = app.uiControls.buildDefaultControlState();
  const lfoDefaults = app.lfo.getDefaultControlState();

  app.controlState = Object.assign({}, defaultState, lfoDefaults, storedControls);
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
  setupEQVisualizer(app);
  setupAutomationScheduling(app);
  
  // Start gain reduction meter animation
  app.uiControls.startGainReductionAnimation();
  
  // Initialize MIDI
  await app.midi.initialize();
  
  // Sync LFO with control state
  app.lfo.syncWithControlState(app.controlState);

  // Initialize mobile gestures
  app.mobileGestures.initialize();
  
  // Register service worker for offline functionality
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }
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
  const presetHistoryBtn = document.getElementById('presetHistoryButton');
  const exportMixBtn = document.getElementById('exportMixButton');
  const exportStemsBtn = document.getElementById('exportStemsButton');
  const curveEditorBtn = document.getElementById('curveEditorButton');
  const midiToggle = document.getElementById('midiLearnToggle');
  
  // Morphing buttons
  const morphToLiftBtn = document.getElementById('morphToLiftButton');
  const morphToPeakBtn = document.getElementById('morphToPeakButton');
  const morphToBreakBtn = document.getElementById('morphToBreakButton');
  // Pattern variation buttons
  const patternABtn = document.getElementById('patternAButton');
  const patternBBtn = document.getElementById('patternBButton');
  const patternCBtn = document.getElementById('patternCButton');
  const randomizeBtn = document.getElementById('randomizePatternButton');

  // Randomize buttons
  const randomizeDrumsBtn = document.getElementById('randomizeDrums');
  const randomizeBassBtn = document.getElementById('randomizeBass');
  const randomizeLeadBtn = document.getElementById('randomizeLead');
  const randomizeFxBtn = document.getElementById('randomizeFx');
  const randomizeAllBtn = document.getElementById('randomizeAll');

  startBtn?.addEventListener('click', () => startPlayback(app));
  stopBtn?.addEventListener('click', () => stopPlayback(app));
  savePresetBtn?.addEventListener('click', () => savePreset(app));
  loadPresetBtn?.addEventListener('click', () => triggerPresetLoad(app));
  presetHistoryBtn?.addEventListener('click', () => showPresetHistory(app));
  exportMixBtn?.addEventListener('click', () => exportMix(app));
  exportStemsBtn?.addEventListener('click', () => exportStems(app));
  curveEditorBtn?.addEventListener('click', () => app.curveEditor.show());
  
  // Add pattern chain export/import buttons
  const exportChainBtn = document.getElementById('exportChainButton');
  const importChainBtn = document.getElementById('importChainButton');
  
  if (exportChainBtn) {
    exportChainBtn.addEventListener('click', () => exportPatternChain(app));
  }
  if (importChainBtn) {
    importChainBtn.addEventListener('click', () => triggerChainImport(app));
  }
  midiToggle?.addEventListener('change', event => {
    const enabled = Boolean(event.target.checked);
    app.midi.setLearning(enabled);
  });
  
  // Morphing button handlers
  morphToLiftBtn?.addEventListener('click', () => {
    const currentSection = app.patternMorphing?.getCurrentSection() || 'Intro';
    app.patternMorphing?.startMorphing(currentSection, 'Lift', 4, 'easeInOut');
  });
  
  morphToPeakBtn?.addEventListener('click', () => {
    const currentSection = app.patternMorphing?.getCurrentSection() || 'Intro';
    app.patternMorphing?.startMorphing(currentSection, 'Peak', 4, 'easeInOut');
  });
  
  morphToBreakBtn?.addEventListener('click', () => {
    const currentSection = app.patternMorphing?.getCurrentSection() || 'Intro';
    app.patternMorphing?.startMorphing(currentSection, 'Break', 4, 'easeInOut');
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

  // Randomize button event listeners
  randomizeDrumsBtn?.addEventListener('click', () => {
    app.audio.randomizeDrums();
    app.status.set('Drums randomized');
    addRandomizeAnimation(randomizeDrumsBtn);
  });
  
  randomizeBassBtn?.addEventListener('click', () => {
    app.audio.randomizeBass();
    app.status.set('Bass randomized');
    addRandomizeAnimation(randomizeBassBtn);
  });
  
  randomizeLeadBtn?.addEventListener('click', () => {
    app.audio.randomizeLead();
    app.status.set('Lead randomized');
    addRandomizeAnimation(randomizeLeadBtn);
  });
  
  randomizeFxBtn?.addEventListener('click', () => {
    app.audio.randomizeFx();
    app.status.set('FX randomized');
    addRandomizeAnimation(randomizeFxBtn);
  });
  
  randomizeAllBtn?.addEventListener('click', () => {
    app.audio.randomizeAll();
    app.status.set('All patterns randomized');
    addRandomizeAnimation(randomizeAllBtn);
  });

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
        
        // Check compatibility before applying
        if (!app.presetVersioning.isCompatible(parsed)) {
          app.status.set('Preset is incompatible with current version');
          return;
        }
        
        applyPreset(app, parsed);
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
  
  try {
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
  } catch (error) {
    console.error('Failed to start playback:', error);
    if (startBtn) {
      startBtn.classList.remove('loading');
      startBtn.disabled = false;
    }
    app.status.set('Failed to start playback - try clicking again');
  }
}

async function ensureTransportRunning(app) {
  if (Tone.Transport.state === 'started') {
    return false;
  }
  
  // Ensure audio context is started with user interaction
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
  
  // Ensure audio engine is initialized
  if (!app.audio.audioInitialized) {
    await app.audio.initializeAudio();
  }
  
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

function showPresetHistory(app) {
  const modal = document.getElementById('presetHistoryModal');
  const historyList = document.getElementById('presetHistoryList');
  const closeBtn = document.getElementById('closeHistoryModal');
  const clearBtn = document.getElementById('clearHistoryButton');
  
  if (!modal) return;
  
  // Load and display history
  const history = app.storage.loadPresetHistory();
  historyList.innerHTML = '';
  
  if (history.length === 0) {
    historyList.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 2rem;">No preset history found</div>';
  } else {
    history.reverse().forEach(entry => {
      const entryEl = document.createElement('div');
      entryEl.className = 'history-entry';
      entryEl.innerHTML = `
        <div class="history-info">
          <div class="history-name">${entry.presetName}</div>
          <div class="history-details">
            <span>${new Date(entry.timestamp).toLocaleString()}</span>
            <span>${entry.action}</span>
            <span class="history-version">v${entry.version}</span>
          </div>
        </div>
      `;
      historyList.appendChild(entryEl);
    });
  }
  
  // Show modal
  modal.style.display = 'flex';
  
  // Close modal handlers
  closeBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Clear history handler
  clearBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all preset history?')) {
      app.storage.clearPresetHistory();
      historyList.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 2rem;">No preset history found</div>';
      app.status.set('Preset history cleared');
    }
  });
}

function savePreset(app) {
  const name = prompt('Preset name', app.presetName || 'Deep Preset');
  if (!name) return;
  
  // Get additional preset options
  const description = prompt('Preset description (optional)', '');
  const tags = prompt('Preset tags (comma-separated, optional)', '');
  
  const options = {};
  if (description) options.description = description;
  if (tags) options.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  
  const payload = buildPresetPayload(app, name, options);
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
  
  // Save to history
  const historyEntry = app.presetVersioning.createHistoryEntry(payload, 'save');
  app.storage.savePresetHistory(historyEntry);
  
  const versionInfo = app.presetVersioning.getVersionInfo(payload);
  app.status.set(`Preset "${name}" saved (v${versionInfo.version})`);
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
    probabilitySettings: app.audio.exportProbabilitySettings(),
    patternVariations: app.patternVariation ? app.patternVariation.getPatternForPreset() : null
  };
}

function applyPreset(app, presetData) {
  if (!presetData || typeof presetData !== 'object') return;
  
  try {
    // Validate and migrate preset if needed
    const migratedPreset = app.presetVersioning.validateAndMigratePreset(presetData);
    const versionInfo = app.presetVersioning.getVersionInfo(migratedPreset);
    
    if (migratedPreset.controls) {
      Object.entries(migratedPreset.controls).forEach(([id, value]) => {
        const control = app.uiControls.getControlDefinition(id);
        if (control) {
          app.uiControls.setControlValue(control, value, { silent: true });
        }
      });
      app.storage.saveControlState(app.controlState);
    }
    if (migratedPreset.automation) {
      applyAutomationPreset(app, migratedPreset.automation);
      app.timeline.draw();
    }
    if (migratedPreset.midiMappings) {
      app.midi.mappings = { ...migratedPreset.midiMappings };
      app.midi.saveMappings();
    }
    if (migratedPreset.name) {
      app.presetName = migratedPreset.name;
    }
    
    // Save the migrated preset
    app.storage.savePresetState(buildPresetPayload(app, app.presetName));
    
    // Save to history
    const historyEntry = app.presetVersioning.createHistoryEntry(migratedPreset, 'load');
    app.storage.savePresetHistory(historyEntry);
    
    applyAutomationForStep(app, app.timeline.currentStep);
    syncSectionState(app, app.timeline.currentStep);
    
    // Show version info in status
    const migrationNote = versionInfo.isLegacy ? ' (migrated from legacy)' : '';
    app.status.set(`Preset "${migratedPreset.name}" loaded (v${versionInfo.version})${migrationNote}`);
    
  } catch (error) {
    console.error('Failed to apply preset:', error);
    app.status.set(`Preset load failed: ${error.message}`);
    
    // Fallback to basic preset loading
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
    if (presetData.probabilitySettings) {
      app.audio.importProbabilitySettings(presetData.probabilitySettings);
    }
    if (presetData.patternVariations && app.patternVariation) {
      app.patternVariation.applyPatternFromPreset(presetData.patternVariations);
    }
    if (presetData.name) {
      app.presetName = presetData.name;
    }
  }
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
  
  // Don't create analyser until audio context is started
  // This will be done in setupUserInteractionHandler after user interaction
  startWaveformAnimation(app);
}

function initializeWaveformAnalyser(app) {
  if (!app.waveform.canvas || app.waveform.analyser) return;
  
  // Create analyser for waveform visualization
  app.waveform.analyser = new Tone.Analyser('waveform', 1024);
  app.audio.master.connect(app.waveform.analyser);
  app.waveform.dataArray = new Uint8Array(app.waveform.analyser.size);
}

function setupEQVisualizer(app) {
  const eqCanvas = document.getElementById('eqDisplay');
  if (!eqCanvas) return;
  
  // Initialize EQ visualizer
  app.eqVisualizer = new EQVisualizer(eqCanvas, app.audio);
  
  // Handle window resize
  const resizeObserver = new ResizeObserver(() => {
    if (app.eqVisualizer) {
      app.eqVisualizer.resize();
    }
  });
  resizeObserver.observe(eqCanvas);
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
    
    // Update pattern morphing
    if (app.patternMorphing) {
      const stepProgress = step / STEP_COUNT;
      app.patternMorphing.updateMorphing(stepProgress);
      app.patternMorphing.applyMorphedPattern();
    }
    
    applyAutomationForStep(app, step, time);
    syncSectionState(app, step);
    
    // Handle pattern chaining
    if (app.patternChain && app.patternChain.isChaining) {
      // Advance chain every 16 steps (one complete pattern)
      if (step === 0 && app.automationStep > 0) {
        app.patternChain.advanceChain();
      }
    }
    
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
  if (!app.automation?.tracks) return;
  
  // Apply automation for each track
  app.automation.tracks.forEach(track => {
    if (track.values && track.values[step] !== undefined) {
      const value = track.values[step];
      applyTrackAutomation(app, track.id, value);
    }
  });
}

function applyTrackAutomation(app, trackId, value) {
  // Apply automation to audio parameters based on track ID
  switch (trackId) {
    case 'leadFilter':
      if (app.audio?.leadFilter) {
        app.audio.leadFilter.frequency.rampTo(value * 20000 + 20, 0.1);
      }
      break;
    case 'fxSend':
      if (app.audio?.fxSend) {
        app.audio.fxSend.gain.rampTo(value * 20 - 20, 0.1);
      }
      break;
    case 'bassFilter':
      if (app.audio?.bassFilter) {
        app.audio.bassFilter.frequency.rampTo(value * 20000 + 20, 0.1);
      }
      break;
    case 'reverbDecay':
      if (app.audio?.reverb) {
        app.audio.reverb.decay = value * 10 + 0.1;
      }
      break;
    case 'delayFeedback':
      if (app.audio?.delay) {
        app.audio.delay.feedback.rampTo(value, 0.1);
      }
      break;
    case 'bassDrive':
      if (app.audio?.bassDrive) {
        app.audio.bassDrive.distortion = value;
      }
      break;
    case 'leadResonance':
      if (app.audio?.leadResonance) {
        app.audio.leadResonance.Q.rampTo(value * 50 + 0.1, 0.1);
      }
      break;
    case 'masterVolume':
      if (app.audio?.master) {
        app.audio.master.volume.rampTo(value * 20 - 20, 0.1);
      }
      break;
  }
  
  // Apply LFO modulation
  if (app.lfo) {
    app.lfo.applyModulation();
  }
  
  // Apply automation track values
  if (app.automation && app.automation.tracks) {
    app.automation.tracks.forEach(track => {
      const value = track.values[step] || 0;
      applyAutomationTrackValue(app, track.id, value);
    });
  }
}

function applyAutomationTrackValue(app, trackId, value) {
  if (!app.audio || !app.audio.nodes) return;

  switch (trackId) {
    case 'leadFilter':
      if (app.audio.nodes.leadFilter) {
        const baseFreq = app.controlState.leadFilterBase || 520;
        const modRange = app.controlState.leadFilterMod || 2600;
        const freq = baseFreq + (value * modRange);
        app.audio.nodes.leadFilter.frequency.value = freq;
      }
      break;
    case 'fxSend':
      if (app.audio.nodes.leadFxSend) {
        app.audio.nodes.leadFxSend.gain.value = value;
      }
      break;
    case 'bassFilter':
      if (app.audio.nodes.bassFilter) {
        const baseFreq = app.controlState.bassFilterBase || 140;
        const modRange = app.controlState.bassFilterMod || 260;
        const freq = baseFreq + (value * modRange);
        app.audio.nodes.bassFilter.frequency.value = freq;
      }
      break;
    case 'reverbDecay':
      if (app.audio.nodes.reverb) {
        const decay = 1 + (value * 11); // 1 to 12 seconds
        app.audio.nodes.reverb.decay = decay;
      }
      break;
    case 'delayFeedback':
      if (app.audio.nodes.delay) {
        app.audio.nodes.delay.feedback.value = value;
      }
      break;
    case 'bassDrive':
      if (app.audio.nodes.bassDrive) {
        app.audio.nodes.bassDrive.wet.value = value;
      }
      break;
    case 'leadResonance':
      if (app.audio.nodes.leadFilter) {
        app.audio.nodes.leadFilter.Q.value = value * 6;
      }
      break;
    case 'masterVolume':
      if (app.audio.master) {
        const db = -24 + (value * 30); // -24 to 6 dB
        app.audio.master.volume.value = db;
      }
      break;
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
  const audio = app.audio;
  
  switch (trackId) {
    case 'leadFilter':
      if (audio.nodes.leadFilter) {
        audio.nodes.leadFilter.frequency.value = 200 + (value * 2000);
      }
      break;
      
    case 'fxSend':
      if (audio.nodes.leadFxSend) {
        audio.nodes.leadFxSend.gain.value = value;
      }
      break;
      
    case 'bassFilter':
      if (audio.nodes.bassFilter) {
        audio.nodes.bassFilter.frequency.value = 50 + (value * 500);
      }
      break;
      
    case 'reverbDecay':
      if (audio.nodes.reverb) {
        audio.nodes.reverb.decay = 1 + (value * 9);
      }
      break;
      
    case 'delayFeedback':
      if (audio.nodes.delay) {
        audio.nodes.delay.feedback.value = value * 0.9;
      }
      break;
      
    case 'bassDrive':
      if (audio.nodes.bassDrive) {
        audio.nodes.bassDrive.distortion = value;
      }
      break;
      
    case 'masterVolume':
      if (audio.master) {
        audio.master.gain.value = 0.1 + (value * 0.8);
      }
      break;
  }
  
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

function exportPatternChain(app) {
  if (!app.patternChain) {
    app.status.set('Pattern chaining not available');
    return;
  }
  
  const chainConfig = app.patternChain.exportChainConfiguration();
  const name = prompt('Pattern chain name', 'My Pattern Chain');
  if (!name) return;
  
  const payload = {
    name,
    type: 'pattern-chain',
    createdAt: new Date().toISOString(),
    chainConfig
  };
  
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = slugify(name) + '-chain.json';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  
  app.status.set(`Pattern chain "${name}" exported`);
}

function triggerChainImport(app) {
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
        if (parsed.type === 'pattern-chain' && parsed.chainConfig) {
          importPatternChain(app, parsed);
          app.status.set(`Pattern chain "${parsed.name || 'Imported'}" loaded`);
        } else {
          app.status.set('Invalid pattern chain file');
        }
      } catch (err) {
        console.error('Pattern chain parse failed', err);
        app.status.set('Pattern chain load failed');
      } finally {
        fileInput.value = '';
      }
    };
    reader.readAsText(file);
  });
  document.body.appendChild(fileInput);
  fileInput.click();
  document.body.removeChild(fileInput);
}

function importPatternChain(app, chainData) {
  if (!app.patternChain) {
    app.status.set('Pattern chaining not available');
    return;
  }
  
  app.patternChain.importChainConfiguration(chainData.chainConfig);
  
  // Update UI controls
  const chainLengthSlider = document.getElementById('chainLengthSlider');
  const variationIntensitySlider = document.getElementById('variationIntensitySlider');
  const transitionModeSelect = document.getElementById('transitionModeSelect');
  
  if (chainLengthSlider) {
    chainLengthSlider.value = chainData.chainConfig.chainLength;
    chainLengthSlider.dispatchEvent(new Event('input'));
  }
  
  if (variationIntensitySlider) {
    variationIntensitySlider.value = chainData.chainConfig.variationIntensity;
    variationIntensitySlider.dispatchEvent(new Event('input'));
  }
  
  if (transitionModeSelect) {
    transitionModeSelect.value = chainData.chainConfig.transitionMode;
    transitionModeSelect.dispatchEvent(new Event('change'));
  }
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

function addRandomizeAnimation(button) {
  if (!button) return;
  
  // Add visual feedback animation
  button.style.transform = 'scale(0.95)';
  button.style.background = 'rgba(73, 169, 255, 0.2)';
  button.style.borderColor = '#49a9ff';
  
  setTimeout(() => {
    button.style.transform = '';
    button.style.background = '';
    button.style.borderColor = '';
  }, 200);
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