/**
 * Procedural Music Theory Engine
 * Advanced music theory algorithms for procedural generation
 */

export class MusicTheoryEngine {
  constructor() {
    this.scales = new Map();
    this.chords = new Map();
    this.progressions = new Map();
    this.rhythms = new Map();
    this.melodies = new Map();
    this.harmonies = new Map();
    
    this.initializeScales();
    this.initializeChords();
    this.initializeProgressions();
    this.initializeRhythms();
  }

  // Scale Definitions
  initializeScales() {
    const scaleTypes = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
      melodicMinor: [0, 2, 3, 5, 7, 9, 11],
      dorian: [0, 2, 3, 5, 7, 9, 10],
      phrygian: [0, 1, 3, 5, 7, 8, 10],
      lydian: [0, 2, 4, 6, 7, 9, 11],
      mixolydian: [0, 2, 4, 5, 7, 9, 10],
      locrian: [0, 1, 3, 5, 6, 8, 10],
      pentatonicMajor: [0, 2, 4, 7, 9],
      pentatonicMinor: [0, 3, 5, 7, 10],
      blues: [0, 3, 5, 6, 7, 10],
      wholeTone: [0, 2, 4, 6, 8, 10],
      diminished: [0, 2, 3, 5, 6, 8, 9, 11],
      augmented: [0, 3, 4, 7, 8, 11],
      chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    };

    for (const [name, intervals] of Object.entries(scaleTypes)) {
      this.scales.set(name, {
        intervals,
        name,
        getNotes: (root = 60) => intervals.map(interval => root + interval),
        getChord: (root = 60, degree = 1) => this.buildChordFromScale(root, intervals, degree),
        getMode: (mode = 0) => this.getMode(intervals, mode)
      });
    }
  }

  // Chord Definitions
  initializeChords() {
    const chordTypes = {
      major: [0, 4, 7],
      minor: [0, 3, 7],
      diminished: [0, 3, 6],
      augmented: [0, 4, 8],
      major7: [0, 4, 7, 11],
      minor7: [0, 3, 7, 10],
      dominant7: [0, 4, 7, 10],
      diminished7: [0, 3, 6, 9],
      halfDiminished7: [0, 3, 6, 10],
      minorMajor7: [0, 3, 7, 11],
      major6: [0, 4, 7, 9],
      minor6: [0, 3, 7, 9],
      sus2: [0, 2, 7],
      sus4: [0, 5, 7],
      add9: [0, 4, 7, 14],
      major9: [0, 4, 7, 11, 14],
      minor9: [0, 3, 7, 10, 14],
      dominant9: [0, 4, 7, 10, 14],
      major11: [0, 4, 7, 11, 14, 17],
      minor11: [0, 3, 7, 10, 14, 17],
      dominant11: [0, 4, 7, 10, 14, 17],
      major13: [0, 4, 7, 11, 14, 21],
      minor13: [0, 3, 7, 10, 14, 21],
      dominant13: [0, 4, 7, 10, 14, 21]
    };

    for (const [name, intervals] of Object.entries(chordTypes)) {
      this.chords.set(name, {
        intervals,
        name,
        getNotes: (root = 60) => intervals.map(interval => root + interval),
        getInversions: (root = 60) => this.getChordInversions(root, intervals),
        getExtensions: (root = 60) => this.getChordExtensions(root, intervals)
      });
    }
  }

  // Chord Progressions
  initializeProgressions() {
    const progressions = {
      // Common progressions
      iiV7I: [2, 5, 1],
      viIVV: [6, 4, 5],
      IviIVV: [1, 6, 4, 5],
      viIVI: [6, 4, 1],
      IIVviV: [1, 2, 6, 5],
      
      // Jazz progressions
      iiV7I7: [2, 5, 1, 1],
      iiiVIiiV: [3, 6, 2, 5],
      IIm7V7Imaj7: [2, 5, 1],
      
      // Modal progressions
      dorian: [1, 4, 1, 2],
      phrygian: [1, 2, 3, 1],
      lydian: [1, 1, 2, 5],
      mixolydian: [1, 4, 1, 5],
      
      // Electronic/Ambient progressions
      ambient: [1, 4, 6, 1],
      cinematic: [1, 6, 4, 5],
      epic: [1, 4, 6, 5],
      mysterious: [1, 3, 6, 2],
      
      // Bodzin-style progressions
      bodzin: [1, 6, 4, 5],
      bodzinVariation1: [1, 6, 4, 1],
      bodzinVariation2: [1, 4, 6, 5],
      bodzinVariation3: [6, 1, 4, 5]
    };

    for (const [name, degrees] of Object.entries(progressions)) {
      this.progressions.set(name, {
        degrees,
        name,
        getChords: (key = 0, scale = 'major') => this.buildProgression(key, scale, degrees),
        getVariations: (key = 0, scale = 'major') => this.getProgressionVariations(key, scale, degrees),
        getRhythmicPattern: () => this.getProgressionRhythm(degrees.length)
      });
    }
  }

  // Rhythm Patterns
  initializeRhythms() {
    const rhythmTypes = {
      // Basic patterns
      fourFour: [1, 0, 1, 0, 1, 0, 1, 0],
      threeFour: [1, 0, 1, 0, 1, 0],
      twoFour: [1, 0, 1, 0],
      
      // Electronic patterns
      fourOnFloor: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      breakbeat: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
      shuffle: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
      triplet: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
      
      // Complex patterns
      polyrhythm: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      syncopated: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      offbeat: [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
      
      // Bodzin-style patterns
      bodzinKick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      bodzinSnare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      bodzinHihat: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      bodzinComplex: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0]
    };

    for (const [name, pattern] of Object.entries(rhythmTypes)) {
      this.rhythms.set(name, {
        pattern,
        name,
        getVariations: () => this.getRhythmVariations(pattern),
        getPolyrhythm: (otherPattern) => this.createPolyrhythm(pattern, otherPattern),
        getAccents: () => this.getRhythmAccents(pattern)
      });
    }
  }

  // Core Music Theory Methods
  buildChordFromScale(root, scaleIntervals, degree) {
    const chordIntervals = [0, 2, 4]; // Basic triad
    const scaleNote = scaleIntervals[(degree - 1) % scaleIntervals.length];
    return chordIntervals.map(interval => root + scaleNote + interval);
  }

  getMode(scaleIntervals, mode) {
    const rotated = [...scaleIntervals.slice(mode), ...scaleIntervals.slice(0, mode)];
    return rotated.map((interval, index) => 
      index === 0 ? 0 : interval - rotated[0]
    );
  }

  getChordInversions(root, intervals) {
    const inversions = [];
    for (let i = 0; i < intervals.length; i++) {
      const inversion = intervals.slice(i).concat(
        intervals.slice(0, i).map(interval => interval + 12)
      );
      inversions.push(inversion.map(interval => root + interval));
    }
    return inversions;
  }

  getChordExtensions(root, baseIntervals) {
    const extensions = [9, 11, 13];
    return extensions.map(ext => {
      const note = root + ext;
      const chord = baseIntervals.map(interval => root + interval);
      return [...chord, note];
    });
  }

  buildProgression(key, scaleName, degrees) {
    const scale = this.scales.get(scaleName);
    if (!scale) return [];

    return degrees.map(degree => {
      const root = key + scale.intervals[(degree - 1) % scale.intervals.length];
      return scale.getChord(root, degree);
    });
  }

  getProgressionVariations(key, scaleName, degrees) {
    const baseProgression = this.buildProgression(key, scaleName, degrees);
    const variations = [];

    // Add inversions
    baseProgression.forEach((chord, index) => {
      const inversions = this.getChordInversions(key, this.scales.get(scaleName).intervals);
      inversions.forEach(inv => {
        const variation = [...baseProgression];
        variation[index] = inv;
        variations.push(variation);
      });
    });

    // Add extensions
    baseProgression.forEach((chord, index) => {
      const extensions = this.getChordExtensions(key, this.scales.get(scaleName).intervals);
      extensions.forEach(ext => {
        const variation = [...baseProgression];
        variation[index] = ext;
        variations.push(variation);
      });
    });

    return variations;
  }

  getProgressionRhythm(length) {
    const patterns = [
      [1, 0, 0, 0], // Whole notes
      [1, 0, 1, 0], // Half notes
      [1, 0, 0, 1, 0, 0, 1, 0], // Quarter notes
      [1, 0, 1, 0, 1, 0, 1, 0]  // Eighth notes
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  getRhythmVariations(pattern) {
    const variations = [];
    
    // Add slight timing variations
    variations.push(pattern.map(beat => beat === 1 ? 1 : Math.random() > 0.8 ? 1 : 0));
    
    // Add syncopation
    variations.push(pattern.map((beat, index) => {
      if (beat === 1 && index > 0) {
        return Math.random() > 0.5 ? 0 : 1;
      }
      return beat;
    }));
    
    // Add ghost notes
    variations.push(pattern.map(beat => {
      if (beat === 0 && Math.random() > 0.7) {
        return 0.5; // Ghost note
      }
      return beat;
    }));
    
    return variations;
  }

  createPolyrhythm(pattern1, pattern2) {
    const lcm = this.lcm(pattern1.length, pattern2.length);
    const polyrhythm = [];
    
    for (let i = 0; i < lcm; i++) {
      const beat1 = pattern1[i % pattern1.length];
      const beat2 = pattern2[i % pattern2.length];
      polyrhythm.push(beat1 + beat2);
    }
    
    return polyrhythm;
  }

  getRhythmAccents(pattern) {
    return pattern.map((beat, index) => {
      if (beat === 0) return 0;
      if (index === 0) return 1; // Strong accent on first beat
      if (index % 4 === 0) return 0.8; // Medium accent on downbeats
      if (index % 2 === 0) return 0.6; // Light accent on even beats
      return 0.4; // Weak accent on off-beats
    });
  }

  // Melodic Generation
  generateMelody(scale, length = 8, style = 'random') {
    const scaleNotes = scale.getNotes();
    const melody = [];
    
    for (let i = 0; i < length; i++) {
      let note;
      
      switch (style) {
        case 'random':
          note = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
          break;
        case 'ascending':
          note = scaleNotes[i % scaleNotes.length];
          break;
        case 'descending':
          note = scaleNotes[scaleNotes.length - 1 - (i % scaleNotes.length)];
          break;
        case 'arpeggio':
          note = scaleNotes[(i * 2) % scaleNotes.length];
          break;
        case 'pentatonic':
          const pentatonic = scaleNotes.filter((_, index) => index % 2 === 0);
          note = pentatonic[i % pentatonic.length];
          break;
        default:
          note = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
      }
      
      melody.push(note);
    }
    
    return melody;
  }

  // Harmonic Analysis
  analyzeHarmony(chordProgression) {
    const analysis = {
      key: this.detectKey(chordProgression),
      function: this.analyzeFunction(chordProgression),
      tension: this.calculateTension(chordProgression),
      resolution: this.findResolution(chordProgression)
    };
    
    return analysis;
  }

  detectKey(chordProgression) {
    // Simplified key detection based on chord frequency
    const keyFrequencies = new Map();
    
    chordProgression.forEach(chord => {
      const root = chord[0] % 12;
      keyFrequencies.set(root, (keyFrequencies.get(root) || 0) + 1);
    });
    
    let maxFreq = 0;
    let detectedKey = 0;
    
    keyFrequencies.forEach((freq, key) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        detectedKey = key;
      }
    });
    
    return detectedKey;
  }

  analyzeFunction(chordProgression) {
    // Analyze chord functions (Tonic, Subdominant, Dominant)
    return chordProgression.map(chord => {
      const root = chord[0] % 12;
      if ([0, 2, 4].includes(root)) return 'T'; // Tonic
      if ([5, 7, 9].includes(root)) return 'S'; // Subdominant
      if ([11, 1, 3].includes(root)) return 'D'; // Dominant
      return '?'; // Unknown
    });
  }

  calculateTension(chordProgression) {
    // Calculate harmonic tension based on chord complexity and intervals
    return chordProgression.map(chord => {
      let tension = 0;
      for (let i = 0; i < chord.length - 1; i++) {
        for (let j = i + 1; j < chord.length; j++) {
          const interval = Math.abs(chord[j] - chord[i]) % 12;
          if ([1, 2, 6, 10, 11].includes(interval)) tension += 1;
        }
      }
      return tension;
    });
  }

  findResolution(chordProgression) {
    // Find points of harmonic resolution
    const resolutions = [];
    for (let i = 1; i < chordProgression.length; i++) {
      const prev = chordProgression[i - 1];
      const curr = chordProgression[i];
      
      // Check for V-I resolution
      if (this.isDominant(prev) && this.isTonic(curr)) {
        resolutions.push({ index: i, type: 'V-I' });
      }
    }
    return resolutions;
  }

  isDominant(chord) {
    const root = chord[0] % 12;
    return [11, 1, 3].includes(root);
  }

  isTonic(chord) {
    const root = chord[0] % 12;
    return [0, 2, 4].includes(root);
  }

  // Utility Methods
  lcm(a, b) {
    return (a * b) / this.gcd(a, b);
  }

  gcd(a, b) {
    if (b === 0) return a;
    return this.gcd(b, a % b);
  }

  // Export/Import
  exportTheory() {
    return {
      scales: Array.from(this.scales.entries()),
      chords: Array.from(this.chords.entries()),
      progressions: Array.from(this.progressions.entries()),
      rhythms: Array.from(this.rhythms.entries())
    };
  }

  importTheory(data) {
    if (data.scales) this.scales = new Map(data.scales);
    if (data.chords) this.chords = new Map(data.chords);
    if (data.progressions) this.progressions = new Map(data.progressions);
    if (data.rhythms) this.rhythms = new Map(data.rhythms);
  }
}