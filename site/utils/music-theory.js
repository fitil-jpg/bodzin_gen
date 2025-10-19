// Music theory utilities: notes, scales, quantization, chords

const PITCH_CLASSES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PITCH_CLASS_TO_INDEX = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11
};

export const SUPPORTED_SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  natural_minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  melodic_minor: [0, 2, 3, 5, 7, 9, 11],
  major_pentatonic: [0, 2, 4, 7, 9],
  minor_pentatonic: [0, 3, 5, 7, 10]
};

export function parseNote(note) {
  const m = /^\s*([A-Ga-g])([#b]?)(-?\d+)\s*$/.exec(note);
  if (!m) return null;
  const letter = m[1].toUpperCase();
  const accidental = m[2] || '';
  const octave = parseInt(m[3], 10);
  const pc = `${letter}${accidental}`;
  const pitchClass = PITCH_CLASS_TO_INDEX.hasOwnProperty(pc) ? pc : letter;
  return { pitchClass, octave };
}

export function noteToMidi(note) {
  const parsed = parseNote(note);
  if (!parsed) return null;
  const pcIndex = PITCH_CLASS_TO_INDEX[parsed.pitchClass];
  return pcIndex + (parsed.octave + 1) * 12;
}

export function midiToNote(midi, useSharps = true) {
  const octave = Math.floor(midi / 12) - 1;
  const pcIndex = ((midi % 12) + 12) % 12;
  const pc = PITCH_CLASSES_SHARP[pcIndex];
  return `${pc}${octave}`;
}

export function getScaleIntervals(scaleType) {
  return SUPPORTED_SCALES[scaleType] || SUPPORTED_SCALES.major;
}

export function getRootPcIndex(root) {
  const rootPc = root.trim();
  const idx = PITCH_CLASS_TO_INDEX[rootPc];
  return Number.isInteger(idx) ? idx : 0;
}

export function buildScalePitchClasses(root, scaleType) {
  const rootIndex = getRootPcIndex(root);
  const intervals = getScaleIntervals(scaleType);
  return intervals.map(semi => (rootIndex + semi) % 12);
}

export function buildScaleNotesInRange(root, scaleType, minMidi, maxMidi) {
  const scalePcs = buildScalePitchClasses(root, scaleType);
  const notes = [];
  for (let m = minMidi; m <= maxMidi; m++) {
    const pc = ((m % 12) + 12) % 12;
    if (scalePcs.includes(pc)) notes.push(m);
  }
  return notes;
}

export function quantizeMidiToScale(midi, root, scaleType) {
  const scalePcs = buildScalePitchClasses(root, scaleType);
  const targetPc = ((midi % 12) + 12) % 12;
  if (scalePcs.includes(targetPc)) return midi;
  // Find nearest midi with an allowed pitch-class
  let offset = 1;
  while (offset < 12) {
    const up = midi + offset;
    const down = midi - offset;
    if (scalePcs.includes(((up % 12) + 12) % 12)) return up;
    if (scalePcs.includes(((down % 12) + 12) % 12)) return down;
    offset += 1;
  }
  return midi; // fallback
}

export function getScaleDegreeMidi(root, scaleType, degree, octave) {
  const intervals = getScaleIntervals(scaleType);
  const scaleLen = intervals.length;
  const degreeIndex0 = (Math.max(1, degree) - 1);
  const cycles = Math.floor(degreeIndex0 / scaleLen);
  const within = degreeIndex0 % scaleLen;
  const rootMidi = getRootPcIndex(root) + (octave + 1) * 12;
  return rootMidi + intervals[within] + cycles * 12;
}

export function buildDiatonicTriad(root, scaleType, degree, baseOctave) {
  const rootMidi = getScaleDegreeMidi(root, scaleType, degree, baseOctave);
  const thirdMidi = getScaleDegreeMidi(root, scaleType, degree + 2, baseOctave);
  const fifthMidi = getScaleDegreeMidi(root, scaleType, degree + 4, baseOctave);
  return [rootMidi, thirdMidi, fifthMidi];
}

export function pickDegreesProgression(scaleType) {
  // Simple, musical defaults
  const isMinor = scaleType.includes('minor');
  const candidates = isMinor
    ? [ [1, 6, 7, 1], [1, 4, 5, 1], [1, 3, 7, 1] ]
    : [ [1, 6, 4, 5], [1, 5, 6, 4], [1, 4, 5, 1] ];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function constrainToRange(midi, minMidi, maxMidi) {
  let m = midi;
  while (m < minMidi) m += 12;
  while (m > maxMidi) m -= 12;
  return m;
}

export function getDefaultKey() { return 'C'; }
export function getDefaultScale() { return 'major'; }

export function listKeys() {
  return ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
}

export function listScales() {
  return [
    { value: 'major', label: 'Major' },
    { value: 'natural_minor', label: 'Natural Minor' },
    { value: 'dorian', label: 'Dorian' },
    { value: 'mixolydian', label: 'Mixolydian' },
    { value: 'harmonic_minor', label: 'Harmonic Minor' },
    { value: 'melodic_minor', label: 'Melodic Minor' },
    { value: 'major_pentatonic', label: 'Major Pentatonic' },
    { value: 'minor_pentatonic', label: 'Minor Pentatonic' }
  ];
}
