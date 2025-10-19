// Simple musical key and scale manager with quantization helpers
// Depends on global Tone for note<->midi conversions

export class ScaleManager {
  constructor() {
    this.root = 'C';
    this.scale = 'major';
    this.quantizeEnabled = true;
  }

  setKey(root) {
    if (typeof root !== 'string') return;
    const normalized = this.normalizeRoot(root);
    if (normalized) this.root = normalized;
  }

  setScale(scaleType) {
    if (SCALE_INTERVALS[scaleType]) {
      this.scale = scaleType;
    }
  }

  setQuantizeEnabled(enabled) {
    this.quantizeEnabled = Boolean(enabled);
  }

  getState() {
    return { root: this.root, scale: this.scale, quantize: this.quantizeEnabled };
  }

  normalizeRoot(root) {
    const r = root.trim().toUpperCase();
    // Accept sharps or flats; prefer sharps internally
    if (PITCH_CLASS_TO_SEMITONE.hasOwnProperty(r)) return r;
    // Convert flats to sharps
    const flatMap = { 'DB': 'C#', 'EB': 'D#', 'GB': 'F#', 'AB': 'G#', 'BB': 'A#' };
    if (flatMap[r]) return flatMap[r];
    return null;
  }

  getRootSemitone() {
    return PITCH_CLASS_TO_SEMITONE[this.root] ?? 0;
  }

  getAllowedPitchClasses() {
    const rootSemi = this.getRootSemitone();
    const intervals = SCALE_INTERVALS[this.scale] || SCALE_INTERVALS.major;
    return intervals.map(interval => (rootSemi + interval) % 12);
  }

  quantizeMidi(midi) {
    if (!this.quantizeEnabled) return midi;
    const allowed = this.getAllowedPitchClasses();
    const pc = ((midi % 12) + 12) % 12;
    if (allowed.includes(pc)) return midi;

    let bestMidi = midi;
    let bestDistance = Infinity;
    // Search within +/- 6 semitones for nearest pitch in scale
    for (let delta = -6; delta <= 6; delta++) {
      const candidate = midi + delta;
      const candidatePc = ((candidate % 12) + 12) % 12;
      if (allowed.includes(candidatePc)) {
        const dist = Math.abs(delta);
        if (dist < bestDistance || (dist === bestDistance && delta > 0)) {
          bestDistance = dist;
          bestMidi = candidate;
          if (bestDistance === 0) break;
        }
      }
    }
    return bestMidi;
  }

  quantizeNote(note) {
    try {
      if (Array.isArray(note)) {
        return note.map(n => this.quantizeNote(n));
      }
      const midi = Tone.Frequency(note).toMidi();
      const qMidi = this.quantizeMidi(midi);
      return Tone.Frequency(qMidi, 'midi').toNote();
    } catch (e) {
      return note;
    }
  }

  getScaleNotesInOctave(octave) {
    const allowed = this.getAllowedPitchClasses();
    return allowed.map(pc => {
      const midi = 12 * (octave + 1) + pc; // MIDI octave formula
      return Tone.Frequency(midi, 'midi').toNote();
    });
  }
}

const PITCH_CLASS_TO_SEMITONE = {
  'C': 0,
  'C#': 1,
  'D': 2,
  'D#': 3,
  'E': 4,
  'F': 5,
  'F#': 6,
  'G': 7,
  'G#': 8,
  'A': 9,
  'A#': 10,
  'B': 11
};

// Common scales (intervals within one octave)
const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  natural_minor: [0, 2, 3, 5, 7, 8, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  melodic_minor: [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonic_major: [0, 2, 4, 7, 9],
  pentatonic_minor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10]
};
