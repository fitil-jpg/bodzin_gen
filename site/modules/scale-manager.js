// Scale Manager - Handles scale operations and note generation
import { 
  SCALE_TYPES, 
  NOTES, 
  getScaleNotes, 
  getChordNotes, 
  transposeNote,
  getScaleChords,
  detectKey
} from '../utils/music-theory.js';

export class ScaleManager {
  constructor() {
    this.currentScale = 'major';
    this.currentKey = 'C';
    this.currentOctave = 4;
    this.scaleNotes = [];
    this.scaleChords = [];
    this.updateScale();
  }

  // Set the current scale type
  setScaleType(scaleType) {
    if (SCALE_TYPES[scaleType]) {
      this.currentScale = scaleType;
      this.updateScale();
      return true;
    }
    return false;
  }

  // Set the current key/root note
  setKey(key) {
    if (NOTES.includes(key.replace(/b/g, '#').replace(/##/g, '#'))) {
      this.currentKey = key;
      this.updateScale();
      return true;
    }
    return false;
  }

  // Set the octave for note generation
  setOctave(octave) {
    if (octave >= 0 && octave <= 8) {
      this.currentOctave = octave;
      this.updateScale();
      return true;
    }
    return false;
  }

  // Update the scale notes and chords
  updateScale() {
    this.scaleNotes = getScaleNotes(this.currentKey, this.currentScale, this.currentOctave);
    this.scaleChords = getScaleChords(this.currentKey, this.currentScale, this.currentOctave);
  }

  // Get current scale information
  getCurrentScale() {
    return {
      key: this.currentKey,
      type: this.currentScale,
      octave: this.currentOctave,
      name: SCALE_TYPES[this.currentScale]?.name || 'Unknown',
      notes: this.scaleNotes,
      chords: this.scaleChords
    };
  }

  // Get available scale types
  getAvailableScales() {
    return Object.entries(SCALE_TYPES).map(([key, value]) => ({
      id: key,
      name: value.name,
      mode: value.mode
    }));
  }

  // Get available keys
  getAvailableKeys() {
    return NOTES.map(note => ({
      id: note,
      name: note,
      display: note
    }));
  }

  // Check if a note is in the current scale
  isNoteInScale(note) {
    const baseNote = note.replace(/\d+/, '');
    return this.scaleNotes.some(scaleNote => scaleNote.note === baseNote);
  }

  // Get scale degree of a note
  getScaleDegree(note) {
    const baseNote = note.replace(/\d+/, '');
    const noteIndex = this.scaleNotes.findIndex(scaleNote => scaleNote.note === baseNote);
    return noteIndex >= 0 ? noteIndex + 1 : null;
  }

  // Generate a random note from the current scale
  getRandomScaleNote(octave = null) {
    const randomIndex = Math.floor(Math.random() * this.scaleNotes.length);
    const scaleNote = this.scaleNotes[randomIndex];
    return {
      note: scaleNote.note,
      octave: octave !== null ? octave : scaleNote.octave,
      fullNote: `${scaleNote.note}${octave !== null ? octave : scaleNote.octave}`
    };
  }

  // Generate a melody pattern using scale notes
  generateMelodyPattern(length = 8, octave = null) {
    const pattern = [];
    for (let i = 0; i < length; i++) {
      if (Math.random() < 0.7) { // 70% chance of a note
        pattern.push(this.getRandomScaleNote(octave));
      } else {
        pattern.push(null);
      }
    }
    return pattern;
  }

  // Generate a chord progression using scale chords
  generateChordProgression(length = 4, octave = null) {
    const progression = [];
    const commonProgressions = [
      [1, 4, 5, 1], // I-IV-V-I
      [1, 6, 4, 5], // I-vi-IV-V
      [1, 5, 6, 4], // I-V-vi-IV
      [2, 5, 1, 6], // ii-V-I-vi
      [1, 4, 1, 5]  // I-IV-I-V
    ];
    
    const selectedProgression = commonProgressions[Math.floor(Math.random() * commonProgressions.length)];
    
    for (let i = 0; i < length; i++) {
      const degree = selectedProgression[i % selectedProgression.length];
      const chord = this.scaleChords[degree - 1];
      if (chord) {
        const chordNotes = octave !== null 
          ? getChordNotes(chord.root, chord.type, octave)
          : chord.notes;
        
        progression.push({
          ...chord,
          notes: chordNotes
        });
      }
    }
    
    return progression;
  }

  // Transpose the current scale
  transpose(semitones) {
    const transposed = transposeNote(this.currentKey, semitones);
    this.currentKey = transposed.note;
    this.updateScale();
    return this.currentKey;
  }

  // Get relative minor/major
  getRelativeKey() {
    if (this.currentScale === 'major') {
      // Find relative minor
      const minorKey = this.getRelativeMinor();
      return {
        key: minorKey,
        type: 'natural_minor',
        name: 'Natural Minor'
      };
    } else if (this.currentScale === 'natural_minor') {
      // Find relative major
      const majorKey = this.getRelativeMajor();
      return {
        key: majorKey,
        type: 'major',
        name: 'Major'
      };
    }
    return null;
  }

  // Get relative minor of major key
  getRelativeMinor() {
    const keyIndex = NOTES.indexOf(this.currentKey.replace(/b/g, '#').replace(/##/g, '#'));
    if (keyIndex === -1) return this.currentKey;
    
    const minorIndex = (keyIndex + 9) % 12; // Minor is 9 semitones below major
    return NOTES[minorIndex];
  }

  // Get relative major of minor key
  getRelativeMajor() {
    const keyIndex = NOTES.indexOf(this.currentKey.replace(/b/g, '#').replace(/##/g, '#'));
    if (keyIndex === -1) return this.currentKey;
    
    const majorIndex = (keyIndex + 3) % 12; // Major is 3 semitones above minor
    return NOTES[majorIndex];
  }

  // Detect key from a set of notes
  detectKeyFromNotes(notes) {
    const detectedKey = detectKey(notes, this.currentScale);
    if (detectedKey) {
      this.setKey(detectedKey);
      return detectedKey;
    }
    return null;
  }

  // Get scale notes in a specific octave range
  getScaleNotesInRange(minOctave = 3, maxOctave = 6) {
    const notes = [];
    for (let octave = minOctave; octave <= maxOctave; octave++) {
      const scaleNotes = getScaleNotes(this.currentKey, this.currentScale, octave);
      notes.push(...scaleNotes);
    }
    return notes;
  }

  // Get chord suggestions for a given note
  getChordSuggestions(note) {
    const baseNote = note.replace(/\d+/, '');
    const suggestions = [];
    
    // Find chords that contain this note
    this.scaleChords.forEach(chord => {
      const hasNote = chord.notes.some(chordNote => chordNote.note === baseNote);
      if (hasNote) {
        suggestions.push(chord);
      }
    });
    
    return suggestions;
  }

  // Generate a bass line using scale notes
  generateBassLine(length = 8, octave = 2) {
    const bassLine = [];
    const rootNote = this.scaleNotes[0]; // Root note
    const fifthNote = this.scaleNotes[4]; // Fifth note
    
    for (let i = 0; i < length; i++) {
      if (i % 4 === 0) {
        // Root note on strong beats
        bassLine.push({
          note: rootNote.note,
          octave: octave,
          fullNote: `${rootNote.note}${octave}`
        });
      } else if (i % 2 === 0) {
        // Fifth note on medium beats
        bassLine.push({
          note: fifthNote.note,
          octave: octave,
          fullNote: `${fifthNote.note}${octave}`
        });
      } else {
        // Random scale note on weak beats
        bassLine.push(this.getRandomScaleNote(octave));
      }
    }
    
    return bassLine;
  }

  // Get scale information for display
  getScaleInfo() {
    return {
      key: this.currentKey,
      scale: this.currentScale,
      name: `${this.currentKey} ${SCALE_TYPES[this.currentScale]?.name || 'Unknown'}`,
      octave: this.currentOctave,
      noteCount: this.scaleNotes.length,
      chordCount: this.scaleChords.length,
      notes: this.scaleNotes.map(n => n.fullNote),
      chords: this.scaleChords.map(c => c.symbol)
    };
  }

  // Export scale configuration
  exportScale() {
    return {
      key: this.currentKey,
      scale: this.currentScale,
      octave: this.currentOctave,
      timestamp: Date.now()
    };
  }

  // Import scale configuration
  importScale(config) {
    if (config.key && config.scale) {
      this.setKey(config.key);
      this.setScaleType(config.scale);
      if (config.octave) {
        this.setOctave(config.octave);
      }
      return true;
    }
    return false;
  }
}