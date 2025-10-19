/**
 * Harmonic Analysis Module
 * Provides chord detection, scale analysis, and key detection functionality
 */

export class HarmonicAnalysis {
  constructor() {
    this.currentKey = 'C';
    this.currentMode = 'major';
    this.currentScale = this.getScale('C', 'major');
    this.detectedChords = [];
    this.chordProgressions = this.initializeChordProgressions();
    
    // Note frequency mapping (A4 = 440Hz)
    this.noteFrequencies = this.generateNoteFrequencies();
    
    // Interval ratios for harmonic analysis
    this.intervalRatios = {
      'P1': 1.0,      // Perfect unison
      'm2': 1.05946,  // Minor second
      'M2': 1.12246,  // Major second
      'm3': 1.18921,  // Minor third
      'M3': 1.25992,  // Major third
      'P4': 1.33484,  // Perfect fourth
      'TT': 1.41421,  // Tritone
      'P5': 1.49831,  // Perfect fifth
      'm6': 1.58740,  // Minor sixth
      'M6': 1.68179,  // Major sixth
      'm7': 1.78180,  // Minor seventh
      'M7': 1.88775,  // Major seventh
      'P8': 2.0       // Perfect octave
    };
  }

  /**
   * Generate note frequencies for all octaves
   */
  generateNoteFrequencies() {
    const frequencies = {};
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseFreq = 440; // A4 = 440Hz
    const a4Index = 9; // A is at index 9 in noteNames
    const a4Octave = 4;
    
    // Generate frequencies for octaves 0-8
    for (let octave = 0; octave <= 8; octave++) {
      for (let noteIndex = 0; noteIndex < 12; noteIndex++) {
        const noteName = noteNames[noteIndex];
        const semitonesFromA4 = (octave - a4Octave) * 12 + (noteIndex - a4Index);
        const frequency = baseFreq * Math.pow(2, semitonesFromA4 / 12);
        frequencies[`${noteName}${octave}`] = frequency;
      }
    }
    
    return frequencies;
  }

  /**
   * Get scale notes for a given key and mode
   */
  getScale(key, mode = 'major') {
    const scalePatterns = {
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

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyIndex = noteNames.indexOf(key);
    
    if (keyIndex === -1 || !scalePatterns[mode]) {
      return [];
    }

    const pattern = scalePatterns[mode];
    return pattern.map(interval => {
      const noteIndex = (keyIndex + interval) % 12;
      return noteNames[noteIndex];
    });
  }

  /**
   * Analyze chord from note frequencies
   */
  analyzeChord(frequencies) {
    if (!frequencies || frequencies.length === 0) return null;

    // Convert frequencies to note names
    const notes = frequencies.map(freq => this.frequencyToNote(freq)).filter(note => note);
    
    if (notes.length < 2) return null;

    // Find root note (lowest frequency)
    const rootFreq = Math.min(...frequencies);
    const rootNote = this.frequencyToNote(rootFreq);
    
    // Analyze intervals from root
    const intervals = frequencies.map(freq => {
      const ratio = freq / rootFreq;
      return this.findClosestInterval(ratio);
    }).filter(interval => interval);

    // Determine chord type
    const chordType = this.determineChordType(intervals);
    
    return {
      root: rootNote,
      type: chordType,
      notes: notes,
      intervals: intervals,
      frequencies: frequencies
    };
  }

  /**
   * Convert frequency to note name
   */
  frequencyToNote(frequency) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const a4Freq = 440;
    const a4Index = 9; // A is at index 9
    const a4Octave = 4;
    
    // Calculate semitones from A4
    const semitones = 12 * Math.log2(frequency / a4Freq);
    const totalSemitones = Math.round(semitones);
    
    // Calculate octave and note index
    const octave = a4Octave + Math.floor(totalSemitones / 12);
    const noteIndex = ((a4Index + totalSemitones) % 12 + 12) % 12;
    
    return `${noteNames[noteIndex]}${octave}`;
  }

  /**
   * Find closest interval ratio
   */
  findClosestInterval(ratio) {
    let closestInterval = 'P1';
    let smallestDiff = Math.abs(ratio - this.intervalRatios['P1']);
    
    for (const [interval, intervalRatio] of Object.entries(this.intervalRatios)) {
      const diff = Math.abs(ratio - intervalRatio);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestInterval = interval;
      }
    }
    
    return closestInterval;
  }

  /**
   * Determine chord type from intervals
   */
  determineChordType(intervals) {
    const intervalSet = new Set(intervals);
    
    // Major chords
    if (intervalSet.has('M3') && intervalSet.has('P5')) {
      if (intervalSet.has('M7')) return 'maj7';
      if (intervalSet.has('m7')) return '7';
      return 'major';
    }
    
    // Minor chords
    if (intervalSet.has('m3') && intervalSet.has('P5')) {
      if (intervalSet.has('M7')) return 'maj7';
      if (intervalSet.has('m7')) return 'm7';
      return 'minor';
    }
    
    // Diminished chords
    if (intervalSet.has('m3') && intervalSet.has('TT')) {
      if (intervalSet.has('m7')) return 'm7b5';
      return 'diminished';
    }
    
    // Augmented chords
    if (intervalSet.has('M3') && intervalSet.has('m6')) {
      return 'augmented';
    }
    
    // Sus chords
    if (intervalSet.has('P4') && intervalSet.has('P5')) {
      return 'sus4';
    }
    if (intervalSet.has('M2') && intervalSet.has('P5')) {
      return 'sus2';
    }
    
    return 'unknown';
  }

  /**
   * Detect key from chord progression
   */
  detectKey(chordProgression) {
    if (!chordProgression || chordProgression.length === 0) return null;

    const keyScores = {};
    const modes = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian'];
    
    // Score each possible key
    for (const mode of modes) {
      for (let keyIndex = 0; keyIndex < 12; keyIndex++) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const key = noteNames[keyIndex];
        const scale = this.getScale(key, mode);
        const keyName = `${key} ${mode}`;
        
        keyScores[keyName] = 0;
        
        // Score based on how many chord roots are in the scale
        chordProgression.forEach(chord => {
          if (chord && chord.root) {
            const rootNote = chord.root.replace(/\d+/, ''); // Remove octave number
            if (scale.includes(rootNote)) {
              keyScores[keyName] += 1;
            }
          }
        });
      }
    }
    
    // Find the key with highest score
    let bestKey = null;
    let highestScore = 0;
    
    for (const [keyName, score] of Object.entries(keyScores)) {
      if (score > highestScore) {
        highestScore = score;
        bestKey = keyName;
      }
    }
    
    return bestKey;
  }

  /**
   * Generate chord progression in a given key
   */
  generateChordProgression(key, mode = 'major', length = 4, style = 'common') {
    const scale = this.getScale(key, mode);
    const progressions = this.chordProgressions[style] || this.chordProgressions.common;
    
    // Get a random progression
    const progression = progressions[Math.floor(Math.random() * progressions.length)];
    
    // Map roman numerals to actual chords
    return progression.slice(0, length).map(romanNumeral => {
      return this.romanNumeralToChord(romanNumeral, key, mode, scale);
    });
  }

  /**
   * Convert roman numeral to chord
   */
  romanNumeralToChord(romanNumeral, key, mode, scale) {
    const chordDegrees = {
      'I': 0, 'ii': 1, 'iii': 2, 'IV': 3, 'V': 4, 'vi': 5, 'vii': 6
    };
    
    const degree = chordDegrees[romanNumeral];
    if (degree === undefined) return null;
    
    const rootNote = scale[degree];
    const chordType = this.getChordTypeForDegree(romanNumeral, mode);
    
    return {
      root: rootNote,
      type: chordType,
      romanNumeral: romanNumeral
    };
  }

  /**
   * Get chord type for degree in mode
   */
  getChordTypeForDegree(romanNumeral, mode) {
    const majorChordTypes = {
      'I': 'major', 'ii': 'minor', 'iii': 'minor', 'IV': 'major',
      'V': 'major', 'vi': 'minor', 'vii': 'diminished'
    };
    
    const minorChordTypes = {
      'i': 'minor', 'ii': 'diminished', 'III': 'major', 'iv': 'minor',
      'v': 'minor', 'VI': 'major', 'VII': 'major'
    };
    
    if (mode === 'major') {
      return majorChordTypes[romanNumeral] || 'major';
    } else {
      return minorChordTypes[romanNumeral] || 'minor';
    }
  }

  /**
   * Initialize common chord progressions
   */
  initializeChordProgressions() {
    return {
      common: [
        ['I', 'V', 'vi', 'IV'],
        ['I', 'IV', 'V', 'I'],
        ['vi', 'IV', 'I', 'V'],
        ['I', 'vi', 'IV', 'V'],
        ['ii', 'V', 'I', 'vi'],
        ['I', 'iii', 'vi', 'IV']
      ],
      jazz: [
        ['ii', 'V', 'I', 'vi'],
        ['I', 'vi', 'ii', 'V'],
        ['iii', 'vi', 'ii', 'V'],
        ['I', 'IV', 'vii', 'iii']
      ],
      blues: [
        ['I', 'I', 'I', 'I'],
        ['IV', 'IV', 'I', 'I'],
        ['V', 'IV', 'I', 'V']
      ],
      pop: [
        ['I', 'V', 'vi', 'IV'],
        ['vi', 'IV', 'I', 'V'],
        ['I', 'IV', 'vi', 'V'],
        ['I', 'vi', 'IV', 'V']
      ]
    };
  }

  /**
   * Analyze harmonic content of audio data
   */
  analyzeHarmonicContent(audioData, sampleRate) {
    if (!audioData || audioData.length === 0) return null;

    // Simple peak detection for harmonic analysis
    const peaks = this.findPeaks(audioData);
    const frequencies = peaks.map(peak => (peak * sampleRate) / audioData.length);
    
    // Analyze chords from detected frequencies
    const chord = this.analyzeChord(frequencies);
    
    return {
      chord: chord,
      frequencies: frequencies,
      peaks: peaks,
      harmonicity: this.calculateHarmonicity(frequencies)
    };
  }

  /**
   * Find peaks in audio data
   */
  findPeaks(data, threshold = 0.1) {
    const peaks = [];
    const windowSize = Math.floor(data.length / 20); // Analyze top 20 peaks
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    // Sort by amplitude and take top peaks
    return peaks
      .sort((a, b) => data[b] - data[a])
      .slice(0, windowSize)
      .sort((a, b) => a - b);
  }

  /**
   * Calculate harmonicity (consonance) of frequency set
   */
  calculateHarmonicity(frequencies) {
    if (frequencies.length < 2) return 0;
    
    let totalHarmonicity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < frequencies.length; i++) {
      for (let j = i + 1; j < frequencies.length; j++) {
        const ratio = frequencies[j] / frequencies[i];
        const interval = this.findClosestInterval(ratio);
        
        // Score based on consonance
        const consonanceScores = {
          'P1': 1.0, 'P5': 0.9, 'P4': 0.8, 'M3': 0.7, 'm3': 0.6,
          'M6': 0.5, 'm6': 0.4, 'M2': 0.3, 'm2': 0.2, 'M7': 0.1, 'm7': 0.1
        };
        
        totalHarmonicity += consonanceScores[interval] || 0;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalHarmonicity / comparisons : 0;
  }

  /**
   * Set current key and mode
   */
  setKey(key, mode = 'major') {
    this.currentKey = key;
    this.currentMode = mode;
    this.currentScale = this.getScale(key, mode);
  }

  /**
   * Get current key information
   */
  getCurrentKey() {
    return {
      key: this.currentKey,
      mode: this.currentMode,
      scale: this.currentScale
    };
  }

  /**
   * Check if a note is in the current scale
   */
  isInScale(note) {
    const noteName = note.replace(/\d+/, ''); // Remove octave number
    return this.currentScale.includes(noteName);
  }

  /**
   * Get scale degree of a note
   */
  getScaleDegree(note) {
    const noteName = note.replace(/\d+/, '');
    const degree = this.currentScale.indexOf(noteName);
    return degree >= 0 ? degree + 1 : null;
  }
}