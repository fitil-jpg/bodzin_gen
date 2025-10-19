/**
 * Scale & Key Management Module
 * Handles musical scales, keys, and harmonic relationships
 */

export class ScaleKeyManager {
  constructor() {
    this.currentKey = 'C';
    this.currentScale = 'major';
    this.availableScales = this.initializeScales();
    this.availableKeys = this.initializeKeys();
    this.scaleDegrees = this.initializeScaleDegrees();
    this.harmonicFunctions = this.initializeHarmonicFunctions();
  }

  initializeScales() {
    return {
      major: {
        name: 'Major',
        intervals: [2, 2, 1, 2, 2, 2, 1], // W-W-H-W-W-W-H
        semitones: [0, 2, 4, 5, 7, 9, 11],
        degrees: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
        characteristics: { brightness: 1.0, stability: 0.8, tension: 0.3 }
      },
      minor: {
        name: 'Natural Minor',
        intervals: [2, 1, 2, 2, 1, 2, 2], // W-H-W-W-H-W-W
        semitones: [0, 2, 3, 5, 7, 8, 10],
        degrees: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
        characteristics: { brightness: 0.3, stability: 0.6, tension: 0.7 }
      },
      harmonic_minor: {
        name: 'Harmonic Minor',
        intervals: [2, 1, 2, 2, 1, 3, 1], // W-H-W-W-H-WH-H
        semitones: [0, 2, 3, 5, 7, 8, 11],
        degrees: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
        characteristics: { brightness: 0.4, stability: 0.5, tension: 0.8 }
      },
      melodic_minor: {
        name: 'Melodic Minor',
        intervals: [2, 1, 2, 2, 2, 2, 1], // W-H-W-W-W-W-H (ascending)
        semitones: [0, 2, 3, 5, 7, 9, 11],
        degrees: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'],
        characteristics: { brightness: 0.6, stability: 0.7, tension: 0.6 }
      },
      dorian: {
        name: 'Dorian',
        intervals: [2, 1, 2, 2, 2, 1, 2], // W-H-W-W-W-H-W
        semitones: [0, 2, 3, 5, 7, 9, 10],
        degrees: ['i', 'ii', 'III', 'IV', 'v', 'vi', 'VII'],
        characteristics: { brightness: 0.5, stability: 0.7, tension: 0.5 }
      },
      phrygian: {
        name: 'Phrygian',
        intervals: [1, 2, 2, 2, 1, 2, 2], // H-W-W-W-H-W-W
        semitones: [0, 1, 3, 5, 7, 8, 10],
        degrees: ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
        characteristics: { brightness: 0.2, stability: 0.4, tension: 0.8 }
      },
      lydian: {
        name: 'Lydian',
        intervals: [2, 2, 2, 1, 2, 2, 1], // W-W-W-H-W-W-H
        semitones: [0, 2, 4, 6, 7, 9, 11],
        degrees: ['I', 'II', 'iii', '#iv°', 'V', 'vi', 'vii'],
        characteristics: { brightness: 1.2, stability: 0.6, tension: 0.4 }
      },
      mixolydian: {
        name: 'Mixolydian',
        intervals: [2, 2, 1, 2, 2, 1, 2], // W-W-H-W-W-H-W
        semitones: [0, 2, 4, 5, 7, 9, 10],
        degrees: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
        characteristics: { brightness: 0.8, stability: 0.7, tension: 0.5 }
      },
      locrian: {
        name: 'Locrian',
        intervals: [1, 2, 2, 1, 2, 2, 2], // H-W-W-H-W-W-W
        semitones: [0, 1, 3, 5, 6, 8, 10],
        degrees: ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii'],
        characteristics: { brightness: 0.1, stability: 0.2, tension: 1.0 }
      },
      pentatonic_major: {
        name: 'Pentatonic Major',
        intervals: [2, 2, 3, 2, 3], // W-W-WH-W-WH
        semitones: [0, 2, 4, 7, 9],
        degrees: ['I', 'II', 'III', 'V', 'VI'],
        characteristics: { brightness: 0.9, stability: 0.9, tension: 0.2 }
      },
      pentatonic_minor: {
        name: 'Pentatonic Minor',
        intervals: [3, 2, 2, 3, 2], // WH-W-W-WH-W
        semitones: [0, 3, 5, 7, 10],
        degrees: ['i', 'III', 'iv', 'v', 'VII'],
        characteristics: { brightness: 0.4, stability: 0.8, tension: 0.3 }
      },
      blues: {
        name: 'Blues Scale',
        intervals: [3, 2, 1, 1, 3, 2], // WH-W-H-H-WH-W
        semitones: [0, 3, 5, 6, 7, 10],
        degrees: ['i', 'III', 'iv', 'iv+', 'v', 'VII'],
        characteristics: { brightness: 0.3, stability: 0.6, tension: 0.6 }
      },
      chromatic: {
        name: 'Chromatic',
        intervals: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // All semitones
        semitones: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        degrees: ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'],
        characteristics: { brightness: 0.5, stability: 0.1, tension: 1.0 }
      }
    };
  }

  initializeKeys() {
    return [
      'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
    ];
  }

  initializeScaleDegrees() {
    return {
      tonic: { degree: 1, stability: 1.0, tension: 0.0, function: 'rest' },
      supertonic: { degree: 2, stability: 0.6, tension: 0.4, function: 'preparation' },
      mediant: { degree: 3, stability: 0.8, tension: 0.2, function: 'color' },
      subdominant: { degree: 4, stability: 0.7, tension: 0.3, function: 'preparation' },
      dominant: { degree: 5, stability: 0.5, tension: 0.5, function: 'tension' },
      submediant: { degree: 6, stability: 0.7, tension: 0.3, function: 'color' },
      leading_tone: { degree: 7, stability: 0.2, tension: 0.8, function: 'tension' }
    };
  }

  initializeHarmonicFunctions() {
    return {
      tonic: { chords: ['I', 'i'], function: 'rest', stability: 1.0 },
      subdominant: { chords: ['IV', 'iv', 'ii', 'ii°'], function: 'preparation', stability: 0.7 },
      dominant: { chords: ['V', 'v', 'vii°', 'VII'], function: 'tension', stability: 0.3 },
      predominant: { chords: ['ii', 'ii°', 'IV', 'iv'], function: 'preparation', stability: 0.6 }
    };
  }

  // Get current scale information
  getCurrentScale() {
    return this.availableScales[this.currentScale];
  }

  getCurrentKey() {
    return this.currentKey;
  }

  // Set key and scale
  setKey(key) {
    if (this.availableKeys.includes(key)) {
      this.currentKey = key;
      return true;
    }
    return false;
  }

  setScale(scale) {
    if (this.availableScales[scale]) {
      this.currentScale = scale;
      return true;
    }
    return false;
  }

  // Get scale notes for current key/scale
  getScaleNotes(octave = 4) {
    const scale = this.getCurrentScale();
    const keyOffset = this.getKeyOffset(this.currentKey);
    
    return scale.semitones.map(semitone => {
      const noteNumber = (octave * 12) + keyOffset + semitone;
      return this.midiToNote(noteNumber);
    });
  }

  // Get all available notes in current scale across multiple octaves
  getScaleNotesRange(startOctave = 2, endOctave = 6) {
    const notes = [];
    for (let octave = startOctave; octave <= endOctave; octave++) {
      notes.push(...this.getScaleNotes(octave));
    }
    return notes;
  }

  // Get chord notes for a given scale degree
  getChordNotes(degree, octave = 4, chordType = 'triad') {
    const scale = this.getCurrentScale();
    const keyOffset = this.getKeyOffset(this.currentKey);
    
    // Get chord intervals based on type
    const chordIntervals = this.getChordIntervals(chordType);
    
    // Calculate root note
    const rootSemitone = scale.semitones[(degree - 1) % scale.semitones.length];
    const rootNoteNumber = (octave * 12) + keyOffset + rootSemitone;
    
    // Generate chord notes
    return chordIntervals.map(interval => {
      const noteNumber = rootNoteNumber + interval;
      return this.midiToNote(noteNumber);
    });
  }

  // Get chord progression based on harmonic function
  getChordProgression(functionSequence, octave = 4) {
    const scale = this.getCurrentScale();
    const progression = [];
    
    functionSequence.forEach(func => {
      const harmonicFunc = this.harmonicFunctions[func];
      if (harmonicFunc) {
        // Select a random chord from the function
        const chordSymbol = harmonicFunc.chords[Math.floor(Math.random() * harmonicFunc.chords.length)];
        const degree = this.chordSymbolToDegree(chordSymbol);
        const chordNotes = this.getChordNotes(degree, octave, 'triad');
        progression.push({
          symbol: chordSymbol,
          degree: degree,
          notes: chordNotes,
          function: func,
          stability: harmonicFunc.stability
        });
      }
    });
    
    return progression;
  }

  // Get common chord progressions
  getCommonProgressions() {
    return {
      'I-V-vi-IV': ['tonic', 'dominant', 'submediant', 'subdominant'],
      'ii-V-I': ['supertonic', 'dominant', 'tonic'],
      'vi-IV-I-V': ['submediant', 'subdominant', 'tonic', 'dominant'],
      'I-vi-IV-V': ['tonic', 'submediant', 'subdominant', 'dominant'],
      'i-bVII-bVI-bVII': ['tonic', 'subtonic', 'submediant', 'subtonic'], // Minor progression
      'I-bVII-IV-I': ['tonic', 'subtonic', 'subdominant', 'tonic'],
      'vi-ii-V-I': ['submediant', 'supertonic', 'dominant', 'tonic']
    };
  }

  // Get scale characteristics for mood/emotion mapping
  getScaleCharacteristics() {
    const scale = this.getCurrentScale();
    return scale.characteristics;
  }

  // Check if a note is in the current scale
  isNoteInScale(note) {
    const scaleNotes = this.getScaleNotesRange(2, 6);
    return scaleNotes.some(scaleNote => this.normalizeNote(scaleNote) === this.normalizeNote(note));
  }

  // Get closest scale note to a given note
  getClosestScaleNote(note) {
    const scaleNotes = this.getScaleNotesRange(2, 6);
    const targetMidi = this.noteToMidi(note);
    
    let closest = scaleNotes[0];
    let minDistance = Math.abs(this.noteToMidi(closest) - targetMidi);
    
    scaleNotes.forEach(scaleNote => {
      const distance = Math.abs(this.noteToMidi(scaleNote) - targetMidi);
      if (distance < minDistance) {
        minDistance = distance;
        closest = scaleNote;
      }
    });
    
    return closest;
  }

  // Get scale degree of a note
  getScaleDegree(note) {
    const scale = this.getCurrentScale();
    const keyOffset = this.getKeyOffset(this.currentKey);
    const noteMidi = this.noteToMidi(note);
    const octave = Math.floor(noteMidi / 12);
    const noteInOctave = noteMidi % 12;
    
    const scaleNoteInOctave = (noteInOctave - keyOffset + 12) % 12;
    const degreeIndex = scale.semitones.indexOf(scaleNoteInOctave);
    
    return degreeIndex >= 0 ? degreeIndex + 1 : null;
  }

  // Utility methods
  getKeyOffset(key) {
    const keyMap = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
      'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    return keyMap[key] || 0;
  }

  getChordIntervals(chordType) {
    const intervals = {
      'triad': [0, 2, 4],
      'seventh': [0, 2, 4, 6],
      'ninth': [0, 2, 4, 6, 8],
      'sus2': [0, 1, 4],
      'sus4': [0, 3, 4],
      'diminished': [0, 2, 3],
      'augmented': [0, 2, 5],
      'minor': [0, 2, 3],
      'major': [0, 2, 4]
    };
    return intervals[chordType] || intervals['triad'];
  }

  chordSymbolToDegree(symbol) {
    const degreeMap = {
      'I': 1, 'i': 1, 'II': 2, 'ii': 2, 'ii°': 2, 'III': 3, 'iii': 3, 'III+': 3,
      'IV': 4, 'iv': 4, 'V': 5, 'v': 5, 'VI': 6, 'vi': 6, 'vii°': 7, 'VII': 7, 'vii': 7
    };
    return degreeMap[symbol] || 1;
  }

  midiToNote(midiNumber) {
    const octave = Math.floor(midiNumber / 12) - 1;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = noteNames[midiNumber % 12];
    return `${noteName}${octave}`;
  }

  noteToMidi(note) {
    const match = note.match(/^([A-G]#?b?)(\d+)$/);
    if (!match) return 60; // Default to middle C
    
    const [, noteName, octave] = match;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = noteNames.indexOf(noteName);
    
    if (noteIndex === -1) return 60;
    
    return (parseInt(octave) + 1) * 12 + noteIndex;
  }

  normalizeNote(note) {
    // Remove octave number and return just the note name
    return note.replace(/\d+$/, '');
  }

  // Get available scales for UI
  getAvailableScales() {
    return Object.entries(this.availableScales).map(([key, scale]) => ({
      value: key,
      label: scale.name,
      characteristics: scale.characteristics
    }));
  }

  // Get available keys for UI
  getAvailableKeys() {
    return this.availableKeys.map(key => ({
      value: key,
      label: key
    }));
  }

  // Export current configuration
  exportConfiguration() {
    return {
      key: this.currentKey,
      scale: this.currentScale,
      timestamp: new Date().toISOString()
    };
  }

  // Import configuration
  importConfiguration(config) {
    if (config.key) this.setKey(config.key);
    if (config.scale) this.setScale(config.scale);
  }
}