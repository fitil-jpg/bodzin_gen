// Константи та конфігурація
import { setBusLevel } from './helpers.js';

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

// Key Signature and Scale Management
export const MUSICAL_KEYS = {
  'C': { name: 'C Major', root: 'C', type: 'major', accidentals: 0 },
  'G': { name: 'G Major', root: 'G', type: 'major', accidentals: 1 },
  'D': { name: 'D Major', root: 'D', type: 'major', accidentals: 2 },
  'A': { name: 'A Major', root: 'A', type: 'major', accidentals: 3 },
  'E': { name: 'E Major', root: 'E', type: 'major', accidentals: 4 },
  'B': { name: 'B Major', root: 'B', type: 'major', accidentals: 5 },
  'F#': { name: 'F# Major', root: 'F#', type: 'major', accidentals: 6 },
  'C#': { name: 'C# Major', root: 'C#', type: 'major', accidentals: 7 },
  'F': { name: 'F Major', root: 'F', type: 'major', accidentals: -1 },
  'Bb': { name: 'Bb Major', root: 'Bb', type: 'major', accidentals: -2 },
  'Eb': { name: 'Eb Major', root: 'Eb', type: 'major', accidentals: -3 },
  'Ab': { name: 'Ab Major', root: 'Ab', type: 'major', accidentals: -4 },
  'Db': { name: 'Db Major', root: 'Db', type: 'major', accidentals: -5 },
  'Gb': { name: 'Gb Major', root: 'Gb', type: 'major', accidentals: -6 },
  'Cb': { name: 'Cb Major', root: 'Cb', type: 'major', accidentals: -7 },
  'Am': { name: 'A Minor', root: 'A', type: 'minor', accidentals: 0 },
  'Em': { name: 'E Minor', root: 'E', type: 'minor', accidentals: 1 },
  'Bm': { name: 'B Minor', root: 'B', type: 'minor', accidentals: 2 },
  'F#m': { name: 'F# Minor', root: 'F#', type: 'minor', accidentals: 3 },
  'C#m': { name: 'C# Minor', root: 'C#', type: 'minor', accidentals: 4 },
  'G#m': { name: 'G# Minor', root: 'G#', type: 'minor', accidentals: 5 },
  'D#m': { name: 'D# Minor', root: 'D#', type: 'minor', accidentals: 6 },
  'A#m': { name: 'A# Minor', root: 'A#', type: 'minor', accidentals: 7 },
  'Dm': { name: 'D Minor', root: 'D', type: 'minor', accidentals: -1 },
  'Gm': { name: 'G Minor', root: 'G', type: 'minor', accidentals: -2 },
  'Cm': { name: 'C Minor', root: 'C', type: 'minor', accidentals: -3 },
  'Fm': { name: 'F Minor', root: 'F', type: 'minor', accidentals: -4 },
  'Bbm': { name: 'Bb Minor', root: 'Bb', type: 'minor', accidentals: -5 },
  'Ebm': { name: 'Eb Minor', root: 'Eb', type: 'minor', accidentals: -6 },
  'Abm': { name: 'Ab Minor', root: 'Ab', type: 'minor', accidentals: -7 }
};

export const SCALE_PATTERNS = {
  major: [0, 2, 4, 5, 7, 9, 11], // W-W-H-W-W-W-H
  minor: [0, 2, 3, 5, 7, 8, 10], // W-H-W-W-H-W-W
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11], // W-H-W-W-H-A2-H
  melodicMinor: [0, 2, 3, 5, 7, 9, 11], // W-H-W-W-W-W-H (ascending)
  dorian: [0, 2, 3, 5, 7, 9, 10], // W-H-W-W-W-H-W
  phrygian: [0, 1, 3, 5, 7, 8, 10], // H-W-W-W-H-W-W
  lydian: [0, 2, 4, 6, 7, 9, 11], // W-W-W-H-W-W-H
  mixolydian: [0, 2, 4, 5, 7, 9, 10], // W-W-H-W-W-H-W
  locrian: [0, 1, 3, 5, 6, 8, 10], // H-W-W-H-W-W-W
  pentatonicMajor: [0, 2, 4, 7, 9], // W-W-W+H-W
  pentatonicMinor: [0, 3, 5, 7, 10], // W+H-W-W-W+H
  blues: [0, 3, 5, 6, 7, 10], // W+H-W-H-H-W+H
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // All semitones
};

export const CHORD_PROGRESSIONS = {
  // Common progressions in major keys
  major: {
    'I-V-vi-IV': ['I', 'V', 'vi', 'IV'], // C-G-Am-F
    'vi-IV-I-V': ['vi', 'IV', 'I', 'V'], // Am-F-C-G
    'I-vi-IV-V': ['I', 'vi', 'IV', 'V'], // C-Am-F-G
    'ii-V-I': ['ii', 'V', 'I'], // Dm-G-C
    'I-IV-V': ['I', 'IV', 'V'], // C-F-G
    'I-vi-ii-V': ['I', 'vi', 'ii', 'V'], // C-Am-Dm-G
    'vi-V-IV-V': ['vi', 'V', 'IV', 'V'], // Am-G-F-G
    'I-V-vi-iii-IV': ['I', 'V', 'vi', 'iii', 'IV'] // C-G-Am-Em-F
  },
  // Common progressions in minor keys
  minor: {
    'i-iv-V': ['i', 'iv', 'V'], // Am-Dm-E
    'i-VI-VII-i': ['i', 'VI', 'VII', 'i'], // Am-F-G-Am
    'i-iv-VII': ['i', 'iv', 'VII'], // Am-Dm-G
    'i-V-iv-i': ['i', 'V', 'iv', 'i'], // Am-E-Dm-Am
    'i-VI-III-VII': ['i', 'VI', 'III', 'VII'], // Am-F-C-G
    'i-iv-i-V': ['i', 'iv', 'i', 'V'], // Am-Dm-Am-E
    'i-VII-VI-V': ['i', 'VII', 'VI', 'V'], // Am-G-F-E
    'i-iv-V-i': ['i', 'iv', 'V', 'i'] // Am-Dm-E-Am
  }
};

export const CHORD_TYPES = {
  major: [0, 4, 7], // Root, Major 3rd, Perfect 5th
  minor: [0, 3, 7], // Root, Minor 3rd, Perfect 5th
  diminished: [0, 3, 6], // Root, Minor 3rd, Diminished 5th
  augmented: [0, 4, 8], // Root, Major 3rd, Augmented 5th
  sus2: [0, 2, 7], // Root, Major 2nd, Perfect 5th
  sus4: [0, 5, 7], // Root, Perfect 4th, Perfect 5th
  major7: [0, 4, 7, 11], // Root, Major 3rd, Perfect 5th, Major 7th
  minor7: [0, 3, 7, 10], // Root, Minor 3rd, Perfect 5th, Minor 7th
  dominant7: [0, 4, 7, 10], // Root, Major 3rd, Perfect 5th, Minor 7th
  diminished7: [0, 3, 6, 9], // Root, Minor 3rd, Diminished 5th, Diminished 7th
  halfDiminished7: [0, 3, 6, 10], // Root, Minor 3rd, Diminished 5th, Minor 7th
  augmented7: [0, 4, 8, 10], // Root, Major 3rd, Augmented 5th, Minor 7th
  major9: [0, 4, 7, 11, 2], // Root, Major 3rd, Perfect 5th, Major 7th, Major 9th
  minor9: [0, 3, 7, 10, 2], // Root, Minor 3rd, Perfect 5th, Minor 7th, Major 9th
  dominant9: [0, 4, 7, 10, 2], // Root, Major 3rd, Perfect 5th, Minor 7th, Major 9th
  add9: [0, 4, 7, 2], // Root, Major 3rd, Perfect 5th, Major 9th
  minorAdd9: [0, 3, 7, 2], // Root, Minor 3rd, Perfect 5th, Major 9th
  power: [0, 7] // Root, Perfect 5th (power chord)
};

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// MIDI note numbers for different octaves
export const MIDI_NOTES = {
  C0: 12, C1: 24, C2: 36, C3: 48, C4: 60, C5: 72, C6: 84, C7: 96, C8: 108,
  D0: 14, D1: 26, D2: 38, D3: 50, D4: 62, D5: 74, D6: 86, D7: 98, D8: 110,
  E0: 16, E1: 28, E2: 40, E3: 52, E4: 64, E5: 76, E6: 88, E7: 100, E8: 112,
  F0: 17, F1: 29, F2: 41, F3: 53, F4: 65, F5: 77, F6: 89, F7: 101, F8: 113,
  G0: 19, G1: 31, G2: 43, G3: 55, G4: 67, G5: 79, G6: 91, G7: 103, G8: 115,
  A0: 21, A1: 33, A2: 45, A3: 57, A4: 69, A5: 81, A6: 93, A7: 105, A8: 117,
  B0: 23, B1: 35, B2: 47, B3: 59, B4: 71, B5: 83, B6: 95, B7: 107, B8: 119
};

// Default key signature settings
export const DEFAULT_KEY_SIGNATURE = {
  key: 'C',
  scale: 'major',
  chordProgression: 'I-V-vi-IV',
  octave: 4,
  rootNote: 'C4',
  enabled: true
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

export const ENVELOPE_FOLLOWER_DEFINITIONS = [
  {
    id: 'envFollower1',
    label: 'Envelope Follower 1',
    color: '#ff9f43',
    source: 'lead', // Audio source to follow
    target: 'leadFilter', // Parameter to modulate
    attackTime: 0.01, // 10ms
    releaseTime: 0.1, // 100ms
    sensitivity: 1.0,
    threshold: 0.0,
    gate: false,
    enabled: false
  },
  {
    id: 'envFollower2',
    label: 'Envelope Follower 2',
    color: '#ff6348',
    source: 'bass',
    target: 'bassFilter',
    attackTime: 0.005, // 5ms
    releaseTime: 0.05, // 50ms
    sensitivity: 1.2,
    threshold: 0.1,
    gate: true,
    enabled: false
  },
  {
    id: 'envFollower3',
    label: 'Envelope Follower 3',
    color: '#ff7675',
    source: 'drums',
    target: 'fxSend',
    attackTime: 0.02, // 20ms
    releaseTime: 0.2, // 200ms
    sensitivity: 0.8,
    threshold: 0.05,
    gate: false,
    enabled: false
  },
  {
    id: 'envFollower4',
    label: 'Envelope Follower 4',
    color: '#fd79a8',
    source: 'lead',
    target: 'reverbDecay',
    attackTime: 0.05, // 50ms
    releaseTime: 0.5, // 500ms
    sensitivity: 0.6,
    threshold: 0.15,
    gate: true,
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
    group: 'Key Signature & Scales',
    description: 'Musical key, scale, and chord progression management.',
    controls: [
      {
        id: 'keySignatureEnabled',
        label: 'Enable Key Signature',
        type: 'select',
        options: [
          { value: true, label: 'On' },
          { value: false, label: 'Off' }
        ],
        default: true,
        apply: (value, app) => {
          if (app.keySignature) {
            app.keySignature.setEnabled(value);
          }
        }
      },
      {
        id: 'musicalKey',
        label: 'Musical Key',
        type: 'select',
        options: [
          { value: 'C', label: 'C Major' },
          { value: 'G', label: 'G Major' },
          { value: 'D', label: 'D Major' },
          { value: 'A', label: 'A Major' },
          { value: 'E', label: 'E Major' },
          { value: 'B', label: 'B Major' },
          { value: 'F#', label: 'F# Major' },
          { value: 'F', label: 'F Major' },
          { value: 'Bb', label: 'Bb Major' },
          { value: 'Eb', label: 'Eb Major' },
          { value: 'Ab', label: 'Ab Major' },
          { value: 'Db', label: 'Db Major' },
          { value: 'Am', label: 'A Minor' },
          { value: 'Em', label: 'E Minor' },
          { value: 'Bm', label: 'B Minor' },
          { value: 'F#m', label: 'F# Minor' },
          { value: 'C#m', label: 'C# Minor' },
          { value: 'G#m', label: 'G# Minor' },
          { value: 'D#m', label: 'D# Minor' },
          { value: 'Dm', label: 'D Minor' },
          { value: 'Gm', label: 'G Minor' },
          { value: 'Cm', label: 'C Minor' },
          { value: 'Fm', label: 'F Minor' },
          { value: 'Bbm', label: 'Bb Minor' },
          { value: 'Ebm', label: 'Eb Minor' },
          { value: 'Abm', label: 'Ab Minor' }
        ],
        default: 'C',
        apply: (value, app) => {
          if (app.keySignature) {
            const currentScale = app.keySignature.currentScale;
            app.keySignature.updateKeySignature(value, currentScale);
          }
        }
      },
      {
        id: 'scaleType',
        label: 'Scale Type',
        type: 'select',
        options: [
          { value: 'major', label: 'Major' },
          { value: 'minor', label: 'Minor' },
          { value: 'harmonicMinor', label: 'Harmonic Minor' },
          { value: 'melodicMinor', label: 'Melodic Minor' },
          { value: 'dorian', label: 'Dorian' },
          { value: 'phrygian', label: 'Phrygian' },
          { value: 'lydian', label: 'Lydian' },
          { value: 'mixolydian', label: 'Mixolydian' },
          { value: 'locrian', label: 'Locrian' },
          { value: 'pentatonicMajor', label: 'Pentatonic Major' },
          { value: 'pentatonicMinor', label: 'Pentatonic Minor' },
          { value: 'blues', label: 'Blues' },
          { value: 'chromatic', label: 'Chromatic' }
        ],
        default: 'major',
        apply: (value, app) => {
          if (app.keySignature) {
            const currentKey = app.keySignature.currentKey;
            app.keySignature.updateKeySignature(currentKey, value);
          }
        }
      },
      {
        id: 'chordProgression',
        label: 'Chord Progression',
        type: 'select',
        options: [
          { value: 'I-V-vi-IV', label: 'I-V-vi-IV (Pop)' },
          { value: 'vi-IV-I-V', label: 'vi-IV-I-V (Pop Alt)' },
          { value: 'I-vi-IV-V', label: 'I-vi-IV-V (Classic)' },
          { value: 'ii-V-I', label: 'ii-V-I (Jazz)' },
          { value: 'I-IV-V', label: 'I-IV-V (Blues)' },
          { value: 'I-vi-ii-V', label: 'I-vi-ii-V (Jazz)' },
          { value: 'vi-V-IV-V', label: 'vi-V-IV-V (Pop)' },
          { value: 'I-V-vi-iii-IV', label: 'I-V-vi-iii-IV (Extended)' },
          { value: 'i-iv-V', label: 'i-iv-V (Minor)' },
          { value: 'i-VI-VII-i', label: 'i-VI-VII-i (Minor)' },
          { value: 'i-iv-VII', label: 'i-iv-VII (Minor)' },
          { value: 'i-V-iv-i', label: 'i-V-iv-i (Minor)' }
        ],
        default: 'I-V-vi-IV',
        apply: (value, app) => {
          if (app.keySignature) {
            app.keySignature.setChordProgression(value);
          }
        }
      },
      {
        id: 'octave',
        label: 'Octave',
        type: 'range',
        min: 3,
        max: 6,
        step: 1,
        default: 4,
        format: value => `Octave ${value}`,
        apply: (value, app) => {
          if (app.keySignature) {
            app.keySignature.setOctave(value);
          }
        }
      },
      {
        id: 'melodicPatternType',
        label: 'Melodic Pattern',
        type: 'select',
        options: [
          { value: 'random', label: 'Random' },
          { value: 'ascending', label: 'Ascending' },
          { value: 'descending', label: 'Descending' },
          { value: 'arpeggio', label: 'Arpeggio' }
        ],
        default: 'random',
        apply: (value, app) => {
          if (app.keySignature) {
            app.keySignature.melodicPatternType = value;
          }
        }
      },
      {
        id: 'melodicPatternLength',
        label: 'Pattern Length',
        type: 'range',
        min: 4,
        max: 16,
        step: 1,
        default: 8,
        format: value => `${value} notes`,
        apply: (value, app) => {
          if (app.keySignature) {
            app.keySignature.melodicPatternLength = value;
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
        default: 0.28,
        format: value => `${Math.round(value * 100)}%`,
        apply: (value, app) => {
          app.audio.nodes.reverb.wet.value = value;
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