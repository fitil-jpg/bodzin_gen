/**
 * Scale & Key Management Module
 * Manages musical scales, keys, and provides key-related utilities
 */

export class ScaleKeyManager {
  constructor() {
    this.currentKey = 'C';
    this.currentMode = 'major';
    this.availableModes = this.initializeModes();
    this.availableKeys = this.initializeKeys();
    this.scalePatterns = this.initializeScalePatterns();
    this.keySignatures = this.initializeKeySignatures();
  }

  /**
   * Initialize available musical modes
   */
  initializeModes() {
    return {
      major: {
        name: 'Major',
        pattern: [0, 2, 4, 5, 7, 9, 11],
        description: 'Bright, happy, uplifting'
      },
      minor: {
        name: 'Natural Minor',
        pattern: [0, 2, 3, 5, 7, 8, 10],
        description: 'Dark, sad, mysterious'
      },
      dorian: {
        name: 'Dorian',
        pattern: [0, 2, 3, 5, 7, 9, 10],
        description: 'Jazz, folk, modal'
      },
      phrygian: {
        name: 'Phrygian',
        pattern: [0, 1, 3, 5, 7, 8, 10],
        description: 'Spanish, flamenco, exotic'
      },
      lydian: {
        name: 'Lydian',
        pattern: [0, 2, 4, 6, 7, 9, 11],
        description: 'Dreamy, floating, ethereal'
      },
      mixolydian: {
        name: 'Mixolydian',
        pattern: [0, 2, 4, 5, 7, 9, 10],
        description: 'Blues, rock, dominant'
      },
      locrian: {
        name: 'Locrian',
        pattern: [0, 1, 3, 5, 6, 8, 10],
        description: 'Unstable, tense, rarely used'
      },
      harmonic_minor: {
        name: 'Harmonic Minor',
        pattern: [0, 2, 3, 5, 7, 8, 11],
        description: 'Classical, dramatic, exotic'
      },
      melodic_minor: {
        name: 'Melodic Minor',
        pattern: [0, 2, 3, 5, 7, 9, 11],
        description: 'Jazz, ascending minor'
      },
      pentatonic_major: {
        name: 'Major Pentatonic',
        pattern: [0, 2, 4, 7, 9],
        description: 'Simple, folk, Asian'
      },
      pentatonic_minor: {
        name: 'Minor Pentatonic',
        pattern: [0, 3, 5, 7, 10],
        description: 'Blues, rock, simple'
      },
      blues: {
        name: 'Blues Scale',
        pattern: [0, 3, 5, 6, 7, 10],
        description: 'Blues, jazz, expressive'
      },
      whole_tone: {
        name: 'Whole Tone',
        pattern: [0, 2, 4, 6, 8, 10],
        description: 'Dreamy, floating, Debussy'
      },
      chromatic: {
        name: 'Chromatic',
        pattern: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        description: 'All notes, atonal'
      }
    };
  }

  /**
   * Initialize available keys
   */
  initializeKeys() {
    return [
      'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
    ];
  }

  /**
   * Initialize scale patterns
   */
  initializeScalePatterns() {
    return {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      dorian: [0, 2, 3, 5, 7, 9, 10],
      phrygian: [0, 1, 3, 5, 7, 8, 10],
      lydian: [0, 2, 4, 6, 7, 9, 11],
      mixolydian: [0, 2, 4, 5, 7, 9, 10],
      locrian: [0, 1, 3, 5, 6, 8, 10],
      harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
      melodic_minor: [0, 2, 3, 5, 7, 9, 11],
      pentatonic_major: [0, 2, 4, 7, 9],
      pentatonic_minor: [0, 3, 5, 7, 10],
      blues: [0, 3, 5, 6, 7, 10],
      whole_tone: [0, 2, 4, 6, 8, 10],
      chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    };
  }

  /**
   * Initialize key signatures
   */
  initializeKeySignatures() {
    return {
      'C': { sharps: 0, flats: 0, notes: [] },
      'G': { sharps: 1, flats: 0, notes: ['F#'] },
      'D': { sharps: 2, flats: 0, notes: ['F#', 'C#'] },
      'A': { sharps: 3, flats: 0, notes: ['F#', 'C#', 'G#'] },
      'E': { sharps: 4, flats: 0, notes: ['F#', 'C#', 'G#', 'D#'] },
      'B': { sharps: 5, flats: 0, notes: ['F#', 'C#', 'G#', 'D#', 'A#'] },
      'F#': { sharps: 6, flats: 0, notes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'] },
      'C#': { sharps: 7, flats: 0, notes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'] },
      'F': { sharps: 0, flats: 1, notes: ['Bb'] },
      'Bb': { sharps: 0, flats: 2, notes: ['Bb', 'Eb'] },
      'Eb': { sharps: 0, flats: 3, notes: ['Bb', 'Eb', 'Ab'] },
      'Ab': { sharps: 0, flats: 4, notes: ['Bb', 'Eb', 'Ab', 'Db'] },
      'Db': { sharps: 0, flats: 5, notes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
      'Gb': { sharps: 0, flats: 6, notes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'] },
      'Cb': { sharps: 0, flats: 7, notes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'] }
    };
  }

  /**
   * Get scale notes for a given key and mode
   */
  getScale(key, mode) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyIndex = noteNames.indexOf(key);
    
    if (keyIndex === -1 || !this.scalePatterns[mode]) {
      return [];
    }

    const pattern = this.scalePatterns[mode];
    return pattern.map(interval => {
      const noteIndex = (keyIndex + interval) % 12;
      return noteNames[noteIndex];
    });
  }

  /**
   * Get scale with octave information
   */
  getScaleWithOctaves(key, mode, startOctave = 4) {
    const scale = this.getScale(key, mode);
    return scale.map(note => `${note}${startOctave}`);
  }

  /**
   * Set current key and mode
   */
  setKey(key, mode) {
    if (this.availableKeys.includes(key) && this.availableModes[mode]) {
      this.currentKey = key;
      this.currentMode = mode;
      return true;
    }
    return false;
  }

  /**
   * Get current key information
   */
  getCurrentKey() {
    return {
      key: this.currentKey,
      mode: this.currentMode,
      scale: this.getScale(this.currentKey, this.currentMode),
      keySignature: this.keySignatures[this.currentKey] || { sharps: 0, flats: 0, notes: [] }
    };
  }

  /**
   * Get all available modes
   */
  getAvailableModes() {
    return Object.entries(this.availableModes).map(([key, mode]) => ({
      key,
      ...mode
    }));
  }

  /**
   * Get all available keys
   */
  getAvailableKeys() {
    return this.availableKeys;
  }

  /**
   * Check if a note is in the current scale
   */
  isInScale(note) {
    const noteName = note.replace(/\d+/, ''); // Remove octave number
    const scale = this.getScale(this.currentKey, this.currentMode);
    return scale.includes(noteName);
  }

  /**
   * Get scale degree of a note
   */
  getScaleDegree(note) {
    const noteName = note.replace(/\d+/, '');
    const scale = this.getScale(this.currentKey, this.currentMode);
    const degree = scale.indexOf(noteName);
    return degree >= 0 ? degree + 1 : null;
  }

  /**
   * Get chord for a scale degree
   */
  getChordForDegree(degree, key, mode) {
    const scale = this.getScale(key, mode);
    const rootNote = scale[(degree - 1) % scale.length];
    
    // Determine chord type based on mode and degree
    const chordTypes = this.getChordTypesForMode(mode);
    const chordType = chordTypes[degree - 1] || 'major';
    
    return {
      root: rootNote,
      type: chordType,
      degree: degree
    };
  }

  /**
   * Get chord types for each degree in a mode
   */
  getChordTypesForMode(mode) {
    const chordTypeMap = {
      major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
      minor: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
      dorian: ['minor', 'minor', 'major', 'major', 'minor', 'diminished', 'major'],
      phrygian: ['minor', 'major', 'major', 'minor', 'diminished', 'major', 'minor'],
      lydian: ['major', 'major', 'minor', 'diminished', 'major', 'minor', 'minor'],
      mixolydian: ['major', 'minor', 'diminished', 'major', 'minor', 'minor', 'major'],
      locrian: ['diminished', 'major', 'minor', 'minor', 'major', 'major', 'minor']
    };
    
    return chordTypeMap[mode] || chordTypeMap.major;
  }

  /**
   * Transpose a note by semitones
   */
  transposeNote(note, semitones) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const match = note.match(/^([A-G]#?)(\d+)$/);
    
    if (!match) return note;
    
    const [, noteName, octave] = match;
    const noteIndex = noteNames.indexOf(noteName);
    const newNoteIndex = (noteIndex + semitones) % 12;
    const octaveChange = Math.floor((noteIndex + semitones) / 12);
    const newOctave = parseInt(octave) + octaveChange;
    
    return `${noteNames[newNoteIndex]}${newOctave}`;
  }

  /**
   * Transpose a chord progression
   */
  transposeChordProgression(chords, semitones) {
    return chords.map(chord => {
      if (!chord || !chord.root) return chord;
      
      return {
        ...chord,
        root: this.transposeNote(chord.root, semitones)
      };
    });
  }

  /**
   * Get relative minor/major key
   */
  getRelativeKey(key, mode) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyIndex = noteNames.indexOf(key);
    
    if (mode === 'major') {
      // Relative minor is 3 semitones down
      const relativeMinorIndex = (keyIndex - 3 + 12) % 12;
      return {
        key: noteNames[relativeMinorIndex],
        mode: 'minor'
      };
    } else if (mode === 'minor') {
      // Relative major is 3 semitones up
      const relativeMajorIndex = (keyIndex + 3) % 12;
      return {
        key: noteNames[relativeMajorIndex],
        mode: 'major'
      };
    }
    
    return null;
  }

  /**
   * Get parallel minor/major key
   */
  getParallelKey(key, mode) {
    if (mode === 'major') {
      return { key, mode: 'minor' };
    } else if (mode === 'minor') {
      return { key, mode: 'major' };
    }
    return null;
  }

  /**
   * Analyze key from a set of notes
   */
  analyzeKey(notes) {
    if (!notes || notes.length === 0) return null;
    
    const noteNames = notes.map(note => note.replace(/\d+/, ''));
    const uniqueNotes = [...new Set(noteNames)];
    
    let bestKey = null;
    let bestScore = 0;
    
    // Test all keys and modes
    for (const key of this.availableKeys) {
      for (const [modeKey, mode] of Object.entries(this.availableModes)) {
        const scale = this.getScale(key, modeKey);
        const scaleNotes = new Set(scale);
        
        // Count how many notes match the scale
        const matches = uniqueNotes.filter(note => scaleNotes.has(note)).length;
        const score = matches / uniqueNotes.length;
        
        if (score > bestScore) {
          bestScore = score;
          bestKey = { key, mode: modeKey, score };
        }
      }
    }
    
    return bestScore > 0.5 ? bestKey : null;
  }

  /**
   * Get circle of fifths information
   */
  getCircleOfFifths() {
    const sharpKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
    const flatKeys = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
    
    return {
      sharpKeys,
      flatKeys,
      current: this.currentKey,
      position: sharpKeys.indexOf(this.currentKey)
    };
  }

  /**
   * Get key signature information
   */
  getKeySignature(key) {
    return this.keySignatures[key] || { sharps: 0, flats: 0, notes: [] };
  }

  /**
   * Get enharmonic equivalent
   */
  getEnharmonicEquivalent(note) {
    const enharmonicMap = {
      'C#': 'Db', 'Db': 'C#',
      'D#': 'Eb', 'Eb': 'D#',
      'F#': 'Gb', 'Gb': 'F#',
      'G#': 'Ab', 'Ab': 'G#',
      'A#': 'Bb', 'Bb': 'A#'
    };
    
    const noteName = note.replace(/\d+/, '');
    const octave = note.replace(/^[A-G]#?/, '');
    const equivalent = enharmonicMap[noteName];
    
    return equivalent ? `${equivalent}${octave}` : note;
  }

  /**
   * Get interval between two notes
   */
  getInterval(note1, note2) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    const match1 = note1.match(/^([A-G]#?)(\d+)$/);
    const match2 = note2.match(/^([A-G]#?)(\d+)$/);
    
    if (!match1 || !match2) return null;
    
    const [, name1, octave1] = match1;
    const [, name2, octave2] = match2;
    
    const index1 = noteNames.indexOf(name1);
    const index2 = noteNames.indexOf(name2);
    
    const octaveDiff = parseInt(octave2) - parseInt(octave1);
    const semitoneDiff = (index2 - index1) + (octaveDiff * 12);
    
    const intervals = [
      'P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'
    ];
    
    return intervals[semitoneDiff % 12];
  }
}