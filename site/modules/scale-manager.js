'use strict';

import { STEP_COUNT } from '../utils/constants.js';

// Lightweight music theory utilities and stateful manager
export class ScaleManager {
  constructor(app) {
    this.app = app;

    // Defaults chosen to be musically neutral and common
    this.currentKey = 'C';
    this.currentScale = 'minor'; // natural minor
    this.lockToScale = true;
    this.progressionTemplate = 'i-VI-III-VII';
    this.stepsPerChord = 4; // 1 chord per bar for 16 steps sequencer

    // Cached state
    this._scaleSemitoneSet = this._computeScaleSemitoneSet();
  }

  // Public API
  setKey(key) {
    if (!KEYS.includes(key)) return;
    this.currentKey = key;
    this._scaleSemitoneSet = this._computeScaleSemitoneSet();
    this.applySettingsIfReady();
  }

  setScale(scale) {
    if (!SCALES[scale]) return;
    this.currentScale = scale;
    this._scaleSemitoneSet = this._computeScaleSemitoneSet();
    this.applySettingsIfReady();
  }

  setLockToScale(enabled) {
    this.lockToScale = Boolean(enabled);
    this.applySettingsIfReady();
  }

  setProgressionTemplate(template) {
    if (!PROGRESSIONS[template]) return;
    this.progressionTemplate = template;
    this.applySettingsIfReady();
  }

  setStepsPerChord(steps) {
    const clamped = Math.max(1, Math.min(STEP_COUNT, Math.floor(steps)));
    this.stepsPerChord = clamped;
    this.applySettingsIfReady();
  }

  // Call once when audio engine is fully initialized
  onAudioReady() {
    this.applySettingsIfReady(true);
  }

  // Persist/restore
  exportState() {
    return {
      key: this.currentKey,
      scale: this.currentScale,
      lockToScale: this.lockToScale,
      progressionTemplate: this.progressionTemplate,
      stepsPerChord: this.stepsPerChord
    };
  }

  importState(state) {
    if (!state || typeof state !== 'object') return;
    if (state.key && KEYS.includes(state.key)) this.currentKey = state.key;
    if (state.scale && SCALES[state.scale]) this.currentScale = state.scale;
    if (typeof state.lockToScale === 'boolean') this.lockToScale = state.lockToScale;
    if (state.progressionTemplate && PROGRESSIONS[state.progressionTemplate]) {
      this.progressionTemplate = state.progressionTemplate;
    }
    if (Number.isFinite(state.stepsPerChord)) {
      this.stepsPerChord = Math.max(1, Math.min(STEP_COUNT, Math.floor(state.stepsPerChord)));
    }
    this._scaleSemitoneSet = this._computeScaleSemitoneSet();
    this.applySettingsIfReady(true);
  }

  // Core operations
  applySettingsIfReady(force = false) {
    const audio = this.app?.audio;
    if (!audio) return;
    if (!force && !audio.audioInitialized) return;

    if (this.lockToScale) {
      this.quantizeExistingSequences();
    }
    this.applyChordProgressionToSequences();
    if (this.app?.status) {
      const name = getScaleDisplayName(this.currentKey, this.currentScale);
      this.app.status.set(`Applied ${name} (${this.progressionTemplate})`);
    }
  }

  quantizeExistingSequences() {
    const audio = this.app?.audio;
    if (!audio?.sequences?.byInstrument) return;
    ['bass', 'lead'].forEach(inst => {
      const seq = audio.sequences.byInstrument[inst];
      if (!seq) return;
      const pattern = this._extractPatternFromSequence(seq);
      const quantized = this._quantizePattern(pattern);
      this._applyPatternToSequence(seq, quantized);
    });
  }

  applyChordProgressionToSequences() {
    const audio = this.app?.audio;
    if (!audio?.sequences?.byInstrument) return;

    const chords = this._buildChordProgression();

    // Build lead pattern: chord stabs on chord starts
    const leadPattern = new Array(STEP_COUNT).fill(null);
    chords.forEach(({ stepIndex, chord }) => {
      leadPattern[stepIndex] = chord;
    });

    // Build bass pattern: root notes with occasional passing note
    const bassPattern = new Array(STEP_COUNT).fill(null);
    chords.forEach(({ stepIndex, chord }, idx) => {
      const root = chord[0];
      bassPattern[stepIndex] = shiftNoteOctave(root, -1);
      // Optional passing on mid-step if space allows
      const mid = stepIndex + Math.floor(this.stepsPerChord / 2);
      if (mid < STEP_COUNT) {
        const next = chords[(idx + 1) % chords.length].chord[0];
        const approach = this._nearestScaleNeighbor(shiftNoteOctave(next, -1), shiftNoteOctave(root, -1));
        if (approach) bassPattern[mid] = approach;
      }
    });

    // Apply to sequences (overwrite values)
    const leadSeq = audio.sequences.byInstrument.lead;
    const bassSeq = audio.sequences.byInstrument.bass;
    if (leadSeq) this._applyPatternToSequence(leadSeq, leadPattern);
    if (bassSeq) this._applyPatternToSequence(bassSeq, bassPattern);
  }

  // Internal helpers
  _buildChordProgression() {
    const degrees = PROGRESSIONS[this.progressionTemplate] || PROGRESSIONS['i-VI-III-VII'];
    const chordStarts = [];
    for (let step = 0, i = 0; step < STEP_COUNT; step += this.stepsPerChord, i++) {
      const degreeSymbol = degrees[i % degrees.length];
      const chord = this._degreeToChord(degreeSymbol, 4); // lead at 4th octave
      chordStarts.push({ stepIndex: step, chord });
    }
    return chordStarts;
  }

  _degreeToChord(degreeSymbol, baseOctave = 4) {
    // Convert Roman numeral to scale degree index and chord quality via diatonic triad stacking
    const degreeIndex = romanToDegreeIndex(degreeSymbol);
    const scale = this._getScaleSemitones();
    const keyRoot = NOTE_TO_SEMITONE[this.currentKey];
    // Build diatonic triad: 1-3-5 from the degree within the scale
    const triadDegs = [0, 2, 4].map(offset => (degreeIndex + offset));
    const notes = triadDegs.map((deg, idx) => {
      // Compute how many scale wrap-arounds occurred to set octave jumps
      const wraps = Math.floor(deg / scale.length);
      const scaleDegree = deg % scale.length;
      const semitone = keyRoot + scale[scaleDegree] + wraps * 12;
      const midi = 12 * (baseOctave + 1) + semitone; // C0 = 12
      return midiToNoteName(midi);
    });
    // Ensure ascending chord voicing
    notes.sort((a, b) => noteToMidi(a) - noteToMidi(b));
    return notes;
  }

  _quantizePattern(pattern) {
    return pattern.map(step => {
      if (!step) return step;
      if (Array.isArray(step)) {
        return step.map(n => this._quantizeNote(n));
      }
      if (typeof step === 'string') {
        return this._quantizeNote(step);
      }
      return step;
    });
  }

  _quantizeNote(noteName) {
    const midi = noteToMidi(noteName);
    if (!Number.isFinite(midi)) return noteName;
    const nearest = this._nearestScaleMidi(midi);
    return midiToNoteName(nearest);
  }

  _nearestScaleNeighbor(targetNote, referenceNote) {
    const targetMidi = noteToMidi(targetNote);
    const refMidi = noteToMidi(referenceNote);
    if (!Number.isFinite(targetMidi) || !Number.isFinite(refMidi)) return null;
    const scaleSet = this._getScaleMidiSet(1, 5);
    let best = scaleSet[0];
    let bestDist = Infinity;
    scaleSet.forEach(m => {
      const d = Math.abs(m - targetMidi);
      if (d < bestDist) {
        bestDist = d;
        best = m;
      }
    });
    // Keep direction towards target but closer to reference octave region
    const preferred = (best + refMidi) / 2;
    const nearest = this._nearestScaleMidi(Math.round(preferred));
    return midiToNoteName(nearest);
  }

  _nearestScaleMidi(midi) {
    const scaleMidis = this._getScaleMidiSet(1, 7);
    let nearest = scaleMidis[0];
    let diff = Math.abs(midi - nearest);
    for (let i = 1; i < scaleMidis.length; i++) {
      const d = Math.abs(midi - scaleMidis[i]);
      if (d < diff) {
        diff = d;
        nearest = scaleMidis[i];
      }
    }
    return nearest;
  }

  _extractPatternFromSequence(sequence) {
    // Prefer values if available, otherwise reconstruct from events
    if (Array.isArray(sequence.values)) {
      return [...sequence.values];
    }
    if (Array.isArray(sequence.events)) {
      const arr = new Array(STEP_COUNT).fill(null);
      sequence.events.forEach(evt => {
        const step = Math.round((evt.time || 0) / 0.25);
        if (step >= 0 && step < STEP_COUNT) arr[step] = evt.value;
      });
      return arr;
    }
    return new Array(STEP_COUNT).fill(null);
  }

  _applyPatternToSequence(sequence, pattern) {
    // Normalize to events array with 16n grid
    sequence.events = pattern.map((value, i) => ({ time: i * 0.25, value }));
  }

  _getScaleSemitones() {
    return SCALES[this.currentScale];
  }

  _computeScaleSemitoneSet() {
    const root = NOTE_TO_SEMITONE[this.currentKey];
    const scale = this._getScaleSemitones();
    return new Set(scale.map(s => ((root + s) % 12 + 12) % 12));
  }

  _getScaleMidiSet(fromOctave = 1, toOctave = 6) {
    const set = [];
    const root = NOTE_TO_SEMITONE[this.currentKey];
    const scale = this._getScaleSemitones();
    for (let oct = fromOctave; oct <= toOctave; oct++) {
      const base = 12 * (oct + 1); // C0 = 12
      for (let i = 0; i < scale.length; i++) {
        set.push(base + root + scale[i]);
      }
    }
    return set.sort((a, b) => a - b);
  }
}

// Static definitions
export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10], // natural minor
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  pentatonic_major: [0, 2, 4, 7, 9],
  pentatonic_minor: [0, 3, 5, 7, 10]
};

// Progression templates (major/minor centric)
export const PROGRESSIONS = {
  'I-V-vi-IV': ['I', 'V', 'vi', 'IV'],
  'ii-V-I-vi': ['ii', 'V', 'I', 'vi'],
  'i-VI-III-VII': ['i', 'VI', 'III', 'VII'],
  'i-iv-VII-VI': ['i', 'iv', 'VII', 'VI'],
  'I-III-VI-VII': ['I', 'III', 'VI', 'VII'],
  'I-vi-ii-V': ['I', 'vi', 'ii', 'V']
};

// Utilities
const NOTE_TO_SEMITONE = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
  'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
};

function parseNote(note) {
  if (typeof note !== 'string') return null;
  const m = note.match(/^([A-G])(#?)(-?\d+)$/);
  if (!m) return null;
  const letter = m[1] + (m[2] || '');
  const octave = parseInt(m[3], 10);
  if (!(letter in NOTE_TO_SEMITONE)) return null;
  return { letter, octave, semitone: NOTE_TO_SEMITONE[letter] };
}

function noteToMidi(note) {
  const p = parseNote(note);
  if (!p) return NaN;
  return 12 * (p.octave + 1) + p.semitone;
}

function midiToNoteName(midi) {
  const semitone = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const name = Object.keys(NOTE_TO_SEMITONE).find(k => NOTE_TO_SEMITONE[k] === semitone) || 'C';
  return `${name}${octave}`;
}

function shiftNoteOctave(note, deltaOctaves) {
  const midi = noteToMidi(note);
  if (!Number.isFinite(midi)) return note;
  return midiToNoteName(midi + deltaOctaves * 12);
}

function romanToDegreeIndex(sym) {
  // Supports I..VII with case; maps to 0-based degree index
  const map = { 'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6 };
  const up = sym.toUpperCase();
  return map[up] ?? 0;
}

function getScaleDisplayName(key, scale) {
  const scaleNames = {
    major: 'Major',
    minor: 'Minor',
    dorian: 'Dorian',
    phrygian: 'Phrygian',
    lydian: 'Lydian',
    mixolydian: 'Mixolydian',
    locrian: 'Locrian',
    pentatonic_major: 'Pentatonic Major',
    pentatonic_minor: 'Pentatonic Minor'
  };
  return `${key} ${scaleNames[scale] || scale}`;
}

export { noteToMidi, midiToNoteName, getScaleDisplayName };
