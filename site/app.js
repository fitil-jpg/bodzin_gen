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
    values: normalizeAutomationValues(definition.curve || [], stepCount)
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
});

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
    }
  };
}

function initializeApp(app) {
  if (!app.timeline.canvas) {
    console.warn('Timeline canvas missing.');
    return;
  }

  app.timeline.ctx = app.timeline.canvas.getContext('2d');
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
  setupAutomationScheduling(app);
  setupMidi(app);
  applyAutomationForStep(app, 0);
  syncSectionState(app, 0);
  drawTimeline(app);
  setStatus(app, 'Idle');
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

      if (control.type === 'range') {
        const midiHandler = () => {
          if (app.midi.learning) {
            setMidiPendingControl(app, control.id);
          }
        };
        input.addEventListener('pointerdown', midiHandler);
        input.addEventListener('mousedown', midiHandler);
        input.addEventListener('touchstart', midiHandler, { passive: true });
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
    entry.valueEl.textContent = formatControlValue(control, normalizedValue);
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
  savePresetBtn?.addEventListener('click', () => savePreset(app));
  loadPresetBtn?.addEventListener('click', () => triggerPresetLoad(app));
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
  await ensureTransportRunning(app);
  if (!options.silent) {
    setStatus(app, 'Playing');
  }
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
  Tone.Transport.stop();
  Tone.Transport.position = 0;
  app.timeline.currentStep = 0;
  app.automationStep = 0;
  applyAutomationForStep(app, 0);
  syncSectionState(app, 0);
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
    drawTimeline(app);
  });
  syncTimelineCanvas(app);
  resizeObserver.observe(app.timeline.canvas);
}

function syncTimelineCanvas(app) {
  const canvas = app.timeline.canvas;
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth * ratio;
  const height = canvas.clientHeight * ratio;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  app.timeline.deviceRatio = ratio;
}

function drawTimeline(app) {
  const { canvas, ctx } = app.timeline;
  if (!ctx) return;
  const ratio = app.timeline.deviceRatio;
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const padding = 20 * ratio;
  const areaHeight = height - padding * 2;
  const stepWidth = width / STEP_COUNT;

  const sections = app.automation.sections && app.automation.sections.length
    ? app.automation.sections
    : DEFAULT_SECTION_LAYOUT;
  sections.forEach(section => {
    const startX = section.start * stepWidth;
    const sectionWidth = (section.end - section.start + 1) * stepWidth;
    ctx.fillStyle = section.color || 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(startX, padding, sectionWidth, areaHeight);
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

  app.automation.tracks.forEach(track => {
    ctx.beginPath();
    track.values.forEach((value, index) => {
      const x = index * stepWidth + stepWidth / 2;
      const y = padding + (1 - value) * areaHeight;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = track.color;
    ctx.lineWidth = 2 * ratio;
    ctx.stroke();
  });

  const activeX = app.timeline.currentStep * stepWidth;
  ctx.fillStyle = 'rgba(73, 169, 255, 0.18)';
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
}

function syncSectionState(app, step) {
  const section = getSectionForStep(app, step);
  updateSectionPlayback(app, section);
  updateSectionLabel(app, step, section);
}

function applyAutomationForStep(app, step, time) {
  const leadTrack = getAutomationTrack(app, 'leadFilter');
  const fxTrack = getAutomationTrack(app, 'fxSend');
  const bassTrack = getAutomationTrack(app, 'bassFilter');
  const leadBase = getControlValue(app, 'leadFilterBase');
  const leadMod = getControlValue(app, 'leadFilterMod');
  const fxBase = getControlValue(app, 'leadFxSend');
  const bassBase = getControlValue(app, 'bassFilterBase');
  const bassMod = getControlValue(app, 'bassFilterMod');

  const leadValue = clamp(getAutomationValue(leadTrack, step), 0, 1);
  const fxValue = clamp(getAutomationValue(fxTrack, step), 0, 1);
  const bassValue = clamp(getAutomationValue(bassTrack, step), 0, 1);

  const leadFreq = leadBase + leadMod * leadValue;
  const fxAmount = fxValue * fxBase;
  const bassFreq = bassBase + bassMod * bassValue;

  const leadFrequency = app.audio.nodes.leadFilter.frequency;
  const leadFxGain = app.audio.nodes.leadFxSend.gain;
  const bassFrequency = app.audio.nodes.bassFilter.frequency;

  if (typeof time === 'number') {
    leadFrequency.setValueAtTime(leadFrequency.value, time);
    leadFrequency.linearRampToValueAtTime(leadFreq, time + 0.1);
    leadFxGain.setValueAtTime(leadFxGain.value, time);
    leadFxGain.linearRampToValueAtTime(fxAmount, time + 0.1);
    bassFrequency.setValueAtTime(bassFrequency.value, time);
    bassFrequency.linearRampToValueAtTime(bassFreq, time + 0.1);
  } else {
    leadFrequency.value = leadFreq;
    leadFxGain.value = fxAmount;
    bassFrequency.value = bassFreq;
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

function normalizeAutomationValues(values, stepCount = STEP_COUNT) {
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
    const interpolated = lowerValue + (upperValue - lowerValue) * ratio;
    return clamp(interpolated, 0, 1);
  });
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
      seenIds.add(trackData.id);
    });
  }

  defaults.tracks.forEach(track => {
    if (seenIds.has(track.id)) {
      return;
    }
    normalizedTracks.push({
      id: track.id,
      label: track.label,
      color: track.color,
      values: track.values.slice()
    });
    seenIds.add(track.id);
  });

  normalizedTracks.sort((a, b) => {
    const orderA = AUTOMATION_TRACK_ORDER.get(a.id);
    const orderB = AUTOMATION_TRACK_ORDER.get(b.id);
    if (orderA === undefined && orderB === undefined) {
      return a.id.localeCompare(b.id);
    }
    if (orderA === undefined) return 1;
    if (orderB === undefined) return -1;
    return orderA - orderB;
  });

  let sections = defaults.sections.map(section => ({ ...section }));
  if (automation && Array.isArray(automation.sections) && automation.sections.length) {
    const normalizedSections = normalizeSections(automation.sections, stepCount);
    if (normalizedSections.length) {
      sections = normalizedSections;
    }
  }

  return { tracks: normalizedTracks, sections };
}

function normalizeSections(sections, stepCount = STEP_COUNT) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return createSectionLayout(stepCount);
  }

  const defaultLayout = createSectionLayout(stepCount);
  const sanitized = sections
    .map(section => {
      if (!section) {
        return null;
      }
      const start = Number(section.start);
      const end = Number(section.end);
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return null;
      }
      return {
        name: section.name,
        color: section.color,
        start,
        end
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);

  if (!sanitized.length) {
    return defaultLayout;
  }

  const maxEnd = sanitized.reduce((max, section) => Math.max(max, section.end), 0);
  const sourceSpan = Math.max(maxEnd, 1);
  const targetMax = Math.max(stepCount - 1, 0);

  let lastEnd = -1;
  const normalized = sanitized.map((section, index) => {
    const definition = SECTION_DEFINITIONS.find(def => def.name === section.name);
    const fallback = defaultLayout[index % defaultLayout.length];
    const color = section.color || definition?.color || fallback.color;
    const scaledStart = sourceSpan > 0 ? Math.round((section.start / sourceSpan) * targetMax) : 0;
    const scaledEnd = sourceSpan > 0 ? Math.round((section.end / sourceSpan) * targetMax) : 0;
    let start = clamp(Number.isFinite(scaledStart) ? scaledStart : 0, 0, targetMax);
    let end = clamp(Number.isFinite(scaledEnd) ? scaledEnd : start, 0, targetMax);
    start = Math.min(Math.max(start, lastEnd + 1), targetMax);
    if (end < start) {
      end = start;
    }
    lastEnd = end;
    return {
      name: section.name || definition?.name || fallback.name,
      color,
      start,
      end
    };
  });

  if (normalized.length) {
    normalized[0].start = 0;
    normalized[normalized.length - 1].end = targetMax;
  }

  return normalized;
}

function updateSectionLabel(app, step, sectionOverride) {
  const section = sectionOverride || getSectionForStep(app, step);
  if (section && app.sectionLabelEl) {
    app.sectionLabelEl.textContent = `Section: ${section.name}`;
  } else if (app.sectionLabelEl) {
    app.sectionLabelEl.textContent = 'Section: Loop';
  }
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

function setupMidi(app) {
  if (!navigator.requestMIDIAccess) {
    console.info('WebMIDI not supported in this browser.');
    return;
  }
  navigator.requestMIDIAccess().then(access => {
    app.midi.access = access;
    access.inputs.forEach(input => {
      input.onmidimessage = message => handleMidiMessage(app, message);
    });
    access.addEventListener('statechange', () => {
      access.inputs.forEach(input => {
        input.onmidimessage = message => handleMidiMessage(app, message);
      });
    });
    setStatus(app, 'MIDI ready');
  }).catch(error => {
    console.warn('MIDI access denied', error);
    setStatus(app, 'MIDI unavailable');
  });
}

function setMidiLearn(app, enabled) {
  app.midi.learning = enabled;
  if (!enabled) {
    setMidiPendingControl(app, null);
  }
  setStatus(app, enabled ? 'MIDI Learn enabled' : 'MIDI Learn disabled');
}

function setMidiPendingControl(app, controlId) {
  app.midi.pendingControl = controlId;
  app.controls.forEach(entry => {
    if (controlId && entry.control.id === controlId) {
      entry.row.classList.add('midi-learning');
    } else {
      entry.row.classList.remove('midi-learning');
    }
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
  app.statusEl.textContent = `Status: ${message}`;
  clearTimeout(app.statusTimer);
  app.statusTimer = setTimeout(() => {
    app.statusEl.textContent = 'Status: Idle';
  }, 3500);
}

function wait(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function formatDb(value) {
  return `${value.toFixed(1)} dB`;
}

function formatHz(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} kHz`;
  }
  return `${Math.round(value)} Hz`;
}

function setBusLevel(bus, db) {
  if (!bus) return;
  bus.gain.value = Tone.dbToGain(db);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'preset';
}

function cloneAutomation(source) {
  return {
    tracks: source.tracks.map(track => ({
      id: track.id,
      label: track.label,
      color: track.color,
      values: [...track.values]
    })),
    sections: source.sections.map(section => ({ ...section }))
  };
}

function saveControlState(state) {
  try {
    localStorage.setItem(STORAGE_KEYS.controlState, JSON.stringify(state));
  } catch (err) {
    console.warn('Unable to persist control state', err);
  }
}

function loadControlState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.controlState);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('Unable to read stored control state', err);
    return {};
  }
}

function savePresetState(preset) {
  try {
    localStorage.setItem(STORAGE_KEYS.preset, JSON.stringify(preset));
  } catch (err) {
    console.warn('Unable to store preset', err);
  }
}

function loadPresetState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.preset);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Unable to load preset', err);
    return null;
  }
}

function saveMidiMappings(mappings) {
  try {
    localStorage.setItem(STORAGE_KEYS.midi, JSON.stringify(mappings));
  } catch (err) {
    console.warn('Unable to persist MIDI mappings', err);
  }
}

function loadMidiMappings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.midi);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('Unable to load MIDI mappings', err);
    return {};
  }
}

