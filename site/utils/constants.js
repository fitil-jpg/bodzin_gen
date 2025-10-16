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
        format: value => `${Math.round(value)} dB`,
        apply: (value, app) => {
          if (app.audio?.buses?.drums) {
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
        format: value => `${Math.round(value)} dB`,
        apply: (value, app) => {
          if (app.audio?.buses?.bass) {
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
        format: value => `${Math.round(value)} dB`,
        apply: (value, app) => {
          if (app.audio?.buses?.lead) {
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
        format: value => `${Math.round(value)} dB`,
        apply: (value, app) => {
          if (app.audio?.buses?.fx) {
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
          if (app.audio?.nodes?.bassFilter) {
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
          if (app.audio?.nodes?.bassFilter) {
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
        default: 0.35,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          if (app.audio?.nodes?.bassDrive) {
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
          if (app.audio?.instruments?.lead) {
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
          if (app.audio?.nodes?.leadFilter) {
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
          if (app.audio?.instruments?.lead) {
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
        default: 0.45,
        format: value => `${Math.round(value * 100)}%`,
        affectsAutomation: true,
        apply: (value, app) => {
          if (app.audio?.nodes?.leadFxSend) {
            app.audio.nodes.leadFxSend.gain.value = value;
          }
        }
      }
    ]
  },
  {
    group: 'Effects',
    description: 'Time-based and spatial effects.',
    controls: [
      {
        id: 'delayTime',
        label: 'Delay Time',
        type: 'select',
        options: [
          { value: '16n', label: '1/16' },
          { value: '8n', label: '1/8' },
          { value: '4n', label: '1/4' }
        ],
        default: '8n',
        apply: (value, app) => {
          if (app.audio?.nodes?.delay) {
            app.audio.nodes.delay.delayTime.value = value;
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
        default: 0.38,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          if (app.audio?.nodes?.delay) {
            app.audio.nodes.delay.feedback.value = value;
          }
        }
      },
      {
        id: 'delayWet',
        label: 'Delay Wet',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.3,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          if (app.audio?.nodes?.delay) {
            app.audio.nodes.delay.wet.value = value;
          }
        }
      },
      {
        id: 'reverbDecay',
        label: 'Reverb Decay',
        type: 'range',
        min: 1,
        max: 12,
        step: 0.1,
        default: 6,
        format: value => `${value.toFixed(1)} s`,
        apply: (value, app) => {
          if (app.audio?.nodes?.reverb) {
            app.audio.nodes.reverb.decay = value;
          }
        }
      },
      {
        id: 'reverbWet',
        label: 'Reverb Wet',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.28,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          if (app.audio?.nodes?.reverb) {
            app.audio.nodes.reverb.wet.value = value;
          }
        }
      }
    ]
  },
  {
    group: 'LFO Modulation',
    description: 'Low-frequency oscillators for dynamic parameter modulation.',
    controls: [
      {
        id: 'lfo1Rate',
        label: 'LFO 1 Rate',
        type: 'range',
        min: 0.1,
        max: 8.0,
        step: 0.1,
        default: 0.5,
        format: value => `${value.toFixed(1)} Hz`,
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFORate('lfo1', value);
          }
        }
      },
      {
        id: 'lfo1Depth',
        label: 'LFO 1 Depth',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.3,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFODepth('lfo1', value);
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
          { value: 'sawtooth', label: 'Sawtooth' }
        ],
        default: 'sine',
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFOWaveform('lfo1', value);
          }
        }
      },
      {
        id: 'lfo1Target',
        label: 'LFO 1 Target',
        type: 'select',
        options: [
          { value: 'leadFilter', label: 'Lead Filter' },
          { value: 'fxSend', label: 'FX Send' },
          { value: 'bassFilter', label: 'Bass Filter' },
          { value: 'reverbDecay', label: 'Reverb Decay' },
          { value: 'delayFeedback', label: 'Delay Feedback' },
          { value: 'bassDrive', label: 'Bass Drive' },
          { value: 'leadResonance', label: 'Lead Resonance' },
          { value: 'masterVolume', label: 'Master Volume' }
        ],
        default: 'leadFilter',
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFOTarget('lfo1', value);
          }
        }
      },
      {
        id: 'lfo1Enabled',
        label: 'LFO 1 On/Off',
        type: 'select',
        options: [
          { value: true, label: 'On' },
          { value: false, label: 'Off' }
        ],
        default: true,
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFOEnabled('lfo1', value);
          }
        }
      },
      {
        id: 'lfo2Rate',
        label: 'LFO 2 Rate',
        type: 'range',
        min: 0.1,
        max: 8.0,
        step: 0.1,
        default: 0.25,
        format: value => `${value.toFixed(1)} Hz`,
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFORate('lfo2', value);
          }
        }
      },
      {
        id: 'lfo2Depth',
        label: 'LFO 2 Depth',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.2,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFODepth('lfo2', value);
          }
        }
      },
      {
        id: 'lfo2Waveform',
        label: 'LFO 2 Wave',
        type: 'select',
        options: [
          { value: 'sine', label: 'Sine' },
          { value: 'triangle', label: 'Triangle' },
          { value: 'square', label: 'Square' },
          { value: 'sawtooth', label: 'Sawtooth' }
        ],
        default: 'triangle',
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFOWaveform('lfo2', value);
          }
        }
      },
      {
        id: 'lfo2Target',
        label: 'LFO 2 Target',
        type: 'select',
        options: [
          { value: 'leadFilter', label: 'Lead Filter' },
          { value: 'fxSend', label: 'FX Send' },
          { value: 'bassFilter', label: 'Bass Filter' },
          { value: 'reverbDecay', label: 'Reverb Decay' },
          { value: 'delayFeedback', label: 'Delay Feedback' },
          { value: 'bassDrive', label: 'Bass Drive' },
          { value: 'leadResonance', label: 'Lead Resonance' },
          { value: 'masterVolume', label: 'Master Volume' }
        ],
        default: 'fxSend',
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFOTarget('lfo2', value);
          }
        }
      },
      {
        id: 'lfo2Enabled',
        label: 'LFO 2 On/Off',
        type: 'select',
        options: [
          { value: true, label: 'On' },
          { value: false, label: 'Off' }
        ],
        default: false,
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFOEnabled('lfo2', value);
          }
        }
      },
      {
        id: 'lfo3Rate',
        label: 'LFO 3 Rate',
        type: 'range',
        min: 0.1,
        max: 8.0,
        step: 0.1,
        default: 1.0,
        format: value => `${value.toFixed(1)} Hz`,
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFORate('lfo3', value);
          }
        }
      },
      {
        id: 'lfo3Depth',
        label: 'LFO 3 Depth',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.15,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFODepth('lfo3', value);
          }
        }
      },
      {
        id: 'lfo3Waveform',
        label: 'LFO 3 Wave',
        type: 'select',
        options: [
          { value: 'sine', label: 'Sine' },
          { value: 'triangle', label: 'Triangle' },
          { value: 'square', label: 'Square' },
          { value: 'sawtooth', label: 'Sawtooth' }
        ],
        default: 'square',
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFOWaveform('lfo3', value);
          }
        }
      },
      {
        id: 'lfo3Target',
        label: 'LFO 3 Target',
        type: 'select',
        options: [
          { value: 'leadFilter', label: 'Lead Filter' },
          { value: 'fxSend', label: 'FX Send' },
          { value: 'bassFilter', label: 'Bass Filter' },
          { value: 'reverbDecay', label: 'Reverb Decay' },
          { value: 'delayFeedback', label: 'Delay Feedback' },
          { value: 'bassDrive', label: 'Bass Drive' },
          { value: 'leadResonance', label: 'Lead Resonance' },
          { value: 'masterVolume', label: 'Master Volume' }
        ],
        default: 'bassFilter',
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFOTarget('lfo3', value);
          }
        }
      },
      {
        id: 'lfo3Enabled',
        label: 'LFO 3 On/Off',
        type: 'select',
        options: [
          { value: true, label: 'On' },
          { value: false, label: 'Off' }
        ],
        default: false,
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFOEnabled('lfo3', value);
          }
        }
      },
      {
        id: 'lfo4Rate',
        label: 'LFO 4 Rate',
        type: 'range',
        min: 0.1,
        max: 8.0,
        step: 0.1,
        default: 0.125,
        format: value => `${value.toFixed(1)} Hz`,
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFORate('lfo4', value);
          }
        }
      },
      {
        id: 'lfo4Depth',
        label: 'LFO 4 Depth',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.25,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFODepth('lfo4', value);
          }
        }
      },
      {
        id: 'lfo4Waveform',
        label: 'LFO 4 Wave',
        type: 'select',
        options: [
          { value: 'sine', label: 'Sine' },
          { value: 'triangle', label: 'Triangle' },
          { value: 'square', label: 'Square' },
          { value: 'sawtooth', label: 'Sawtooth' }
        ],
        default: 'sawtooth',
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFOWaveform('lfo4', value);
          }
        }
      },
      {
        id: 'lfo4Target',
        label: 'LFO 4 Target',
        type: 'select',
        options: [
          { value: 'leadFilter', label: 'Lead Filter' },
          { value: 'fxSend', label: 'FX Send' },
          { value: 'bassFilter', label: 'Bass Filter' },
          { value: 'reverbDecay', label: 'Reverb Decay' },
          { value: 'delayFeedback', label: 'Delay Feedback' },
          { value: 'bassDrive', label: 'Bass Drive' },
          { value: 'leadResonance', label: 'Lead Resonance' },
          { value: 'masterVolume', label: 'Master Volume' }
        ],
        default: 'reverbDecay',
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFOTarget('lfo4', value);
          }
        }
      },
      {
        id: 'lfo4Enabled',
        label: 'LFO 4 On/Off',
        type: 'select',
        options: [
          { value: true, label: 'On' },
          { value: false, label: 'Off' }
        ],
        default: false,
        apply: (value, app) => {
          if (app.lfo) {
            app.lfo.setLFOEnabled('lfo4', value);
          }
        }
      }
    ]
  }
];