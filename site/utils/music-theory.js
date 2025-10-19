// Music Theory Constants and Utilities
// Comprehensive scale and key management for chord progression tools

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Scale definitions with semitone intervals
export const SCALE_TYPES = {
  // Major scales
  'major': { intervals: [0, 2, 4, 5, 7, 9, 11], name: 'Major', mode: 'ionian' },
  'natural_minor': { intervals: [0, 2, 3, 5, 7, 8, 10], name: 'Natural Minor', mode: 'aeolian' },
  'harmonic_minor': { intervals: [0, 2, 3, 5, 7, 8, 11], name: 'Harmonic Minor', mode: 'harmonic_minor' },
  'melodic_minor': { intervals: [0, 2, 3, 5, 7, 9, 11], name: 'Melodic Minor', mode: 'melodic_minor' },
  
  // Modes
  'dorian': { intervals: [0, 2, 3, 5, 7, 9, 10], name: 'Dorian', mode: 'dorian' },
  'phrygian': { intervals: [0, 1, 3, 5, 7, 8, 10], name: 'Phrygian', mode: 'phrygian' },
  'lydian': { intervals: [0, 2, 4, 6, 7, 9, 11], name: 'Lydian', mode: 'lydian' },
  'mixolydian': { intervals: [0, 2, 4, 5, 7, 9, 10], name: 'Mixolydian', mode: 'mixolydian' },
  'locrian': { intervals: [0, 1, 3, 5, 6, 8, 10], name: 'Locrian', mode: 'locrian' },
  
  // Pentatonic scales
  'major_pentatonic': { intervals: [0, 2, 4, 7, 9], name: 'Major Pentatonic', mode: 'pentatonic' },
  'minor_pentatonic': { intervals: [0, 3, 5, 7, 10], name: 'Minor Pentatonic', mode: 'pentatonic' },
  
  // Blues scales
  'blues': { intervals: [0, 3, 5, 6, 7, 10], name: 'Blues', mode: 'blues' },
  'major_blues': { intervals: [0, 2, 3, 4, 7, 9], name: 'Major Blues', mode: 'blues' },
  
  // Exotic scales
  'whole_tone': { intervals: [0, 2, 4, 6, 8, 10], name: 'Whole Tone', mode: 'exotic' },
  'diminished': { intervals: [0, 2, 3, 5, 6, 8, 9, 11], name: 'Diminished', mode: 'exotic' },
  'augmented': { intervals: [0, 3, 4, 7, 8, 11], name: 'Augmented', mode: 'exotic' },
  'chromatic': { intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], name: 'Chromatic', mode: 'exotic' },
  
  // Electronic music scales
  'phrygian_dominant': { intervals: [0, 1, 4, 5, 7, 8, 10], name: 'Phrygian Dominant', mode: 'exotic' },
  'double_harmonic': { intervals: [0, 1, 4, 5, 7, 8, 11], name: 'Double Harmonic', mode: 'exotic' },
  'hungarian_minor': { intervals: [0, 2, 3, 6, 7, 8, 11], name: 'Hungarian Minor', mode: 'exotic' }
};

// Chord types with their intervals from root
export const CHORD_TYPES = {
  // Triads
  'major': { intervals: [0, 4, 7], name: 'Major', symbol: '' },
  'minor': { intervals: [0, 3, 7], name: 'Minor', symbol: 'm' },
  'diminished': { intervals: [0, 3, 6], name: 'Diminished', symbol: 'dim' },
  'augmented': { intervals: [0, 4, 8], name: 'Augmented', symbol: 'aug' },
  'sus2': { intervals: [0, 2, 7], name: 'Sus2', symbol: 'sus2' },
  'sus4': { intervals: [0, 5, 7], name: 'Sus4', symbol: 'sus4' },
  
  // Seventh chords
  'major7': { intervals: [0, 4, 7, 11], name: 'Major 7', symbol: 'maj7' },
  'minor7': { intervals: [0, 3, 7, 10], name: 'Minor 7', symbol: 'm7' },
  'dominant7': { intervals: [0, 4, 7, 10], name: 'Dominant 7', symbol: '7' },
  'diminished7': { intervals: [0, 3, 6, 9], name: 'Diminished 7', symbol: 'dim7' },
  'half_diminished7': { intervals: [0, 3, 6, 10], name: 'Half Diminished 7', symbol: 'm7b5' },
  'augmented7': { intervals: [0, 4, 8, 10], name: 'Augmented 7', symbol: 'aug7' },
  'minor_major7': { intervals: [0, 3, 7, 11], name: 'Minor Major 7', symbol: 'mM7' },
  
  // Extended chords
  'major9': { intervals: [0, 4, 7, 11, 14], name: 'Major 9', symbol: 'maj9' },
  'minor9': { intervals: [0, 3, 7, 10, 14], name: 'Minor 9', symbol: 'm9' },
  'dominant9': { intervals: [0, 4, 7, 10, 14], name: 'Dominant 9', symbol: '9' },
  'major11': { intervals: [0, 4, 7, 11, 14, 17], name: 'Major 11', symbol: 'maj11' },
  'minor11': { intervals: [0, 3, 7, 10, 14, 17], name: 'Minor 11', symbol: 'm11' },
  'dominant11': { intervals: [0, 4, 7, 10, 14, 17], name: 'Dominant 11', symbol: '11' },
  'major13': { intervals: [0, 4, 7, 11, 14, 17, 21], name: 'Major 13', symbol: 'maj13' },
  'minor13': { intervals: [0, 3, 7, 10, 14, 17, 21], name: 'Minor 13', symbol: 'm13' },
  'dominant13': { intervals: [0, 4, 7, 10, 14, 17, 21], name: 'Dominant 13', symbol: '13' },
  
  // Altered chords
  '7b5': { intervals: [0, 4, 6, 10], name: '7b5', symbol: '7b5' },
  '7#5': { intervals: [0, 4, 8, 10], name: '7#5', symbol: '7#5' },
  '7b9': { intervals: [0, 4, 7, 10, 13], name: '7b9', symbol: '7b9' },
  '7#9': { intervals: [0, 4, 7, 10, 15], name: '7#9', symbol: '7#9' },
  '7#11': { intervals: [0, 4, 7, 10, 18], name: '7#11', symbol: '7#11' },
  '7b13': { intervals: [0, 4, 7, 10, 20], name: '7b13', symbol: '7b13' }
};

// Common chord progressions
export const CHORD_PROGRESSIONS = {
  // Major key progressions
  'major_2_5_1': { 
    name: 'II-V-I (Major)', 
    chords: ['ii', 'V', 'I'], 
    description: 'Classic jazz progression' 
  },
  'major_1_6_4_5': { 
    name: 'I-vi-IV-V', 
    chords: ['I', 'vi', 'IV', 'V'], 
    description: 'Pop progression' 
  },
  'major_1_5_6_4': { 
    name: 'I-V-vi-IV', 
    chords: ['I', 'V', 'vi', 'IV'], 
    description: 'Modern pop progression' 
  },
  'major_1_4_5': { 
    name: 'I-IV-V', 
    chords: ['I', 'IV', 'V'], 
    description: 'Basic major progression' 
  },
  'major_2_5_1_6': { 
    name: 'II-V-I-vi', 
    chords: ['ii', 'V', 'I', 'vi'], 
    description: 'Extended jazz progression' 
  },
  
  // Minor key progressions
  'minor_2_5_1': { 
    name: 'II-V-i (Minor)', 
    chords: ['ii', 'V', 'i'], 
    description: 'Minor jazz progression' 
  },
  'minor_1_6_4_5': { 
    name: 'i-vi-IV-V', 
    chords: ['i', 'vi', 'IV', 'V'], 
    description: 'Minor pop progression' 
  },
  'minor_1_4_5': { 
    name: 'i-iv-V', 
    chords: ['i', 'iv', 'V'], 
    description: 'Basic minor progression' 
  },
  'minor_1_5_6_4': { 
    name: 'i-V-vi-IV', 
    chords: ['i', 'V', 'vi', 'IV'], 
    description: 'Minor modern progression' 
  },
  
  // Electronic music progressions
  'electronic_1_5_6_4': { 
    name: 'I-V-vi-IV (Electronic)', 
    chords: ['I', 'V', 'vi', 'IV'], 
    description: 'Electronic dance music' 
  },
  'electronic_minor_1_5_6_4': { 
    name: 'i-V-vi-IV (Minor Electronic)', 
    chords: ['i', 'V', 'vi', 'IV'], 
    description: 'Minor electronic progression' 
  },
  'electronic_1_4_1_5': { 
    name: 'I-IV-I-V', 
    chords: ['I', 'IV', 'I', 'V'], 
    description: 'Simple electronic loop' 
  },
  'electronic_1_6_2_5': { 
    name: 'I-vi-ii-V', 
    chords: ['I', 'vi', 'ii', 'V'], 
    description: 'Jazz-influenced electronic' 
  },
  
  // Modal progressions
  'dorian_1_4_1_5': { 
    name: 'I-IV-I-V (Dorian)', 
    chords: ['i', 'IV', 'i', 'V'], 
    description: 'Dorian mode progression' 
  },
  'phrygian_1_2_3_4': { 
    name: 'i-II-III-iv (Phrygian)', 
    chords: ['i', 'II', 'III', 'iv'], 
    description: 'Phrygian mode progression' 
  },
  'lydian_1_2_1_5': { 
    name: 'I-II-I-V (Lydian)', 
    chords: ['I', 'II', 'I', 'V'], 
    description: 'Lydian mode progression' 
  },
  'mixolydian_1_4_1_5': { 
    name: 'I-IV-I-v (Mixolydian)', 
    chords: ['I', 'IV', 'I', 'v'], 
    description: 'Mixolydian mode progression' 
  }
};

// Key signatures
export const KEY_SIGNATURES = {
  'C': { sharps: 0, flats: 0, relative: 'Am' },
  'G': { sharps: 1, flats: 0, relative: 'Em' },
  'D': { sharps: 2, flats: 0, relative: 'Bm' },
  'A': { sharps: 3, flats: 0, relative: 'F#m' },
  'E': { sharps: 4, flats: 0, relative: 'C#m' },
  'B': { sharps: 5, flats: 0, relative: 'G#m' },
  'F#': { sharps: 6, flats: 0, relative: 'D#m' },
  'C#': { sharps: 7, flats: 0, relative: 'A#m' },
  'F': { sharps: 0, flats: 1, relative: 'Dm' },
  'Bb': { sharps: 0, flats: 2, relative: 'Gm' },
  'Eb': { sharps: 0, flats: 3, relative: 'Cm' },
  'Ab': { sharps: 0, flats: 4, relative: 'Fm' },
  'Db': { sharps: 0, flats: 5, relative: 'Bbm' },
  'Gb': { sharps: 0, flats: 6, relative: 'Ebm' },
  'Cb': { sharps: 0, flats: 7, relative: 'Abm' }
};

// Utility functions
export function noteToMidi(note, octave = 4) {
  const noteIndex = NOTES.indexOf(note.replace(/b/g, '#').replace(/##/g, '#'));
  if (noteIndex === -1) return null;
  return (octave + 1) * 12 + noteIndex;
}

export function midiToNote(midiNumber) {
  const octave = Math.floor(midiNumber / 12) - 1;
  const noteIndex = midiNumber % 12;
  return {
    note: NOTES[noteIndex],
    octave: octave
  };
}

export function getNoteWithOctave(note, octave) {
  return `${note}${octave}`;
}

export function transposeNote(note, semitones) {
  const noteIndex = NOTES.indexOf(note.replace(/b/g, '#').replace(/##/g, '#'));
  if (noteIndex === -1) return note;
  
  const newIndex = (noteIndex + semitones) % 12;
  const octaveShift = Math.floor((noteIndex + semitones) / 12);
  
  return {
    note: NOTES[newIndex < 0 ? newIndex + 12 : newIndex],
    octaveShift: octaveShift
  };
}

export function getScaleNotes(rootNote, scaleType, octave = 4) {
  const scale = SCALE_TYPES[scaleType];
  if (!scale) return [];
  
  const rootIndex = NOTES.indexOf(rootNote.replace(/b/g, '#').replace(/##/g, '#'));
  if (rootIndex === -1) return [];
  
  return scale.intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    const octaveShift = Math.floor((rootIndex + interval) / 12);
    return {
      note: NOTES[noteIndex],
      octave: octave + octaveShift,
      fullNote: `${NOTES[noteIndex]}${octave + octaveShift}`
    };
  });
}

export function getChordNotes(rootNote, chordType, octave = 4) {
  const chord = CHORD_TYPES[chordType];
  if (!chord) return [];
  
  const rootIndex = NOTES.indexOf(rootNote.replace(/b/g, '#').replace(/##/g, '#'));
  if (rootIndex === -1) return [];
  
  return chord.intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    const octaveShift = Math.floor((rootIndex + interval) / 12);
    return {
      note: NOTES[noteIndex],
      octave: octave + octaveShift,
      fullNote: `${NOTES[noteIndex]}${octave + octaveShift}`
    };
  });
}

export function getRomanNumeral(scaleDegree, isMajor = true) {
  const numerals = isMajor 
    ? ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
    : ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
  return numerals[(scaleDegree - 1) % 7];
}

export function getChordFromRomanNumeral(romanNumeral, key, scaleType = 'major') {
  const scale = SCALE_TYPES[scaleType];
  if (!scale) return null;
  
  const keyIndex = NOTES.indexOf(key.replace(/b/g, '#').replace(/##/g, '#'));
  if (keyIndex === -1) return null;
  
  const degree = parseInt(romanNumeral.replace(/[iv]/g, '')) - 1;
  if (degree < 0 || degree >= 7) return null;
  
  const rootNote = NOTES[(keyIndex + scale.intervals[degree]) % 12];
  
  // Determine chord type based on scale degree and scale type
  let chordType = 'major';
  if (scaleType === 'major') {
    const chordTypes = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];
    chordType = chordTypes[degree];
  } else if (scaleType === 'natural_minor') {
    const chordTypes = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'];
    chordType = chordTypes[degree];
  }
  
  return {
    root: rootNote,
    type: chordType,
    symbol: `${rootNote}${CHORD_TYPES[chordType]?.symbol || ''}`
  };
}

export function analyzeChordProgression(progression, key, scaleType = 'major') {
  return progression.map(romanNumeral => 
    getChordFromRomanNumeral(romanNumeral, key, scaleType)
  ).filter(Boolean);
}

export function generateChordProgression(progressionName, key, scaleType = 'major', octave = 4) {
  const progression = CHORD_PROGRESSIONS[progressionName];
  if (!progression) return [];
  
  const chords = analyzeChordProgression(progression.chords, key, scaleType);
  
  return chords.map(chord => ({
    ...chord,
    notes: getChordNotes(chord.root, chord.type, octave)
  }));
}

export function getScaleChords(key, scaleType = 'major', octave = 4) {
  const scale = SCALE_TYPES[scaleType];
  if (!scale) return [];
  
  const keyIndex = NOTES.indexOf(key.replace(/b/g, '#').replace(/##/g, '#'));
  if (keyIndex === -1) return [];
  
  const chords = [];
  for (let i = 0; i < 7; i++) {
    const rootNote = NOTES[(keyIndex + scale.intervals[i]) % 12];
    const octaveShift = Math.floor((keyIndex + scale.intervals[i]) / 12);
    
    // Determine chord type based on scale degree and scale type
    let chordType = 'major';
    if (scaleType === 'major') {
      const chordTypes = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];
      chordType = chordTypes[i];
    } else if (scaleType === 'natural_minor') {
      const chordTypes = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'];
      chordType = chordTypes[i];
    }
    
    chords.push({
      degree: i + 1,
      romanNumeral: getRomanNumeral(i + 1, scaleType === 'major'),
      root: rootNote,
      type: chordType,
      symbol: `${rootNote}${CHORD_TYPES[chordType]?.symbol || ''}`,
      notes: getChordNotes(rootNote, chordType, octave + octaveShift)
    });
  }
  
  return chords;
}

export function detectKey(notes, scaleType = 'major') {
  // Simple key detection based on note frequency
  const noteCounts = {};
  notes.forEach(note => {
    const baseNote = note.replace(/\d+/, '');
    noteCounts[baseNote] = (noteCounts[baseNote] || 0) + 1;
  });
  
  // Find the most common note as potential root
  const mostCommonNote = Object.keys(noteCounts).reduce((a, b) => 
    noteCounts[a] > noteCounts[b] ? a : b
  );
  
  return mostCommonNote;
}

export function transposeProgression(progression, semitones) {
  return progression.map(chord => ({
    ...chord,
    root: transposeNote(chord.root, semitones).note,
    notes: chord.notes.map(note => {
      const transposed = transposeNote(note.note, semitones);
      return {
        ...note,
        note: transposed.note,
        octave: note.octave + transposed.octaveShift,
        fullNote: `${transposed.note}${note.octave + transposed.octaveShift}`
      };
    })
  }));
}