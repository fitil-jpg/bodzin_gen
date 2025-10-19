/**
 * Music Theory Utilities
 * Provides fundamental music theory functions and calculations
 */

export class MusicTheoryUtils {
  constructor() {
    this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    this.intervalNames = [
      'P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'
    ];
    this.intervalSemitones = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    this.chordQualities = this.initializeChordQualities();
    this.scaleDegrees = this.initializeScaleDegrees();
  }

  /**
   * Initialize chord quality definitions
   */
  initializeChordQualities() {
    return {
      major: { intervals: [0, 4, 7], symbol: '', description: 'Major triad' },
      minor: { intervals: [0, 3, 7], symbol: 'm', description: 'Minor triad' },
      diminished: { intervals: [0, 3, 6], symbol: 'dim', description: 'Diminished triad' },
      augmented: { intervals: [0, 4, 8], symbol: 'aug', description: 'Augmented triad' },
      sus2: { intervals: [0, 2, 7], symbol: 'sus2', description: 'Suspended 2nd' },
      sus4: { intervals: [0, 5, 7], symbol: 'sus4', description: 'Suspended 4th' },
      maj7: { intervals: [0, 4, 7, 11], symbol: 'maj7', description: 'Major 7th' },
      m7: { intervals: [0, 3, 7, 10], symbol: 'm7', description: 'Minor 7th' },
      dom7: { intervals: [0, 4, 7, 10], symbol: '7', description: 'Dominant 7th' },
      m7b5: { intervals: [0, 3, 6, 10], symbol: 'm7b5', description: 'Half-diminished 7th' },
      dim7: { intervals: [0, 3, 6, 9], symbol: 'dim7', description: 'Diminished 7th' },
      aug7: { intervals: [0, 4, 8, 10], symbol: 'aug7', description: 'Augmented 7th' },
      add9: { intervals: [0, 4, 7, 14], symbol: 'add9', description: 'Added 9th' },
      madd9: { intervals: [0, 3, 7, 14], symbol: 'madd9', description: 'Minor added 9th' },
      maj9: { intervals: [0, 4, 7, 11, 14], symbol: 'maj9', description: 'Major 9th' },
      m9: { intervals: [0, 3, 7, 10, 14], symbol: 'm9', description: 'Minor 9th' },
      dom9: { intervals: [0, 4, 7, 10, 14], symbol: '9', description: 'Dominant 9th' }
    };
  }

  /**
   * Initialize scale degree names
   */
  initializeScaleDegrees() {
    return {
      1: { name: 'Tonic', function: 'T', description: 'Home note, most stable' },
      2: { name: 'Supertonic', function: 'S', description: 'Above tonic' },
      3: { name: 'Mediant', function: 'T', description: 'Between tonic and dominant' },
      4: { name: 'Subdominant', function: 'S', description: 'Below dominant' },
      5: { name: 'Dominant', function: 'D', description: 'Second most important' },
      6: { name: 'Submediant', function: 'T', description: 'Below tonic' },
      7: { name: 'Leading Tone', function: 'D', description: 'Leads to tonic' }
    };
  }

  /**
   * Convert frequency to note name
   */
  frequencyToNote(frequency, referenceFreq = 440, referenceNote = 'A4') {
    const noteIndex = this.noteNames.indexOf(referenceNote.replace(/\d+/, ''));
    const octave = parseInt(referenceNote.replace(/[A-G]#?/, ''));
    
    const semitones = 12 * Math.log2(frequency / referenceFreq);
    const totalSemitones = Math.round(semitones);
    
    const newNoteIndex = (noteIndex + totalSemitones) % 12;
    const octaveChange = Math.floor((noteIndex + totalSemitones) / 12);
    const newOctave = octave + octaveChange;
    
    return `${this.noteNames[newNoteIndex]}${newOctave}`;
  }

  /**
   * Convert note name to frequency
   */
  noteToFrequency(note, referenceFreq = 440, referenceNote = 'A4') {
    const match = note.match(/^([A-G]#?)(\d+)$/);
    if (!match) return null;
    
    const [, noteName, octave] = match;
    const noteIndex = this.noteNames.indexOf(noteName);
    const octaveNum = parseInt(octave);
    
    const refNoteIndex = this.noteNames.indexOf(referenceNote.replace(/\d+/, ''));
    const refOctave = parseInt(referenceNote.replace(/[A-G]#?/, ''));
    
    const semitones = (octaveNum - refOctave) * 12 + (noteIndex - refNoteIndex);
    
    return referenceFreq * Math.pow(2, semitones / 12);
  }

  /**
   * Get interval between two notes
   */
  getInterval(note1, note2) {
    const match1 = note1.match(/^([A-G]#?)(\d+)$/);
    const match2 = note2.match(/^([A-G]#?)(\d+)$/);
    
    if (!match1 || !match2) return null;
    
    const [, name1, octave1] = match1;
    const [, name2, octave2] = match2;
    
    const index1 = this.noteNames.indexOf(name1);
    const index2 = this.noteNames.indexOf(name2);
    
    const octaveDiff = parseInt(octave2) - parseInt(octave1);
    const semitoneDiff = (index2 - index1) + (octaveDiff * 12);
    
    return this.intervalNames[semitoneDiff % 12];
  }

  /**
   * Get interval in semitones
   */
  getIntervalSemitones(note1, note2) {
    const match1 = note1.match(/^([A-G]#?)(\d+)$/);
    const match2 = note2.match(/^([A-G]#?)(\d+)$/);
    
    if (!match1 || !match2) return null;
    
    const [, name1, octave1] = match1;
    const [, name2, octave2] = match2;
    
    const index1 = this.noteNames.indexOf(name1);
    const index2 = this.noteNames.indexOf(name2);
    
    const octaveDiff = parseInt(octave2) - parseInt(octave1);
    return (index2 - index1) + (octaveDiff * 12);
  }

  /**
   * Transpose a note by semitones
   */
  transposeNote(note, semitones) {
    const match = note.match(/^([A-G]#?)(\d+)$/);
    if (!match) return note;
    
    const [, noteName, octave] = match;
    const noteIndex = this.noteNames.indexOf(noteName);
    const octaveNum = parseInt(octave);
    
    const newNoteIndex = (noteIndex + semitones) % 12;
    const octaveChange = Math.floor((noteIndex + semitones) / 12);
    const newOctave = octaveNum + octaveChange;
    
    return `${this.noteNames[newNoteIndex]}${newOctave}`;
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
    
    const match = note.match(/^([A-G]#?)(\d+)$/);
    if (!match) return note;
    
    const [, noteName, octave] = match;
    const equivalent = enharmonicMap[noteName];
    
    return equivalent ? `${equivalent}${octave}` : note;
  }

  /**
   * Get chord notes for a given root and quality
   */
  getChordNotes(root, quality) {
    const match = root.match(/^([A-G]#?)(\d+)$/);
    if (!match) return [];
    
    const [, noteName, octave] = match;
    const rootIndex = this.noteNames.indexOf(noteName);
    const octaveNum = parseInt(octave);
    
    const chordDef = this.chordQualities[quality];
    if (!chordDef) return [];
    
    return chordDef.intervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      const octaveChange = Math.floor((rootIndex + interval) / 12);
      const newOctave = octaveNum + octaveChange;
      return `${this.noteNames[noteIndex]}${newOctave}`;
    });
  }

  /**
   * Analyze chord from note names
   */
  analyzeChord(notes) {
    if (!notes || notes.length < 2) return null;
    
    // Find root (lowest note)
    const frequencies = notes.map(note => this.noteToFrequency(note)).filter(freq => freq !== null);
    if (frequencies.length === 0) return null;
    
    const rootFreq = Math.min(...frequencies);
    const rootNote = this.frequencyToNote(rootFreq);
    
    // Get intervals from root
    const intervals = notes.map(note => {
      const semitones = this.getIntervalSemitones(rootNote, note);
      return semitones !== null ? this.intervalNames[semitones % 12] : null;
    }).filter(interval => interval);
    
    // Determine chord quality
    const quality = this.determineChordQuality(intervals);
    
    return {
      root: rootNote,
      quality: quality,
      notes: notes,
      intervals: intervals
    };
  }

  /**
   * Determine chord quality from intervals
   */
  determineChordQuality(intervals) {
    const intervalSet = new Set(intervals);
    
    // Check for common chord types
    for (const [quality, def] of Object.entries(this.chordQualities)) {
      const expectedIntervals = def.intervals.map(i => this.intervalNames[i % 12]);
      const hasAllIntervals = expectedIntervals.every(interval => intervalSet.has(interval));
      
      if (hasAllIntervals && intervals.length === expectedIntervals.length) {
        return quality;
      }
    }
    
    return 'unknown';
  }

  /**
   * Get scale notes for a given key and mode
   */
  getScaleNotes(key, mode) {
    const scalePatterns = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      dorian: [0, 2, 3, 5, 7, 9, 10],
      phrygian: [0, 1, 3, 5, 7, 8, 10],
      lydian: [0, 2, 4, 6, 7, 9, 11],
      mixolydian: [0, 2, 4, 5, 7, 9, 10],
      locrian: [0, 1, 3, 5, 6, 8, 10]
    };
    
    const pattern = scalePatterns[mode];
    if (!pattern) return [];
    
    const keyIndex = this.noteNames.indexOf(key);
    if (keyIndex === -1) return [];
    
    return pattern.map(interval => this.noteNames[(keyIndex + interval) % 12]);
  }

  /**
   * Check if a note is in a scale
   */
  isNoteInScale(note, key, mode) {
    const scale = this.getScaleNotes(key, mode);
    const noteName = note.replace(/\d+/, '');
    return scale.includes(noteName);
  }

  /**
   * Get scale degree of a note
   */
  getScaleDegree(note, key, mode) {
    const scale = this.getScaleNotes(key, mode);
    const noteName = note.replace(/\d+/, '');
    const degree = scale.indexOf(noteName);
    return degree >= 0 ? degree + 1 : null;
  }

  /**
   * Calculate harmonic distance between two chords
   */
  calculateHarmonicDistance(chord1, chord2) {
    if (!chord1 || !chord2) return Infinity;
    
    const notes1 = chord1.notes || [];
    const notes2 = chord2.notes || [];
    
    let totalDistance = 0;
    let comparisons = 0;
    
    // Calculate average distance between all note pairs
    for (const note1 of notes1) {
      for (const note2 of notes2) {
        const semitones = this.getIntervalSemitones(note1, note2);
        if (semitones !== null) {
          totalDistance += Math.abs(semitones);
          comparisons++;
        }
      }
    }
    
    return comparisons > 0 ? totalDistance / comparisons : Infinity;
  }

  /**
   * Calculate consonance between two notes
   */
  calculateConsonance(note1, note2) {
    const semitones = this.getIntervalSemitones(note1, note2);
    if (semitones === null) return 0;
    
    const consonanceMap = {
      0: 1.0,   // Unison
      1: 0.1,   // Minor second
      2: 0.3,   // Major second
      3: 0.6,   // Minor third
      4: 0.7,   // Major third
      5: 0.8,   // Perfect fourth
      6: 0.2,   // Tritone
      7: 0.9,   // Perfect fifth
      8: 0.5,   // Minor sixth
      9: 0.6,   // Major sixth
      10: 0.2,  // Minor seventh
      11: 0.3   // Major seventh
    };
    
    return consonanceMap[semitones % 12] || 0;
  }

  /**
   * Generate all possible chord inversions
   */
  getChordInversions(root, quality) {
    const notes = this.getChordNotes(root, quality);
    if (notes.length < 2) return [notes];
    
    const inversions = [];
    
    for (let i = 0; i < notes.length; i++) {
      const inversion = [];
      
      // Add notes starting from the i-th note
      for (let j = 0; j < notes.length; j++) {
        const noteIndex = (i + j) % notes.length;
        const note = notes[noteIndex];
        
        // Transpose up an octave if needed
        if (j > 0 && noteIndex < i) {
          const transposed = this.transposeNote(note, 12);
          inversion.push(transposed);
        } else {
          inversion.push(note);
        }
      }
      
      inversions.push(inversion);
    }
    
    return inversions;
  }

  /**
   * Find common tones between two chords
   */
  findCommonTones(chord1, chord2) {
    const notes1 = chord1.notes || [];
    const notes2 = chord2.notes || [];
    
    return notes1.filter(note1 => 
      notes2.some(note2 => note1.replace(/\d+/, '') === note2.replace(/\d+/, ''))
    );
  }

  /**
   * Calculate voice leading smoothness
   */
  calculateVoiceLeadingSmoothness(chord1, chord2) {
    const notes1 = chord1.notes || [];
    const notes2 = chord2.notes || [];
    
    if (notes1.length === 0 || notes2.length === 0) return 0;
    
    let totalMotion = 0;
    let smoothMotions = 0;
    
    for (const note1 of notes1) {
      let closestNote2 = null;
      let smallestDistance = Infinity;
      
      for (const note2 of notes2) {
        const distance = Math.abs(this.getIntervalSemitones(note1, note2));
        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestNote2 = note2;
        }
      }
      
      if (closestNote2) {
        totalMotion += smallestDistance;
        if (smallestDistance <= 2) {
          smoothMotions++;
        }
      }
    }
    
    const averageMotion = totalMotion / notes1.length;
    const smoothnessRatio = smoothMotions / notes1.length;
    
    return {
      averageMotion,
      smoothnessRatio,
      totalMotion,
      smoothMotions
    };
  }

  /**
   * Get chord symbol (e.g., "Cmaj7", "F#m7")
   */
  getChordSymbol(root, quality) {
    const match = root.match(/^([A-G]#?)(\d+)$/);
    if (!match) return '';
    
    const [, noteName] = match;
    const chordDef = this.chordQualities[quality];
    const symbol = chordDef ? chordDef.symbol : '';
    
    return `${noteName}${symbol}`;
  }

  /**
   * Parse chord symbol to get root and quality
   */
  parseChordSymbol(symbol) {
    const match = symbol.match(/^([A-G]#?)(.*)$/);
    if (!match) return null;
    
    const [, noteName, qualitySymbol] = match;
    
    // Find quality by symbol
    for (const [quality, def] of Object.entries(this.chordQualities)) {
      if (def.symbol === qualitySymbol) {
        return {
          root: noteName,
          quality: quality
        };
      }
    }
    
    return {
      root: noteName,
      quality: 'major'
    };
  }

  /**
   * Get all available chord qualities
   */
  getAvailableChordQualities() {
    return Object.entries(this.chordQualities).map(([key, def]) => ({
      key,
      ...def
    }));
  }

  /**
   * Get all available intervals
   */
  getAvailableIntervals() {
    return this.intervalNames.map((name, index) => ({
      name,
      semitones: this.intervalSemitones[index],
      description: this.getIntervalDescription(name)
    }));
  }

  /**
   * Get interval description
   */
  getIntervalDescription(interval) {
    const descriptions = {
      'P1': 'Perfect Unison',
      'm2': 'Minor Second',
      'M2': 'Major Second',
      'm3': 'Minor Third',
      'M3': 'Major Third',
      'P4': 'Perfect Fourth',
      'TT': 'Tritone',
      'P5': 'Perfect Fifth',
      'm6': 'Minor Sixth',
      'M6': 'Major Sixth',
      'm7': 'Minor Seventh',
      'M7': 'Major Seventh'
    };
    
    return descriptions[interval] || 'Unknown Interval';
  }
}