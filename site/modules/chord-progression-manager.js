/**
 * Chord Progression Manager
 * Manages harmonic progressions and chord sequences
 */

import { ScaleKeyManager } from './scale-key-manager.js';

export class ChordProgressionManager {
  constructor(scaleKeyManager) {
    this.scaleKeyManager = scaleKeyManager || new ScaleKeyManager();
    this.currentProgression = [];
    this.progressionHistory = [];
    this.voiceLeadingRules = this.initializeVoiceLeadingRules();
    this.chordSubstitutions = this.initializeChordSubstitutions();
    this.cadenceTypes = this.initializeCadenceTypes();
    this.harmonicRhythm = { pattern: [1, 1, 1, 1], current: 0 }; // 1 = chord change, 0 = hold
  }

  initializeVoiceLeadingRules() {
    return {
      // Common voice leading principles
      smoothMotion: true, // Prefer stepwise motion
      avoidParallels: true, // Avoid parallel fifths and octaves
      resolveTritones: true, // Resolve tritones properly
      maintainRange: true, // Keep voices in appropriate ranges
      bassMotion: 'strong', // 'strong', 'weak', 'mixed'
      tenorRange: { min: 3, max: 5 }, // C3 to C5
      altoRange: { min: 4, max: 6 }, // C4 to C6
      sopranoRange: { min: 5, max: 7 } // C5 to C7
    };
  }

  initializeChordSubstitutions() {
    return {
      // Tonic substitutions
      'I': ['vi', 'iii', 'I6', 'I64'],
      'i': ['VI', 'III', 'i6', 'i64'],
      
      // Subdominant substitutions
      'IV': ['ii', 'ii6', 'IV6', 'iv'],
      'iv': ['ii°', 'ii°6', 'iv6', 'IV'],
      
      // Dominant substitutions
      'V': ['vii°', 'V7', 'V9', 'V13'],
      'v': ['VII', 'v7', 'v9', 'v13'],
      
      // Secondary dominants
      'V/vi': ['V7/vi', 'vii°/vi'],
      'V/ii': ['V7/ii', 'vii°/ii'],
      'V/IV': ['V7/IV', 'vii°/IV'],
      'V/V': ['V7/V', 'vii°/V']
    };
  }

  initializeCadenceTypes() {
    return {
      'perfect_authentic': {
        pattern: ['V', 'I'],
        strength: 1.0,
        resolution: 'strong',
        description: 'V to I with root in bass'
      },
      'imperfect_authentic': {
        pattern: ['V', 'I'],
        strength: 0.8,
        resolution: 'moderate',
        description: 'V to I with third or fifth in bass'
      },
      'plagal': {
        pattern: ['IV', 'I'],
        strength: 0.6,
        resolution: 'gentle',
        description: 'IV to I (Amen cadence)'
      },
      'deceptive': {
        pattern: ['V', 'vi'],
        strength: 0.4,
        resolution: 'weak',
        description: 'V to vi (surprise resolution)'
      },
      'half': {
        pattern: ['ii', 'V'],
        strength: 0.3,
        resolution: 'incomplete',
        description: 'ii to V (incomplete cadence)'
      },
      'phrygian': {
        pattern: ['iv6', 'V'],
        strength: 0.7,
        resolution: 'strong',
        description: 'iv6 to V (Phrygian cadence)'
      }
    };
  }

  // Generate a chord progression
  generateProgression(length = 4, style = 'classical', mood = 'balanced') {
    const progressionTemplates = this.getProgressionTemplates(style, mood);
    const template = this.selectTemplate(progressionTemplates, length);
    
    const progression = [];
    const scale = this.scaleKeyManager.getCurrentScale();
    const key = this.scaleKeyManager.getCurrentKey();
    
    for (let i = 0; i < length; i++) {
      const chordSymbol = template[i % template.length];
      const chord = this.buildChord(chordSymbol, i);
      
      if (chord) {
        progression.push(chord);
      }
    }
    
    // Apply voice leading
    if (this.voiceLeadingRules.smoothMotion) {
      this.applyVoiceLeading(progression);
    }
    
    // Apply harmonic rhythm
    this.applyHarmonicRhythm(progression);
    
    this.currentProgression = progression;
    this.progressionHistory.push([...progression]);
    
    return progression;
  }

  // Get progression templates by style and mood
  getProgressionTemplates(style, mood) {
    const templates = {
      classical: {
        balanced: [
          ['I', 'V', 'vi', 'IV'],
          ['I', 'IV', 'V', 'I'],
          ['vi', 'IV', 'I', 'V'],
          ['I', 'vi', 'IV', 'V']
        ],
        happy: [
          ['I', 'V', 'I', 'V'],
          ['I', 'IV', 'I', 'V'],
          ['I', 'V', 'vi', 'V']
        ],
        sad: [
          ['i', 'iv', 'i', 'V'],
          ['i', 'VI', 'iv', 'V'],
          ['i', 'iv', 'VII', 'i']
        ]
      },
      jazz: {
        balanced: [
          ['I', 'ii', 'V', 'I'],
          ['I', 'vi', 'ii', 'V'],
          ['ii', 'V', 'I', 'vi'],
          ['I', 'iii', 'vi', 'ii', 'V', 'I']
        ],
        happy: [
          ['I', 'I7', 'IV', 'iv'],
          ['I', 'VI', 'ii', 'V'],
          ['I', 'V/vi', 'vi', 'V']
        ],
        sad: [
          ['i', 'VI', 'ii°', 'V'],
          ['i', 'iv', 'VII', 'i'],
          ['i', 'VI', 'iv', 'V']
        ]
      },
      pop: {
        balanced: [
          ['I', 'V', 'vi', 'IV'],
          ['vi', 'IV', 'I', 'V'],
          ['I', 'vi', 'IV', 'V'],
          ['IV', 'I', 'V', 'vi']
        ],
        happy: [
          ['I', 'V', 'I', 'V'],
          ['I', 'IV', 'I', 'V'],
          ['I', 'V', 'vi', 'V']
        ],
        sad: [
          ['vi', 'IV', 'I', 'V'],
          ['i', 'VI', 'iv', 'V'],
          ['vi', 'I', 'IV', 'V']
        ]
      },
      electronic: {
        balanced: [
          ['i', 'VII', 'VI', 'VII'],
          ['i', 'v', 'VI', 'VII'],
          ['i', 'VII', 'i', 'VII'],
          ['i', 'VI', 'VII', 'i']
        ],
        happy: [
          ['I', 'V', 'I', 'V'],
          ['I', 'IV', 'I', 'V'],
          ['I', 'V', 'vi', 'V']
        ],
        sad: [
          ['i', 'VII', 'VI', 'VII'],
          ['i', 'v', 'VI', 'VII'],
          ['i', 'VI', 'VII', 'i']
        ]
      }
    };
    
    return templates[style]?.[mood] || templates.classical.balanced;
  }

  // Select a template based on length and preferences
  selectTemplate(templates, length) {
    const suitableTemplates = templates.filter(template => 
      template.length <= length || length % template.length === 0
    );
    
    if (suitableTemplates.length === 0) {
      return templates[0] || ['I', 'V', 'vi', 'IV'];
    }
    
    return suitableTemplates[Math.floor(Math.random() * suitableTemplates.length)];
  }

  // Build a chord from symbol
  buildChord(symbol, position) {
    const scale = this.scaleKeyManager.getCurrentScale();
    const key = this.scaleKeyManager.getCurrentKey();
    const octave = 4;
    
    // Parse chord symbol
    const chordInfo = this.parseChordSymbol(symbol);
    if (!chordInfo) return null;
    
    // Get chord notes
    const chordNotes = this.getChordNotes(chordInfo.degree, octave, chordInfo.type);
    
    // Apply voicing
    const voicing = this.generateVoicing(chordNotes, chordInfo, position);
    
    return {
      symbol: symbol,
      degree: chordInfo.degree,
      type: chordInfo.type,
      notes: voicing,
      duration: this.getChordDuration(position),
      velocity: this.getChordVelocity(chordInfo),
      function: this.getHarmonicFunction(chordInfo.degree),
      tension: this.calculateTension(chordInfo)
    };
  }

  // Parse chord symbol (e.g., 'I', 'V7', 'ii°', 'V/vi')
  parseChordSymbol(symbol) {
    const match = symbol.match(/^([IViv]+)([°°+]?)(\d*)(?:\/([IViv]+))?$/);
    if (!match) return null;
    
    const [, degree, quality, extension, secondary] = match;
    
    return {
      degree: this.romanToDegree(degree),
      quality: quality,
      extension: extension ? parseInt(extension) : 0,
      secondary: secondary ? this.romanToDegree(secondary) : null,
      type: this.determineChordType(quality, extension)
    };
  }

  // Convert Roman numeral to degree
  romanToDegree(roman) {
    const romanMap = {
      'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7,
      'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7
    };
    return romanMap[roman] || 1;
  }

  // Determine chord type from quality and extension
  determineChordType(quality, extension) {
    if (extension >= 7) return 'seventh';
    if (extension >= 6) return 'sixth';
    if (quality === '°') return 'diminished';
    if (quality === '+') return 'augmented';
    if (quality === '') return 'major';
    return 'minor';
  }

  // Get chord notes from degree and type
  getChordNotes(degree, octave, type) {
    const scale = this.scaleKeyManager.getCurrentScale();
    const keyOffset = this.scaleKeyManager.getKeyOffset(this.scaleKeyManager.getCurrentKey());
    
    const rootSemitone = scale.semitones[(degree - 1) % scale.semitones.length];
    const rootNoteNumber = (octave * 12) + keyOffset + rootSemitone;
    
    const intervals = this.getChordIntervals(type);
    return intervals.map(interval => {
      const noteNumber = rootNoteNumber + interval;
      return this.scaleKeyManager.midiToNote(noteNumber);
    });
  }

  // Get chord intervals by type
  getChordIntervals(type) {
    const intervals = {
      'major': [0, 4, 7],
      'minor': [0, 3, 7],
      'diminished': [0, 3, 6],
      'augmented': [0, 4, 8],
      'seventh': [0, 4, 7, 10],
      'minor_seventh': [0, 3, 7, 10],
      'major_seventh': [0, 4, 7, 11],
      'diminished_seventh': [0, 3, 6, 9],
      'half_diminished': [0, 3, 6, 10],
      'sixth': [0, 4, 7, 9],
      'minor_sixth': [0, 3, 7, 9]
    };
    
    return intervals[type] || intervals['major'];
  }

  // Generate chord voicing
  generateVoicing(notes, chordInfo, position) {
    const voicing = [...notes];
    
    // Apply inversions
    if (Math.random() < 0.3) {
      const inversion = Math.floor(Math.random() * 3) + 1; // 1st, 2nd, or 3rd inversion
      for (let i = 0; i < inversion; i++) {
        const root = voicing.shift();
        voicing.push(this.scaleKeyManager.applyOctaveShift ? 
          this.scaleKeyManager.applyOctaveShift(root, 1) : 
          this.applyOctaveShift(root, 1));
      }
    }
    
    // Apply voice leading from previous chord
    if (position > 0 && this.currentProgression.length > 0) {
      const previousChord = this.currentProgression[position - 1];
      this.applyVoiceLeadingToChord(previousChord, voicing);
    }
    
    return voicing;
  }

  // Apply voice leading between chords
  applyVoiceLeading(progression) {
    for (let i = 1; i < progression.length; i++) {
      const currentChord = progression[i];
      const previousChord = progression[i - 1];
      
      this.applyVoiceLeadingToChord(previousChord, currentChord.notes);
    }
  }

  // Apply voice leading to a single chord
  applyVoiceLeadingToChord(previousChord, currentNotes) {
    if (!previousChord || !this.voiceLeadingRules.smoothMotion) return;
    
    // Simple voice leading: move each voice to the nearest note
    const previousNotes = previousChord.notes || [];
    
    for (let i = 0; i < Math.min(currentNotes.length, previousNotes.length); i++) {
      const previousNote = previousNotes[i];
      const currentNote = currentNotes[i];
      
      if (previousNote && currentNote) {
        const previousMidi = this.scaleKeyManager.noteToMidi(previousNote);
        const currentMidi = this.scaleKeyManager.noteToMidi(currentNote);
        
        // If the leap is too large, try to find a closer note
        if (Math.abs(currentMidi - previousMidi) > 7) { // More than a perfect fifth
          const closerNote = this.findCloserNote(previousNote, currentNotes);
          if (closerNote) {
            const index = currentNotes.indexOf(currentNote);
            if (index !== -1) {
              currentNotes[index] = closerNote;
            }
          }
        }
      }
    }
  }

  // Find a closer note for voice leading
  findCloserNote(referenceNote, availableNotes) {
    const referenceMidi = this.scaleKeyManager.noteToMidi(referenceNote);
    let closestNote = availableNotes[0];
    let minDistance = Math.abs(this.scaleKeyManager.noteToMidi(closestNote) - referenceMidi);
    
    availableNotes.forEach(note => {
      const distance = Math.abs(this.scaleKeyManager.noteToMidi(note) - referenceMidi);
      if (distance < minDistance) {
        minDistance = distance;
        closestNote = note;
      }
    });
    
    return closestNote;
  }

  // Apply harmonic rhythm
  applyHarmonicRhythm(progression) {
    const pattern = this.harmonicRhythm.pattern;
    let patternIndex = 0;
    
    progression.forEach((chord, index) => {
      if (pattern[patternIndex % pattern.length] === 0) {
        // Hold previous chord
        if (index > 0) {
          chord.notes = progression[index - 1].notes;
          chord.symbol = progression[index - 1].symbol;
        }
      }
      patternIndex++;
    });
  }

  // Get chord duration based on position
  getChordDuration(position) {
    const pattern = this.harmonicRhythm.pattern;
    const patternIndex = position % pattern.length;
    return pattern[patternIndex] === 1 ? 1.0 : 0.5;
  }

  // Get chord velocity based on harmonic function
  getChordVelocity(chordInfo) {
    const function = this.getHarmonicFunction(chordInfo.degree);
    const baseVelocity = 0.7;
    
    switch (function) {
      case 'tonic': return baseVelocity;
      case 'subdominant': return baseVelocity + 0.1;
      case 'dominant': return baseVelocity + 0.2;
      default: return baseVelocity;
    }
  }

  // Get harmonic function of a degree
  getHarmonicFunction(degree) {
    const scale = this.scaleKeyManager.getCurrentScale();
    const scaleName = this.scaleKeyManager.getCurrentScale().name.toLowerCase();
    
    if (scaleName.includes('major')) {
      switch (degree) {
        case 1: return 'tonic';
        case 2: case 4: return 'subdominant';
        case 3: case 6: return 'tonic';
        case 5: case 7: return 'dominant';
        default: return 'tonic';
      }
    } else {
      switch (degree) {
        case 1: return 'tonic';
        case 2: case 4: return 'subdominant';
        case 3: case 6: return 'tonic';
        case 5: case 7: return 'dominant';
        default: return 'tonic';
      }
    }
  }

  // Calculate harmonic tension
  calculateTension(chordInfo) {
    let tension = 0.5; // Base tension
    
    // Add tension based on chord type
    switch (chordInfo.type) {
      case 'diminished': tension += 0.3; break;
      case 'augmented': tension += 0.2; break;
      case 'seventh': tension += 0.1; break;
      case 'major': tension -= 0.1; break;
    }
    
    // Add tension based on harmonic function
    const function = this.getHarmonicFunction(chordInfo.degree);
    switch (function) {
      case 'dominant': tension += 0.2; break;
      case 'subdominant': tension += 0.1; break;
      case 'tonic': tension -= 0.2; break;
    }
    
    return Math.max(0, Math.min(1, tension));
  }

  // Apply octave shift to note
  applyOctaveShift(note, octaves) {
    const midi = this.scaleKeyManager.noteToMidi(note);
    const newMidi = midi + (octaves * 12);
    return this.scaleKeyManager.midiToNote(newMidi);
  }

  // Generate cadence
  generateCadence(type = 'perfect_authentic') {
    const cadence = this.cadenceTypes[type];
    if (!cadence) return null;
    
    const progression = this.generateProgression(cadence.pattern.length, 'classical', 'balanced');
    return {
      type: type,
      pattern: cadence.pattern,
      chords: progression,
      strength: cadence.strength,
      resolution: cadence.resolution,
      description: cadence.description
    };
  }

  // Substitute chords in progression
  substituteChords(progression, substitutionLevel = 0.3) {
    return progression.map(chord => {
      if (Math.random() < substitutionLevel) {
        const substitutions = this.chordSubstitutions[chord.symbol];
        if (substitutions && substitutions.length > 0) {
          const newSymbol = substitutions[Math.floor(Math.random() * substitutions.length)];
          return this.buildChord(newSymbol, progression.indexOf(chord));
        }
      }
      return chord;
    });
  }

  // Update harmonic rhythm
  setHarmonicRhythm(pattern) {
    this.harmonicRhythm.pattern = pattern;
    this.harmonicRhythm.current = 0;
  }

  // Update voice leading rules
  updateVoiceLeadingRules(rules) {
    this.voiceLeadingRules = { ...this.voiceLeadingRules, ...rules };
  }

  // Get current progression
  getCurrentProgression() {
    return [...this.currentProgression];
  }

  // Get progression history
  getProgressionHistory() {
    return [...this.progressionHistory];
  }

  // Clear progression history
  clearHistory() {
    this.progressionHistory = [];
  }

  // Export configuration
  exportConfiguration() {
    return {
      voiceLeadingRules: this.voiceLeadingRules,
      harmonicRhythm: this.harmonicRhythm,
      currentProgression: this.currentProgression,
      timestamp: new Date().toISOString()
    };
  }

  // Import configuration
  importConfiguration(config) {
    if (config.voiceLeadingRules) {
      this.updateVoiceLeadingRules(config.voiceLeadingRules);
    }
    if (config.harmonicRhythm) {
      this.setHarmonicRhythm(config.harmonicRhythm.pattern);
    }
    if (config.currentProgression) {
      this.currentProgression = config.currentProgression;
    }
  }
}