/**
 * Main Application Module
 * Orchestrates all other modules and handles application lifecycle
 */

import { AudioModule } from './audio.js';
import { UIModule } from './ui.js';
import { WaveformModule } from './waveform.js';

export class App {
  constructor() {
    this.audio = new AudioModule();
    this.ui = new UIModule(this);
    this.waveform = new WaveformModule(this);
    this.isInitialized = false;
  }

  async init() {
    try {
      this.ui.setStatus('Initializing application...');
      
      // Initialize audio first
      await this.audio.init();
      
      // Initialize waveform
      this.waveform.init();
      
      this.isInitialized = true;
      this.ui.setStatus('Application ready');
      
      // Set up global error handling
      window.addEventListener('error', (event) => {
        this.ui.showError(event.error.message);
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        this.ui.showError(event.reason);
'use strict';

const STEP_COUNT = 16;
const STEP_DURATION = '1m';
const LOOP_DURATION = Tone.Ticks(Tone.Time(STEP_DURATION).toTicks() * STEP_COUNT);
const STORAGE_KEYS = {
  controlState: 'bodzin.controlState',
  preset: 'bodzin.preset',
  midi: 'bodzin.midiMappings'
};

const SECTION_DEFINITIONS = [
  { name: 'Intro', color: 'rgba(73, 169, 255, 0.05)' },
  { name: 'Lift', color: 'rgba(255, 73, 175, 0.04)' },
  { name: 'Peak', color: 'rgba(148, 255, 73, 0.04)' },
  { name: 'Break', color: 'rgba(255, 180, 73, 0.05)' }
];

const DEFAULT_SECTION_LAYOUT = createSectionLayout(STEP_COUNT);

const AUTOMATION_TRACK_DEFINITIONS = [
  {
    id: 'leadFilter',
    label: 'Lead Filter',
    color: '#49a9ff',
    curve: [
      0.1, 0.12, 0.18, 0.24, 0.32, 0.38, 0.46, 0.52,
      0.6, 0.68, 0.76, 0.84, 0.88, 0.92, 0.96, 1
    ]
  },
  {
    id: 'fxSend',
    label: 'FX Send',
    color: '#ff49af',
    curve: [
      0.05, 0.08, 0.1, 0.14, 0.18, 0.22, 0.28, 0.32,
      0.35, 0.4, 0.46, 0.52, 0.58, 0.62, 0.68, 0.74
    ]
  },
  {
    id: 'bassFilter',
    label: 'Bass Filter',
    color: '#94ff49',
    curve: [
      0.24, 0.25, 0.26, 0.28, 0.34, 0.4, 0.48, 0.54,
      0.52, 0.46, 0.4, 0.34, 0.3, 0.28, 0.26, 0.24
    ]
  },
  {
    id: 'reverbDecay',
    label: 'Reverb Decay',
    color: '#ff6b35',
    curve: [
      0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65,
      0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1, 0.95
    ]
  },
  {
    id: 'delayFeedback',
    label: 'Delay Feedback',
    color: '#4ecdc4',
    curve: [
      0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45,
      0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15
    ]
  },
  {
    id: 'bassDrive',
    label: 'Bass Drive',
    color: '#f7b731',
    curve: [
      0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55,
      0.6, 0.65, 0.7, 0.75, 0.8, 0.75, 0.7, 0.65
    ]
  },
  {
    id: 'leadResonance',
    label: 'Lead Resonance',
    color: '#a55eea',
    curve: [
      0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8,
      0.9, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4
    ]
  },
  {
    id: 'masterVolume',
    label: 'Master Volume',
    color: '#26de81',
    curve: [
      0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95,
      1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65
    ]
  }
];

const DEFAULT_AUTOMATION = createDefaultAutomation(STEP_COUNT);

const AUTOMATION_TRACK_ORDER = new Map(
  AUTOMATION_TRACK_DEFINITIONS.map((definition, index) => [definition.id, index])
);

// Pattern Variation System
const PATTERN_VARIATIONS = {
  kick: {
    A: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // Default
    B: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0], // Syncopated
    C: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], // Double time
    D: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0]  // Half time
  },
  snare: {
    A: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0], // Default
    B: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], // More hits
    C: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Sparse
    D: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0]  // Roll
  },
  hats: {
    A: [0.6, 0, 0.45, 0, 0.7, 0.25, 0.5, 0.25, 0.65, 0, 0.45, 0, 0.75, 0.3, 0.55, 0.35], // Default
    B: [0.8, 0.4, 0.6, 0.2, 0.8, 0.4, 0.6, 0.2, 0.8, 0.4, 0.6, 0.2, 0.8, 0.4, 0.6, 0.2], // Dense
    C: [0.5, 0, 0, 0, 0.5, 0, 0, 0, 0.5, 0, 0, 0, 0.5, 0, 0, 0], // Sparse
    D: [0.7, 0.3, 0.5, 0.3, 0.7, 0.3, 0.5, 0.3, 0.7, 0.3, 0.5, 0.3, 0.7, 0.3, 0.5, 0.3]  // Steady
  },
  bass: {
    A: ['C2', null, 'G1', null, 'C2', 'D2', null, 'G1', 'C2', null, 'A1', null, 'C2', 'D2', null, 'G1'], // Default
    B: ['C2', 'G1', 'C2', 'G1', 'C2', 'D2', 'G1', 'D2', 'C2', 'G1', 'A1', 'G1', 'C2', 'D2', 'G1', 'D2'], // Dense
    C: ['C2', null, null, null, 'C2', null, null, null, 'C2', null, null, null, 'C2', null, null, null], // Sparse
    D: ['C2', 'E2', 'G2', 'A2', 'C2', 'E2', 'G2', 'A2', 'C2', 'E2', 'G2', 'A2', 'C2', 'E2', 'G2', 'A2']  // Arpeggio
  },
  lead: {
    A: [['E4', 'B4'], null, ['G4'], null, ['A4'], null, ['B4', 'D5'], null, ['E5'], null, ['G4'], null, ['A4', 'C5'], null, ['B4'], null], // Default
    B: [['E4', 'B4', 'G4'], ['A4'], ['G4', 'B4'], ['D5'], ['E5', 'G4'], ['A4'], ['B4', 'D5', 'E5'], ['G4'], ['E4', 'B4'], ['G4'], ['A4', 'C5'], ['B4'], ['E5', 'G4'], ['A4'], ['B4', 'D5'], ['E4']], // Dense
    C: [['E4'], null, null, null, ['A4'], null, null, null, ['E5'], null, null, null, ['A4'], null, null, null], // Sparse
    D: [['E4', 'G4', 'B4'], ['A4', 'C5'], ['G4', 'B4', 'D5'], ['E5', 'G4'], ['A4', 'C5', 'E5'], ['B4', 'D5'], ['G4', 'B4', 'E5'], ['A4', 'C5']] // Arpeggio
  },
  fx: {
    A: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0], // Default
    B: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], // More hits
    C: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], // Sparse
    D: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]  // Quarter notes
  }
};

// Additional pattern variations for more complexity
const EXTENDED_PATTERN_VARIATIONS = {
  kick: {
    E: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0], // Triplet feel
    F: [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0]  // Complex
  },
  snare: {
    E: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Single hit
    F: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]  // Roll pattern
  },
  hats: {
    E: [0.4, 0.2, 0.4, 0.2, 0.4, 0.2, 0.4, 0.2, 0.4, 0.2, 0.4, 0.2, 0.4, 0.2, 0.4, 0.2], // Steady 16ths
    F: [0.8, 0, 0.6, 0, 0.8, 0, 0.6, 0, 0.8, 0, 0.6, 0, 0.8, 0, 0.6, 0]  // Accented 8ths
  },
  bass: {
    E: ['C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2'], // Drone
    F: ['C2', 'E2', 'G2', 'A2', 'C2', 'E2', 'G2', 'A2', 'C2', 'E2', 'G2', 'A2', 'C2', 'E2', 'G2', 'A2']  // Arpeggio
  },
  lead: {
    E: [['C4', 'E4', 'G4'], ['A4', 'C5'], ['G4', 'B4'], ['E5', 'G5'], ['C4', 'E4', 'G4'], ['A4', 'C5'], ['G4', 'B4'], ['E5', 'G5']], // Chord progression
    F: [['E4'], ['F4'], ['G4'], ['A4'], ['B4'], ['C5'], ['D5'], ['E5'], ['D5'], ['C5'], ['B4'], ['A4'], ['G4'], ['F4'], ['E4'], ['D4']]  // Scale run
  },
  fx: {
    E: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Silent
    F: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // Constant
  }
};

const PATTERN_VARIATION_CONFIG = {
  enabled: true,
  randomization: {
    enabled: true,
    intensity: 0.3, // 0-1, how much to randomize
    frequency: 0.1  // 0-1, how often to randomize
  },
  abPatterns: {
    enabled: true,
    switchProbability: 0.2, // 0-1, probability of switching A/B patterns
    currentPattern: 'A' // Current active pattern
  },
  probabilityTriggers: {
    enabled: true,
    skipProbability: 0.1, // 0-1, probability of skipping a step
    accentProbability: 0.15, // 0-1, probability of accenting a step
    accentMultiplier: 1.5 // Multiplier for accented steps
  }
const LFO_DEFINITIONS = [
  {
    id: 'lfo1',
    label: 'LFO 1',
    color: '#ff6b6b',
    rate: 0.5, // Hz
    depth: 0.3,
    waveform: 'sine',
    target: 'leadFilter',
    enabled: true
  },
  {
    id: 'lfo2',
    label: 'LFO 2',
    color: '#4ecdc4',
    rate: 0.25, // Hz
    depth: 0.2,
    waveform: 'triangle',
    target: 'fxSend',
    enabled: false
  },
  {
    id: 'lfo3',
    label: 'LFO 3',
    color: '#45b7d1',
    rate: 1.0, // Hz
    depth: 0.15,
    waveform: 'square',
    target: 'bassFilter',
    enabled: false
  },
  {
    id: 'lfo4',
    label: 'LFO 4',
    color: '#96ceb4',
    rate: 0.125, // Hz
    depth: 0.25,
    waveform: 'sawtooth',
    target: 'reverbDecay',
    enabled: false
  }
];

const CURVE_TYPES = {
  LINEAR: 'linear',
  BEZIER: 'bezier',
  EXPONENTIAL: 'exponential',
  LOGARITHMIC: 'logarithmic',
  SINE: 'sine'
};

function createSectionLayout(stepCount = STEP_COUNT) {
  const totalSteps = Math.max(Math.floor(stepCount), 0);
  if (totalSteps <= 0) {
    return [];
  }

  const definitions = SECTION_DEFINITIONS.slice(0, Math.min(SECTION_DEFINITIONS.length, totalSteps));
  if (!definitions.length) {
    return [
      { name: 'Loop', start: 0, end: totalSteps - 1, color: 'rgba(255, 255, 255, 0.04)' }
    ];
  }

  const sectionCount = definitions.length;
  const baseLength = Math.floor(totalSteps / sectionCount);
  const remainder = totalSteps % sectionCount;

  let cursor = 0;
  return definitions.map((definition, index) => {
    const extra = index < remainder ? 1 : 0;
    const length = Math.max(baseLength + extra, 1);
    const start = cursor;
    let end = start + length - 1;
    if (index === sectionCount - 1 || end >= totalSteps - 1) {
      end = totalSteps - 1;
    }
    cursor = end + 1;
    return {
      name: definition.name,
      color: definition.color,
      start,
      end
    };
  });
}

function createAutomationTrack(definition, stepCount = STEP_COUNT) {
  return {
    id: definition.id,
    label: definition.label,
    color: definition.color,
    values: normalizeAutomationValues(definition.curve || [], stepCount, definition.curveType),
    curveType: definition.curveType || CURVE_TYPES.LINEAR,
    lfo: definition.lfo || null,
    breakpoints: definition.breakpoints || []
  };
}

function createDefaultAutomation(stepCount = STEP_COUNT) {
  return {
    tracks: AUTOMATION_TRACK_DEFINITIONS.map(definition => createAutomationTrack(definition, stepCount)),
    sections: createSectionLayout(stepCount)
  };
}

const SECTION_SEQUENCE_ACTIVITY = {
  Intro: { drums: true, bass: false, lead: false, fx: false },
  Lift: { drums: true, bass: true, lead: false, fx: true },
  Peak: { drums: true, bass: true, lead: true, fx: true },
  Break: { drums: true, bass: false, lead: false, fx: true }
};

const CONTROL_SCHEMA = [
  {
    group: 'Transport',
    description: 'Tempo and groove foundation.',
    controls: [
      {
        id: 'tempo',
        label: 'Tempo',
        type: 'range',
        min: 110,
        max: 136,
        step: 1,
        default: 124,
        format: value => `${Math.round(value)} BPM`,
        apply: (value) => Tone.Transport.bpm.rampTo(value, 0.1)
      },
      {
        id: 'swing',
        label: 'Swing Amount',
        type: 'range',
        min: 0,
        max: 0.45,
        step: 0.01,
        default: 0.08,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value) => {
          Tone.Transport.swing = value;
          Tone.Transport.swingSubdivision = '8n';
        }
      }
    ]
  },
  {
    group: 'Bus Levels',
    description: 'Mix bus trims for the core stems.',
    controls: [
      {
        id: 'drumLevel',
        label: 'Drums Level',
        type: 'range',
        min: -24,
        max: 6,
        step: 0.5,
        default: -4,
        format: formatDb,
        apply: (value, app) => setBusLevel(app.audio.buses.drums, value)
      },
      {
        id: 'bassLevel',
        label: 'Bass Level',
        type: 'range',
        min: -24,
        max: 6,
        step: 0.5,
        default: -6,
        format: formatDb,
        apply: (value, app) => setBusLevel(app.audio.buses.bass, value)
      },
      {
        id: 'leadLevel',
        label: 'Lead Level',
        type: 'range',
        min: -24,
        max: 6,
        step: 0.5,
        default: -3,
        format: formatDb,
        apply: (value, app) => setBusLevel(app.audio.buses.lead, value)
      },
      {
        id: 'fxLevel',
        label: 'FX Return',
        type: 'range',
        min: -24,
        max: 6,
        step: 0.5,
        default: -8,
        format: formatDb,
        apply: (value, app) => setBusLevel(app.audio.buses.fx, value)
      }
    ]
  },
  {
    group: 'Bass Synth',
    description: 'Low-end sculpting.',
    controls: [
      {
        id: 'bassFilterBase',
        label: 'Filter Base',
        type: 'range',
        min: 80,
        max: 420,
        step: 1,
        default: 140,
        format: formatHz,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.bassFilter.frequency.value = value;
        }
      },
      {
        id: 'bassFilterMod',
        label: 'Filter Movement',
        type: 'range',
        min: 0,
        max: 520,
        step: 1,
        default: 260,
        format: value => `${Math.round(value)} Hz`,
        affectsAutomation: true,
        apply: () => {}
      },
      {
        id: 'bassResonance',
        label: 'Resonance',
        type: 'range',
        min: 0.3,
        max: 1.5,
        step: 0.01,
        default: 0.7,
        format: value => value.toFixed(2),
        apply: (value, app) => {
          app.audio.nodes.bassFilter.Q.value = value * 6;
        }
      },
      {
        id: 'bassDrive',
        label: 'Drive',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.35,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.nodes.bassDrive.wet.value = value;
        }
      }
    ]
  },
  {
    group: 'Lead Synth',
    description: 'Top line motion and tone.',
    controls: [
      {
        id: 'leadWave',
        label: 'Waveform',
        type: 'select',
        options: [
          { value: 'sawtooth', label: 'Saw' },
          { value: 'square', label: 'Square' },
          { value: 'triangle', label: 'Triangle' }
        ],
        default: 'sawtooth',
        apply: (value, app) => {
          app.audio.instruments.lead.set({ oscillator: { type: value } });
        }
      },
      {
        id: 'leadFilterBase',
        label: 'Filter Base',
        type: 'range',
        min: 240,
        max: 2200,
        step: 1,
        default: 520,
        format: formatHz,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.leadFilter.frequency.value = value;
        }
      },
      {
        id: 'leadFilterMod',
        label: 'Filter Movement',
        type: 'range',
        min: 0,
        max: 5200,
        step: 1,
        default: 2600,
        format: value => `${Math.round(value)} Hz`,
        affectsAutomation: true,
        apply: () => {}
      },
      {
        id: 'leadDetune',
        label: 'Detune',
        type: 'range',
        min: -12,
        max: 12,
        step: 0.1,
        default: 3,
        format: value => `${value.toFixed(1)} cents`,
        apply: (value, app) => {
          app.audio.instruments.lead.set({ detune: value });
        }
      },
      {
        id: 'leadFxSend',
        label: 'FX Send',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.45,
        format: value => `${Math.round(value * 100)}%`,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.leadFxSend.gain.value = value;
        }
      }
    ]
  },
  {
    group: 'EQ',
    description: 'Multi-band equalizer with visual feedback.',
    controls: [
      {
        id: 'eqLowShelf',
        label: 'Low Shelf',
        type: 'range',
        min: -12,
        max: 12,
        step: 0.5,
        default: 0,
        format: value => `${value > 0 ? '+' : ''}${value.toFixed(1)} dB`,
        apply: (value, app) => {
          app.audio.nodes.eq.bands.lowShelf.gain.value = value;
        }
      },
      {
        id: 'eqLowMid',
        label: 'Low Mid',
        type: 'range',
        min: -12,
        max: 12,
        step: 0.5,
        default: 0,
        format: value => `${value > 0 ? '+' : ''}${value.toFixed(1)} dB`,
        apply: (value, app) => {
          app.audio.nodes.eq.bands.lowMid.gain.value = value;
        }
      },
      {
        id: 'eqMid',
        label: 'Mid',
        type: 'range',
        min: -12,
        max: 12,
        step: 0.5,
        default: 0,
        format: value => `${value > 0 ? '+' : ''}${value.toFixed(1)} dB`,
        apply: (value, app) => {
          app.audio.nodes.eq.bands.mid.gain.value = value;
        }
      },
      {
        id: 'eqHighMid',
        label: 'High Mid',
        type: 'range',
        min: -12,
        max: 12,
        step: 0.5,
        default: 0,
        format: value => `${value > 0 ? '+' : ''}${value.toFixed(1)} dB`,
        apply: (value, app) => {
          app.audio.nodes.eq.bands.highMid.gain.value = value;
        }
      },
      {
        id: 'eqHighShelf',
        label: 'High Shelf',
        type: 'range',
        min: -12,
        max: 12,
        step: 0.5,
        default: 0,
        format: value => `${value > 0 ? '+' : ''}${value.toFixed(1)} dB`,
        apply: (value, app) => {
          app.audio.nodes.eq.bands.highShelf.gain.value = value;
    group: 'Distortion & Overdrive',
    description: 'Harmonic saturation and drive effects.',
    controls: [
      {
        id: 'leadDistortion',
        label: 'Lead Distortion',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.2,
        format: value => `${Math.round(value * 100)}%`,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.leadDistortion.distortion = value;
        }
      },
      {
        id: 'leadOverdrive',
        label: 'Lead Overdrive',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.3,
        format: value => `${Math.round(value * 100)}%`,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.leadOverdrive.drive = value;
        }
      },
      {
        id: 'drumDistortion',
        label: 'Drum Distortion',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.15,
        format: value => `${Math.round(value * 100)}%`,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.drumDistortion.distortion = value;
        }
      },
      {
        id: 'masterOverdrive',
        label: 'Master Overdrive',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.1,
        format: value => `${Math.round(value * 100)}%`,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.masterOverdrive.drive = value;
        }
      }
    ]
  },
  {
    group: 'Ambience',
    description: 'Delay and space design.',
    controls: [
      {
        id: 'delayTime',
        label: 'Delay Time',
        type: 'select',
        options: [
          { value: '8n', label: '1/8' },
          { value: '8t', label: '1/8T' },
          { value: '4n', label: '1/4' }
        ],
        default: '8n',
        apply: (value, app) => {
          app.audio.nodes.delay.delayTime.value = value;
        }
      },
      {
        id: 'delayFeedback',
        label: 'Delay Feedback',
        type: 'range',
        min: 0,
        max: 0.8,
        step: 0.01,
        default: 0.38,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.nodes.delay.feedback.value = value;
        }
      },
      {
        id: 'delayMix',
        label: 'Delay Mix',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.3,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.nodes.delay.wet.value = value;
        }
      },
      {
        id: 'reverbDecay',
        label: 'Reverb Decay',
        type: 'range',
        min: 0.5,
        max: 12,
        step: 0.1,
        default: 6,
        format: value => `${value.toFixed(1)} s`,
        apply: (value, app) => {
          app.audio.nodes.reverb.decay = value;
        }
      },
      {
        id: 'reverbMix',
        label: 'Reverb Mix',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.28,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.nodes.reverb.wet.value = value;
        }
      }
    ]
  },
  {
    group: 'Envelope Followers',
    description: 'Dynamic modulation based on audio signal amplitude.',
    controls: [
      {
        id: 'envFollower1Enabled',
        label: 'EF1 Enable',
        type: 'select',
        options: [
          { value: false, label: 'Off' },
          { value: true, label: 'On' }
        ],
        default: false,
        apply: (value, app) => {
          app.audio.setEnvelopeFollowerEnabled('envFollower1', value);
        }
      },
      {
        id: 'envFollower1Attack',
        label: 'EF1 Attack',
        type: 'range',
        min: 0.001,
        max: 0.1,
        step: 0.001,
        default: 0.01,
        format: value => `${(value * 1000).toFixed(1)} ms`,
        apply: (value, app) => {
          app.audio.setEnvelopeFollowerConfig('envFollower1', { attackTime: value });
        }
      },
      {
        id: 'envFollower1Release',
        label: 'EF1 Release',
        type: 'range',
        min: 0.01,
        max: 1.0,
        step: 0.01,
        default: 0.1,
        format: value => `${(value * 1000).toFixed(0)} ms`,
        apply: (value, app) => {
          app.audio.setEnvelopeFollowerConfig('envFollower1', { releaseTime: value });
        }
      },
      {
        id: 'envFollower1Sensitivity',
        label: 'EF1 Sensitivity',
        type: 'range',
        min: 0.1,
        max: 5.0,
        step: 0.1,
        default: 1.0,
        format: value => `${value.toFixed(1)}x`,
        apply: (value, app) => {
          app.audio.setEnvelopeFollowerConfig('envFollower1', { sensitivity: value });
        }
      },
      {
        id: 'envFollower2Enabled',
        label: 'EF2 Enable',
        type: 'select',
        options: [
          { value: false, label: 'Off' },
          { value: true, label: 'On' }
        ],
        default: false,
        apply: (value, app) => {
          app.audio.setEnvelopeFollowerEnabled('envFollower2', value);
        }
      },
      {
        id: 'envFollower2Attack',
        label: 'EF2 Attack',
        type: 'range',
        min: 0.001,
        max: 0.1,
        step: 0.001,
        default: 0.005,
        format: value => `${(value * 1000).toFixed(1)} ms`,
        apply: (value, app) => {
          app.audio.setEnvelopeFollowerConfig('envFollower2', { attackTime: value });
        }
      },
      {
        id: 'envFollower2Release',
        label: 'EF2 Release',
        type: 'range',
        min: 0.01,
        max: 1.0,
        step: 0.01,
        default: 0.05,
        format: value => `${(value * 1000).toFixed(0)} ms`,
        apply: (value, app) => {
          app.audio.setEnvelopeFollowerConfig('envFollower2', { releaseTime: value });
        }
      },
      {
        id: 'envFollower2Sensitivity',
        label: 'EF2 Sensitivity',
        type: 'range',
        min: 0.1,
        max: 5.0,
        step: 0.1,
        default: 1.2,
        format: value => `${value.toFixed(1)}x`,
        apply: (value, app) => {
          app.audio.setEnvelopeFollowerConfig('envFollower2', { sensitivity: value });
        }
      },
      {
        id: 'envFollower2Threshold',
        label: 'EF2 Threshold',
        type: 'range',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        default: 0.1,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.setEnvelopeFollowerConfig('envFollower2', { threshold: value });
    group: 'Pattern Variations',
    description: 'Randomization and pattern switching for dynamic arrangements.',
    controls: [
      {
        id: 'patternVariationsEnabled',
        label: 'Enable Variations',
        type: 'select',
        options: [
          { value: 'true', label: 'On' },
          { value: 'false', label: 'Off' }
        ],
        default: 'true',
        apply: (value, app) => {
          app.patternVariations.enabled = value === 'true';
        }
      },
      {
        id: 'randomizationIntensity',
        label: 'Random Intensity',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.3,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.patternVariations.randomization.intensity = value;
        }
      },
      {
        id: 'randomizationFrequency',
        label: 'Random Frequency',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.1,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.patternVariations.randomization.frequency = value;
        }
      },
      {
        id: 'abPatternSwitch',
        label: 'A/B Switch Prob',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.2,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.patternVariations.abPatterns.switchProbability = value;
        }
      },
      {
        id: 'skipProbability',
        label: 'Skip Probability',
        type: 'range',
        min: 0,
        max: 0.5,
        step: 0.01,
        default: 0.1,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.patternVariations.probabilityTriggers.skipProbability = value;
        }
      },
      {
        id: 'accentProbability',
        label: 'Accent Probability',
        type: 'range',
        min: 0,
        max: 0.5,
        step: 0.01,
        default: 0.15,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.patternVariations.probabilityTriggers.accentProbability = value;
        }
      },
      {
        id: 'patternVariationReset',
        label: 'Reset Patterns',
        type: 'select',
        options: [
          { value: 'reset', label: 'Reset to A' },
          { value: 'random', label: 'Random All' }
        ],
        default: 'reset',
        apply: (value, app) => {
          if (value === 'reset') {
            Object.keys(app.patternVariations.currentPatterns).forEach(instrument => {
              app.patternVariations.currentPatterns[instrument] = 'A';
            });
            app.patternVariations.abPatterns.currentPattern = 'A';
          } else if (value === 'random') {
            const patterns = ['A', 'B', 'C', 'D'];
            Object.keys(app.patternVariations.currentPatterns).forEach(instrument => {
              app.patternVariations.currentPatterns[instrument] = patterns[Math.floor(Math.random() * patterns.length)];
            });
            app.patternVariations.abPatterns.currentPattern = patterns[Math.floor(Math.random() * patterns.length)];
          }
          rebuildSequencesWithVariations(app);
          drawTimeline(app);
        }
      },
      {
        id: 'accentMultiplier',
        label: 'Accent Multiplier',
        type: 'range',
        min: 1,
        max: 3,
        step: 0.1,
        default: 1.5,
        format: value => `${value.toFixed(1)}x`,
        apply: (value, app) => {
          app.patternVariations.probabilityTriggers.accentMultiplier = value;
    group: 'Sidechain Compression',
    description: 'Duck bass and lead when kick hits.',
    controls: [
      {
        id: 'sidechainEnabled',
        label: 'Enable Sidechain',
        type: 'select',
        options: [
          { value: 'off', label: 'Off' },
          { value: 'on', label: 'On' }
        ],
        default: 'on',
        apply: (value, app) => {
          app.audio.sidechainEnabled = value === 'on';
          app.audio.updateSidechainRouting();
        }
      },
      {
        id: 'sidechainThreshold',
        label: 'Threshold',
        type: 'range',
        min: -40,
        max: 0,
        step: 1,
        default: -24,
        format: formatDb,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.sidechainCompressor.threshold.value = value;
        }
      },
      {
        id: 'sidechainRatio',
        label: 'Ratio',
        type: 'range',
        min: 1,
        max: 20,
        step: 0.1,
        default: 4,
        format: value => `${value.toFixed(1)}:1`,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.sidechainCompressor.ratio.value = value;
        }
      },
      {
        id: 'sidechainAttack',
        label: 'Attack',
        type: 'range',
        min: 0.001,
        max: 0.1,
        step: 0.001,
        default: 0.003,
        format: value => `${(value * 1000).toFixed(1)} ms`,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.sidechainCompressor.attack.value = value;
        }
      },
      {
        id: 'sidechainRelease',
        label: 'Release',
        type: 'range',
        min: 0.01,
        max: 2,
        step: 0.01,
        default: 0.1,
        format: value => `${(value * 1000).toFixed(0)} ms`,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.sidechainCompressor.release.value = value;
        }
      },
      {
        id: 'sidechainAmount',
        label: 'Amount',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.8,
        format: value => `${Math.round(value * 100)}%`,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.sidechainGain.gain.value = value;
        }
      }
    ]
  }
];

let appInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  appInstance = createApp();
  initializeApp(appInstance);
  window.bodzinApp = appInstance;
  
  // Add mobile-specific optimizations
  setupMobileOptimizations(appInstance);
});

function setupMobileOptimizations(app) {
  // Prevent zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Optimize for mobile performance
  if (window.innerWidth <= 768) {
    // Reduce animation frequency on mobile
    const originalDrawTimeline = drawTimeline;
    let drawTimeout = null;
    drawTimeline = (app) => {
      if (drawTimeout) {
        clearTimeout(drawTimeout);
      }
      drawTimeout = setTimeout(() => originalDrawTimeline(app), 16); // ~60fps
    };

    // Optimize canvas rendering
    const canvas = app.timeline.canvas;
    if (canvas) {
      canvas.style.willChange = 'transform';
      canvas.style.transform = 'translateZ(0)'; // Force hardware acceleration
    }
  }

  // Add mobile-specific keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
      return; // Don't interfere with form inputs
    }

    switch (event.key) {
      case ' ':
        event.preventDefault();
        if (Tone.Transport.state === 'started') {
          stopPlayback(app);
        } else {
          startPlayback(app);
        }
        break;
      case 'Escape':
        if (app.midi.learning) {
          setMidiLearn(app, false);
        }
        break;
      case '=':
      case '+':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          app.timeline.zoom = Math.min(app.timeline.zoom + app.timeline.zoomStep, app.timeline.maxZoom);
          updateZoomLevel(app);
          drawTimeline(app);
        }
        break;
      case '-':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          app.timeline.zoom = Math.max(app.timeline.zoom - app.timeline.zoomStep, app.timeline.minZoom);
          updateZoomLevel(app);
          drawTimeline(app);
        }
        break;
      case '0':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          app.timeline.zoom = 1.0;
          app.timeline.pan = 0;
          updateZoomLevel(app);
          drawTimeline(app);
        }
        break;
      case 'Home':
        event.preventDefault();
        app.timeline.pan = -getMaxPan(app);
        drawTimeline(app);
        break;
      case 'End':
        event.preventDefault();
        app.timeline.pan = 0;
        drawTimeline(app);
        break;
      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const stepWidth = (app.timeline.canvas.clientWidth / STEP_COUNT) * app.timeline.zoom;
          app.timeline.pan = Math.max(app.timeline.pan - stepWidth * 0.1, -getMaxPan(app));
          drawTimeline(app);
        }
        break;
      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const stepWidth = (app.timeline.canvas.clientWidth / STEP_COUNT) * app.timeline.zoom;
          app.timeline.pan = Math.min(app.timeline.pan + stepWidth * 0.1, 0);
          drawTimeline(app);
        }
        break;
    }
  });

  // Handle orientation changes
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      syncTimelineCanvas(app);
      drawTimeline(app);
    }, 100);
  });

  // Handle resize events with debouncing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      syncTimelineCanvas(app);
      drawTimeline(app);
    }, 150);
  });
}

function createApp() {
  return {
    audio: null,
    controls: new Map(),
    controlState: {},
    automation: cloneAutomation(DEFAULT_AUTOMATION),
    automationEvent: null,
    automationStep: 0,
    activeSection: null,
    midi: {
      access: null,
      mappings: loadMidiMappings(),
      learning: false,
      pendingControl: null
    },
    presetName: 'Deep Default',
    timeline: {
      canvas: document.getElementById('timeline'),
      ctx: null,
      currentStep: 0,
      deviceRatio: window.devicePixelRatio || 1,
      zoom: 1.0,
      pan: 0,
      minZoom: 0.1,
      maxZoom: 10.0,
      zoomStep: 0.1,
      isDragging: false,
      lastPanX: 0,
      snapToGrid: true,
      gridSize: 1,
      showRuler: true,
      rulerHeight: 30
    },
    waveform: {
      canvas: document.getElementById('waveform'),
      ctx: null,
      analyser: null,
      dataArray: null,
      animationId: null,
      deviceRatio: window.devicePixelRatio || 1
    },
    statusEl: document.getElementById('status'),
    sectionLabelEl: document.getElementById('sectionLabel'),
    statusTimer: null,
    presetFileInput: null,
    patternVariations: {
      enabled: true,
      randomization: {
        enabled: true,
        intensity: 0.3,
        frequency: 0.1
      },
      abPatterns: {
        enabled: true,
        switchProbability: 0.2,
        currentPattern: 'A'
      },
      probabilityTriggers: {
        enabled: true,
        skipProbability: 0.1,
        accentProbability: 0.15,
        accentMultiplier: 1.5
      },
      currentPatterns: {
        kick: 'A',
        snare: 'A',
        hats: 'A',
        bass: 'A',
        lead: 'A',
        fx: 'A'
      },
      lastVariationStep: 0
    particles: [],
    lastParticleTime: 0,
    leds: {
      drums: document.getElementById('led-drums'),
      bass: document.getElementById('led-bass'),
      lead: document.getElementById('led-lead'),
      fx: document.getElementById('led-fx')
    }
  };
}

function initializeApp(app) {
  if (!app.timeline.canvas) {
    console.warn('Timeline canvas missing.');
    return;
  }

  // Show mobile loading indicator
  const mobileLoading = document.getElementById('mobile-loading');
  if (mobileLoading && window.innerWidth <= 768) {
    mobileLoading.style.display = 'flex';
  }

  app.timeline.ctx = app.timeline.canvas.getContext('2d');
  app.waveform.ctx = app.waveform.canvas.getContext('2d');
  app.audio = initializeAudioGraph();
  configureTransport();

  const storedControls = loadControlState();
  const storedPreset = loadPresetState();
  const externalPreset = typeof preset !== 'undefined' ? preset : null;
  const defaultState = buildDefaultControlState();

  app.controlState = Object.assign({}, defaultState, storedControls);
  app.automation = normalizeAutomationState(app.automation, STEP_COUNT);
  
  // Initialize pattern variations
  if (storedPreset && storedPreset.patternVariations) {
    app.patternVariations = Object.assign({}, app.patternVariations, storedPreset.patternVariations);
  }

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

  renderControlInterface(app);
  setupButtons(app);
  setupTimeline(app);
  setupTimelineControls(app);
  setupWaveform(app);
  setupAutomationScheduling(app);
  setupMidi(app);
  applyAutomationForStep(app, 0);
  syncSectionState(app, 0);
  updateLEDIndicators(app, getSectionForStep(app, 0));
  drawTimeline(app);
  setStatus(app, 'Idle');

  // Hide mobile loading indicator
  if (mobileLoading) {
    setTimeout(() => {
      mobileLoading.style.display = 'none';
    }, 500);
  }
}

function configureTransport() {
  Tone.Transport.bpm.value = 124;
  Tone.Transport.loop = true;
  Tone.Transport.loopStart = 0;
  Tone.Transport.loopEnd = LOOP_DURATION;
  Tone.Transport.swing = 0.08;
  Tone.Transport.swingSubdivision = '8n';
}

function initializeAudioGraph() {
  const masterGain = new Tone.Gain(0.9);
  const limiter = new Tone.Limiter(-1);
  masterGain.connect(limiter);
  limiter.toDestination();

  const buses = {
    drums: new Tone.Gain(0.8),
    bass: new Tone.Gain(0.8),
    lead: new Tone.Gain(0.8),
    fx: new Tone.Gain(0.5)
  };
  Object.values(buses).forEach(bus => bus.connect(masterGain));

  const delay = new Tone.FeedbackDelay('8n', 0.38);
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.28, preDelay: 0.02 });
  const leadFilter = new Tone.Filter(520, 'lowpass', -12);
  const leadFxSend = new Tone.Gain(0.45);
  const bassFilter = new Tone.Filter(140, 'lowpass', -12);
  const bassDrive = new Tone.Distortion(0.35);

  buses.fx.connect(delay);
  buses.fx.connect(reverb);
  delay.connect(masterGain);
  reverb.connect(masterGain);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.28, sustain: 0.0001, release: 0.2 }
  }).connect(buses.drums);

  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
  }).connect(buses.drums);

  const hats = new Tone.MetalSynth({
    frequency: 320,
    envelope: { attack: 0.001, decay: 0.09, release: 0.12 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 3000,
    octaves: 1.3
  }).connect(buses.drums);

  const bass = new Tone.MonoSynth({
    oscillator: { type: 'square' },
    filter: { type: 'lowpass', rolloff: -12 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.6 },
    envelope: { attack: 0.005, decay: 0.25, sustain: 0.6, release: 0.4 }
  });
  bass.chain(bassDrive, bassFilter, buses.bass);

  const lead = new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 4,
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.02, decay: 0.35, sustain: 0.4, release: 0.7 }
  });
  lead.connect(leadFilter);
  leadFilter.connect(buses.lead);
  leadFilter.connect(leadFxSend);
  leadFxSend.connect(buses.fx);

  const noiseFx = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.5, decay: 2.4, sustain: 0 },
    volume: -20
  }).connect(buses.fx);

  const sequences = buildSequences({ kick, snare, hats, bass, lead, noiseFx }, appInstance);

  return {
    master: masterGain,
    buses,
    nodes: {
      delay,
      reverb,
      leadFilter,
      leadFxSend,
      bassFilter,
      bassDrive
    },
    instruments: { kick, snare, hats, bass, lead, noiseFx },
    sequences,
    sequencesStarted: false
  };
}

// Pattern Variation Functions
function applyPatternVariations(value, instrument, app) {
  if (!app || !app.patternVariations || !app.patternVariations.enabled) {
    return value;
  }

  const config = app.patternVariations;
  let finalValue = value;

  // Apply skip probability
  if (config.probabilityTriggers.enabled && Math.random() < config.probabilityTriggers.skipProbability) {
    return 0;
  }

  // Apply accent probability
  if (config.probabilityTriggers.enabled && Math.random() < config.probabilityTriggers.accentProbability) {
    finalValue *= config.probabilityTriggers.accentMultiplier;
  }

  // Apply randomization
  if (config.randomization.enabled && Math.random() < config.randomization.frequency) {
    const intensity = config.randomization.intensity;
    const randomFactor = 1 + (Math.random() - 0.5) * intensity * 2;
    finalValue *= randomFactor;
  }

  return Math.max(0, Math.min(finalValue, 1));
}

function updatePatternVariations(app) {
  if (!app.patternVariations || !app.patternVariations.enabled) {
    return;
  }

  const config = app.patternVariations;
  const currentStep = app.timeline.currentStep || 0;

  // Check if we should switch A/B patterns
  if (config.abPatterns.enabled && Math.random() < config.abPatterns.switchProbability) {
    const patterns = ['A', 'B', 'C', 'D', 'E', 'F'];
    const currentPattern = config.abPatterns.currentPattern;
    const availablePatterns = patterns.filter(p => p !== currentPattern);
    const newPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    
    config.abPatterns.currentPattern = newPattern;
    
    // Update individual instrument patterns
    Object.keys(config.currentPatterns).forEach(instrument => {
      if (Math.random() < 0.5) { // 50% chance to update each instrument
        config.currentPatterns[instrument] = newPattern;
      }
    });

    // Rebuild sequences with new patterns
    rebuildSequencesWithVariations(app);
  }

  // Update randomization based on step
  if (config.randomization.enabled && currentStep !== config.lastVariationStep) {
    config.lastVariationStep = currentStep;
  }
}

function triggerPatternVariation(app, instrument = null) {
  if (!app.patternVariations || !app.patternVariations.enabled) {
    return;
  }

  const patterns = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  if (instrument && app.patternVariations.currentPatterns[instrument]) {
    // Update specific instrument
    const currentPattern = app.patternVariations.currentPatterns[instrument];
    const availablePatterns = patterns.filter(p => p !== currentPattern);
    app.patternVariations.currentPatterns[instrument] = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
  } else {
    // Update all instruments
    Object.keys(app.patternVariations.currentPatterns).forEach(inst => {
      app.patternVariations.currentPatterns[inst] = patterns[Math.floor(Math.random() * patterns.length)];
    });
    app.patternVariations.abPatterns.currentPattern = patterns[Math.floor(Math.random() * patterns.length)];
  }

  rebuildSequencesWithVariations(app);
  drawTimeline(app);
}

function rebuildSequencesWithVariations(app) {
  if (!app.audio || !app.audio.sequences) {
    return;
  }

  // Stop existing sequences
  app.audio.sequences.all.forEach(seq => {
    if (seq.state === 'started') {
      seq.stop();
    }
  });

  // Rebuild sequences with current patterns
  const newSequences = buildSequences(app.audio.instruments, app);
  
  // Update the sequences in the audio object
  app.audio.sequences = newSequences;
  
  // Restart sequences if transport is running
  if (Tone.Transport.state === 'started') {
    newSequences.all.forEach(seq => seq.start(0));
  }
}

function buildSequences(instruments, app = null) {
  // Get current patterns or defaults
  const getPattern = (instrument, variation = 'A') => {
    if (app && app.patternVariations && app.patternVariations.enabled) {
      // Check extended patterns first, then fall back to basic patterns
      if (EXTENDED_PATTERN_VARIATIONS[instrument] && EXTENDED_PATTERN_VARIATIONS[instrument][variation]) {
        return EXTENDED_PATTERN_VARIATIONS[instrument][variation];
      }
      return PATTERN_VARIATIONS[instrument][variation] || PATTERN_VARIATIONS[instrument]['A'];
    }
    return PATTERN_VARIATIONS[instrument]['A'];
  };

  const kickPattern = getPattern('kick', app?.patternVariations?.currentPatterns?.kick);
  const snarePattern = getPattern('snare', app?.patternVariations?.currentPatterns?.snare);
  const hatPattern = getPattern('hats', app?.patternVariations?.currentPatterns?.hats);
  const bassPattern = getPattern('bass', app?.patternVariations?.currentPatterns?.bass);
  const leadPattern = getPattern('lead', app?.patternVariations?.currentPatterns?.lead);
  const fxPattern = getPattern('fx', app?.patternVariations?.currentPatterns?.fx);

  const kickSeq = new Tone.Sequence((time, velocity) => {
    if (velocity) {
      const finalVelocity = applyPatternVariations(velocity, 'kick', app);
      if (finalVelocity > 0) {
        instruments.kick.triggerAttackRelease('C1', '8n', time, finalVelocity);
      }
    }
  }, kickPattern, '16n');

  const snareSeq = new Tone.Sequence((time, hit) => {
    if (hit) {
      const finalHit = applyPatternVariations(hit, 'snare', app);
      if (finalHit > 0) {
        instruments.snare.triggerAttackRelease('16n', time, 0.8 * finalHit);
      }
    }
  }, snarePattern, '16n');

  const hatSeq = new Tone.Sequence((time, velocity) => {
    if (velocity) {
      const finalVelocity = applyPatternVariations(velocity, 'hats', app);
      if (finalVelocity > 0) {
        instruments.hats.triggerAttackRelease('32n', time, finalVelocity);
      }
    }
  }, hatPattern, '16n');

  const bassSeq = new Tone.Sequence((time, note) => {
    if (note) {
      const shouldPlay = applyPatternVariations(1, 'bass', app);
      if (shouldPlay > 0) {
        instruments.bass.triggerAttackRelease(note, '8n', time, 0.9);
      }
    }
  }, bassPattern, '16n');

  const leadSeq = new Tone.Sequence((time, notes) => {
    if (notes && notes.length) {
      const shouldPlay = applyPatternVariations(1, 'lead', app);
      if (shouldPlay > 0) {
        notes.forEach(note => instruments.lead.triggerAttackRelease(note, '16n', time, 0.8));
      }
    }
  }, leadPattern, '16n');

  const fxSeq = new Tone.Sequence((time, trigger) => {
    if (trigger) {
      const finalTrigger = applyPatternVariations(trigger, 'fx', app);
      if (finalTrigger > 0) {
        instruments.noiseFx.triggerAttackRelease('2n', time, 0.35 * finalTrigger);
      }
    }
  }, fxPattern, '16n');

  const groups = {
    drums: [kickSeq, snareSeq, hatSeq],
    bass: [bassSeq],
    lead: [leadSeq],
    fx: [fxSeq]
  };

  const sequencesByInstrument = {
    kick: kickSeq,
    snare: snareSeq,
    hats: hatSeq,
    bass: bassSeq,
    lead: leadSeq,
    fx: fxSeq
  };

  return {
    all: [].concat(...Object.values(groups)),
    groups,
    byInstrument: sequencesByInstrument
  };
}

function buildDefaultControlState() {
  const state = {};
  CONTROL_SCHEMA.forEach(section => {
    section.controls.forEach(control => {
      state[control.id] = control.default;
    });
  });
  return state;
}

function renderControlInterface(app) {
  const container = document.getElementById('controls');
  container.innerHTML = '';
  
  // Add mobile-specific container classes
  container.classList.add('mobile-optimized');
  
  CONTROL_SCHEMA.forEach(section => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'control-section';

    const heading = document.createElement('h3');
    heading.textContent = section.group;
    sectionEl.appendChild(heading);

    if (section.description) {
      const description = document.createElement('p');
      description.className = 'control-description';
      description.textContent = section.description;
      sectionEl.appendChild(description);
    }

    container.appendChild(sectionEl);

    section.controls.forEach(control => {
      const row = document.createElement('label');
      row.className = 'control-row';
      row.dataset.controlId = control.id;

      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = control.label;
      row.appendChild(label);

      const valueEl = document.createElement('span');
      valueEl.className = 'control-value';

      let input;
      if (control.type === 'select') {
        input = document.createElement('select');
        control.options.forEach(option => {
          const opt = document.createElement('option');
          opt.value = option.value;
          opt.textContent = option.label;
          input.appendChild(opt);
        });
      } else {
        input = document.createElement('input');
        input.type = 'range';
        input.min = String(control.min);
        input.max = String(control.max);
        input.step = String(control.step);
        
        // Add mobile-specific attributes
        input.setAttribute('aria-label', control.label);
        input.setAttribute('role', 'slider');
        input.setAttribute('aria-valuemin', control.min);
        input.setAttribute('aria-valuemax', control.max);
      }
      input.id = control.id;
      input.dataset.controlId = control.id;

      const wrap = document.createElement('div');
      wrap.className = 'control-input';
      wrap.appendChild(input);
      row.appendChild(wrap);
      row.appendChild(valueEl);

      sectionEl.appendChild(row);

      const entry = { control, input, valueEl, row };
      app.controls.set(control.id, entry);

      const storedValue = app.controlState[control.id];
      setControlValue(app, control, storedValue, { silent: true, skipSave: true });

      input.addEventListener('input', event => {
        const val = getInputValue(control, event.target);
        setControlValue(app, control, val, { silent: true, skipSave: true });
      });
      input.addEventListener('change', event => {
        const val = getInputValue(control, event.target);
        setControlValue(app, control, val);
      });

      // Touch-specific event handlers for better mobile experience
      if (control.type === 'range') {
        let isDragging = false;
        let startValue = 0;
        let startY = 0;

        const handleTouchStart = (event) => {
          if (event.touches.length !== 1) return;
          isDragging = true;
          startValue = parseFloat(input.value);
          startY = event.touches[0].clientY;
          input.style.touchAction = 'none';
          event.preventDefault();
        };

        const handleTouchMove = (event) => {
          if (!isDragging || event.touches.length !== 1) return;
          const deltaY = startY - event.touches[0].clientY;
          const sensitivity = 0.5;
          const range = control.max - control.min;
          const step = control.step || 1;
          const deltaValue = (deltaY / 100) * range * sensitivity;
          const newValue = startValue + deltaValue;
          const clampedValue = Math.max(control.min, Math.min(control.max, newValue));
          const steppedValue = Math.round(clampedValue / step) * step;
          
          input.value = steppedValue;
          const val = getInputValue(control, input);
          setControlValue(app, control, val, { silent: true, skipSave: true });
          event.preventDefault();
        };

        const handleTouchEnd = (event) => {
          if (!isDragging) return;
          isDragging = false;
          input.style.touchAction = '';
          const val = getInputValue(control, input);
          setControlValue(app, control, val);
          event.preventDefault();
        };

        input.addEventListener('touchstart', handleTouchStart, { passive: false });
        input.addEventListener('touchmove', handleTouchMove, { passive: false });
        input.addEventListener('touchend', handleTouchEnd, { passive: false });
      }

      if (control.type === 'range') {
        const midiHandler = () => {
          if (app.midi.learning) {
            setMidiPendingControl(app, control.id);
          }
        };
        
        // Use pointer events for better cross-platform support
        input.addEventListener('pointerdown', midiHandler);
        input.addEventListener('mousedown', midiHandler);
        input.addEventListener('touchstart', midiHandler, { passive: true });
        
        // Add haptic feedback for mobile devices
        const addHapticFeedback = () => {
          if ('vibrate' in navigator) {
            navigator.vibrate(10); // Short vibration
          }
        };
        
        input.addEventListener('input', addHapticFeedback);
        input.addEventListener('change', addHapticFeedback);
      }
    });
  });
}

function getInputValue(control, input) {
  if (control.type === 'select') {
    return input.value;
  }
  const numeric = parseFloat(input.value);
  if (!Number.isFinite(numeric)) {
    return control.default;
  }
  return numeric;
}

function setControlValue(app, control, value, options = {}) {
  const { silent = false, skipSave = false } = options;
  const entry = app.controls.get(control.id);
  let normalizedValue = value;
  if (control.type !== 'select') {
    const min = Number(control.min);
    const max = Number(control.max);
    normalizedValue = clamp(typeof value === 'number' ? value : parseFloat(value), min, max);
  }
  app.controlState[control.id] = normalizedValue;

  if (entry) {
    if (control.type === 'select') {
      entry.input.value = String(normalizedValue);
    } else {
      entry.input.value = String(normalizedValue);
    }
    
    // Animate value change with smooth number transition
    animateValueChange(entry.valueEl, formatControlValue(control, normalizedValue));
    
    // Add enhanced visual feedback animations
    addParameterChangeAnimation(entry, control);
  }

  if (control.apply) {
    control.apply(normalizedValue, app);
  }

  if (control.affectsAutomation) {
    applyAutomationForStep(app, app.timeline.currentStep);
    drawTimeline(app);
  }

  // Handle pattern variation controls
  if (control.id === 'patternVariationsEnabled') {
    app.patternVariations.enabled = normalizedValue === 'true';
  } else if (control.id === 'randomizationIntensity') {
    app.patternVariations.randomization.intensity = normalizedValue;
  } else if (control.id === 'randomizationFrequency') {
    app.patternVariations.randomization.frequency = normalizedValue;
  } else if (control.id === 'abPatternSwitch') {
    app.patternVariations.abPatterns.switchProbability = normalizedValue;
  } else if (control.id === 'skipProbability') {
    app.patternVariations.probabilityTriggers.skipProbability = normalizedValue;
  } else if (control.id === 'accentProbability') {
    app.patternVariations.probabilityTriggers.accentProbability = normalizedValue;
  }

  if (!skipSave) {
    saveControlState(app.controlState);
  }
  if (!silent) {
    setStatus(app, `${control.label} → ${formatControlValue(control, normalizedValue)}`);
  }
}

function animateValueChange(element, newValue) {
  // Remove any existing animation classes
  element.classList.remove('value-changing');
  
  // Force reflow to ensure class removal takes effect
  element.offsetHeight;
  
  // Add animation class
  element.classList.add('value-changing');
  
  // Update the text content
  element.textContent = newValue;
  
  // Remove animation class after animation completes
  setTimeout(() => {
    element.classList.remove('value-changing');
  }, 400);
}

function addParameterChangeAnimation(entry, control) {
  // Remove any existing animation classes
  entry.row.classList.remove('parameter-changing');
  if (control.type === 'range') {
    entry.input.classList.remove('slider-changing');
  }
  
  // Force reflow
  entry.row.offsetHeight;
  
  // Add animation classes
  entry.row.classList.add('parameter-changing');
  if (control.type === 'range') {
    entry.input.classList.add('slider-changing');
  }
  
  // Remove animation classes after animation completes
  setTimeout(() => {
    entry.row.classList.remove('parameter-changing');
    if (control.type === 'range') {
      entry.input.classList.remove('slider-changing');
    }
  }, 600);
}

function formatControlValue(control, value) {
  if (control.format) {
    return control.format(value);
  }
  if (control.type === 'select') {
    const option = control.options.find(opt => opt.value === value);
    return option ? option.label : String(value);
  }
  return typeof value === 'number' ? value.toFixed(2) : String(value);
}

function setupButtons(app) {
  const startBtn = document.getElementById('startButton');
  const stopBtn = document.getElementById('stopButton');
  const savePresetBtn = document.getElementById('savePresetButton');
  const loadPresetBtn = document.getElementById('loadPresetButton');
  const exportMixBtn = document.getElementById('exportMixButton');
  const exportStemsBtn = document.getElementById('exportStemsButton');
  const midiToggle = document.getElementById('midiLearnToggle');
  const triggerVariationBtn = document.getElementById('triggerVariationButton');

  startBtn?.addEventListener('click', () => startPlayback(app));
  stopBtn?.addEventListener('click', () => stopPlayback(app));
  savePresetBtn?.addEventListener('click', () => {
    // Add visual feedback for preset saving
    savePresetBtn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    savePresetBtn.style.transform = 'scale(0.95)';
    savePresetBtn.style.background = 'rgba(73, 169, 255, 0.2)';
    setTimeout(() => {
      savePresetBtn.style.transform = 'scale(1)';
      savePresetBtn.style.background = '';
    }, 300);
    savePreset(app);
  });
  loadPresetBtn?.addEventListener('click', () => {
    // Add visual feedback for preset loading
    loadPresetBtn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    loadPresetBtn.style.transform = 'scale(0.95)';
    loadPresetBtn.style.background = 'rgba(255, 73, 175, 0.2)';
    setTimeout(() => {
      loadPresetBtn.style.transform = 'scale(1)';
      loadPresetBtn.style.background = '';
    }, 300);
    triggerPresetLoad(app);
  });
  exportMixBtn?.addEventListener('click', () => exportMix(app));
  exportStemsBtn?.addEventListener('click', () => exportStems(app));
  triggerVariationBtn?.addEventListener('click', () => triggerPatternVariation(app));
  midiToggle?.addEventListener('change', event => {
    const enabled = Boolean(event.target.checked);
    setMidiLearn(app, enabled);
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
        applyPreset(app, parsed);
        setStatus(app, `Preset “${parsed.name || 'Imported'}” loaded`);
      } catch (err) {
        console.error('Preset parse failed', err);
        setStatus(app, 'Preset load failed');
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
  
  // Enhanced visual feedback with smooth animations
  if (startBtn) {
    startBtn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    startBtn.classList.add('loading');
    startBtn.disabled = true;
    startBtn.style.transform = 'scale(0.95)';
  }
  
  await ensureTransportRunning(app);
  
  if (startBtn) {
    startBtn.classList.remove('loading');
    startBtn.disabled = false;
    startBtn.style.transform = 'scale(1)';
    startBtn.style.background = 'rgba(73, 169, 255, 0.1)';
    startBtn.style.borderColor = 'rgba(73, 169, 255, 0.3)';
  }
  
  if (stopBtn) {
    stopBtn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    stopBtn.style.background = 'rgba(255, 73, 175, 0.1)';
    stopBtn.style.borderColor = '#ff49af';
    stopBtn.style.transform = 'scale(1.02)';
    setTimeout(() => {
      stopBtn.style.transform = 'scale(1)';
    }, 200);
  }
  
  if (!options.silent) {
    setStatus(app, 'Playing');
  }
  
  // Update LED indicators when starting playback
  const currentSection = getSectionForStep(app, app.timeline.currentStep);
  updateLEDIndicators(app, currentSection);
}

async function ensureTransportRunning(app) {
  if (Tone.Transport.state === 'started') {
    return false;
  }
  await Tone.start();
  if (!app.audio.sequencesStarted) {
    const sequenceList = app.audio.sequences && Array.isArray(app.audio.sequences.all)
      ? app.audio.sequences.all
      : [];
    sequenceList.forEach(seq => seq.start(0));
    app.audio.sequencesStarted = true;
  }
  Tone.Transport.start();
  return true;
}

function stopPlayback(app) {
  const startBtn = document.getElementById('startButton');
  const stopBtn = document.getElementById('stopButton');
  
  // Enhanced visual feedback with smooth animations
  if (stopBtn) {
    stopBtn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    stopBtn.style.background = 'rgba(255, 255, 255, 0.04)';
    stopBtn.style.borderColor = 'var(--border)';
    stopBtn.style.transform = 'scale(0.98)';
    setTimeout(() => {
      stopBtn.style.transform = 'scale(1)';
    }, 200);
  }
  
  if (startBtn) {
    startBtn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    startBtn.style.background = 'linear-gradient(135deg, var(--accent), #3d8bff)';
    startBtn.style.borderColor = 'rgba(73, 169, 255, 0.45)';
    startBtn.style.transform = 'scale(1.02)';
    setTimeout(() => {
      startBtn.style.transform = 'scale(1)';
    }, 200);
  }
  
  Tone.Transport.stop();
  Tone.Transport.position = 0;
  app.timeline.currentStep = 0;
  app.automationStep = 0;
  applyAutomationForStep(app, 0);
  syncSectionState(app, 0);
  
  // Clear all LED indicators when stopping
  if (app.leds) {
    Object.values(app.leds).forEach(led => {
      if (led) led.classList.remove('active');
    });
  }
  
  drawTimeline(app);
  setStatus(app, 'Stopped');
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
  savePresetState(payload);
  setStatus(app, `Preset “${name}” saved`);
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
    patternVariations: { ...app.patternVariations }
  };
}

function applyPreset(app, presetData) {
  if (!presetData || typeof presetData !== 'object') return;
  if (presetData.controls) {
    Object.entries(presetData.controls).forEach(([id, value]) => {
      const control = getControlDefinition(id);
      if (control) {
        setControlValue(app, control, value, { silent: true });
      }
    });
    saveControlState(app.controlState);
  }
  if (presetData.automation) {
    applyAutomationPreset(app, presetData.automation);
    drawTimeline(app);
  }
  if (presetData.midiMappings) {
    app.midi.mappings = { ...presetData.midiMappings };
    saveMidiMappings(app.midi.mappings);
  }
  if (presetData.patternVariations) {
    app.patternVariations = Object.assign({}, app.patternVariations, presetData.patternVariations);
  }
  if (presetData.name) {
    app.presetName = presetData.name;
  }
  savePresetState(buildPresetPayload(app, app.presetName));
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

function setupTimeline(app) {
  const resizeObserver = new ResizeObserver(() => {
    syncTimelineCanvas(app);
    syncWaveformCanvas(app);
    drawTimeline(app);
  });
  syncTimelineCanvas(app);
  resizeObserver.observe(app.timeline.canvas);

  // Add mobile touch support for timeline
  setupTimelineTouch(app);
  setupTimelineZoomPan(app);
}

function setupTimelineControls(app) {
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const zoomFitBtn = document.getElementById('zoomFit');
  const zoomLevelEl = document.getElementById('zoomLevel');
  const panLeftBtn = document.getElementById('panLeft');
  const panRightBtn = document.getElementById('panRight');
  const goToStartBtn = document.getElementById('goToStart');
  const goToEndBtn = document.getElementById('goToEnd');
  const snapToggle = document.getElementById('snapToGridToggle');
  const rulerToggle = document.getElementById('showRulerToggle');

  // Zoom controls
  zoomInBtn?.addEventListener('click', () => {
    app.timeline.zoom = Math.min(app.timeline.zoom + app.timeline.zoomStep, app.timeline.maxZoom);
    updateZoomLevel(app);
    drawTimeline(app);
  });

  zoomOutBtn?.addEventListener('click', () => {
    app.timeline.zoom = Math.max(app.timeline.zoom - app.timeline.zoomStep, app.timeline.minZoom);
    updateZoomLevel(app);
    drawTimeline(app);
  });

  zoomFitBtn?.addEventListener('click', () => {
    app.timeline.zoom = 1.0;
    app.timeline.pan = 0;
    updateZoomLevel(app);
    drawTimeline(app);
  });

  // Pan controls
  panLeftBtn?.addEventListener('click', () => {
    const stepWidth = (app.timeline.canvas.clientWidth / STEP_COUNT) * app.timeline.zoom;
    app.timeline.pan = Math.max(app.timeline.pan - stepWidth * 0.1, -getMaxPan(app));
    drawTimeline(app);
  });

  panRightBtn?.addEventListener('click', () => {
    const stepWidth = (app.timeline.canvas.clientWidth / STEP_COUNT) * app.timeline.zoom;
    app.timeline.pan = Math.min(app.timeline.pan + stepWidth * 0.1, 0);
    drawTimeline(app);
  });

  goToStartBtn?.addEventListener('click', () => {
    app.timeline.pan = -getMaxPan(app);
    drawTimeline(app);
  });

  goToEndBtn?.addEventListener('click', () => {
    app.timeline.pan = 0;
    drawTimeline(app);
  });

  // Toggle controls
  snapToggle?.addEventListener('change', (event) => {
    app.timeline.snapToGrid = event.target.checked;
  });

  rulerToggle?.addEventListener('change', (event) => {
    app.timeline.showRuler = event.target.checked;
    drawTimeline(app);
  });

  // Initialize zoom level display
  updateZoomLevel(app);
}

function setupTimelineZoomPan(app) {
  const canvas = app.timeline.canvas;
  let isPanning = false;
  let lastPanX = 0;

  // Mouse wheel zoom
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -app.timeline.zoomStep : app.timeline.zoomStep;
    const oldZoom = app.timeline.zoom;
    app.timeline.zoom = Math.max(app.timeline.minZoom, Math.min(app.timeline.maxZoom, app.timeline.zoom + delta));
    
    if (app.timeline.zoom !== oldZoom) {
      // Zoom towards mouse position
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const zoomFactor = app.timeline.zoom / oldZoom;
      app.timeline.pan = mouseX - (mouseX - app.timeline.pan) * zoomFactor;
      
      updateZoomLevel(app);
      drawTimeline(app);
    }
  });

  // Mouse pan
  canvas.addEventListener('mousedown', (event) => {
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) { // Middle mouse or Ctrl+left
      isPanning = true;
      lastPanX = event.clientX;
      canvas.style.cursor = 'grabbing';
      event.preventDefault();
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    if (isPanning) {
      const deltaX = event.clientX - lastPanX;
      app.timeline.pan = Math.max(-getMaxPan(app), Math.min(0, app.timeline.pan + deltaX));
      lastPanX = event.clientX;
      drawTimeline(app);
    }
  });

  canvas.addEventListener('mouseup', () => {
    isPanning = false;
    canvas.style.cursor = '';
  });

  canvas.addEventListener('mouseleave', () => {
    isPanning = false;
    canvas.style.cursor = '';
  });

  // Touch pan and pinch zoom
  let lastTouchX = 0;
  let touchStartX = 0;
  let lastTouchDistance = 0;
  let initialZoom = 1.0;
  let initialPan = 0;

  canvas.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) {
      lastTouchX = event.touches[0].clientX;
      touchStartX = event.touches[0].clientX;
    } else if (event.touches.length === 2) {
      // Pinch zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      lastTouchDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      initialZoom = app.timeline.zoom;
      initialPan = app.timeline.pan;
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (event) => {
    if (event.touches.length === 1) {
      const deltaX = event.touches[0].clientX - lastTouchX;
      const totalDelta = Math.abs(event.touches[0].clientX - touchStartX);
      
      // Only pan if we've moved enough (to distinguish from tap)
      if (totalDelta > 10) {
        app.timeline.pan = Math.max(-getMaxPan(app), Math.min(0, app.timeline.pan + deltaX));
        lastTouchX = event.touches[0].clientX;
        drawTimeline(app);
        event.preventDefault();
      }
    } else if (event.touches.length === 2) {
      // Pinch zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (lastTouchDistance > 0) {
        const scale = currentDistance / lastTouchDistance;
        const newZoom = Math.max(app.timeline.minZoom, Math.min(app.timeline.maxZoom, initialZoom * scale));
        
        // Zoom towards center of pinch
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const rect = canvas.getBoundingClientRect();
        const relativeX = centerX - rect.left;
        const zoomFactor = newZoom / app.timeline.zoom;
        
        app.timeline.zoom = newZoom;
        app.timeline.pan = relativeX - (relativeX - app.timeline.pan) * zoomFactor;
        
        updateZoomLevel(app);
        drawTimeline(app);
        event.preventDefault();
      }
    }
  }, { passive: false });
}

function updateZoomLevel(app) {
  const zoomLevelEl = document.getElementById('zoomLevel');
  if (zoomLevelEl) {
    zoomLevelEl.textContent = `${Math.round(app.timeline.zoom * 100)}%`;
    
    // Add visual feedback
    zoomLevelEl.style.transform = 'scale(1.1)';
    zoomLevelEl.style.color = '#49a9ff';
    setTimeout(() => {
      zoomLevelEl.style.transform = '';
      zoomLevelEl.style.color = '';
    }, 200);
  }
  
  // Update pan button states
  const panLeftBtn = document.getElementById('panLeft');
  const panRightBtn = document.getElementById('panRight');
  const goToStartBtn = document.getElementById('goToStart');
  const goToEndBtn = document.getElementById('goToEnd');
  
  const maxPan = getMaxPan(app);
  const canPanLeft = app.timeline.pan > -maxPan;
  const canPanRight = app.timeline.pan < 0;
  
  if (panLeftBtn) {
    panLeftBtn.disabled = !canPanLeft;
    panLeftBtn.style.opacity = canPanLeft ? '1' : '0.5';
  }
  if (panRightBtn) {
    panRightBtn.disabled = !canPanRight;
    panRightBtn.style.opacity = canPanRight ? '1' : '0.5';
  }
  if (goToStartBtn) {
    goToStartBtn.disabled = !canPanLeft;
    goToStartBtn.style.opacity = canPanLeft ? '1' : '0.5';
  }
  if (goToEndBtn) {
    goToEndBtn.disabled = !canPanRight;
    goToEndBtn.style.opacity = canPanRight ? '1' : '0.5';
  }
}

function getMaxPan(app) {
  const canvasWidth = app.timeline.canvas.clientWidth;
  const totalWidth = canvasWidth * app.timeline.zoom;
  return Math.max(0, totalWidth - canvasWidth);
}

function setupTimelineTouch(app) {
  const canvas = app.timeline.canvas;
  let isDragging = false;
  let lastTouchTime = 0;

  const getStepFromPosition = (clientX) => {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const stepWidth = (rect.width / STEP_COUNT) * app.timeline.zoom;
    const offsetX = app.timeline.pan;
    const adjustedX = x - offsetX;
    const step = Math.floor(adjustedX / stepWidth);
    return app.timeline.snapToGrid ? step : Math.round(adjustedX / stepWidth);
  };

  const handleTimelineInteraction = (clientX) => {
    const step = Math.max(0, Math.min(STEP_COUNT - 1, getStepFromPosition(clientX)));
    if (step !== app.timeline.currentStep) {
      // Add smooth transition animation
      canvas.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
      
      app.timeline.currentStep = step;
      app.automationStep = step;
      applyAutomationForStep(app, step);
      syncSectionState(app, step);
      drawTimeline(app);
      setStatus(app, `Step ${step + 1}/${STEP_COUNT}`);
      
      // Add visual feedback for timeline interaction
      canvas.style.transform = 'scale(1.01)';
      setTimeout(() => {
        canvas.style.transform = 'scale(1)';
        canvas.style.transition = '';
      }, 200);
    }
  };

  // Mouse events
  canvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Left mouse button
      isDragging = true;
      handleTimelineInteraction(event.clientX);
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
      handleTimelineInteraction(event.clientX);
    }
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  // Touch events
  canvas.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) {
      isDragging = true;
      lastTouchTime = Date.now();
      handleTimelineInteraction(event.touches[0].clientX);
      event.preventDefault();
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (event) => {
    if (isDragging && event.touches.length === 1) {
      handleTimelineInteraction(event.touches[0].clientX);
      event.preventDefault();
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (event) => {
    if (isDragging) {
      isDragging = false;
      const touchDuration = Date.now() - lastTouchTime;
      if (touchDuration < 200) { // Quick tap
        handleTimelineInteraction(event.changedTouches[0].clientX);
      }
      event.preventDefault();
    }
  }, { passive: false });

  // Prevent context menu on long press
  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
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
  
  // Smooth background fade instead of clear
  ctx.fillStyle = 'rgba(8, 8, 11, 0.1)';
  ctx.fillRect(0, 0, width, height);
  
  analyser.getValue(dataArray);
  
  const barWidth = (width / dataArray.length) * 2.5;
  let x = 0;
  
  // Create animated gradient for waveform bars
  const time = Date.now() * 0.002;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `rgba(73, 169, 255, ${0.8 + 0.2 * Math.sin(time)})`);
  gradient.addColorStop(0.5, `rgba(255, 73, 175, ${0.6 + 0.2 * Math.sin(time + 1)})`);
  gradient.addColorStop(1, `rgba(148, 255, 73, ${0.4 + 0.2 * Math.sin(time + 2)})`);
  
  ctx.fillStyle = gradient;
  
  // Store previous values for smooth interpolation
  if (!app.waveform.previousData) {
    app.waveform.previousData = new Array(dataArray.length).fill(0);
  }
  
  for (let i = 0; i < dataArray.length; i++) {
    // Smooth interpolation between current and previous values
    const currentValue = dataArray[i] / 255;
    const previousValue = app.waveform.previousData[i];
    const smoothedValue = previousValue + (currentValue - previousValue) * 0.3;
    app.waveform.previousData[i] = smoothedValue;
    
    const barHeight = smoothedValue * height;
    const y = (height - barHeight) / 2;
    
    // Add some visual flair with rounded rectangles and smooth animation
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 2);
    ctx.fill();
    
    // Add subtle glow to each bar
    ctx.shadowColor = gradient;
    ctx.shadowBlur = 2 * ratio;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    x += barWidth + 1;
  }
  
  // Add a subtle animated glow effect
  const glowIntensity = 0.1 + 0.05 * Math.sin(time * 0.5);
  ctx.shadowColor = 'rgba(73, 169, 255, 0.3)';
  ctx.shadowBlur = 15 * ratio;
  ctx.fillStyle = `rgba(73, 169, 255, ${glowIntensity})`;
  ctx.fillRect(0, 0, width, height);
  ctx.shadowBlur = 0;
}

function createParticle(x, y, color) {
  return {
    x: x + (Math.random() - 0.5) * 20,
    y: y + (Math.random() - 0.5) * 20,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    life: 1.0,
    decay: 0.02 + Math.random() * 0.01,
    size: 2 + Math.random() * 3,
    color: color || `hsl(${200 + Math.random() * 60}, 70%, 60%)`
  };
}

function updateParticles(app) {
  const now = Date.now();
  if (now - app.lastParticleTime > 100) { // Add particles every 100ms
    const colors = ['#49a9ff', '#ff49af', '#94ff49', '#ffb449'];
    app.particles.push(createParticle(
      Math.random() * window.innerWidth,
      Math.random() * 200,
      colors[Math.floor(Math.random() * colors.length)]
    ));
    app.lastParticleTime = now;
  }
  
  app.particles = app.particles.filter(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life -= particle.decay;
    particle.vy += 0.1; // Gravity
    return particle.life > 0;
  });
}

function drawParticles(app, ctx, x, y, ratio) {
  updateParticles(app);
  
  app.particles.forEach(particle => {
    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 10 * ratio;
    
    ctx.beginPath();
    ctx.arc(particle.x * ratio, particle.y * ratio, particle.size * ratio, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  });
}

function syncTimelineCanvas(app) {
  const canvas = app.timeline.canvas;
  const ratio = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
  const width = canvas.clientWidth * ratio;
  const height = canvas.clientHeight * ratio;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    // Set CSS size to maintain crisp rendering
    canvas.style.width = canvas.clientWidth + 'px';
    canvas.style.height = canvas.clientHeight + 'px';
  }
  app.timeline.deviceRatio = ratio;
}

function drawTimeline(app) {
  const { canvas, ctx } = app.timeline;
  if (!ctx) return;
  const ratio = app.timeline.deviceRatio;
  const width = canvas.width;
  const height = canvas.height;
  
  // Use requestAnimationFrame for smooth rendering
  requestAnimationFrame(() => {
    ctx.clearRect(0, 0, width, height);

    const rulerHeight = app.timeline.showRuler ? app.timeline.rulerHeight * ratio : 0;
    const padding = 20 * ratio;
    const areaHeight = height - padding * 2 - rulerHeight;
    const stepWidth = (width / STEP_COUNT) * app.timeline.zoom;
    const offsetX = app.timeline.pan;

    // Enable anti-aliasing for smoother lines
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const sections = app.automation.sections && app.automation.sections.length
      ? app.automation.sections
      : DEFAULT_SECTION_LAYOUT;
    
    // Draw sections
    sections.forEach(section => {
      const startX = section.start * stepWidth + offsetX;
      const sectionWidth = (section.end - section.start + 1) * stepWidth;
      ctx.fillStyle = section.color || 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(startX, padding + rulerHeight, sectionWidth, areaHeight);
    });

    // Draw ruler if enabled
    if (app.timeline.showRuler) {
      drawTimelineRuler(app, ctx, width, rulerHeight, stepWidth, offsetX, ratio);
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1 * ratio;
    ctx.setLineDash([]);
    for (let i = 0; i <= STEP_COUNT; i += 1) {
      const x = i * stepWidth + offsetX;
      if (x >= -stepWidth && x <= width + stepWidth) {
        ctx.beginPath();
        ctx.moveTo(x, padding + rulerHeight);
        ctx.lineTo(x, padding + rulerHeight + areaHeight);
        ctx.stroke();
      }
    }

    // Draw automation tracks
    app.automation.tracks.forEach(track => {
      ctx.beginPath();
      ctx.setLineDash([]);
      let pathStarted = false;
      track.values.forEach((value, index) => {
        const x = index * stepWidth + stepWidth / 2 + offsetX;
        if (x >= -stepWidth && x <= width + stepWidth) {
          const y = padding + rulerHeight + (1 - value) * areaHeight;
          if (!pathStarted) {
            ctx.moveTo(x, y);
            pathStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.strokeStyle = track.color;
      ctx.lineWidth = 2 * ratio;
      ctx.stroke();
    });

    // Draw active step indicator
    const activeX = app.timeline.currentStep * stepWidth + offsetX;
    if (activeX >= -stepWidth && activeX <= width + stepWidth) {
      ctx.fillStyle = 'rgba(73, 169, 255, 0.18)';
      ctx.fillRect(activeX, padding + rulerHeight, stepWidth, areaHeight);
    }

    // Draw step numbers on mobile for better usability
    if (window.innerWidth <= 768) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = `${10 * ratio}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      const stepNumberInterval = app.timeline.zoom > 1.0 ? 1 : 2; // Show more numbers when zoomed in
      for (let i = 0; i < STEP_COUNT; i += stepNumberInterval) {
        const x = i * stepWidth + stepWidth / 2 + offsetX;
        if (x >= -stepWidth && x <= width + stepWidth) {
          const y = padding + rulerHeight + areaHeight + 5 * ratio;
          ctx.fillText((i + 1).toString(), x, y);
        }
      }
    }
  });
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1 * ratio;
  for (let i = 0; i <= STEP_COUNT; i += 1) {
    const x = i * stepWidth;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, padding + areaHeight);
    ctx.stroke();
  }

  // Draw automation tracks with better visualization
  const trackHeight = areaHeight / Math.max(app.automation.tracks.length, 1);
  
  app.automation.tracks.forEach((track, trackIndex) => {
    const trackY = padding + rulerHeight + trackIndex * trackHeight;
    const trackAreaHeight = trackHeight - 4 * ratio; // Small gap between tracks
    
    // Draw track background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(0, trackY, width, trackAreaHeight);
    
    // Draw track label
    ctx.fillStyle = track.color;
    ctx.font = `${10 * ratio}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(track.label, 4 * ratio, trackY + 12 * ratio);
    
    // Draw automation curve
    ctx.beginPath();
    let pathStarted = false;
    track.values.forEach((value, index) => {
      const x = index * stepWidth + stepWidth / 2 + offsetX;
      if (x >= -stepWidth && x <= width + stepWidth) {
        const y = trackY + (1 - value) * trackAreaHeight;
        if (!pathStarted) {
          ctx.moveTo(x, y);
          pathStarted = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    });
    ctx.strokeStyle = track.color;
    ctx.lineWidth = 2 * ratio;
    ctx.stroke();
    // Draw automation tracks with better visualization and smooth curves
    const trackHeight = areaHeight / Math.max(app.automation.tracks.length, 1);
    
    app.automation.tracks.forEach((track, trackIndex) => {
      const trackY = padding + trackIndex * trackHeight;
      const trackAreaHeight = trackHeight - 4 * ratio; // Small gap between tracks
      
      // Draw track background with subtle animation
      const time = Date.now() * 0.001;
      const backgroundPulse = 0.02 + 0.01 * Math.sin(time + trackIndex);
      ctx.fillStyle = `rgba(255, 255, 255, ${backgroundPulse})`;
      ctx.fillRect(0, trackY, width, trackAreaHeight);
      
      // Draw track label with smooth color transition
      ctx.fillStyle = track.color;
      ctx.font = `${10 * ratio}px Inter, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(track.label, 4 * ratio, trackY + 12 * ratio);
      
      // Draw automation curve with smooth interpolation
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Use quadratic curves for smoother automation lines
      track.values.forEach((value, index) => {
        const x = index * stepWidth + stepWidth / 2;
        const y = trackY + (1 - value) * trackAreaHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          // Create smooth curves between points
          const prevX = (index - 1) * stepWidth + stepWidth / 2;
          const prevY = trackY + (1 - track.values[index - 1]) * trackAreaHeight;
          const controlX = (prevX + x) / 2;
          const controlY = (prevY + y) / 2;
          ctx.quadraticCurveTo(controlX, controlY, x, y);
        }
      });
      
      // Add gradient stroke for visual appeal
      const gradient = ctx.createLinearGradient(0, trackY, width, trackY);
      gradient.addColorStop(0, track.color);
      gradient.addColorStop(1, track.color + '80'); // Add transparency
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5 * ratio;
      ctx.stroke();
      
      // Add subtle glow effect
      ctx.shadowColor = track.color;
      ctx.shadowBlur = 4 * ratio;
      ctx.stroke();
      ctx.shadowBlur = 0;
    
    // Draw LFO indicator if track has LFO
    const lfo = LFO_DEFINITIONS.find(l => l.target === track.id && l.enabled);
    if (lfo) {
      ctx.fillStyle = lfo.color;
      ctx.font = `${8 * ratio}px Inter, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(`LFO: ${lfo.waveform}`, width - 4 * ratio, trackY + 12 * ratio);
    }
    
    // Draw breakpoints if they exist
    if (track.breakpoints && track.breakpoints.length > 0) {
      track.breakpoints.forEach(bp => {
        const x = bp.step * stepWidth + stepWidth / 2 + offsetX;
        if (x >= -stepWidth && x <= width + stepWidth) {
          const y = trackY + (1 - bp.value) * trackAreaHeight;
          ctx.fillStyle = track.color;
          ctx.beginPath();
          ctx.arc(x, y, 3 * ratio, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
  });

}

function drawTimelineRuler(app, ctx, width, rulerHeight, stepWidth, offsetX, ratio) {
  const rulerY = 0;
  const rulerAreaHeight = rulerHeight;
  
  // Ruler background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, rulerY, width, rulerAreaHeight);
  
  // Ruler border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1 * ratio;
  ctx.strokeRect(0, rulerY, width, rulerAreaHeight);
  
  // Time markers
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = `${10 * ratio}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const stepDuration = Tone.Time(STEP_DURATION).toSeconds();
  const totalDuration = stepDuration * STEP_COUNT;
  
  // Calculate appropriate time division based on zoom level
  let timeDivision = 1; // steps
  if (app.timeline.zoom < 0.5) {
    timeDivision = 4; // Show every 4th step
  } else if (app.timeline.zoom < 1.0) {
    timeDivision = 2; // Show every 2nd step
  }
  
  for (let i = 0; i <= STEP_COUNT; i += timeDivision) {
    const x = i * stepWidth + offsetX;
    if (x >= -stepWidth && x <= width + stepWidth) {
      // Vertical line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1 * ratio;
      ctx.beginPath();
      ctx.moveTo(x, rulerY);
      ctx.lineTo(x, rulerY + rulerAreaHeight);
      ctx.stroke();
      
      // Time label
      const timeInSeconds = i * stepDuration;
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = (timeInSeconds % 60).toFixed(1);
      const timeLabel = minutes > 0 ? `${minutes}:${seconds.padStart(4, '0')}` : `${seconds}s`;
      
      ctx.fillText(timeLabel, x, rulerY + rulerAreaHeight / 2);
    }
  }
  // Draw animated playback cursor with enhanced smoothness
  const activeX = app.timeline.currentStep * stepWidth;
  const time = Date.now() * 0.003; // Slow animation
  const pulseIntensity = 0.3 + 0.2 * Math.sin(time);
  const smoothPulse = 0.5 + 0.5 * Math.sin(time * 1.5); // Additional smooth pulse
  
  // Main cursor with smooth gradient
  const cursorGradient = ctx.createLinearGradient(activeX, padding, activeX + stepWidth, padding + areaHeight);
  cursorGradient.addColorStop(0, `rgba(73, 169, 255, ${0.15 + pulseIntensity * 0.1})`);
  cursorGradient.addColorStop(0.5, `rgba(73, 169, 255, ${0.25 + pulseIntensity * 0.15})`);
  cursorGradient.addColorStop(1, `rgba(73, 169, 255, ${0.15 + pulseIntensity * 0.1})`);
  
  ctx.fillStyle = cursorGradient;
  ctx.fillRect(activeX, padding, stepWidth, areaHeight);

  // Draw pattern variation indicators
  if (app.patternVariations && app.patternVariations.enabled) {
    const patternColors = {
      'A': 'rgba(73, 169, 255, 0.3)',
      'B': 'rgba(255, 73, 175, 0.3)',
      'C': 'rgba(148, 255, 73, 0.3)',
      'D': 'rgba(255, 180, 73, 0.3)',
      'E': 'rgba(255, 100, 100, 0.3)',
      'F': 'rgba(100, 255, 255, 0.3)'
    };
    
    // Draw pattern indicators at the top
    const indicatorHeight = 8 * ratio;
    const currentPattern = app.patternVariations.abPatterns.currentPattern;
    ctx.fillStyle = patternColors[currentPattern] || patternColors['A'];
    ctx.fillRect(0, padding - indicatorHeight - 2, width, indicatorHeight);
    
    // Draw individual instrument pattern indicators
    const instrumentPatterns = app.patternVariations.currentPatterns;
    const instrumentColors = {
      kick: 'rgba(255, 100, 100, 0.4)',
      snare: 'rgba(100, 255, 100, 0.4)',
      hats: 'rgba(100, 100, 255, 0.4)',
      bass: 'rgba(255, 255, 100, 0.4)',
      lead: 'rgba(255, 100, 255, 0.4)',
      fx: 'rgba(100, 255, 255, 0.4)'
    };
    
    let yOffset = padding - indicatorHeight - 12;
    Object.entries(instrumentPatterns).forEach(([instrument, pattern]) => {
      ctx.fillStyle = patternColors[pattern] || patternColors['A'];
      ctx.fillRect(0, yOffset, width, 4);
      yOffset -= 6;
    });
  
  // Animated border with smooth transitions
  ctx.strokeStyle = `rgba(73, 169, 255, ${0.7 + pulseIntensity * 0.3})`;
  ctx.lineWidth = 2 * ratio;
  ctx.setLineDash([5 * ratio, 3 * ratio]);
  ctx.strokeRect(activeX, padding, stepWidth, areaHeight);
  ctx.setLineDash([]);
  
  // Enhanced glow effect with multiple layers
  const glowGradient = ctx.createLinearGradient(activeX, 0, activeX + stepWidth, 0);
  glowGradient.addColorStop(0, `rgba(73, 169, 255, ${0.08 + smoothPulse * 0.05})`);
  glowGradient.addColorStop(0.5, `rgba(73, 169, 255, ${0.18 + smoothPulse * 0.1})`);
  glowGradient.addColorStop(1, `rgba(73, 169, 255, ${0.08 + smoothPulse * 0.05})`);
  
  ctx.fillStyle = glowGradient;
  ctx.fillRect(activeX - 15 * ratio, padding, stepWidth + 30 * ratio, areaHeight);
  
  // Additional outer glow for depth
  const outerGlow = ctx.createRadialGradient(
    activeX + stepWidth / 2, padding + areaHeight / 2, 0,
    activeX + stepWidth / 2, padding + areaHeight / 2, stepWidth
  );
  outerGlow.addColorStop(0, `rgba(73, 169, 255, ${0.05 + smoothPulse * 0.03})`);
  outerGlow.addColorStop(1, 'rgba(73, 169, 255, 0)');
  
  ctx.fillStyle = outerGlow;
  ctx.fillRect(activeX - stepWidth, padding - stepWidth, stepWidth * 3, areaHeight + stepWidth * 2);
  
  // Current time indicator
  const currentTimeX = app.timeline.currentStep * stepWidth + offsetX;
  if (currentTimeX >= -stepWidth && currentTimeX <= width + stepWidth) {
    ctx.strokeStyle = '#49a9ff';
    ctx.lineWidth = 2 * ratio;
    ctx.beginPath();
    ctx.moveTo(currentTimeX, rulerY);
    ctx.lineTo(currentTimeX, rulerY + rulerAreaHeight);
    ctx.stroke();
    
    // Current time label
    const currentTimeInSeconds = app.timeline.currentStep * stepDuration;
    const minutes = Math.floor(currentTimeInSeconds / 60);
    const seconds = (currentTimeInSeconds % 60).toFixed(1);
    const currentTimeLabel = minutes > 0 ? `${minutes}:${seconds.padStart(4, '0')}` : `${seconds}s`;
    
    ctx.fillStyle = '#49a9ff';
    ctx.font = `${9 * ratio}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(currentTimeLabel, currentTimeX, rulerY + rulerAreaHeight - 5 * ratio);
  }
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
    updatePatternVariations(app);
    requestAnimationFrame(() => drawTimeline(app));
    app.automationStep = (step + 1) % STEP_COUNT;
  }, STEP_DURATION);
}

function getSectionForStep(app, step) {
  const sections = app.automation.sections && app.automation.sections.length
    ? app.automation.sections
    : DEFAULT_SECTION_LAYOUT;
  return sections.find(section => step >= section.start && step <= section.end) || null;
}

function updateSectionPlayback(app, section) {
  if (!app.audio || !app.audio.sequences || !app.audio.sequences.groups) {
    return;
  }
  const sectionName = section ? section.name : null;
  if (app.activeSection === sectionName) {
    return;
  }

  const arrangement = section ? SECTION_SEQUENCE_ACTIVITY[section.name] : null;
  const groups = app.audio.sequences.groups;
  const defaultState = { drums: true, bass: true, lead: true, fx: true };

  Object.entries(groups).forEach(([groupName, seqs]) => {
    const hasExplicitSetting = arrangement && Object.prototype.hasOwnProperty.call(arrangement, groupName);
    const shouldEnable = hasExplicitSetting
      ? Boolean(arrangement[groupName])
      : defaultState[groupName] !== undefined
        ? defaultState[groupName]
        : true;
    seqs.forEach(seq => {
      seq.mute = !shouldEnable;
    });
  });

  app.activeSection = sectionName;
  
  // Update LED indicators based on active sequences
  updateLEDIndicators(app, section);
}

function syncSectionState(app, step) {
  const section = getSectionForStep(app, step);
  updateSectionPlayback(app, section);
  updateSectionLabel(app, step, section);
  updateLEDIndicators(app, section);
}

function applyAutomationForStep(app, step, time) {
  const leadTrack = getAutomationTrack(app, 'leadFilter');
  const fxTrack = getAutomationTrack(app, 'fxSend');
  const bassTrack = getAutomationTrack(app, 'bassFilter');
  const reverbTrack = getAutomationTrack(app, 'reverbDecay');
  const delayTrack = getAutomationTrack(app, 'delayFeedback');
  const driveTrack = getAutomationTrack(app, 'bassDrive');
  const resonanceTrack = getAutomationTrack(app, 'leadResonance');
  const masterTrack = getAutomationTrack(app, 'masterVolume');
  
  // New automation tracks
  const reverbMixTrack = getAutomationTrack(app, 'reverbMix');
  const reverbPreDelayTrack = getAutomationTrack(app, 'reverbPreDelay');
  const reverbRoomSizeTrack = getAutomationTrack(app, 'reverbRoomSize');
  const delayTimeTrack = getAutomationTrack(app, 'delayTime');
  const delayMixTrack = getAutomationTrack(app, 'delayMix');
  const delayFilterTrack = getAutomationTrack(app, 'delayFilter');
  const distortionAmountTrack = getAutomationTrack(app, 'distortionAmount');
  const distortionToneTrack = getAutomationTrack(app, 'distortionTone');
  const distortionMixTrack = getAutomationTrack(app, 'distortionMix');
  // New distortion tracks
  const leadDistortionTrack = getAutomationTrack(app, 'leadDistortion');
  const leadOverdriveTrack = getAutomationTrack(app, 'leadOverdrive');
  const drumDistortionTrack = getAutomationTrack(app, 'drumDistortion');
  const masterOverdriveTrack = getAutomationTrack(app, 'masterOverdrive');

  const leadBase = getControlValue(app, 'leadFilterBase');
  const leadMod = getControlValue(app, 'leadFilterMod');
  const fxBase = getControlValue(app, 'leadFxSend');
  const bassBase = getControlValue(app, 'bassFilterBase');
  const bassMod = getControlValue(app, 'bassFilterMod');
  const reverbBase = getControlValue(app, 'reverbDecay');
  const delayBase = getControlValue(app, 'delayFeedback');
  const driveBase = getControlValue(app, 'bassDrive');

  // Apply LFOs to tracks
  const lfoModulatedTracks = applyLFOModulation(app, {
    leadFilter: leadTrack,
    fxSend: fxTrack,
    bassFilter: bassTrack,
    reverbDecay: reverbTrack,
    delayFeedback: delayTrack,
    bassDrive: driveTrack,
    leadResonance: resonanceTrack,
    masterVolume: masterTrack,
    reverbMix: reverbMixTrack,
    reverbPreDelay: reverbPreDelayTrack,
    reverbRoomSize: reverbRoomSizeTrack,
    delayTime: delayTimeTrack,
    delayMix: delayMixTrack,
    delayFilter: delayFilterTrack,
    distortionAmount: distortionAmountTrack,
    distortionTone: distortionToneTrack,
    distortionMix: distortionMixTrack
    leadDistortion: leadDistortionTrack,
    leadOverdrive: leadOverdriveTrack,
    drumDistortion: drumDistortionTrack,
    masterOverdrive: masterOverdriveTrack
  }, step, time);

  // Apply envelope follower modulation
  const envModulatedTracks = applyEnvelopeFollowerModulation(app, lfoModulatedTracks, step, time);

  const leadValue = clamp(getAutomationValue(envModulatedTracks.leadFilter, step), 0, 1);
  const fxValue = clamp(getAutomationValue(envModulatedTracks.fxSend, step), 0, 1);
  const bassValue = clamp(getAutomationValue(envModulatedTracks.bassFilter, step), 0, 1);
  const reverbValue = clamp(getAutomationValue(envModulatedTracks.reverbDecay, step), 0, 1);
  const delayValue = clamp(getAutomationValue(envModulatedTracks.delayFeedback, step), 0, 1);
  const driveValue = clamp(getAutomationValue(envModulatedTracks.bassDrive, step), 0, 1);
  const resonanceValue = clamp(getAutomationValue(envModulatedTracks.leadResonance, step), 0, 1);
  const masterValue = clamp(getAutomationValue(envModulatedTracks.masterVolume, step), 0, 1);
  const leadValue = clamp(getAutomationValue(lfoModulatedTracks.leadFilter, step), 0, 1);
  const fxValue = clamp(getAutomationValue(lfoModulatedTracks.fxSend, step), 0, 1);
  const bassValue = clamp(getAutomationValue(lfoModulatedTracks.bassFilter, step), 0, 1);
  const reverbValue = clamp(getAutomationValue(lfoModulatedTracks.reverbDecay, step), 0, 1);
  const delayValue = clamp(getAutomationValue(lfoModulatedTracks.delayFeedback, step), 0, 1);
  const driveValue = clamp(getAutomationValue(lfoModulatedTracks.bassDrive, step), 0, 1);
  const resonanceValue = clamp(getAutomationValue(lfoModulatedTracks.leadResonance, step), 0, 1);
  const masterValue = clamp(getAutomationValue(lfoModulatedTracks.masterVolume, step), 0, 1);
  
  // New automation values
  const reverbMixValue = clamp(getAutomationValue(lfoModulatedTracks.reverbMix, step), 0, 1);
  const reverbPreDelayValue = clamp(getAutomationValue(lfoModulatedTracks.reverbPreDelay, step), 0, 1);
  const reverbRoomSizeValue = clamp(getAutomationValue(lfoModulatedTracks.reverbRoomSize, step), 0, 1);
  const delayTimeValue = clamp(getAutomationValue(lfoModulatedTracks.delayTime, step), 0, 1);
  const delayMixValue = clamp(getAutomationValue(lfoModulatedTracks.delayMix, step), 0, 1);
  const delayFilterValue = clamp(getAutomationValue(lfoModulatedTracks.delayFilter, step), 0, 1);
  const distortionAmountValue = clamp(getAutomationValue(lfoModulatedTracks.distortionAmount, step), 0, 1);
  const distortionToneValue = clamp(getAutomationValue(lfoModulatedTracks.distortionTone, step), 0, 1);
  const distortionMixValue = clamp(getAutomationValue(lfoModulatedTracks.distortionMix, step), 0, 1);
  // New distortion values
  const leadDistortionValue = clamp(getAutomationValue(lfoModulatedTracks.leadDistortion, step), 0, 1);
  const leadOverdriveValue = clamp(getAutomationValue(lfoModulatedTracks.leadOverdrive, step), 0, 1);
  const drumDistortionValue = clamp(getAutomationValue(lfoModulatedTracks.drumDistortion, step), 0, 1);
  const masterOverdriveValue = clamp(getAutomationValue(lfoModulatedTracks.masterOverdrive, step), 0, 1);

  const leadFreq = leadBase + leadMod * leadValue;
  const fxAmount = fxValue * fxBase;
  const bassFreq = bassBase + bassMod * bassValue;
  const reverbDecay = 0.5 + (reverbValue * 11.5); // 0.5 to 12 seconds
  const delayFeedback = delayValue * 0.8; // 0 to 0.8
  const driveAmount = driveValue;
  const resonanceAmount = 0.3 + (resonanceValue * 1.2); // 0.3 to 1.5
  const masterGain = 0.1 + (masterValue * 0.9); // 0.1 to 1.0
  
  // New calculated values
  const reverbMix = reverbMixValue * 0.8; // 0 to 0.8
  const reverbPreDelay = 0.01 + (reverbPreDelayValue * 0.09); // 0.01 to 0.1 seconds
  const reverbRoomSize = 0.2 + (reverbRoomSizeValue * 0.8); // 0.2 to 1.0
  const delayTime = 0.1 + (delayTimeValue * 0.9); // 0.1 to 1.0 seconds
  const delayMix = delayMixValue * 0.6; // 0 to 0.6
  const delayFilterFreq = 1000 + (delayFilterValue * 7000); // 1000 to 8000 Hz
  const distortionAmount = distortionAmountValue * 0.8; // 0 to 0.8
  const distortionTone = 1000 + (distortionToneValue * 4000); // 1000 to 5000 Hz
  const distortionMix = distortionMixValue * 0.7; // 0 to 0.7

  const leadFrequency = app.audio.nodes.leadFilter.frequency;
  const leadFxGain = app.audio.nodes.leadFxSend.gain;
  const bassFrequency = app.audio.nodes.bassFilter.frequency;
  const reverbNode = app.audio.nodes.reverb;
  const delayNode = app.audio.nodes.delay;
  const driveNode = app.audio.nodes.bassDrive;
  const masterNode = app.audio.master;
  
  // New node references
  const delayFilterNode = app.audio.nodes.delayFilter;
  const delayMixNode = app.audio.nodes.delayMix;
  const distortionNode = app.audio.nodes.distortion;
  const distortionFilterNode = app.audio.nodes.distortionFilter;
  const distortionMixNode = app.audio.nodes.distortionMix;
  // New distortion nodes
  const leadDistortionNode = app.audio.nodes.leadDistortion;
  const leadOverdriveNode = app.audio.nodes.leadOverdrive;
  const drumDistortionNode = app.audio.nodes.drumDistortion;
  const masterOverdriveNode = app.audio.nodes.masterOverdrive;

  if (typeof time === 'number') {
    leadFrequency.setValueAtTime(leadFrequency.value, time);
    leadFrequency.linearRampToValueAtTime(leadFreq, time + 0.1);
    leadFxGain.setValueAtTime(leadFxGain.value, time);
    leadFxGain.linearRampToValueAtTime(fxAmount, time + 0.1);
    bassFrequency.setValueAtTime(bassFrequency.value, time);
    bassFrequency.linearRampToValueAtTime(bassFreq, time + 0.1);
    reverbNode.decay = reverbDecay;
    reverbNode.wet.setValueAtTime(reverbNode.wet.value, time);
    reverbNode.wet.linearRampToValueAtTime(reverbMix, time + 0.1);
    reverbNode.preDelay = reverbPreDelay;
    reverbNode.roomSize = reverbRoomSize;
    delayNode.delayTime.setValueAtTime(delayNode.delayTime.value, time);
    delayNode.delayTime.linearRampToValueAtTime(delayTime, time + 0.1);
    delayNode.feedback.setValueAtTime(delayNode.feedback.value, time);
    delayNode.feedback.linearRampToValueAtTime(delayFeedback, time + 0.1);
    delayFilterNode.frequency.setValueAtTime(delayFilterNode.frequency.value, time);
    delayFilterNode.frequency.linearRampToValueAtTime(delayFilterFreq, time + 0.1);
    delayMixNode.gain.setValueAtTime(delayMixNode.gain.value, time);
    delayMixNode.gain.linearRampToValueAtTime(delayMix, time + 0.1);
    distortionNode.distortion = distortionAmount;
    distortionFilterNode.frequency.setValueAtTime(distortionFilterNode.frequency.value, time);
    distortionFilterNode.frequency.linearRampToValueAtTime(distortionTone, time + 0.1);
    distortionMixNode.gain.setValueAtTime(distortionMixNode.gain.value, time);
    distortionMixNode.gain.linearRampToValueAtTime(distortionMix, time + 0.1);
    driveNode.wet.setValueAtTime(driveNode.wet.value, time);
    driveNode.wet.linearRampToValueAtTime(driveAmount, time + 0.1);
    masterNode.gain.setValueAtTime(masterNode.gain.value, time);
    masterNode.gain.linearRampToValueAtTime(masterGain, time + 0.1);
    
    // Apply distortion automation
    leadDistortionNode.distortion.setValueAtTime(leadDistortionNode.distortion.value, time);
    leadDistortionNode.distortion.linearRampToValueAtTime(leadDistortionValue, time + 0.1);
    leadOverdriveNode.drive.setValueAtTime(leadOverdriveNode.drive.value, time);
    leadOverdriveNode.drive.linearRampToValueAtTime(leadOverdriveValue, time + 0.1);
    drumDistortionNode.distortion.setValueAtTime(drumDistortionNode.distortion.value, time);
    drumDistortionNode.distortion.linearRampToValueAtTime(drumDistortionValue, time + 0.1);
    masterOverdriveNode.drive.setValueAtTime(masterOverdriveNode.drive.value, time);
    masterOverdriveNode.drive.linearRampToValueAtTime(masterOverdriveValue, time + 0.1);
  } else {
    leadFrequency.value = leadFreq;
    leadFxGain.value = fxAmount;
    bassFrequency.value = bassFreq;
    reverbNode.decay = reverbDecay;
    reverbNode.wet.value = reverbMix;
    reverbNode.preDelay = reverbPreDelay;
    reverbNode.roomSize = reverbRoomSize;
    delayNode.delayTime.value = delayTime;
    delayNode.feedback.value = delayFeedback;
    delayFilterNode.frequency.value = delayFilterFreq;
    delayMixNode.gain.value = delayMix;
    distortionNode.distortion = distortionAmount;
    distortionFilterNode.frequency.value = distortionTone;
    distortionMixNode.gain.value = distortionMix;
    driveNode.wet.value = driveAmount;
    masterNode.gain.value = masterGain;
    
    // Apply distortion values
    leadDistortionNode.distortion = leadDistortionValue;
    leadOverdriveNode.drive = leadOverdriveValue;
    drumDistortionNode.distortion = drumDistortionValue;
    masterOverdriveNode.drive = masterOverdriveValue;
  }
}

function getAutomationTrack(app, id) {
  const track = app.automation.tracks.find(track => track.id === id);
  if (track) {
    track.values = normalizeAutomationValues(track.values);
    return track;
  }
  return { id, values: new Array(STEP_COUNT).fill(0) };
}

function getAutomationValue(track, step) {
  if (!track || !Array.isArray(track.values)) {
    return 0;
  }
  const rawValue = track.values[step];
  if (rawValue === null || rawValue === undefined) {
    return 0;
  }
  const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function applyLFOModulation(app, tracks, step, time) {
  const currentTime = time || Tone.now();
  const modulatedTracks = { ...tracks };

  LFO_DEFINITIONS.forEach(lfo => {
    if (!lfo.enabled) return;
    
    const targetTrack = tracks[lfo.target];
    if (!targetTrack) return;

    const lfoValue = generateLFOValue(lfo, currentTime);
    const baseValue = getAutomationValue(targetTrack, step);
    const modulatedValue = baseValue + (lfoValue * lfo.depth);
    
    // Create a copy of the track with LFO modulation
    modulatedTracks[lfo.target] = {
      ...targetTrack,
      values: [...targetTrack.values],
      lfoModulated: true
    };
    
    // Apply LFO to the current step
    if (modulatedTracks[lfo.target].values[step] !== undefined) {
      modulatedTracks[lfo.target].values[step] = clamp(modulatedValue, 0, 1);
    }
  });

  return modulatedTracks;
}

function applyEnvelopeFollowerModulation(app, tracks, step, time) {
  const modulatedTracks = { ...tracks };

  if (!app.audio || !app.audio.envelopeFollowers) {
    return modulatedTracks;
  }

  Object.values(app.audio.envelopeFollowers).forEach(follower => {
    const { node, definition } = follower;
    if (!node || !definition.enabled) return;
    
    const targetTrack = tracks[definition.target];
    if (!targetTrack) return;
    
    // Get current envelope level
    const envelopeLevel = node.getLevel();
    const inputLevel = node.getInputLevel();
    
    // Apply envelope follower modulation
    const baseValue = getAutomationValue(targetTrack, step);
    const modulationAmount = envelopeLevel * 0.3; // Scale down for subtle effect
    const modulatedValue = baseValue + modulationAmount;
    
    // Create a copy of the track with envelope follower modulation
    modulatedTracks[definition.target] = {
      ...targetTrack,
      values: [...targetTrack.values],
      envModulated: true
    };
    
    // Apply envelope follower to the current step
    if (modulatedTracks[definition.target].values[step] !== undefined) {
      modulatedTracks[definition.target].values[step] = clamp(modulatedValue, 0, 1);
    }
  });

  return modulatedTracks;
}

function generateLFOValue(lfo, time) {
  const phase = (time * lfo.rate) % 1;
  
  switch (lfo.waveform) {
    case 'sine':
      return Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
    case 'triangle':
      return phase < 0.5 ? phase * 2 : 2 - (phase * 2);
    case 'square':
      return phase < 0.5 ? 1 : 0;
    case 'sawtooth':
      return phase;
    case 'reverseSawtooth':
      return 1 - phase;
    default:
      return Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
  }
}

function normalizeAutomationValues(values, stepCount = STEP_COUNT, curveType = CURVE_TYPES.LINEAR) {
  const totalSteps = Math.max(Math.floor(stepCount), 0);
  if (totalSteps <= 0) {
    return [];
  }

  if (!Array.isArray(values) || values.length === 0) {
    return new Array(totalSteps).fill(0);
  }

  const sanitized = values.map(value => {
    const numeric = typeof value === 'number' ? value : Number(value);
    const safeValue = Number.isFinite(numeric) ? numeric : 0;
    return clamp(safeValue, 0, 1);
  });

  if (sanitized.length === 1) {
    return new Array(totalSteps).fill(sanitized[0]);
  }

  if (sanitized.length === totalSteps) {
    return sanitized.slice();
  }

  const lastIndex = sanitized.length - 1;
  if (totalSteps === 1) {
    return [sanitized[lastIndex]];
  }

  return Array.from({ length: totalSteps }, (_, index) => {
    const position = index / (totalSteps - 1);
    const scaledIndex = position * lastIndex;
    const lowerIndex = Math.floor(scaledIndex);
    const upperIndex = Math.min(Math.ceil(scaledIndex), lastIndex);
    const lowerValue = sanitized[lowerIndex];
    const upperValue = sanitized[upperIndex];
    if (lowerIndex === upperIndex) {
      return lowerValue;
    }
    const ratio = scaledIndex - lowerIndex;
    const interpolated = interpolateCurve(lowerValue, upperValue, ratio, curveType);
    return clamp(interpolated, 0, 1);
  });
}

function interpolateCurve(start, end, t, curveType) {
  switch (curveType) {
    case CURVE_TYPES.LINEAR:
      return start + (end - start) * t;
    case CURVE_TYPES.EXPONENTIAL:
      return start + (end - start) * (t * t);
    case CURVE_TYPES.LOGARITHMIC:
      return start + (end - start) * Math.sqrt(t);
    case CURVE_TYPES.SINE:
      return start + (end - start) * (Math.sin(t * Math.PI - Math.PI / 2) * 0.5 + 0.5);
    case CURVE_TYPES.BEZIER:
      // Simple bezier with control points at 0.25 and 0.75
      const p0 = start;
      const p1 = start + (end - start) * 0.25;
      const p2 = start + (end - start) * 0.75;
      const p3 = end;
      return bezierInterpolation(p0, p1, p2, p3, t);
    default:
      return start + (end - start) * t;
  }
}

function bezierInterpolation(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  
  return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
}

function normalizeAutomationState(automation, stepCount = STEP_COUNT) {
  const defaults = createDefaultAutomation(stepCount);
  const normalizedTracks = [];
  const seenIds = new Set();

  if (automation && Array.isArray(automation.tracks)) {
    automation.tracks.forEach(trackData => {
      if (!trackData || !trackData.id) {
        return;
      }
      const definition = AUTOMATION_TRACK_DEFINITIONS.find(def => def.id === trackData.id);
      const label = trackData.label || definition?.label || trackData.id;
      const color = trackData.color || definition?.color || '#49a9ff';
      const baseValues = Array.isArray(trackData.values) && trackData.values.length
        ? trackData.values
        : definition?.curve || [];
      normalizedTracks.push({
        id: trackData.id,
        label,
        color,
        values: normalizeAutomationValues(baseValues, stepCount)
      });
      
    } catch (error) {
      this.ui.showError(`Failed to initialize: ${error.message}`);
      throw error;
    }
  }

  setStatus(message) {
    this.ui.setStatus(message);
  }
  return normalized;
}

function updateSectionLabel(app, step, sectionOverride) {
  const section = sectionOverride || getSectionForStep(app, step);
  if (app.sectionLabelEl) {
    // Add smooth transition for section changes
    app.sectionLabelEl.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    app.sectionLabelEl.style.transform = 'scale(0.95)';
    app.sectionLabelEl.style.opacity = '0.7';
    
    setTimeout(() => {
      if (section) {
        app.sectionLabelEl.textContent = `Section: ${section.name}`;
        app.sectionLabelEl.style.color = section.color ? section.color.replace('0.04', '1') : 'var(--accent)';
      } else {
        app.sectionLabelEl.textContent = 'Section: Loop';
        app.sectionLabelEl.style.color = 'var(--accent)';
      }
      
      app.sectionLabelEl.style.transform = 'scale(1)';
      app.sectionLabelEl.style.opacity = '1';
    }, 200);
    
    setTimeout(() => {
      app.sectionLabelEl.style.color = '';
    }, 1000);
  }
}

function updateLEDIndicators(app, section) {
  if (!app.leds) return;
  
  const arrangement = section ? SECTION_SEQUENCE_ACTIVITY[section.name] : null;
  const defaultState = { drums: true, bass: true, lead: true, fx: true };
  
  // Update each LED based on the current section's sequence activity
  Object.keys(app.leds).forEach(groupName => {
    const led = app.leds[groupName];
    if (!led) return;
    
    const hasExplicitSetting = arrangement && Object.prototype.hasOwnProperty.call(arrangement, groupName);
    const shouldEnable = hasExplicitSetting
      ? Boolean(arrangement[groupName])
      : defaultState[groupName] !== undefined
        ? defaultState[groupName]
        : true;
    
    if (shouldEnable) {
      led.classList.add('active');
    } else {
      led.classList.remove('active');
    }
  });
}

function updateLEDIndicators(app, section) {
  if (!app.leds) return;
  
  const arrangement = section ? SECTION_SEQUENCE_ACTIVITY[section.name] : null;
  const defaultState = { drums: true, bass: true, lead: true, fx: true };
  const isPlaying = Tone.Transport.state === 'started';
  
  // Update each LED based on the current section's sequence activity
  Object.keys(app.leds).forEach(groupName => {
    const led = app.leds[groupName];
    if (!led) return;
    
    const hasExplicitSetting = arrangement && Object.prototype.hasOwnProperty.call(arrangement, groupName);
    const shouldEnable = hasExplicitSetting
      ? Boolean(arrangement[groupName])
      : defaultState[groupName] !== undefined
        ? defaultState[groupName]
        : true;
    
    // Only show active LEDs when actually playing
    if (shouldEnable && isPlaying) {
      led.classList.add('active');
    } else {
      led.classList.remove('active');
    }
  });
}

async function exportMix(app) {
  await captureBuses(app, [
    { node: app.audio.master, label: 'mix' }
  ]);
  setStatus(app, 'Mix export complete');
}

async function exportStems(app) {
  await captureBuses(app, [
    { node: app.audio.buses.drums, label: 'drums' },
    { node: app.audio.buses.bass, label: 'bass' },
    { node: app.audio.buses.lead, label: 'lead' },
    { node: app.audio.buses.fx, label: 'fx' }
  ]);
  setStatus(app, 'Stem export complete');
}

async function captureBuses(app, buses) {
  const startedByExport = await ensureTransportRunning(app);
  const duration = Tone.Time(LOOP_DURATION).toSeconds();
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
    updateLEDIndicators(app, getSectionForStep(app, 0));
    drawTimeline(app);
  }
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

  showError(message) {
    this.ui.showError(message);
  }

  showSuccess(message) {
    this.ui.showSuccess(message);
  }

  destroy() {
    if (this.waveform) {
      this.waveform.destroy();
    }
    if (this.audio) {
      this.audio.destroy();
  });
}

function handleMidiMessage(app, message) {
  const [status, data1, data2] = message.data;
  const command = status & 0xf0;
  const channel = (status & 0x0f) + 1;
  if (command !== 0xb0) return; // CC only
  const cc = data1;
  const value = data2;

  if (app.midi.learning && app.midi.pendingControl) {
    const targetId = app.midi.pendingControl;
    app.midi.mappings[targetId] = { channel, cc };
    saveMidiMappings(app.midi.mappings);
    setMidiPendingControl(app, null);
    setStatus(app, `Assigned CC ${cc} (Ch ${channel})`);
    return;
  }

  Object.entries(app.midi.mappings).forEach(([controlId, mapping]) => {
    if (!mapping) return;
    if (mapping.channel && mapping.channel !== channel) return;
    if (mapping.cc !== cc) return;
    const control = getControlDefinition(controlId);
    if (!control || control.type !== 'range') return;
    const min = Number(control.min);
    const max = Number(control.max);
    const scaled = min + (max - min) * (value / 127);
    setControlValue(app, control, scaled, { silent: true });
  });
}

function getControlDefinition(id) {
  for (const section of CONTROL_SCHEMA) {
    const control = section.controls.find(item => item.id === id);
    if (control) return control;
  }
  return null;
}

function getControlValue(app, id) {
  if (id in app.controlState) {
    return app.controlState[id];
  }
  const control = getControlDefinition(id);
  return control ? control.default : 0;
}

function setStatus(app, message) {
  if (!app.statusEl) return;
  
  // Add smooth visual feedback animation
  app.statusEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  app.statusEl.style.transform = 'scale(1.05)';
  app.statusEl.style.color = '#49a9ff';
  app.statusEl.style.textShadow = '0 0 10px rgba(73, 169, 255, 0.3)';
  
  // Smooth text transition
  setTimeout(() => {
    app.statusEl.textContent = `Status: ${message}`;
  }, 100);
  
  setTimeout(() => {
    app.statusEl.style.transform = 'scale(1)';
    app.statusEl.style.textShadow = 'none';
  }, 300);
  
  setTimeout(() => {
    app.statusEl.style.color = '';
  }, 500);
  
  clearTimeout(app.statusTimer);
  app.statusTimer = setTimeout(() => {
    app.statusEl.style.transition = 'all 0.5s ease-out';
    app.statusEl.textContent = 'Status: Idle';
    app.statusEl.style.color = 'var(--muted)';
  }, 3500);
  
  // Add mobile-specific status feedback
  if (window.innerWidth <= 768 && 'vibrate' in navigator) {
    // Different vibration patterns for different status types
    if (message.includes('Playing') || message.includes('Started')) {
      navigator.vibrate([100, 50, 100]); // Success pattern
    } else if (message.includes('Error') || message.includes('Failed')) {
      navigator.vibrate([200, 100, 200, 100, 200]); // Error pattern
    } else if (message.includes('MIDI')) {
      navigator.vibrate(50); // Short feedback for MIDI
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  window.app = new App();
  try {
    await window.app.init();
  } catch (error) {
    console.error('Failed to start application:', error);
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.app) {
    window.app.destroy();
  }
});