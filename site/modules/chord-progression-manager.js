// Chord Progression Manager - Intelligent chord generation and progression management
import { 
  CHORD_PROGRESSIONS, 
  CHORD_TYPES, 
  NOTES,
  generateChordProgression,
  analyzeChordProgression,
  transposeProgression,
  getChordFromRomanNumeral
} from '../utils/music-theory.js';

export class ChordProgressionManager {
  constructor() {
    this.currentProgression = [];
    this.currentKey = 'C';
    this.currentScale = 'major';
    this.currentOctave = 4;
    this.progressionHistory = [];
    this.maxHistorySize = 20;
    this.availableProgressions = Object.keys(CHORD_PROGRESSIONS);
  }

  // Set the current key
  setKey(key) {
    if (NOTES.includes(key.replace(/b/g, '#').replace(/##/g, '#'))) {
      this.currentKey = key;
      return true;
    }
    return false;
  }

  // Set the current scale type
  setScale(scale) {
    this.currentScale = scale;
    return true;
  }

  // Set the octave for chord generation
  setOctave(octave) {
    if (octave >= 0 && octave <= 8) {
      this.currentOctave = octave;
      return true;
    }
    return false;
  }

  // Generate a chord progression by name
  generateProgression(progressionName, key = null, scale = null, octave = null) {
    const targetKey = key || this.currentKey;
    const targetScale = scale || this.currentScale;
    const targetOctave = octave || this.currentOctave;
    
    const progression = generateChordProgression(progressionName, targetKey, targetScale, targetOctave);
    
    if (progression.length > 0) {
      this.addToHistory(this.currentProgression);
      this.currentProgression = progression;
      this.currentKey = targetKey;
      this.currentScale = targetScale;
      this.currentOctave = targetOctave;
      return progression;
    }
    
    return null;
  }

  // Generate a random chord progression
  generateRandomProgression(length = 4, key = null, scale = null, octave = null) {
    const targetKey = key || this.currentKey;
    const targetScale = scale || this.currentScale;
    const targetOctave = octave || this.currentOctave;
    
    const commonProgressions = [
      [1, 4, 5, 1], // I-IV-V-I
      [1, 6, 4, 5], // I-vi-IV-V
      [1, 5, 6, 4], // I-V-vi-IV
      [2, 5, 1, 6], // ii-V-I-vi
      [1, 4, 1, 5], // I-IV-I-V
      [1, 3, 4, 5], // I-iii-IV-V
      [1, 6, 2, 5], // I-vi-ii-V
      [1, 4, 6, 5]  // I-IV-vi-V
    ];
    
    const selectedProgression = commonProgressions[Math.floor(Math.random() * commonProgressions.length)];
    const chords = [];
    
    for (let i = 0; i < length; i++) {
      const degree = selectedProgression[i % selectedProgression.length];
      const chord = getChordFromRomanNumeral(
        this.getRomanNumeral(degree, targetScale === 'major'),
        targetKey,
        targetScale
      );
      
      if (chord) {
        const chordNotes = this.getChordNotes(chord.root, chord.type, targetOctave);
        chords.push({
          ...chord,
          notes: chordNotes,
          degree: degree,
          romanNumeral: this.getRomanNumeral(degree, targetScale === 'major')
        });
      }
    }
    
    if (chords.length > 0) {
      this.addToHistory(this.currentProgression);
      this.currentProgression = chords;
      this.currentKey = targetKey;
      this.currentScale = targetScale;
      this.currentOctave = targetOctave;
    }
    
    return chords;
  }

  // Generate a chord progression based on a melody
  generateProgressionFromMelody(notes, key = null, scale = null, octave = null) {
    const targetKey = key || this.currentKey;
    const targetScale = scale || this.currentScale;
    const targetOctave = octave || this.currentOctave;
    
    // Analyze the melody to find chord tones
    const chordSuggestions = this.analyzeMelodyForChords(notes, targetKey, targetScale);
    
    // Generate progression based on suggestions
    const progression = this.buildProgressionFromSuggestions(chordSuggestions, targetKey, targetScale, targetOctave);
    
    if (progression.length > 0) {
      this.addToHistory(this.currentProgression);
      this.currentProgression = progression;
      this.currentKey = targetKey;
      this.currentScale = targetScale;
      this.currentOctave = targetOctave;
    }
    
    return progression;
  }

  // Analyze melody for chord suggestions
  analyzeMelodyForChords(notes, key, scale) {
    const suggestions = [];
    const scaleChords = this.getScaleChords(key, scale);
    
    // Group notes into measures (assuming 4 notes per measure)
    const measures = [];
    for (let i = 0; i < notes.length; i += 4) {
      measures.push(notes.slice(i, i + 4));
    }
    
    measures.forEach(measure => {
      const measureSuggestions = [];
      
      scaleChords.forEach(chord => {
        const chordNotes = chord.notes.map(n => n.note);
        const matches = measure.filter(note => {
          const baseNote = note.replace(/\d+/, '');
          return chordNotes.includes(baseNote);
        });
        
        if (matches.length > 0) {
          measureSuggestions.push({
            chord: chord,
            matches: matches.length,
            confidence: matches.length / measure.length,
            measure: measure
          });
        }
      });
      
      if (measureSuggestions.length > 0) {
        suggestions.push(measureSuggestions.sort((a, b) => b.confidence - a.confidence));
      }
    });
    
    return suggestions;
  }

  // Build progression from chord suggestions
  buildProgressionFromSuggestions(suggestions, key, scale, octave) {
    const progression = [];
    
    suggestions.forEach(measureSuggestions => {
      if (measureSuggestions.length > 0) {
        const bestChord = measureSuggestions[0].chord;
        const chordNotes = this.getChordNotes(bestChord.root, bestChord.type, octave);
        
        progression.push({
          ...bestChord,
          notes: chordNotes,
          confidence: measureSuggestions[0].confidence
        });
      }
    });
    
    return progression;
  }

  // Get available chord progressions
  getAvailableProgressions() {
    return this.availableProgressions.map(name => ({
      id: name,
      name: CHORD_PROGRESSIONS[name].name,
      description: CHORD_PROGRESSIONS[name].description,
      chords: CHORD_PROGRESSIONS[name].chords
    }));
  }

  // Get current progression
  getCurrentProgression() {
    return {
      progression: this.currentProgression,
      key: this.currentKey,
      scale: this.currentScale,
      octave: this.currentOctave,
      length: this.currentProgression.length
    };
  }

  // Add chord to current progression
  addChord(chord, position = -1) {
    if (position === -1) {
      this.currentProgression.push(chord);
    } else {
      this.currentProgression.splice(position, 0, chord);
    }
    return this.currentProgression;
  }

  // Remove chord from current progression
  removeChord(position) {
    if (position >= 0 && position < this.currentProgression.length) {
      return this.currentProgression.splice(position, 1)[0];
    }
    return null;
  }

  // Replace chord in current progression
  replaceChord(position, newChord) {
    if (position >= 0 && position < this.currentProgression.length) {
      this.currentProgression[position] = newChord;
      return true;
    }
    return false;
  }

  // Transpose current progression
  transposeProgression(semitones) {
    const transposed = transposeProgression(this.currentProgression, semitones);
    this.addToHistory(this.currentProgression);
    this.currentProgression = transposed;
    return transposed;
  }

  // Transpose progression to new key
  transposeToKey(newKey) {
    const currentKeyIndex = NOTES.indexOf(this.currentKey.replace(/b/g, '#').replace(/##/g, '#'));
    const newKeyIndex = NOTES.indexOf(newKey.replace(/b/g, '#').replace(/##/g, '#'));
    
    if (currentKeyIndex === -1 || newKeyIndex === -1) return false;
    
    const semitones = (newKeyIndex - currentKeyIndex + 12) % 12;
    const transposed = this.transposeProgression(semitones);
    this.currentKey = newKey;
    return transposed;
  }

  // Get chord suggestions for a specific note
  getChordSuggestions(note, key = null, scale = null) {
    const targetKey = key || this.currentKey;
    const targetScale = scale || this.currentScale;
    const baseNote = note.replace(/\d+/, '');
    
    const scaleChords = this.getScaleChords(targetKey, targetScale);
    const suggestions = [];
    
    scaleChords.forEach(chord => {
      const chordNotes = chord.notes.map(n => n.note);
      if (chordNotes.includes(baseNote)) {
        suggestions.push({
          chord: chord,
          containsNote: baseNote,
          confidence: 1.0
        });
      }
    });
    
    return suggestions;
  }

  // Get scale chords for a key
  getScaleChords(key, scale) {
    // This would typically use the ScaleManager or music theory functions
    // For now, return a basic implementation
    const scaleChords = [];
    const keyIndex = NOTES.indexOf(key.replace(/b/g, '#').replace(/##/g, '#'));
    
    if (keyIndex === -1) return scaleChords;
    
    const scaleIntervals = scale === 'major' 
      ? [0, 2, 4, 5, 7, 9, 11] 
      : [0, 2, 3, 5, 7, 8, 10];
    
    const chordTypes = scale === 'major'
      ? ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished']
      : ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'];
    
    for (let i = 0; i < 7; i++) {
      const rootNote = NOTES[(keyIndex + scaleIntervals[i]) % 12];
      const chordType = chordTypes[i];
      const chordNotes = this.getChordNotes(rootNote, chordType, this.currentOctave);
      
      scaleChords.push({
        degree: i + 1,
        romanNumeral: this.getRomanNumeral(i + 1, scale === 'major'),
        root: rootNote,
        type: chordType,
        symbol: `${rootNote}${CHORD_TYPES[chordType]?.symbol || ''}`,
        notes: chordNotes
      });
    }
    
    return scaleChords;
  }

  // Get chord notes
  getChordNotes(root, type, octave) {
    const chord = CHORD_TYPES[type];
    if (!chord) return [];
    
    const rootIndex = NOTES.indexOf(root.replace(/b/g, '#').replace(/##/g, '#'));
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

  // Get Roman numeral for scale degree
  getRomanNumeral(degree, isMajor) {
    const numerals = isMajor 
      ? ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
      : ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
    return numerals[(degree - 1) % 7];
  }

  // Add progression to history
  addToHistory(progression) {
    this.progressionHistory.unshift([...progression]);
    if (this.progressionHistory.length > this.maxHistorySize) {
      this.progressionHistory.pop();
    }
  }

  // Get progression history
  getProgressionHistory() {
    return this.progressionHistory;
  }

  // Go back to previous progression
  goBack() {
    if (this.progressionHistory.length > 0) {
      const previousProgression = this.progressionHistory.shift();
      this.currentProgression = previousProgression;
      return previousProgression;
    }
    return null;
  }

  // Clear progression history
  clearHistory() {
    this.progressionHistory = [];
  }

  // Export progression
  exportProgression() {
    return {
      progression: this.currentProgression,
      key: this.currentKey,
      scale: this.currentScale,
      octave: this.currentOctave,
      history: this.progressionHistory,
      timestamp: Date.now()
    };
  }

  // Import progression
  importProgression(config) {
    if (config.progression && Array.isArray(config.progression)) {
      this.currentProgression = config.progression;
      
      if (config.key) this.currentKey = config.key;
      if (config.scale) this.currentScale = config.scale;
      if (config.octave) this.currentOctave = config.octave;
      if (config.history) this.progressionHistory = config.history.slice(0, this.maxHistorySize);
      
      return true;
    }
    return false;
  }

  // Get progression analysis
  analyzeProgression() {
    if (this.currentProgression.length === 0) return null;
    
    const analysis = {
      key: this.currentKey,
      scale: this.currentScale,
      length: this.currentProgression.length,
      chords: this.currentProgression.map(chord => ({
        symbol: chord.symbol,
        root: chord.root,
        type: chord.type,
        degree: chord.degree,
        romanNumeral: chord.romanNumeral
      })),
      harmonicRhythm: this.analyzeHarmonicRhythm(),
      voiceLeading: this.analyzeVoiceLeading(),
      tension: this.analyzeTension()
    };
    
    return analysis;
  }

  // Analyze harmonic rhythm
  analyzeHarmonicRhythm() {
    // Simple harmonic rhythm analysis
    return {
      changesPerMeasure: this.currentProgression.length / 4, // Assuming 4/4 time
      stability: this.calculateStability()
    };
  }

  // Calculate progression stability
  calculateStability() {
    let stability = 0;
    const stableChords = ['I', 'i', 'IV', 'iv', 'V', 'v'];
    
    this.currentProgression.forEach(chord => {
      if (stableChords.includes(chord.romanNumeral)) {
        stability += 1;
      }
    });
    
    return stability / this.currentProgression.length;
  }

  // Analyze voice leading
  analyzeVoiceLeading() {
    if (this.currentProgression.length < 2) return null;
    
    const voiceLeading = [];
    
    for (let i = 1; i < this.currentProgression.length; i++) {
      const prevChord = this.currentProgression[i - 1];
      const currChord = this.currentProgression[i];
      
      const movement = this.calculateVoiceMovement(prevChord, currChord);
      voiceLeading.push(movement);
    }
    
    return {
      movements: voiceLeading,
      smoothness: this.calculateSmoothness(voiceLeading)
    };
  }

  // Calculate voice movement between chords
  calculateVoiceMovement(prevChord, currChord) {
    // Simplified voice leading analysis
    const prevRoot = NOTES.indexOf(prevChord.root.replace(/b/g, '#').replace(/##/g, '#'));
    const currRoot = NOTES.indexOf(currChord.root.replace(/b/g, '#').replace(/##/g, '#'));
    
    const rootMovement = (currRoot - prevRoot + 12) % 12;
    
    return {
      rootMovement: rootMovement,
      direction: rootMovement > 6 ? 'down' : 'up',
      interval: this.getIntervalName(rootMovement)
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

  // Calculate smoothness of voice leading
  calculateSmoothness(movements) {
    if (movements.length === 0) return 1;
    
    const smoothMovements = movements.filter(m => m.rootMovement <= 2 || m.rootMovement >= 10);
    return smoothMovements.length / movements.length;
  }

  // Analyze tension in progression
  analyzeTension() {
    const tensionChords = ['V', 'vii', 'ii', 'IV'];
    let tension = 0;
    
    this.currentProgression.forEach(chord => {
      if (tensionChords.includes(chord.romanNumeral)) {
        tension += 1;
      }
    });
    
    return {
      level: tension / this.currentProgression.length,
      chords: this.currentProgression.filter(chord => 
        tensionChords.includes(chord.romanNumeral)
      ).map(chord => chord.symbol)
    };
  }
}