/**
 * Chord Progression Engine
 * Generates and manages chord progressions with harmonic relationships
 */

export class ChordProgressionEngine {
  constructor(scaleKeyManager) {
    this.scaleKeyManager = scaleKeyManager;
    this.progressions = this.initializeProgressions();
    this.voiceLeadingRules = this.initializeVoiceLeadingRules();
    this.currentProgression = [];
    this.progressionHistory = [];
  }

  /**
   * Initialize common chord progressions
   */
  initializeProgressions() {
    return {
      common: [
        { name: 'I-V-vi-IV', pattern: ['I', 'V', 'vi', 'IV'], style: 'Pop' },
        { name: 'I-IV-V-I', pattern: ['I', 'IV', 'V', 'I'], style: 'Classical' },
        { name: 'vi-IV-I-V', pattern: ['vi', 'IV', 'I', 'V'], style: 'Pop' },
        { name: 'I-vi-IV-V', pattern: ['I', 'vi', 'IV', 'V'], style: 'Classical' },
        { name: 'ii-V-I-vi', pattern: ['ii', 'V', 'I', 'vi'], style: 'Jazz' },
        { name: 'I-iii-vi-IV', pattern: ['I', 'iii', 'vi', 'IV'], style: 'Pop' }
      ],
      jazz: [
        { name: 'ii-V-I-vi', pattern: ['ii', 'V', 'I', 'vi'], style: 'Jazz' },
        { name: 'I-vi-ii-V', pattern: ['I', 'vi', 'ii', 'V'], style: 'Jazz' },
        { name: 'iii-vi-ii-V', pattern: ['iii', 'vi', 'ii', 'V'], style: 'Jazz' },
        { name: 'I-IV-vii-iii', pattern: ['I', 'IV', 'vii', 'iii'], style: 'Jazz' },
        { name: 'vi-ii-V-I', pattern: ['vi', 'ii', 'V', 'I'], style: 'Jazz' }
      ],
      blues: [
        { name: 'I-I-I-I', pattern: ['I', 'I', 'I', 'I'], style: 'Blues' },
        { name: 'IV-IV-I-I', pattern: ['IV', 'IV', 'I', 'I'], style: 'Blues' },
        { name: 'V-IV-I-V', pattern: ['V', 'IV', 'I', 'V'], style: 'Blues' },
        { name: 'I-IV-I-V', pattern: ['I', 'IV', 'I', 'V'], style: 'Blues' }
      ],
      classical: [
        { name: 'I-IV-V-I', pattern: ['I', 'IV', 'V', 'I'], style: 'Classical' },
        { name: 'I-vi-IV-V', pattern: ['I', 'vi', 'IV', 'V'], style: 'Classical' },
        { name: 'I-ii-V-I', pattern: ['I', 'ii', 'V', 'I'], style: 'Classical' },
        { name: 'I-iii-vi-IV', pattern: ['I', 'iii', 'vi', 'IV'], style: 'Classical' }
      ],
      modal: [
        { name: 'i-bVII-bVI-bVII', pattern: ['i', 'bVII', 'bVI', 'bVII'], style: 'Modal' },
        { name: 'i-bVII-bVI-V', pattern: ['i', 'bVII', 'bVI', 'V'], style: 'Modal' },
        { name: 'i-bVII-i-bVII', pattern: ['i', 'bVII', 'i', 'bVII'], style: 'Modal' }
      ]
    };
  }

  /**
   * Initialize voice leading rules
   */
  initializeVoiceLeadingRules() {
    return {
      // Common voice leading intervals (in semitones)
      smooth: [0, 1, 2, 3, 4, 5, 7, 12],
      // Avoid large jumps
      maxJump: 7,
      // Preferred voice leading directions
      preferred: {
        'I': { to: 'V': 'up', to: 'vi': 'down', to: 'IV': 'up' },
        'V': { to: 'I': 'down', to: 'vi': 'down' },
        'vi': { to: 'IV': 'up', to: 'V': 'up' },
        'IV': { to: 'V': 'up', to: 'I': 'down' }
      }
    };
  }

  /**
   * Generate a chord progression
   */
  generateProgression(key, mode, style = 'common', length = 4) {
    const progressions = this.progressions[style] || this.progressions.common;
    const progression = progressions[Math.floor(Math.random() * progressions.length)];
    
    // Extend or truncate to desired length
    const pattern = this.extendPattern(progression.pattern, length);
    
    // Convert to actual chords
    const chords = this.patternToChords(pattern, key, mode);
    
    this.currentProgression = chords;
    this.progressionHistory.push({
      pattern: pattern,
      chords: chords,
      key: key,
      mode: mode,
      style: style,
      timestamp: Date.now()
    });
    
    return chords;
  }

  /**
   * Extend or truncate a pattern to desired length
   */
  extendPattern(pattern, length) {
    if (pattern.length >= length) {
      return pattern.slice(0, length);
    }
    
    // Repeat pattern to fill length
    const extended = [];
    for (let i = 0; i < length; i++) {
      extended.push(pattern[i % pattern.length]);
    }
    return extended;
  }

  /**
   * Convert roman numeral pattern to actual chords
   */
  patternToChords(pattern, key, mode) {
    const scale = this.scaleKeyManager.getScale(key, mode);
    const chordTypes = this.scaleKeyManager.getChordTypesForMode(mode);
    
    return pattern.map(romanNumeral => {
      const degree = this.romanNumeralToDegree(romanNumeral);
      if (degree === null) return null;
      
      const rootNote = scale[(degree - 1) % scale.length];
      const chordType = chordTypes[degree - 1] || 'major';
      
      return {
        root: rootNote,
        type: chordType,
        degree: degree,
        romanNumeral: romanNumeral,
        notes: this.getChordNotes(rootNote, chordType)
      };
    });
  }

  /**
   * Convert roman numeral to scale degree
   */
  romanNumeralToDegree(romanNumeral) {
    const degreeMap = {
      'I': 1, 'ii': 2, 'iii': 3, 'IV': 4, 'V': 5, 'vi': 6, 'vii': 7,
      'i': 1, 'bII': 2, 'bIII': 3, 'bIV': 4, 'bV': 5, 'bVI': 6, 'bVII': 7
    };
    return degreeMap[romanNumeral] || null;
  }

  /**
   * Get chord notes for a given root and type
   */
  getChordNotes(root, type) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = noteNames.indexOf(root);
    
    const chordPatterns = {
      major: [0, 4, 7],
      minor: [0, 3, 7],
      diminished: [0, 3, 6],
      augmented: [0, 4, 8],
      sus2: [0, 2, 7],
      sus4: [0, 5, 7],
      maj7: [0, 4, 7, 11],
      m7: [0, 3, 7, 10],
      dom7: [0, 4, 7, 10],
      m7b5: [0, 3, 6, 10],
      dim7: [0, 3, 6, 9],
      aug7: [0, 4, 8, 10],
      add9: [0, 4, 7, 14],
      madd9: [0, 3, 7, 14],
      maj9: [0, 4, 7, 11, 14],
      m9: [0, 3, 7, 10, 14],
      dom9: [0, 4, 7, 10, 14]
    };
    
    const pattern = chordPatterns[type] || chordPatterns.major;
    
    return pattern.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return noteNames[noteIndex];
    });
  }

  /**
   * Analyze chord progression for harmonic function
   */
  analyzeProgression(chords) {
    if (!chords || chords.length === 0) return null;
    
    const analysis = {
      tonicChords: [],
      dominantChords: [],
      subdominantChords: [],
      cadences: [],
      harmonicRhythm: this.analyzeHarmonicRhythm(chords),
      voiceLeading: this.analyzeVoiceLeading(chords)
    };
    
    chords.forEach((chord, index) => {
      if (!chord) return;
      
      const functionType = this.getHarmonicFunction(chord.degree);
      analysis[`${functionType}Chords`].push({
        chord: chord,
        position: index,
        function: functionType
      });
    });
    
    // Find cadences
    analysis.cadences = this.findCadences(chords);
    
    return analysis;
  }

  /**
   * Get harmonic function for a chord degree
   */
  getHarmonicFunction(degree) {
    const functionMap = {
      1: 'tonic',
      2: 'subdominant',
      3: 'tonic',
      4: 'subdominant',
      5: 'dominant',
      6: 'tonic',
      7: 'dominant'
    };
    return functionMap[degree] || 'unknown';
  }

  /**
   * Analyze harmonic rhythm
   */
  analyzeHarmonicRhythm(chords) {
    const changes = [];
    let currentChord = null;
    let duration = 0;
    
    chords.forEach((chord, index) => {
      if (chord && chord.romanNumeral !== currentChord) {
        if (currentChord !== null) {
          changes.push({ chord: currentChord, duration: duration });
        }
        currentChord = chord.romanNumeral;
        duration = 1;
      } else {
        duration++;
      }
    });
    
    if (currentChord !== null) {
      changes.push({ chord: currentChord, duration: duration });
    }
    
    return changes;
  }

  /**
   * Analyze voice leading between chords
   */
  analyzeVoiceLeading(chords) {
    const voiceLeading = [];
    
    for (let i = 1; i < chords.length; i++) {
      const prevChord = chords[i - 1];
      const currChord = chords[i];
      
      if (!prevChord || !currChord) continue;
      
      const leading = this.calculateVoiceLeading(prevChord, currChord);
      voiceLeading.push(leading);
    }
    
    return voiceLeading;
  }

  /**
   * Calculate voice leading between two chords
   */
  calculateVoiceLeading(chord1, chord2) {
    const notes1 = chord1.notes || [];
    const notes2 = chord2.notes || [];
    
    const leading = {
      commonTones: 0,
      stepwiseMotion: 0,
      leaps: 0,
      totalMotion: 0,
      smoothness: 0
    };
    
    // Find common tones
    const commonTones = notes1.filter(note => notes2.includes(note));
    leading.commonTones = commonTones.length;
    
    // Calculate motion for each voice
    notes1.forEach(note1 => {
      const closestNote2 = this.findClosestNote(note1, notes2);
      if (closestNote2) {
        const interval = this.scaleKeyManager.getInterval(note1, closestNote2);
        const semitones = this.intervalToSemitones(interval);
        
        leading.totalMotion += Math.abs(semitones);
        
        if (semitones <= 2) {
          leading.stepwiseMotion++;
        } else if (semitones > 7) {
          leading.leaps++;
        }
      }
    });
    
    // Calculate smoothness (higher is smoother)
    const totalNotes = Math.max(notes1.length, notes2.length);
    leading.smoothness = totalNotes > 0 ? 
      (leading.commonTones + leading.stepwiseMotion) / totalNotes : 0;
    
    return leading;
  }

  /**
   * Find closest note in a chord
   */
  findClosestNote(targetNote, chordNotes) {
    if (chordNotes.length === 0) return null;
    
    let closest = chordNotes[0];
    let smallestInterval = this.scaleKeyManager.getInterval(targetNote, closest);
    
    for (const note of chordNotes) {
      const interval = this.scaleKeyManager.getInterval(targetNote, note);
      if (this.intervalToSemitones(interval) < this.intervalToSemitones(smallestInterval)) {
        closest = note;
        smallestInterval = interval;
      }
    }
    
    return closest;
  }

  /**
   * Convert interval to semitones
   */
  intervalToSemitones(interval) {
    const intervalMap = {
      'P1': 0, 'm2': 1, 'M2': 2, 'm3': 3, 'M3': 4, 'P4': 5, 'TT': 6,
      'P5': 7, 'm6': 8, 'M6': 9, 'm7': 10, 'M7': 11, 'P8': 12
    };
    return intervalMap[interval] || 0;
  }

  /**
   * Find cadences in the progression
   */
  findCadences(chords) {
    const cadences = [];
    
    for (let i = 1; i < chords.length; i++) {
      const prevChord = chords[i - 1];
      const currChord = chords[i];
      
      if (!prevChord || !currChord) continue;
      
      const cadenceType = this.identifyCadence(prevChord, currChord);
      if (cadenceType) {
        cadences.push({
          type: cadenceType,
          position: i - 1,
          chords: [prevChord, currChord]
        });
      }
    }
    
    return cadences;
  }

  /**
   * Identify cadence type between two chords
   */
  identifyCadence(chord1, chord2) {
    const degree1 = chord1.degree;
    const degree2 = chord2.degree;
    
    // Perfect cadence (V-I)
    if (degree1 === 5 && degree2 === 1) return 'perfect';
    
    // Plagal cadence (IV-I)
    if (degree1 === 4 && degree2 === 1) return 'plagal';
    
    // Half cadence (ends on V)
    if (degree2 === 5) return 'half';
    
    // Deceptive cadence (V-vi)
    if (degree1 === 5 && degree2 === 6) return 'deceptive';
    
    return null;
  }

  /**
   * Get current progression
   */
  getCurrentProgression() {
    return this.currentProgression;
  }

  /**
   * Get progression history
   */
  getProgressionHistory() {
    return this.progressionHistory;
  }

  /**
   * Get available progression styles
   */
  getAvailableStyles() {
    return Object.keys(this.progressions);
  }

  /**
   * Get progressions for a specific style
   */
  getProgressionsForStyle(style) {
    return this.progressions[style] || [];
  }

  /**
   * Modify a chord in the current progression
   */
  modifyChord(position, newChord) {
    if (position >= 0 && position < this.currentProgression.length) {
      this.currentProgression[position] = newChord;
      return true;
    }
    return false;
  }

  /**
   * Add chord to progression
   */
  addChord(chord, position = -1) {
    if (position === -1) {
      this.currentProgression.push(chord);
    } else if (position >= 0 && position <= this.currentProgression.length) {
      this.currentProgression.splice(position, 0, chord);
    } else {
      return false;
    }
    return true;
  }

  /**
   * Remove chord from progression
   */
  removeChord(position) {
    if (position >= 0 && position < this.currentProgression.length) {
      this.currentProgression.splice(position, 1);
      return true;
    }
    return false;
  }

  /**
   * Transpose progression
   */
  transposeProgression(semitones) {
    this.currentProgression = this.currentProgression.map(chord => {
      if (!chord) return chord;
      
      return {
        ...chord,
        root: this.scaleKeyManager.transposeNote(chord.root, semitones),
        notes: chord.notes.map(note => this.scaleKeyManager.transposeNote(note, semitones))
      };
    });
  }

  /**
   * Clear current progression
   */
  clearProgression() {
    this.currentProgression = [];
  }

  /**
   * Export progression as MIDI data
   */
  exportAsMIDI() {
    // This would integrate with a MIDI library
    // For now, return a simple representation
    return {
      progression: this.currentProgression,
      timestamp: Date.now(),
      format: 'progression-data'
    };
  }
}