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
  },
  // Reverb automation tracks
  {
    id: 'reverbMix',
    label: 'Reverb Mix',
    color: '#ff8c42',
    curve: [
      0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45,
      0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15
    ]
  },
  {
    id: 'reverbPreDelay',
    label: 'Reverb PreDelay',
    color: '#ff6b6b',
    curve: [
      0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045,
      0.05, 0.045, 0.04, 0.035, 0.03, 0.025, 0.02, 0.015
    ]
  },
  {
    id: 'reverbRoomSize',
    label: 'Reverb Room Size',
    color: '#ff9ff3',
    curve: [
      0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
      0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2
    ]
  },
  // Delay automation tracks
  {
    id: 'delayTime',
    label: 'Delay Time',
    color: '#54a0ff',
    curve: [
      0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1,
      0.875, 0.75, 0.625, 0.5, 0.375, 0.25, 0.125, 0.1
    ]
  },
  {
    id: 'delayMix',
    label: 'Delay Mix',
    color: '#5f27cd',
    curve: [
      0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2,
      0.1, 0.15, 0.2, 0.25, 0.3, 0.25, 0.2, 0.15
    ]
  },
  {
    id: 'delayFilter',
    label: 'Delay Filter',
    color: '#00d2d3',
    curve: [
      0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
      1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3
    ]
  },
  // Distortion automation tracks
  {
    id: 'distortionAmount',
    label: 'Distortion Amount',
    color: '#ff3838',
    curve: [
      0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8,
      0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2
    ]
  },
  {
    id: 'distortionTone',
    label: 'Distortion Tone',
    color: '#ff9f43',
    curve: [
      0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
      1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3
    ]
  },
  {
    id: 'distortionMix',
    label: 'Distortion Mix',
    color: '#ee5a24',
    curve: [
      0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45,
      0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15
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