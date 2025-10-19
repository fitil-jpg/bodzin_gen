/**
 * Pattern Harmonic Integration Module
 * Connects harmonic analysis with existing pattern generation and variation systems
 */

export class PatternHarmonicIntegration {
  constructor(app) {
    this.app = app;
    this.harmonicAnalysis = app.harmonicAnalysis;
    this.scaleKeyManager = app.scaleKeyManager;
    this.chordProgressionEngine = app.chordProgressionEngine;
    this.musicTheoryUtils = app.musicTheoryUtils;
    this.patternVariation = app.patternVariation;
    this.audioEngine = app.audio;
    
    this.currentHarmonicContext = {
      key: 'C',
      mode: 'major',
      scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      chordProgression: [],
      currentChord: null
    };
    
    this.harmonicConstraints = {
      enforceScale: true,
      preferChordTones: true,
      avoidDissonance: false,
      voiceLeadingSmoothness: 0.7
    };
  }

  /**
   * Set harmonic context for pattern generation
   */
  setHarmonicContext(key, mode, chordProgression = null) {
    this.currentHarmonicContext.key = key;
    this.currentHarmonicContext.mode = mode;
    this.currentHarmonicContext.scale = this.scaleKeyManager.getScale(key, mode);
    
    if (chordProgression) {
      this.currentHarmonicContext.chordProgression = chordProgression;
    }
    
    // Update related modules
    this.harmonicAnalysis.setKey(key, mode);
    this.scaleKeyManager.setKey(key, mode);
    
    console.log(`Harmonic context set to ${key} ${mode}`);
  }

  /**
   * Generate harmonically constrained patterns
   */
  generateHarmonicPatterns(instrument, patternLength = 16) {
    const scale = this.currentHarmonicContext.scale;
    const patterns = {
      bass: this.generateHarmonicBassPattern(scale, patternLength),
      lead: this.generateHarmonicLeadPattern(scale, patternLength),
      chords: this.generateHarmonicChordPattern(scale, patternLength),
      arp: this.generateHarmonicArpPattern(scale, patternLength)
    };
    
    return patterns[instrument] || this.generateGenericHarmonicPattern(scale, patternLength);
  }

  /**
   * Generate harmonically constrained bass pattern
   */
  generateHarmonicBassPattern(scale, length) {
    const pattern = [];
    const rootNote = scale[0]; // Use scale root as base
    const octaves = [2, 3, 4]; // Bass range
    
    for (let i = 0; i < length; i++) {
      if (Math.random() < 0.7) { // 70% chance of note
        const note = scale[Math.floor(Math.random() * scale.length)];
        const octave = octaves[Math.floor(Math.random() * octaves.length)];
        pattern.push(`${note}${octave}`);
      } else {
        pattern.push(null);
      }
    }
    
    return pattern;
  }

  /**
   * Generate harmonically constrained lead pattern
   */
  generateHarmonicLeadPattern(scale, length) {
    const pattern = [];
    const octaves = [4, 5, 6]; // Lead range
    
    for (let i = 0; i < length; i++) {
      if (Math.random() < 0.6) { // 60% chance of note
        const note = scale[Math.floor(Math.random() * scale.length)];
        const octave = octaves[Math.floor(Math.random() * octaves.length)];
        pattern.push(`${note}${octave}`);
      } else {
        pattern.push(null);
      }
    }
    
    return pattern;
  }

  /**
   * Generate harmonically constrained chord pattern
   */
  generateHarmonicChordPattern(scale, length) {
    const pattern = [];
    const chordTypes = this.scaleKeyManager.getChordTypesForMode(this.currentHarmonicContext.mode);
    
    for (let i = 0; i < length; i++) {
      if (Math.random() < 0.4) { // 40% chance of chord
        const degree = Math.floor(Math.random() * scale.length);
        const rootNote = scale[degree];
        const chordType = chordTypes[degree];
        
        const chord = this.musicTheoryUtils.getChordNotes(rootNote, chordType);
        pattern.push(chord);
      } else {
        pattern.push(null);
      }
    }
    
    return pattern;
  }

  /**
   * Generate harmonically constrained arpeggio pattern
   */
  generateHarmonicArpPattern(scale, length) {
    const pattern = [];
    const chordTypes = this.scaleKeyManager.getChordTypesForMode(this.currentHarmonicContext.mode);
    
    for (let i = 0; i < length; i++) {
      if (Math.random() < 0.8) { // 80% chance of note
        const degree = Math.floor(Math.random() * scale.length);
        const rootNote = scale[degree];
        const chordType = chordTypes[degree];
        
        const chordNotes = this.musicTheoryUtils.getChordNotes(rootNote, chordType);
        const note = chordNotes[Math.floor(Math.random() * chordNotes.length)];
        const octave = 4 + Math.floor(Math.random() * 2); // Octaves 4-5
        
        pattern.push(`${note}${octave}`);
      } else {
        pattern.push(null);
      }
    }
    
    return pattern;
  }

  /**
   * Generate generic harmonically constrained pattern
   */
  generateGenericHarmonicPattern(scale, length) {
    const pattern = [];
    const octaves = [3, 4, 5];
    
    for (let i = 0; i < length; i++) {
      if (Math.random() < 0.5) {
        const note = scale[Math.floor(Math.random() * scale.length)];
        const octave = octaves[Math.floor(Math.random() * octaves.length)];
        pattern.push(`${note}${octave}`);
      } else {
        pattern.push(null);
      }
    }
    
    return pattern;
  }

  /**
   * Apply harmonic constraints to existing patterns
   */
  applyHarmonicConstraints(patterns) {
    const constrainedPatterns = {};
    const scale = this.currentHarmonicContext.scale;
    
    for (const [instrument, pattern] of Object.entries(patterns)) {
      if (Array.isArray(pattern)) {
        constrainedPatterns[instrument] = pattern.map(note => {
          if (!note) return null;
          
          // Check if note is in scale
          if (this.harmonicConstraints.enforceScale) {
            const noteName = note.replace(/\d+/, '');
            if (!scale.includes(noteName)) {
              // Replace with closest scale note
              return this.findClosestScaleNote(note, scale);
            }
          }
          
          return note;
        });
      } else {
        constrainedPatterns[instrument] = pattern;
      }
    }
    
    return constrainedPatterns;
  }

  /**
   * Find closest note in scale
   */
  findClosestScaleNote(note, scale) {
    const match = note.match(/^([A-G]#?)(\d+)$/);
    if (!match) return note;
    
    const [, noteName, octave] = match;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const currentIndex = noteNames.indexOf(noteName);
    
    let closestNote = scale[0];
    let smallestDistance = Infinity;
    
    for (const scaleNote of scale) {
      const scaleIndex = noteNames.indexOf(scaleNote);
      const distance = Math.abs(scaleIndex - currentIndex);
      
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestNote = scaleNote;
      }
    }
    
    return `${closestNote}${octave}`;
  }

  /**
   * Generate chord progression for current harmonic context
   */
  generateChordProgression(style = 'common', length = 4) {
    const progression = this.chordProgressionEngine.generateProgression(
      this.currentHarmonicContext.key,
      this.currentHarmonicContext.mode,
      style,
      length
    );
    
    this.currentHarmonicContext.chordProgression = progression;
    return progression;
  }

  /**
   * Get current chord for a given step
   */
  getCurrentChord(step) {
    if (!this.currentHarmonicContext.chordProgression.length) return null;
    
    const chordIndex = Math.floor(step / 4) % this.currentHarmonicContext.chordProgression.length;
    return this.currentHarmonicContext.chordProgression[chordIndex];
  }

  /**
   * Generate pattern variations based on harmonic context
   */
  generateHarmonicVariations(basePattern, variationIntensity = 0.5) {
    const variations = [];
    const scale = this.currentHarmonicContext.scale;
    
    for (let i = 0; i < 3; i++) {
      const variation = basePattern.map(note => {
        if (!note || Math.random() > variationIntensity) return note;
        
        // Apply harmonic variation
        if (Math.random() < 0.3) {
          // Replace with scale note
          const scaleNote = scale[Math.floor(Math.random() * scale.length)];
          const octave = note.replace(/[A-G]#?/, '');
          return `${scaleNote}${octave}`;
        } else if (Math.random() < 0.2) {
          // Transpose within scale
          const semitones = Math.floor(Math.random() * 7) - 3; // -3 to +3 semitones
          return this.musicTheoryUtils.transposeNote(note, semitones);
        }
        
        return note;
      });
      
      variations.push(variation);
    }
    
    return variations;
  }

  /**
   * Analyze pattern for harmonic content
   */
  analyzePatternHarmony(pattern) {
    if (!Array.isArray(pattern)) return null;
    
    const notes = pattern.filter(note => note !== null);
    const scale = this.currentHarmonicContext.scale;
    
    const analysis = {
      totalNotes: notes.length,
      scaleNotes: 0,
      outOfScaleNotes: 0,
      harmonicity: 0,
      chordTones: 0,
      nonChordTones: 0
    };
    
    notes.forEach(note => {
      const noteName = note.replace(/\d+/, '');
      if (scale.includes(noteName)) {
        analysis.scaleNotes++;
      } else {
        analysis.outOfScaleNotes++;
      }
    });
    
    // Calculate harmonicity
    if (notes.length > 1) {
      let totalConsonance = 0;
      let comparisons = 0;
      
      for (let i = 0; i < notes.length; i++) {
        for (let j = i + 1; j < notes.length; j++) {
          const consonance = this.musicTheoryUtils.calculateConsonance(notes[i], notes[j]);
          totalConsonance += consonance;
          comparisons++;
        }
      }
      
      analysis.harmonicity = comparisons > 0 ? totalConsonance / comparisons : 0;
    }
    
    analysis.scaleAdherence = notes.length > 0 ? analysis.scaleNotes / notes.length : 0;
    
    return analysis;
  }

  /**
   * Get harmonic suggestions for pattern improvement
   */
  getHarmonicSuggestions(pattern) {
    const analysis = this.analyzePatternHarmony(pattern);
    if (!analysis) return [];
    
    const suggestions = [];
    
    if (analysis.scaleAdherence < 0.8) {
      suggestions.push({
        type: 'scale_adherence',
        message: 'Consider using more notes from the current scale',
        priority: 'high'
      });
    }
    
    if (analysis.harmonicity < 0.5) {
      suggestions.push({
        type: 'harmonicity',
        message: 'Try using more consonant intervals',
        priority: 'medium'
      });
    }
    
    if (analysis.totalNotes < 4) {
      suggestions.push({
        type: 'density',
        message: 'Consider adding more notes for richer harmonic content',
        priority: 'low'
      });
    }
    
    return suggestions;
  }

  /**
   * Set harmonic constraints
   */
  setHarmonicConstraints(constraints) {
    this.harmonicConstraints = { ...this.harmonicConstraints, ...constraints };
  }

  /**
   * Get current harmonic context
   */
  getCurrentHarmonicContext() {
    return { ...this.currentHarmonicContext };
  }

  /**
   * Get harmonic constraints
   */
  getHarmonicConstraints() {
    return { ...this.harmonicConstraints };
  }

  /**
   * Export harmonic context for sharing
   */
  exportHarmonicContext() {
    return {
      key: this.currentHarmonicContext.key,
      mode: this.currentHarmonicContext.mode,
      scale: this.currentHarmonicContext.scale,
      chordProgression: this.currentHarmonicContext.chordProgression,
      constraints: this.harmonicConstraints,
      timestamp: Date.now()
    };
  }

  /**
   * Import harmonic context
   */
  importHarmonicContext(context) {
    if (context.key && context.mode) {
      this.setHarmonicContext(context.key, context.mode, context.chordProgression);
    }
    
    if (context.constraints) {
      this.setHarmonicConstraints(context.constraints);
    }
  }
}