// Константи та конфігурація
export const STEP_COUNT = 16;
export const STEP_DURATION = '1m';
export const LOOP_DURATION = Tone.Ticks(Tone.Time(STEP_DURATION).toTicks() * STEP_COUNT);

export const STORAGE_KEYS = {
  controlState: 'bodzin.controlState',
  preset: 'bodzin.preset',
  midi: 'bodzin.midiMappings',
  presetHistory: 'bodzin.presetHistory'
};

// Preset versioning
export const PRESET_VERSION = '1.0.0';
export const PRESET_SCHEMA_VERSION = 1;

export const PRESET_VERSIONS = {
  '1.0.0': {
    schemaVersion: 1,
    description: 'Initial preset format with controls, automation, and MIDI mappings',
    migration: null // No migration needed for initial version
  }
};

export const SECTION_DEFINITIONS = [
  { name: 'Intro', color: 'rgba(73, 169, 255, 0.05)' },
  { name: 'Lift', color: 'rgba(255, 73, 175, 0.04)' },
  { name: 'Peak', color: 'rgba(148, 255, 73, 0.04)' },
  { name: 'Break', color: 'rgba(255, 180, 73, 0.05)' }
];

export const CURVE_TYPES = {
  LINEAR: 'linear',
  BEZIER: 'bezier',
  EXPONENTIAL: 'exponential',
  LOGARITHMIC: 'logarithmic',
  SINE: 'sine'
};

export const CURVE_TYPES = {
  LINEAR: 'linear',
  BEZIER: 'bezier',
  EXPONENTIAL: 'exponential',
  LOGARITHMIC: 'logarithmic',
  SINE: 'sine'
};

export const AUTOMATION_TRACK_DEFINITIONS = [
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
  },
  {
    id: 'sidechainAmount',
    label: 'Sidechain Amount',
    color: '#ff4757',
    curve: [
      0.8, 0.6, 0.4, 0.2, 0.1, 0.3, 0.5, 0.7,
      0.9, 0.7, 0.5, 0.3, 0.1, 0.2, 0.4, 0.6
    ]
  },
  {
    id: 'sidechainThreshold',
    label: 'Sidechain Threshold',
    color: '#ff6b35',
    curve: [
      -24, -22, -20, -18, -16, -18, -20, -22,
      -24, -26, -28, -26, -24, -22, -20, -18
    id: 'leadDistortion',
    label: 'Lead Distortion',
    color: '#ff4757',
    curve: [
      0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45,
      0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15
    ]
  },
  {
    id: 'leadOverdrive',
    label: 'Lead Overdrive',
    color: '#ff6b35',
    curve: [
      0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55,
      0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25
    ]
  },
  {
    id: 'drumDistortion',
    label: 'Drum Distortion',
    color: '#ffa502',
    curve: [
      0.1, 0.12, 0.15, 0.18, 0.2, 0.22, 0.25, 0.28,
      0.3, 0.28, 0.25, 0.22, 0.2, 0.18, 0.15, 0.12
    ]
  },
  {
    id: 'masterOverdrive',
    label: 'Master Overdrive',
    color: '#ff3838',
    curve: [
      0.05, 0.08, 0.1, 0.12, 0.15, 0.18, 0.2, 0.22,
      0.25, 0.22, 0.2, 0.18, 0.15, 0.12, 0.1, 0.08
    ]
  }
];

export const LFO_DEFINITIONS = [
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

export const SECTION_SEQUENCE_ACTIVITY = {
  Intro: { drums: true, bass: false, lead: false, fx: false },
  Lift: { drums: true, bass: true, lead: false, fx: true },
  Peak: { drums: true, bass: true, lead: true, fx: true },
  Break: { drums: true, bass: false, lead: false, fx: true }
};

export const CONTROL_SCHEMA = [
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
    group: 'Probability Triggers',
    description: 'Dynamic trigger system with probability-based patterns.',
    controls: [
      {
        id: 'probabilityEnabled',
        label: 'Enable Probability Triggers',
        type: 'select',
        options: [
          { value: false, label: 'Fixed Patterns' },
          { value: true, label: 'Probability Based' }
        ],
        default: false,
        apply: (value, app) => {
          app.audio.setProbabilityTriggersEnabled(value);
        }
      },
      {
        id: 'probabilityEntropy',
        label: 'Randomness',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.5,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.setEntropy(value);
        }
      },
      {
        id: 'kickProbability',
        label: 'Kick Probability',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.8,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.setBaseProbability('kick', value);
        }
      },
      {
        id: 'snareProbability',
        label: 'Snare Probability',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.6,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.setBaseProbability('snare', value);
        }
      },
      {
        id: 'hatsProbability',
        label: 'Hats Probability',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.7,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.setBaseProbability('hats', value);
        }
      },
      {
        id: 'bassProbability',
        label: 'Bass Probability',
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
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio && app.audio.buses && app.audio.buses.drums) {
            app.audio.buses.drums.volume.value = value;
          }
        }
      },
      {
        id: 'bassLevel',
        label: 'Bass Level',
        type: 'range',
        min: -24,
        max: 6,
        step: 0.5,
        default: -6,
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio && app.audio.buses && app.audio.buses.bass) {
            app.audio.buses.bass.volume.value = value;
          }
        }
      },
      {
        id: 'leadLevel',
        label: 'Lead Level',
        type: 'range',
        min: -24,
        max: 6,
        step: 0.5,
        default: -3,
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio && app.audio.buses && app.audio.buses.lead) {
            app.audio.buses.lead.volume.value = value;
          }
        }
      },
      {
        id: 'fxLevel',
        label: 'FX Return',
        type: 'range',
        min: -24,
        max: 6,
        step: 0.5,
        default: -8,
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio && app.audio.buses && app.audio.buses.fx) {
            app.audio.buses.fx.volume.value = value;
          }
        }
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
        format: value => `${Math.round(value)} Hz`,
        affectsAutomation: true,
        apply: (value, app) => {
          if (app.audio && app.audio.nodes && app.audio.nodes.bassFilter) {
            app.audio.nodes.bassFilter.frequency.value = value;
          }
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
          if (app.audio && app.audio.nodes && app.audio.nodes.bassFilter) {
            app.audio.nodes.bassFilter.Q.value = value * 6;
          }
        }
      },
      {
        id: 'bassDrive',
        label: 'Drive',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.6,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.setBaseProbability('bass', value);
        }
      },
      {
        id: 'leadProbability',
        label: 'Lead Probability',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.5,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.setBaseProbability('lead', value);
        }
      },
      {
        id: 'fxProbability',
        label: 'FX Probability',
        default: 0.35,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          if (app.audio && app.audio.nodes && app.audio.nodes.bassDrive) {
            app.audio.nodes.bassDrive.wet.value = value;
          }
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
          if (app.audio && app.audio.instruments && app.audio.instruments.lead) {
            app.audio.instruments.lead.set({ oscillator: { type: value } });
          }
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
        format: value => `${Math.round(value)} Hz`,
        affectsAutomation: true,
        apply: (value, app) => {
          if (app.audio && app.audio.nodes && app.audio.nodes.leadFilter) {
            app.audio.nodes.leadFilter.frequency.value = value;
          }
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
          if (app.audio && app.audio.instruments && app.audio.instruments.lead) {
            app.audio.instruments.lead.set({ detune: value });
          }
        }
      },
      {
        id: 'leadFxSend',
        label: 'FX Send',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.3,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.setBaseProbability('fx', value);
        affectsAutomation: true,
        apply: (value, app) => {
          if (app.audio && app.audio.nodes && app.audio.nodes.leadFxSend) {
            app.audio.nodes.leadFxSend.gain.value = value;
          }
        }
      }
    ]
  },
  {
    group: 'Drums',
    description: 'Rhythmic foundation.',
    controls: [
      {
        id: 'kickLevel',
        label: 'Kick Level',
    group: 'Pattern Morphing',
    description: 'Smooth transitions between sections.',
    controls: [
      {
        id: 'morphingEnabled',
        label: 'Enable Morphing',
        type: 'checkbox',
        default: false,
        apply: (value, app) => {
          if (app.patternMorphing) {
            if (value) {
              app.patternMorphing.startMorphing('Intro', 'Lift', 4, 'easeInOut');
            } else {
              app.patternMorphing.resetMorphing();
            }
          }
        }
      },
      {
        id: 'morphSource',
        label: 'Source Section',
        type: 'select',
        options: SECTION_DEFINITIONS.map(section => ({
          value: section.name,
          label: section.name
        })),
        default: 'Intro',
        apply: (value, app) => {
          if (app.patternMorphing && app.patternMorphing.morphingState.isActive) {
            app.patternMorphing.morphingState.sourceSection = value;
          }
        }
      },
      {
        id: 'morphTarget',
        label: 'Target Section',
        type: 'select',
        options: SECTION_DEFINITIONS.map(section => ({
          value: section.name,
          label: section.name
        })),
        default: 'Lift',
        apply: (value, app) => {
          if (app.patternMorphing && app.patternMorphing.morphingState.isActive) {
            app.patternMorphing.morphingState.targetSection = value;
          }
        }
      },
      {
        id: 'morphDuration',
        label: 'Morph Duration',
        type: 'range',
        min: 1,
        max: 8,
        step: 1,
        default: 4,
        format: value => `${value} steps`,
        apply: (value, app) => {
          if (app.patternMorphing) {
            app.patternMorphing.morphingState.morphDuration = value;
          }
        }
      },
      {
        id: 'morphType',
        label: 'Morph Type',
        type: 'select',
        options: [
          { value: 'linear', label: 'Linear' },
          { value: 'easeInOut', label: 'Ease In/Out' },
          { value: 'easeIn', label: 'Ease In' },
          { value: 'easeOut', label: 'Ease Out' },
          { value: 'bezier', label: 'Bezier' },
          { value: 'exponential', label: 'Exponential' },
          { value: 'logarithmic', label: 'Logarithmic' },
          { value: 'sine', label: 'Sine' }
        ],
        default: 'easeInOut',
        apply: (value, app) => {
          if (app.patternMorphing) {
            app.patternMorphing.morphingState.easingFunction = value;
          }
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
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio && app.audio.buses && app.audio.buses.drums) {
            app.audio.buses.drums.gain.value = Tone.dbToGain(value);
          }
        }
      },
      {
        id: 'bassLevel',
        label: 'Bass Level',
        type: 'range',
        min: -24,
        max: 6,
        step: 0.5,
        default: -6,
        format: value => `${Math.round(value)} dB`,
        apply: (value, app) => {
          const db = 20 * Math.log10(Math.max(0.001, Math.pow(10, value / 20)));
          app.audio.buses.bass.gain.value = db;
        default: -2,
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio && app.audio.nodes && app.audio.nodes.kick) {
            app.audio.nodes.kick.volume.value = value;
          }
        }
      },
      {
        id: 'snareLevel',
        label: 'Snare Level',
        default: -6,
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio && app.audio.buses && app.audio.buses.bass) {
            app.audio.buses.bass.gain.value = Tone.dbToGain(value);
          }
        }
      },
      {
        id: 'leadLevel',
        label: 'Lead Level',
        type: 'range',
        min: -24,
        max: 6,
        step: 0.5,
        default: -4,
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio && app.audio.nodes && app.audio.nodes.snare) {
            app.audio.nodes.snare.volume.value = value;
          }
        }
      },
      {
        id: 'hihatLevel',
        label: 'Hi-hat Level',
        default: -3,
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio && app.audio.buses && app.audio.buses.lead) {
            app.audio.buses.lead.gain.value = Tone.dbToGain(value);
          }
        }
      },
      {
        id: 'fxLevel',
        label: 'FX Return',
        type: 'range',
        min: -24,
        max: 6,
        step: 0.5,
        default: -8,
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio && app.audio.nodes && app.audio.nodes.hihat) {
            app.audio.nodes.hihat.volume.value = value;
          }
        }
      }
    ]
  },
  {
    group: 'FX',
    description: 'Effects and processing.',
    controls: [
      {
        id: 'reverbDecay',
        label: 'Reverb Decay',
        type: 'range',
        min: 0.1,
        max: 3,
        step: 0.01,
        default: 1.2,
        format: value => `${value.toFixed(2)}s`,
        affectsAutomation: true,
        apply: (value, app) => {
          if (app.audio && app.audio.nodes && app.audio.nodes.reverb) {
            app.audio.nodes.reverb.decay = value;
          }
        }
      },
      {
        id: 'delayFeedback',
        label: 'Delay Feedback',
        type: 'range',
        min: 0,
        max: 0.9,
        step: 0.01,
        default: 0.3,
        format: value => `${Math.round(value * 100)}%`,
        affectsAutomation: true,
        apply: (value, app) => {
          if (app.audio && app.audio.nodes && app.audio.nodes.delay) {
            app.audio.nodes.delay.feedback.value = value;
          }
        }
      },
      {
        id: 'delayTime',
        label: 'Delay Time',
        type: 'range',
        min: 0.125,
        max: 1,
        step: 0.125,
        default: 0.5,
        format: value => `${value.toFixed(3)}s`,
        apply: (value, app) => {
          if (app.audio && app.audio.nodes && app.audio.nodes.delay) {
            app.audio.nodes.delay.delayTime.value = value;
          }
        }
      }
    ]
  },
  {
    group: 'LFO',
    description: 'Low frequency oscillators.',
    controls: [
      {
        id: 'lfo1Rate',
        label: 'LFO 1 Rate',
        type: 'range',
        min: 0.1,
        max: 10,
        step: 0.1,
        default: 0.5,
        format: value => `${value.toFixed(1)} Hz`,
        apply: (value, app) => {
          if (app.audio && app.audio.lfos && app.audio.lfos.lfo1) {
            app.audio.lfos.lfo1.frequency.value = value;
          }
        }
      },
      {
        id: 'lfo1Depth',
        label: 'LFO 1 Depth',
          if (app.audio && app.audio.buses && app.audio.buses.fx) {
            app.audio.buses.fx.gain.value = Tone.dbToGain(value);
          }
        }
      }
    ]
  },
  {
    group: 'Pattern Variations',
    description: 'A/B pattern switching and variation controls.',
    controls: [
      {
        id: 'patternSelect',
        label: 'Pattern',
        type: 'select',
        default: 'A',
        options: [
          { value: 'A', label: 'Pattern A' },
          { value: 'B', label: 'Pattern B' },
          { value: 'C', label: 'Pattern C' }
        ],
        apply: (value, app) => {
          if (app.patternVariation) {
            app.patternVariation.switchPattern(value);
          }
        }
      },
      {
        id: 'variationIntensity',
        label: 'Variation Intensity',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.5,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          if (app.patternVariation) {
            app.patternVariation.setVariationIntensity(value);
          }
        }
      },
      {
        id: 'morphingEnabled',
        label: 'Pattern Morphing',
        type: 'select',
        default: 'off',
        options: [
          { value: 'off', label: 'Off' },
          { value: 'on', label: 'On' }
        ],
        apply: (value, app) => {
          if (app.patternVariation) {
            app.patternVariation.setMorphingEnabled(value === 'on');
          }
        }
      },
      {
        id: 'randomizationAmount',
        label: 'Randomization',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.3,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          if (app.audio && app.audio.lfos && app.audio.lfos.lfo1) {
            app.audio.lfos.lfo1.depth = value;
          }
        }
      },
      {
        id: 'lfo1Waveform',
        label: 'LFO 1 Wave',
        type: 'select',
        options: [
          { value: 'sine', label: 'Sine' },
          { value: 'triangle', label: 'Triangle' },
          { value: 'square', label: 'Square' },
          { value: 'sawtooth', label: 'Saw' }
        ],
        default: 'sine',
        apply: (value, app) => {
          if (app.audio && app.audio.lfos && app.audio.lfos.lfo1) {
            app.audio.lfos.lfo1.type = value;
        default: 0.2,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          if (app.patternVariation) {
            app.patternVariation.setRandomizationAmount(value);
          }
        }
      }
    ]
  }
];