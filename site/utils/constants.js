// Константи та конфігурація
export const STEP_COUNT = 16;
export const STEP_DURATION = '1m';
export const LOOP_DURATION = Tone.Ticks(Tone.Time(STEP_DURATION).toTicks() * STEP_COUNT);

export const STORAGE_KEYS = {
  controlState: 'bodzin.controlState',
  preset: 'bodzin.preset',
  midi: 'bodzin.midiMappings'
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
          if (app.audio?.buses?.drums) {
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
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio?.buses?.bass) {
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
        default: -3,
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio?.buses?.lead) {
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
          if (app.audio?.buses?.fx) {
            app.audio.buses.fx.gain.value = Tone.dbToGain(value);
          }
        }
      }
    ]
  }
];