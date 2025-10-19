/**
 * Note Generation Engine
 * Generates scale-aware notes, melodies, and patterns
 */

import { ScaleKeyManager } from './scale-key-manager.js';

export class NoteGenerationEngine {
  constructor(scaleKeyManager) {
    this.scaleKeyManager = scaleKeyManager || new ScaleKeyManager();
    this.generationSettings = {
      octaveRange: { min: 3, max: 5 },
      noteDensity: 0.7, // 0-1, how many steps have notes
      rhythmComplexity: 0.5, // 0-1, complexity of rhythm patterns
      melodicContour: 'balanced', // 'ascending', 'descending', 'balanced', 'random'
      harmonicComplexity: 0.6, // 0-1, chord complexity
      tensionLevel: 0.5, // 0-1, harmonic tension
      humanization: 0.3 // 0-1, timing and velocity variation
    };
    this.patternTemplates = this.initializePatternTemplates();
    this.melodicContours = this.initializeMelodicContours();
  }

  initializePatternTemplates() {
    return {
      // Bass patterns
      bass: {
        'root_fifth': { pattern: [1, 0, 5, 0], rhythm: [1, 0, 1, 0] },
        'walking': { pattern: [1, 2, 3, 4], rhythm: [1, 1, 1, 1] },
        'octave_jump': { pattern: [1, 0, 1, 0], rhythm: [1, 0, 1, 0], octaveShift: [0, 1, 0, 1] },
        'arpeggio': { pattern: [1, 3, 5, 3], rhythm: [1, 1, 1, 1] },
        'pedal': { pattern: [1, 1, 1, 1], rhythm: [1, 0, 1, 0] }
      },
      // Lead patterns
      lead: {
        'melodic': { pattern: [1, 2, 3, 5, 4, 3, 2, 1], rhythm: [1, 1, 1, 1, 1, 1, 1, 1] },
        'arpeggio': { pattern: [1, 3, 5, 7, 5, 3], rhythm: [1, 1, 1, 1, 1, 1] },
        'scale_run': { pattern: [1, 2, 3, 4, 5, 6, 7, 8], rhythm: [1, 1, 1, 1, 1, 1, 1, 1] },
        'leap': { pattern: [1, 5, 3, 7, 5, 1], rhythm: [1, 0, 1, 0, 1, 0] },
        'ornament': { pattern: [1, 2, 1, 3, 2, 1], rhythm: [1, 0.5, 0.5, 1, 0.5, 0.5] }
      },
      // Chord patterns
      chord: {
        'triad': { pattern: [1, 3, 5], rhythm: [1, 1, 1] },
        'seventh': { pattern: [1, 3, 5, 7], rhythm: [1, 1, 1, 1] },
        'inversion': { pattern: [3, 5, 1], rhythm: [1, 1, 1] },
        'spread': { pattern: [1, 5, 3], rhythm: [1, 1, 1] },
        'cluster': { pattern: [1, 2, 3], rhythm: [1, 1, 1] }
      }
    };
  }

  initializeMelodicContours() {
    return {
      'ascending': { direction: 1, curve: 'linear', tension: 0.3 },
      'descending': { direction: -1, curve: 'linear', tension: 0.7 },
      'balanced': { direction: 0, curve: 'sine', tension: 0.5 },
      'random': { direction: 0, curve: 'random', tension: 0.6 },
      'arch': { direction: 0, curve: 'parabolic', tension: 0.4 },
      'valley': { direction: 0, curve: 'inverted_parabolic', tension: 0.6 }
    };
  }

  // Generate a bass pattern
  generateBassPattern(length = 16, template = 'root_fifth') {
    const scale = this.scaleKeyManager.getCurrentScale();
    const key = this.scaleKeyManager.getCurrentKey();
    const templateData = this.patternTemplates.bass[template];
    
    if (!templateData) {
      return this.generateRandomBassPattern(length);
    }

    const pattern = [];
    const octave = this.generationSettings.octaveRange.min;
    
    for (let i = 0; i < length; i++) {
      const templateIndex = i % templateData.pattern.length;
      const degree = templateData.pattern[templateIndex];
      const rhythm = templateData.rhythm[templateIndex % templateData.rhythm.length];
      
      if (rhythm > 0 && Math.random() < this.generationSettings.noteDensity) {
        const note = this.getNoteFromDegree(degree, octave);
        const octaveShift = templateData.octaveShift ? templateData.octaveShift[templateIndex] : 0;
        const finalNote = this.applyOctaveShift(note, octaveShift);
        
        pattern.push({
          note: finalNote,
          velocity: this.calculateVelocity(rhythm),
          duration: this.calculateDuration(rhythm),
          degree: degree
        });
      } else {
        pattern.push(null);
      }
    }
    
    return this.applyHumanization(pattern);
  }

  // Generate a lead melody
  generateLeadMelody(length = 16, template = 'melodic') {
    const scale = this.scaleKeyManager.getCurrentScale();
    const templateData = this.patternTemplates.lead[template];
    
    if (!templateData) {
      return this.generateRandomLeadMelody(length);
    }

    const pattern = [];
    const octave = this.generationSettings.octaveRange.min + 1; // Lead typically higher
    const contour = this.melodicContours[this.generationSettings.melodicContour];
    
    for (let i = 0; i < length; i++) {
      const templateIndex = i % templateData.pattern.length;
      const degree = templateData.pattern[templateIndex];
      const rhythm = templateData.rhythm[templateIndex % templateData.rhythm.length];
      
      if (rhythm > 0 && Math.random() < this.generationSettings.noteDensity) {
        // Apply melodic contour
        const contourDegree = this.applyMelodicContour(degree, i, length, contour);
        const note = this.getNoteFromDegree(contourDegree, octave);
        
        pattern.push({
          note: note,
          velocity: this.calculateVelocity(rhythm),
          duration: this.calculateDuration(rhythm),
          degree: contourDegree
        });
      } else {
        pattern.push(null);
      }
    }
    
    return this.applyHumanization(pattern);
  }

  // Generate chord progression
  generateChordProgression(length = 4, progressionType = 'I-V-vi-IV') {
    const commonProgressions = this.scaleKeyManager.getCommonProgressions();
    const functionSequence = commonProgressions[progressionType] || commonProgressions['I-V-vi-IV'];
    
    const progression = this.scaleKeyManager.getChordProgression(functionSequence, this.generationSettings.octaveRange.min);
    const chords = [];
    
    for (let i = 0; i < length; i++) {
      const chordIndex = i % progression.length;
      const chord = progression[chordIndex];
      
      // Generate chord voicing based on harmonic complexity
      const voicing = this.generateChordVoicing(chord.notes, chord.degree);
      
      chords.push({
        ...chord,
        voicing: voicing,
        duration: 1, // One beat per chord
        velocity: this.calculateVelocity(0.8)
      });
    }
    
    return chords;
  }

  // Generate chord voicing
  generateChordVoicing(notes, degree) {
    const complexity = this.generationSettings.harmonicComplexity;
    const octave = this.generationSettings.octaveRange.min;
    
    if (complexity < 0.3) {
      // Simple triad
      return notes.slice(0, 3).map(note => this.applyOctaveShift(note, 0));
    } else if (complexity < 0.6) {
      // Add seventh
      return notes.slice(0, 4).map(note => this.applyOctaveShift(note, 0));
    } else {
      // Complex voicing with inversions and extensions
      const voicing = [...notes.slice(0, 3)];
      
      // Add seventh if complexity allows
      if (Math.random() < complexity) {
        voicing.push(notes[3] || notes[0]);
      }
      
      // Add ninth if very complex
      if (complexity > 0.8 && Math.random() < 0.5) {
        const ninth = this.getNoteFromDegree((degree + 1) % 8, octave + 1);
        voicing.push(ninth);
      }
      
      // Apply inversion
      if (Math.random() < 0.3) {
        const root = voicing.shift();
        voicing.push(this.applyOctaveShift(root, 1));
      }
      
      return voicing;
    }
  }

  // Generate random bass pattern
  generateRandomBassPattern(length) {
    const pattern = [];
    const octave = this.generationSettings.octaveRange.min;
    
    for (let i = 0; i < length; i++) {
      if (Math.random() < this.generationSettings.noteDensity) {
        const degree = this.getRandomScaleDegree();
        const note = this.getNoteFromDegree(degree, octave);
        
        pattern.push({
          note: note,
          velocity: this.calculateVelocity(0.8),
          duration: this.calculateDuration(0.8),
          degree: degree
        });
      } else {
        pattern.push(null);
      }
    }
    
    return pattern;
  }

  // Generate random lead melody
  generateRandomLeadMelody(length) {
    const pattern = [];
    const octave = this.generationSettings.octaveRange.min + 1;
    
    for (let i = 0; i < length; i++) {
      if (Math.random() < this.generationSettings.noteDensity) {
        const degree = this.getRandomScaleDegree();
        const note = this.getNoteFromDegree(degree, octave);
        
        pattern.push({
          note: note,
          velocity: this.calculateVelocity(0.7),
          duration: this.calculateDuration(0.7),
          degree: degree
        });
      } else {
        pattern.push(null);
      }
    }
    
    return pattern;
  }

  // Apply melodic contour to a degree
  applyMelodicContour(degree, position, length, contour) {
    const progress = position / (length - 1);
    let contourModifier = 0;
    
    switch (contour.curve) {
      case 'linear':
        contourModifier = contour.direction * progress;
        break;
      case 'sine':
        contourModifier = Math.sin(progress * Math.PI) * 0.5;
        break;
      case 'parabolic':
        contourModifier = 4 * progress * (1 - progress);
        break;
      case 'inverted_parabolic':
        contourModifier = 1 - 4 * progress * (1 - progress);
        break;
      case 'random':
        contourModifier = (Math.random() - 0.5) * 2;
        break;
    }
    
    const scale = this.scaleKeyManager.getCurrentScale();
    const scaleLength = scale.semitones.length;
    const modifiedDegree = Math.max(1, Math.min(scaleLength, degree + Math.round(contourModifier * 3)));
    
    return modifiedDegree;
  }

  // Get note from scale degree
  getNoteFromDegree(degree, octave) {
    const scale = this.scaleKeyManager.getCurrentScale();
    const keyOffset = this.scaleKeyManager.getKeyOffset(this.scaleKeyManager.getCurrentKey());
    
    const degreeIndex = (degree - 1) % scale.semitones.length;
    const semitone = scale.semitones[degreeIndex];
    const noteNumber = (octave * 12) + keyOffset + semitone;
    
    return this.scaleKeyManager.midiToNote(noteNumber);
  }

  // Get random scale degree
  getRandomScaleDegree() {
    const scale = this.scaleKeyManager.getCurrentScale();
    return Math.floor(Math.random() * scale.semitones.length) + 1;
  }

  // Apply octave shift to note
  applyOctaveShift(note, octaveShift) {
    const midi = this.scaleKeyManager.noteToMidi(note);
    const newMidi = midi + (octaveShift * 12);
    return this.scaleKeyManager.midiToNote(newMidi);
  }

  // Calculate velocity based on rhythm and settings
  calculateVelocity(rhythm) {
    const baseVelocity = rhythm * 0.8 + 0.2; // 0.2 to 1.0
    const humanization = (Math.random() - 0.5) * this.generationSettings.humanization * 0.4;
    return Math.max(0.1, Math.min(1.0, baseVelocity + humanization));
  }

  // Calculate duration based on rhythm
  calculateDuration(rhythm) {
    const baseDuration = rhythm * 0.5 + 0.25; // 0.25 to 0.75
    const humanization = (Math.random() - 0.5) * this.generationSettings.humanization * 0.2;
    return Math.max(0.1, Math.min(1.0, baseDuration + humanization));
  }

  // Apply humanization to pattern
  applyHumanization(pattern) {
    if (this.generationSettings.humanization === 0) return pattern;
    
    return pattern.map(step => {
      if (!step) return step;
      
      const humanization = this.generationSettings.humanization;
      
      return {
        ...step,
        velocity: Math.max(0.1, Math.min(1.0, step.velocity + (Math.random() - 0.5) * humanization * 0.3)),
        duration: Math.max(0.1, Math.min(1.0, step.duration + (Math.random() - 0.5) * humanization * 0.2))
      };
    });
  }

  // Generate pattern based on mood/emotion
  generateMoodPattern(mood, instrument = 'lead', length = 16) {
    const moodSettings = this.getMoodSettings(mood);
    const originalSettings = { ...this.generationSettings };
    
    // Apply mood settings
    this.generationSettings = { ...this.generationSettings, ...moodSettings };
    
    let pattern;
    switch (instrument) {
      case 'bass':
        pattern = this.generateBassPattern(length);
        break;
      case 'lead':
        pattern = this.generateLeadMelody(length);
        break;
      case 'chord':
        pattern = this.generateChordProgression(Math.ceil(length / 4));
        break;
      default:
        pattern = this.generateLeadMelody(length);
    }
    
    // Restore original settings
    this.generationSettings = originalSettings;
    
    return pattern;
  }

  // Get mood-based settings
  getMoodSettings(mood) {
    const moodMap = {
      'happy': {
        melodicContour: 'ascending',
        tensionLevel: 0.3,
        noteDensity: 0.8,
        harmonicComplexity: 0.4
      },
      'sad': {
        melodicContour: 'descending',
        tensionLevel: 0.7,
        noteDensity: 0.5,
        harmonicComplexity: 0.6
      },
      'energetic': {
        melodicContour: 'random',
        tensionLevel: 0.8,
        noteDensity: 0.9,
        rhythmComplexity: 0.8,
        harmonicComplexity: 0.7
      },
      'calm': {
        melodicContour: 'balanced',
        tensionLevel: 0.2,
        noteDensity: 0.4,
        rhythmComplexity: 0.2,
        harmonicComplexity: 0.3
      },
      'mysterious': {
        melodicContour: 'valley',
        tensionLevel: 0.6,
        noteDensity: 0.6,
        harmonicComplexity: 0.8,
        humanization: 0.5
      },
      'dramatic': {
        melodicContour: 'arch',
        tensionLevel: 0.9,
        noteDensity: 0.7,
        rhythmComplexity: 0.9,
        harmonicComplexity: 0.9
      }
    };
    
    return moodMap[mood] || moodMap['balanced'];
  }

  // Update generation settings
  updateSettings(newSettings) {
    this.generationSettings = { ...this.generationSettings, ...newSettings };
  }

  // Get current settings
  getSettings() {
    return { ...this.generationSettings };
  }

  // Generate pattern variations
  generateVariations(basePattern, count = 3) {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      const variation = basePattern.map(step => {
        if (!step) return step;
        
        // Vary the note
        if (Math.random() < 0.3) {
          const degree = step.degree;
          const newDegree = this.getRandomScaleDegree();
          const octave = this.generationSettings.octaveRange.min + (step.note.includes('5') ? 1 : 0);
          const newNote = this.getNoteFromDegree(newDegree, octave);
          
          return {
            ...step,
            note: newNote,
            degree: newDegree
          };
        }
        
        // Vary velocity
        if (Math.random() < 0.4) {
          return {
            ...step,
            velocity: Math.max(0.1, Math.min(1.0, step.velocity + (Math.random() - 0.5) * 0.4))
          };
        }
        
        return step;
      });
      
      variations.push(variation);
    }
    
    return variations;
  }

  // Export configuration
  exportConfiguration() {
    return {
      settings: this.generationSettings,
      scaleKey: this.scaleKeyManager.exportConfiguration(),
      timestamp: new Date().toISOString()
    };
  }

  // Import configuration
  importConfiguration(config) {
    if (config.settings) {
      this.updateSettings(config.settings);
    }
    if (config.scaleKey) {
      this.scaleKeyManager.importConfiguration(config.scaleKey);
    }
  }
}