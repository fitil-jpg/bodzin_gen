// Key Manager - Handles key detection, transposition, and key relationships
import { 
  KEY_SIGNATURES, 
  NOTES, 
  transposeNote,
  detectKey,
  getScaleChords,
  getScaleNotes
} from '../utils/music-theory.js';

export class KeyManager {
  constructor() {
    this.currentKey = 'C';
    this.currentMode = 'major';
    this.keySignature = KEY_SIGNATURES['C'];
    this.availableKeys = Object.keys(KEY_SIGNATURES);
    this.keyHistory = [];
    this.maxHistorySize = 10;
  }

  // Set the current key
  setKey(key) {
    if (KEY_SIGNATURES[key]) {
      this.addToHistory(this.currentKey);
      this.currentKey = key;
      this.keySignature = KEY_SIGNATURES[key];
      return true;
    }
    return false;
  }

  // Set the current mode (major/minor)
  setMode(mode) {
    if (mode === 'major' || mode === 'minor') {
      this.currentMode = mode;
      return true;
    }
    return false;
  }

  // Get current key information
  getCurrentKey() {
    return {
      key: this.currentKey,
      mode: this.currentMode,
      signature: this.keySignature,
      relative: this.getRelativeKey(),
      parallel: this.getParallelKey()
    };
  }

  // Get available keys
  getAvailableKeys() {
    return this.availableKeys.map(key => ({
      key: key,
      signature: KEY_SIGNATURES[key],
      sharps: KEY_SIGNATURES[key].sharps,
      flats: KEY_SIGNATURES[key].flats
    }));
  }

  // Transpose to a new key
  transposeToKey(targetKey) {
    if (!KEY_SIGNATURES[targetKey]) return false;
    
    const currentKeyIndex = NOTES.indexOf(this.currentKey.replace(/b/g, '#').replace(/##/g, '#'));
    const targetKeyIndex = NOTES.indexOf(targetKey.replace(/b/g, '#').replace(/##/g, '#'));
    
    if (currentKeyIndex === -1 || targetKeyIndex === -1) return false;
    
    const semitones = (targetKeyIndex - currentKeyIndex + 12) % 12;
    this.addToHistory(this.currentKey);
    this.currentKey = targetKey;
    this.keySignature = KEY_SIGNATURES[targetKey];
    
    return {
      semitones: semitones,
      direction: semitones > 6 ? 'down' : 'up'
    };
  }

  // Transpose by semitones
  transposeBySemitones(semitones) {
    const transposed = transposeNote(this.currentKey, semitones);
    const newKey = transposed.note;
    
    if (KEY_SIGNATURES[newKey]) {
      this.addToHistory(this.currentKey);
      this.currentKey = newKey;
      this.keySignature = KEY_SIGNATURES[newKey];
      return true;
    }
    return false;
  }

  // Get relative key (major/minor)
  getRelativeKey() {
    if (this.currentMode === 'major') {
      return {
        key: this.keySignature.relative,
        mode: 'minor',
        relationship: 'relative minor'
      };
    } else {
      // Find relative major
      const relativeMajor = Object.keys(KEY_SIGNATURES).find(key => 
        KEY_SIGNATURES[key].relative === this.currentKey
      );
      return {
        key: relativeMajor || this.currentKey,
        mode: 'major',
        relationship: 'relative major'
      };
    }
  }

  // Get parallel key (same root, different mode)
  getParallelKey() {
    if (this.currentMode === 'major') {
      return {
        key: this.currentKey,
        mode: 'minor',
        relationship: 'parallel minor'
      };
    } else {
      return {
        key: this.currentKey,
        mode: 'major',
        relationship: 'parallel major'
      };
    }
  }

  // Switch to relative key
  switchToRelativeKey() {
    const relative = this.getRelativeKey();
    if (relative) {
      this.addToHistory(this.currentKey);
      this.currentKey = relative.key;
      this.currentMode = relative.mode;
      this.keySignature = KEY_SIGNATURES[this.currentKey];
      return true;
    }
    return false;
  }

  // Switch to parallel key
  switchToParallelKey() {
    const parallel = this.getParallelKey();
    if (parallel) {
      this.addToHistory(this.currentKey);
      this.currentMode = parallel.mode;
      return true;
    }
    return false;
  }

  // Detect key from chord progression
  detectKeyFromProgression(chords) {
    const chordRoots = chords.map(chord => chord.root || chord);
    const detectedKey = detectKey(chordRoots, this.currentMode);
    
    if (detectedKey && KEY_SIGNATURES[detectedKey]) {
      this.addToHistory(this.currentKey);
      this.currentKey = detectedKey;
      this.keySignature = KEY_SIGNATURES[detectedKey];
      return detectedKey;
    }
    return null;
  }

  // Detect key from melody notes
  detectKeyFromMelody(notes) {
    const detectedKey = detectKey(notes, this.currentMode);
    
    if (detectedKey && KEY_SIGNATURES[detectedKey]) {
      this.addToHistory(this.currentKey);
      this.currentKey = detectedKey;
      this.keySignature = KEY_SIGNATURES[detectedKey];
      return detectedKey;
    }
    return null;
  }

  // Get circle of fifths information
  getCircleOfFifths() {
    const circle = [];
    const sharpKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
    const flatKeys = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
    
    // Sharp side
    sharpKeys.forEach((key, index) => {
      circle.push({
        key: key,
        sharps: index,
        flats: 0,
        side: 'sharp'
      });
    });
    
    // Flat side
    flatKeys.forEach((key, index) => {
      if (key !== 'C') { // Avoid duplicate C
        circle.push({
          key: key,
          sharps: 0,
          flats: index,
          side: 'flat'
        });
      }
    });
    
    return circle;
  }

  // Get key relationships
  getKeyRelationships() {
    const currentIndex = NOTES.indexOf(this.currentKey.replace(/b/g, '#').replace(/##/g, '#'));
    
    return {
      current: {
        key: this.currentKey,
        mode: this.currentMode,
        index: currentIndex
      },
      relative: this.getRelativeKey(),
      parallel: this.getParallelKey(),
      dominant: this.getKeyByInterval(7), // Fifth up
      subdominant: this.getKeyByInterval(5), // Fifth down
      mediant: this.getKeyByInterval(4), // Third up
      submediant: this.getKeyByInterval(3), // Third down
      supertonic: this.getKeyByInterval(2), // Second up
      subtonic: this.getKeyByInterval(10) // Seventh down
    };
  }

  // Get key by interval (semitones)
  getKeyByInterval(semitones) {
    const currentIndex = NOTES.indexOf(this.currentKey.replace(/b/g, '#').replace(/##/g, '#'));
    if (currentIndex === -1) return null;
    
    const newIndex = (currentIndex + semitones) % 12;
    const newKey = NOTES[newIndex];
    
    return {
      key: newKey,
      interval: semitones,
      relationship: this.getIntervalName(semitones)
    };
  }

  // Get interval name
  getIntervalName(semitones) {
    const intervals = {
      0: 'unison',
      1: 'minor second',
      2: 'major second',
      3: 'minor third',
      4: 'major third',
      5: 'perfect fourth',
      6: 'tritone',
      7: 'perfect fifth',
      8: 'minor sixth',
      9: 'major sixth',
      10: 'minor seventh',
      11: 'major seventh'
    };
    return intervals[semitones] || 'unknown';
  }

  // Get common chord progressions for current key
  getCommonProgressions() {
    const progressions = {
      major: [
        { name: 'I-IV-V-I', chords: ['I', 'IV', 'V', 'I'] },
        { name: 'I-vi-IV-V', chords: ['I', 'vi', 'IV', 'V'] },
        { name: 'I-V-vi-IV', chords: ['I', 'V', 'vi', 'IV'] },
        { name: 'ii-V-I', chords: ['ii', 'V', 'I'] },
        { name: 'I-iii-vi-IV', chords: ['I', 'iii', 'vi', 'IV'] }
      ],
      minor: [
        { name: 'i-iv-V-i', chords: ['i', 'iv', 'V', 'i'] },
        { name: 'i-vi-IV-V', chords: ['i', 'vi', 'IV', 'V'] },
        { name: 'i-V-vi-IV', chords: ['i', 'V', 'vi', 'IV'] },
        { name: 'ii-V-i', chords: ['ii', 'V', 'i'] },
        { name: 'i-iii-vi-IV', chords: ['i', 'iii', 'vi', 'IV'] }
      ]
    };
    
    return progressions[this.currentMode] || [];
  }

  // Get scale chords for current key
  getScaleChords(scaleType = null) {
    const scale = scaleType || (this.currentMode === 'major' ? 'major' : 'natural_minor');
    return getScaleChords(this.currentKey, scale, 4);
  }

  // Get scale notes for current key
  getScaleNotes(scaleType = null, octave = 4) {
    const scale = scaleType || (this.currentMode === 'major' ? 'major' : 'natural_minor');
    return getScaleNotes(this.currentKey, scale, octave);
  }

  // Add key to history
  addToHistory(key) {
    this.keyHistory.unshift(key);
    if (this.keyHistory.length > this.maxHistorySize) {
      this.keyHistory.pop();
    }
  }

  // Get key history
  getKeyHistory() {
    return this.keyHistory;
  }

  // Go back to previous key
  goBack() {
    if (this.keyHistory.length > 0) {
      const previousKey = this.keyHistory.shift();
      this.currentKey = previousKey;
      this.keySignature = KEY_SIGNATURES[this.currentKey];
      return previousKey;
    }
    return null;
  }

  // Clear key history
  clearHistory() {
    this.keyHistory = [];
  }

  // Get key signature info
  getKeySignatureInfo() {
    return {
      key: this.currentKey,
      mode: this.currentMode,
      sharps: this.keySignature.sharps,
      flats: this.keySignature.flats,
      relative: this.keySignature.relative,
      accidentals: this.getAccidentals()
    };
  }

  // Get accidentals for current key
  getAccidentals() {
    const accidentals = [];
    
    if (this.keySignature.sharps > 0) {
      const sharpOrder = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
      for (let i = 0; i < this.keySignature.sharps; i++) {
        accidentals.push({
          note: sharpOrder[i],
          type: 'sharp',
          symbol: '#'
        });
      }
    } else if (this.keySignature.flats > 0) {
      const flatOrder = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
      for (let i = 0; i < this.keySignature.flats; i++) {
        accidentals.push({
          note: flatOrder[i],
          type: 'flat',
          symbol: 'b'
        });
      }
    }
    
    return accidentals;
  }

  // Export key configuration
  exportKey() {
    return {
      key: this.currentKey,
      mode: this.currentMode,
      history: this.keyHistory,
      timestamp: Date.now()
    };
  }

  // Import key configuration
  importKey(config) {
    if (config.key && KEY_SIGNATURES[config.key]) {
      this.currentKey = config.key;
      this.keySignature = KEY_SIGNATURES[config.key];
      
      if (config.mode) {
        this.currentMode = config.mode;
      }
      
      if (config.history) {
        this.keyHistory = config.history.slice(0, this.maxHistorySize);
      }
      
      return true;
    }
    return false;
  }

  // Get key analysis for a set of notes
  analyzeKey(notes) {
    const analysis = {
      detectedKey: this.detectKeyFromMelody(notes),
      confidence: this.calculateKeyConfidence(notes),
      suggestions: this.getKeySuggestions(notes),
      chordSuggestions: this.getChordSuggestions(notes)
    };
    
    return analysis;
  }

  // Calculate key confidence
  calculateKeyConfidence(notes) {
    // Simple confidence calculation based on note frequency
    const noteCounts = {};
    notes.forEach(note => {
      const baseNote = note.replace(/\d+/, '');
      noteCounts[baseNote] = (noteCounts[baseNote] || 0) + 1;
    });
    
    const totalNotes = notes.length;
    const maxCount = Math.max(...Object.values(noteCounts));
    
    return Math.round((maxCount / totalNotes) * 100);
  }

  // Get key suggestions
  getKeySuggestions(notes) {
    const suggestions = [];
    const noteCounts = {};
    
    notes.forEach(note => {
      const baseNote = note.replace(/\d+/, '');
      noteCounts[baseNote] = (noteCounts[baseNote] || 0) + 1;
    });
    
    // Check each key for compatibility
    Object.keys(KEY_SIGNATURES).forEach(key => {
      const scaleNotes = this.getScaleNotes('major', 4);
      const keyNotes = scaleNotes.map(n => n.note);
      
      let matches = 0;
      Object.keys(noteCounts).forEach(note => {
        if (keyNotes.includes(note)) {
          matches += noteCounts[note];
        }
      });
      
      const confidence = Math.round((matches / notes.length) * 100);
      if (confidence > 30) { // Only suggest keys with >30% confidence
        suggestions.push({
          key: key,
          confidence: confidence,
          matches: matches,
          total: notes.length
        });
      }
    });
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Get chord suggestions for notes
  getChordSuggestions(notes) {
    const suggestions = [];
    const scaleChords = this.getScaleChords();
    
    scaleChords.forEach(chord => {
      const chordNotes = chord.notes.map(n => n.note);
      const matches = notes.filter(note => {
        const baseNote = note.replace(/\d+/, '');
        return chordNotes.includes(baseNote);
      });
      
      if (matches.length > 0) {
        suggestions.push({
          chord: chord,
          matches: matches.length,
          confidence: Math.round((matches.length / notes.length) * 100)
        });
      }
    });
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }
}