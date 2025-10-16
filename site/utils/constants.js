// Константи та конфігурація
import { setBusLevel } from './helpers.js';

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
        format: value => `${value.toFixed(1)} dB`,
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
        format: value => `${value.toFixed(1)} dB`,
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
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => setBusLevel(app.audio.buses.fx, value)
      }
    ]
  },
  {
    group: 'Compressor/Limiter',
    description: 'Dynamic range control and limiting.',
    controls: [
      {
        id: 'compressorThreshold',
        label: 'Compressor Threshold',
        type: 'range',
        min: -40,
        max: 0,
        step: 0.5,
        default: -12,
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio.compressor) {
            app.audio.compressor.threshold.value = value;
          }
        }
      },
      {
        id: 'compressorRatio',
        label: 'Compressor Ratio',
        type: 'range',
        min: 1,
        max: 20,
        step: 0.1,
        default: 4,
        format: value => `${value.toFixed(1)}:1`,
        apply: (value, app) => {
          if (app.audio.compressor) {
            app.audio.compressor.ratio.value = value;
          }
        }
      },
      {
        id: 'compressorAttack',
        label: 'Attack Time',
        type: 'range',
        min: 0.001,
        max: 1,
        step: 0.001,
        default: 0.003,
        format: value => `${(value * 1000).toFixed(1)} ms`,
        apply: (value, app) => {
          if (app.audio.compressor) {
            app.audio.compressor.attack.value = value;
          }
        }
      },
      {
        id: 'compressorRelease',
        label: 'Release Time',
        type: 'range',
        min: 0.01,
        max: 2,
        step: 0.01,
        default: 0.25,
        format: value => `${(value * 1000).toFixed(0)} ms`,
        apply: (value, app) => {
          if (app.audio.compressor) {
            app.audio.compressor.release.value = value;
          }
        }
      },
      {
        id: 'compressorKnee',
        label: 'Knee',
        type: 'range',
        min: 0,
        max: 40,
        step: 0.5,
        default: 30,
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio.compressor) {
            app.audio.compressor.knee.value = value;
          }
        }
      },
      {
        id: 'limiterThreshold',
        label: 'Limiter Threshold',
        type: 'range',
        min: -6,
        max: 0,
        step: 0.1,
        default: -1,
        format: value => `${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio.limiter) {
            app.audio.limiter.threshold.value = value;
          }
        }
      },
      {
        id: 'compressorMakeup',
        label: 'Makeup Gain',
        type: 'range',
        min: 0,
        max: 12,
        step: 0.1,
        default: 0,
        format: value => `+${value.toFixed(1)} dB`,
        apply: (value, app) => {
          if (app.audio.compressorMakeup) {
            app.audio.compressorMakeup.gain.value = Tone.dbToGain(value);
          }
        }
      },
      {
        id: 'compressorSidechain',
        label: 'Sidechain Source',
        type: 'select',
        options: [
          { value: 'none', label: 'None' },
          { value: 'drums', label: 'Drums' },
          { value: 'bass', label: 'Bass' },
          { value: 'lead', label: 'Lead' }
        ],
        default: 'none',
        apply: (value, app) => {
          // Disconnect existing sidechain
          if (app.audio.sidechainGain) {
            app.audio.sidechainGain.disconnect();
          }
          
          if (value !== 'none' && app.audio.buses[value]) {
            // Create sidechain gain control
            app.audio.sidechainGain = new Tone.Gain(0.3);
            app.audio.buses[value].connect(app.audio.sidechainGain);
            app.audio.sidechainGain.connect(app.audio.compressor);
          }
        }
      },
      {
        id: 'compressorLookahead',
        label: 'Lookahead',
        type: 'range',
        min: 0,
        max: 50,
        step: 1,
        default: 0,
        format: value => `${value} ms`,
        apply: (value, app) => {
          if (app.audio.lookahead) {
            // Simple lookahead implementation using delay
            const delayTime = value / 1000; // Convert ms to seconds
            app.audio.lookahead.gain.value = delayTime > 0 ? 1 : 1;
          }
        }
      },
      {
        id: 'compressorBypass',
        label: 'Bypass',
        type: 'select',
        options: [
          { value: 'off', label: 'Off' },
          { value: 'on', label: 'On' }
        ],
        default: 'off',
        apply: (value, app) => {
          if (app.audio.compressor) {
            app.audio.compressor.wet.value = value === 'on' ? 1 : 0;
          }
        }
      },
      {
        id: 'compressorPreset',
        label: 'Preset',
        type: 'select',
        options: [
          { value: 'custom', label: 'Custom' },
          { value: 'gentle', label: 'Gentle' },
          { value: 'aggressive', label: 'Aggressive' },
          { value: 'mastering', label: 'Mastering' },
          { value: 'sidechain', label: 'Sidechain' }
        ],
        default: 'custom',
        apply: (value, app) => {
          if (app.audio && value !== 'custom') {
            app.audio.applyCompressorPreset(value);
          }
        }
      },
      {
        id: 'compressorAutoMakeup',
        label: 'Auto Makeup',
        type: 'select',
        options: [
          { value: 'off', label: 'Off' },
          { value: 'on', label: 'On' }
        ],
        default: 'off',
        apply: (value, app) => {
          if (app.audio && value === 'on') {
            const makeupGain = app.audio.applyAutoMakeup();
            // Update the makeup gain control value
            const makeupControl = app.uiControls.getControlDefinition('compressorMakeup');
            if (makeupControl) {
              app.uiControls.setControlValue(makeupControl, makeupGain, { silent: true });
            }
          }
        }
      },
      {
        id: 'compressorMode',
        label: 'Mode',
        type: 'select',
        options: [
          { value: 'standard', label: 'Standard' },
          { value: 'soft', label: 'Soft' },
          { value: 'hard', label: 'Hard' },
          { value: 'vintage', label: 'Vintage' }
        ],
        default: 'standard',
        apply: (value, app) => {
          if (app.audio && app.audio.compressor) {
            const modes = {
              'standard': { knee: 30, attack: 0.003, release: 0.25 },
              'soft': { knee: 50, attack: 0.01, release: 0.1 },
              'hard': { knee: 0, attack: 0.001, release: 0.5 },
              'vintage': { knee: 20, attack: 0.005, release: 0.3 }
            };
            
            const settings = modes[value];
            if (settings) {
              app.audio.compressor.knee.value = settings.knee;
              app.audio.compressor.attack.value = settings.attack;
              app.audio.compressor.release.value = settings.release;
            }
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
        format: value => `${Math.round(value)} Hz`,
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
    group: 'Effects',
    description: 'Spatial and time-based effects.',
    controls: [
      {
        id: 'delayTime',
        label: 'Delay Time',
        type: 'select',
        options: [
          { value: '4n', label: '1/4' },
          { value: '8n', label: '1/8' },
          { value: '8t', label: '1/8T' },
          { value: '16n', label: '1/16' }
        ],
        default: '8n',
        apply: (value, app) => {
          app.audio.nodes.delay.delayTime.value = Tone.Time(value).toSeconds();
        }
      },
      {
        id: 'delayFeedback',
        label: 'Delay Feedback',
        type: 'range',
        min: 0,
        max: 0.95,
        step: 0.01,
        default: 0.38,
        format: value => `${Math.round(value * 100)}%`,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.delay.feedback.value = value;
        }
      },
      {
        id: 'reverbDecay',
        label: 'Reverb Decay',
        type: 'range',
        min: 0.5,
        max: 20,
        step: 0.1,
        default: 6,
        format: value => `${value.toFixed(1)}s`,
        affectsAutomation: true,
        apply: (value, app) => {
          app.audio.nodes.reverb.decay = value;
        }
      },
      {
        id: 'reverbWet',
        label: 'Reverb Amount',
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
  }
];