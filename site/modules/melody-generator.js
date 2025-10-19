/**
 * Melody Generator
 * Generates melodic lines with musical intelligence
 */

import { ScaleKeyManager } from './scale-key-manager.js';

export class MelodyGenerator {
  constructor(scaleKeyManager) {
    this.scaleKeyManager = scaleKeyManager || new ScaleKeyManager();
    this.melodicRules = this.initializeMelodicRules();
    this.motifTemplates = this.initializeMotifTemplates();
    this.phraseStructures = this.initializePhraseStructures();
    this.ornamentationPatterns = this.initializeOrnamentationPatterns();
    this.currentMotif = null;
    this.melodyHistory = [];
  }

  initializeMelodicRules() {
    return {
      // Melodic contour rules
      maxLeap: 12, // Maximum leap in semitones
      preferStepwise: 0.7, // Probability of stepwise motion
      avoidAugmented: true, // Avoid augmented intervals
      resolveLeaps: true, // Resolve large leaps with stepwise motion
      
      // Range rules
      maxRange: 16, // Maximum range in semitones
      preferCenter: 0.6, // Probability of returning to center of range
      avoidExtremes: true, // Avoid extreme high/low notes
      
      // Rhythm rules
      preferOnBeats: 0.8, // Probability of notes on strong beats
      varyRhythm: 0.5, // Probability of rhythmic variation
      syncopation: 0.3, // Probability of syncopated rhythms
      
      // Repetition rules
      allowRepetition: 0.4, // Probability of repeated notes
      sequenceProbability: 0.3, // Probability of sequences
      variationProbability: 0.6, // Probability of variations
      
      // Ornamentation
      ornamentationLevel: 0.3, // Level of ornamentation (0-1)
      trillProbability: 0.1, // Probability of trills
      graceNoteProbability: 0.2, // Probability of grace notes
      
      // Harmonic awareness
      chordTonePreference: 0.7, // Preference for chord tones
      avoidChromatic: 0.8, // Avoid chromatic notes
      resolveTension: 0.6 // Resolve to stable tones
    };
  }

  initializeMotifTemplates() {
    return {
      // Ascending motifs
      'ascending_scale': {
        pattern: [1, 2, 3, 4, 5],
        rhythm: [1, 1, 1, 1, 1],
        contour: 'ascending',
        energy: 0.7
      },
      'ascending_arpeggio': {
        pattern: [1, 3, 5, 7],
        rhythm: [1, 1, 1, 1],
        contour: 'ascending',
        energy: 0.8
      },
      'ascending_leap': {
        pattern: [1, 5, 3, 7],
        rhythm: [1, 0.5, 0.5, 1],
        contour: 'ascending',
        energy: 0.9
      },
      
      // Descending motifs
      'descending_scale': {
        pattern: [5, 4, 3, 2, 1],
        rhythm: [1, 1, 1, 1, 1],
        contour: 'descending',
        energy: 0.6
      },
      'descending_arpeggio': {
        pattern: [7, 5, 3, 1],
        rhythm: [1, 1, 1, 1],
        contour: 'descending',
        energy: 0.7
      },
      'descending_leap': {
        pattern: [7, 3, 5, 1],
        rhythm: [1, 0.5, 0.5, 1],
        contour: 'descending',
        energy: 0.8
      },
      
      // Balanced motifs
      'arch': {
        pattern: [1, 3, 5, 3, 1],
        rhythm: [1, 1, 1, 1, 1],
        contour: 'arch',
        energy: 0.6
      },
      'valley': {
        pattern: [5, 3, 1, 3, 5],
        rhythm: [1, 1, 1, 1, 1],
        contour: 'valley',
        energy: 0.5
      },
      'wave': {
        pattern: [1, 2, 1, 3, 2, 1],
        rhythm: [1, 0.5, 0.5, 1, 0.5, 0.5],
        contour: 'wave',
        energy: 0.4
      },
      
      // Ornamented motifs
      'ornamented_scale': {
        pattern: [1, 2, 1, 3, 2, 4, 3, 5],
        rhythm: [1, 0.5, 0.5, 1, 0.5, 0.5, 1, 1],
        contour: 'ascending',
        energy: 0.5
      },
      'trill_motif': {
        pattern: [1, 2, 1, 2, 1],
        rhythm: [0.5, 0.5, 0.5, 0.5, 1],
        contour: 'static',
        energy: 0.3
      },
      'grace_note': {
        pattern: [1, 2, 3],
        rhythm: [0.25, 0.25, 1],
        contour: 'ascending',
        energy: 0.4
      }
    };
  }

  initializePhraseStructures() {
    return {
      'question_answer': {
        structure: ['question', 'answer'],
        lengths: [8, 8],
        description: 'Call and response pattern'
      },
      'aaba': {
        structure: ['a', 'a', 'b', 'a'],
        lengths: [8, 8, 8, 8],
        description: 'AABA song form'
      },
      'abac': {
        structure: ['a', 'b', 'a', 'c'],
        lengths: [8, 8, 8, 8],
        description: 'ABAC variation form'
      },
      'through_composed': {
        structure: ['a', 'b', 'c', 'd'],
        lengths: [8, 8, 8, 8],
        description: 'Through-composed (no repetition)'
      },
      'period': {
        structure: ['antecedent', 'consequent'],
        lengths: [8, 8],
        description: 'Classical period structure'
      }
    };
  }

  initializeOrnamentationPatterns() {
    return {
      'trill': {
        pattern: [0, 1, 0, 1],
        rhythm: [0.25, 0.25, 0.25, 0.25],
        type: 'trill'
      },
      'mordent': {
        pattern: [0, 1, 0],
        rhythm: [0.5, 0.25, 0.25],
        type: 'mordent'
      },
      'turn': {
        pattern: [1, 0, -1, 0],
        rhythm: [0.25, 0.25, 0.25, 0.25],
        type: 'turn'
      },
      'appoggiatura': {
        pattern: [1, 0],
        rhythm: [0.5, 0.5],
        type: 'appoggiatura'
      },
      'acciaccatura': {
        pattern: [1, 0],
        rhythm: [0.1, 0.9],
        type: 'acciaccatura'
      }
    };
  }

  // Generate a complete melody
  generateMelody(length = 16, style = 'classical', mood = 'balanced') {
    const phraseStructure = this.selectPhraseStructure(style);
    const melody = [];
    
    let currentPosition = 0;
    for (let i = 0; i < phraseStructure.structure.length; i++) {
      const phraseType = phraseStructure.structure[i];
      const phraseLength = phraseStructure.lengths[i];
      
      const phrase = this.generatePhrase(phraseLength, phraseType, style, mood);
      melody.push(...phrase);
      currentPosition += phraseLength;
    }
    
    // Apply overall melodic development
    this.applyMelodicDevelopment(melody);
    
    // Apply ornamentation
    if (this.melodicRules.ornamentationLevel > 0) {
      this.applyOrnamentation(melody);
    }
    
    this.melodyHistory.push([...melody]);
    return melody;
  }

  // Generate a phrase
  generatePhrase(length, phraseType, style, mood) {
    const phrase = [];
    const motifLength = Math.min(4, length);
    const numMotifs = Math.ceil(length / motifLength);
    
    for (let i = 0; i < numMotifs; i++) {
      const motif = this.generateMotif(motifLength, phraseType, style, mood);
      phrase.push(...motif);
    }
    
    // Trim to exact length
    return phrase.slice(0, length);
  }

  // Generate a motif
  generateMotif(length, phraseType, style, mood) {
    const template = this.selectMotifTemplate(phraseType, style, mood);
    const motif = [];
    
    if (template) {
      // Use template as base
      for (let i = 0; i < length; i++) {
        const templateIndex = i % template.pattern.length;
        const degree = template.pattern[templateIndex];
        const rhythm = template.rhythm[templateIndex % template.rhythm.length];
        
        if (rhythm > 0) {
          const note = this.getNoteFromDegree(degree, 5); // Default to octave 5
          motif.push({
            note: note,
            degree: degree,
            velocity: this.calculateVelocity(rhythm),
            duration: this.calculateDuration(rhythm),
            ornament: null
          });
        } else {
          motif.push(null);
        }
      }
    } else {
      // Generate random motif
      motif.push(...this.generateRandomMotif(length));
    }
    
    // Apply motif variations
    this.applyMotifVariations(motif, phraseType);
    
    return motif;
  }

  // Generate random motif
  generateRandomMotif(length) {
    const motif = [];
    const scale = this.scaleKeyManager.getCurrentScale();
    const currentDegree = Math.floor(Math.random() * scale.semitones.length) + 1;
    
    for (let i = 0; i < length; i++) {
      if (Math.random() < 0.8) { // 80% chance of note
        const degree = this.getNextDegree(currentDegree);
        const note = this.getNoteFromDegree(degree, 5);
        
        motif.push({
          note: note,
          degree: degree,
          velocity: this.calculateVelocity(0.7),
          duration: this.calculateDuration(0.7),
          ornament: null
        });
        
        currentDegree = degree;
      } else {
        motif.push(null);
      }
    }
    
    return motif;
  }

  // Get next degree based on melodic rules
  getNextDegree(currentDegree) {
    const scale = this.scaleKeyManager.getCurrentScale();
    const scaleLength = scale.semitones.length;
    
    if (Math.random() < this.melodicRules.preferStepwise) {
      // Stepwise motion
      const direction = Math.random() < 0.5 ? 1 : -1;
      let nextDegree = currentDegree + direction;
      
      // Wrap around scale
      if (nextDegree < 1) nextDegree = scaleLength;
      if (nextDegree > scaleLength) nextDegree = 1;
      
      return nextDegree;
    } else {
      // Leap motion
      const leapSize = this.calculateLeapSize();
      const direction = Math.random() < 0.5 ? 1 : -1;
      let nextDegree = currentDegree + (leapSize * direction);
      
      // Wrap around scale
      while (nextDegree < 1) nextDegree += scaleLength;
      while (nextDegree > scaleLength) nextDegree -= scaleLength;
      
      return nextDegree;
    }
  }

  // Calculate leap size based on rules
  calculateLeapSize() {
    const maxLeap = Math.min(this.melodicRules.maxLeap, 7); // Max perfect fifth
    const leapSize = Math.floor(Math.random() * maxLeap) + 2; // 2 to maxLeap
    
    // Avoid augmented intervals
    if (this.melodicRules.avoidAugmented && leapSize === 6) {
      return 5; // Use perfect fifth instead
    }
    
    return leapSize;
  }

  // Select motif template
  selectMotifTemplate(phraseType, style, mood) {
    const templates = Object.values(this.motifTemplates);
    const suitableTemplates = templates.filter(template => {
      // Filter by phrase type
      if (phraseType === 'question' && template.contour === 'ascending') return true;
      if (phraseType === 'answer' && template.contour === 'descending') return true;
      if (phraseType === 'antecedent' && template.contour === 'ascending') return true;
      if (phraseType === 'consequent' && template.contour === 'descending') return true;
      
      // Filter by mood
      if (mood === 'happy' && template.energy > 0.6) return true;
      if (mood === 'sad' && template.energy < 0.5) return true;
      if (mood === 'balanced') return true;
      
      return true;
    });
    
    if (suitableTemplates.length === 0) return null;
    
    return suitableTemplates[Math.floor(Math.random() * suitableTemplates.length)];
  }

  // Select phrase structure
  selectPhraseStructure(style) {
    const structures = Object.values(this.phraseStructures);
    return structures[Math.floor(Math.random() * structures.length)];
  }

  // Apply motif variations
  applyMotifVariations(motif, phraseType) {
    if (Math.random() < this.melodicRules.variationProbability) {
      const variationType = this.selectVariationType(phraseType);
      
      switch (variationType) {
        case 'sequence':
          this.applySequence(motif);
          break;
        case 'inversion':
          this.applyInversion(motif);
          break;
        case 'retrograde':
          this.applyRetrograde(motif);
          break;
        case 'augmentation':
          this.applyAugmentation(motif);
          break;
        case 'diminution':
          this.applyDiminution(motif);
          break;
      }
    }
  }

  // Select variation type
  selectVariationType(phraseType) {
    const variations = ['sequence', 'inversion', 'retrograde', 'augmentation', 'diminution'];
    return variations[Math.floor(Math.random() * variations.length)];
  }

  // Apply sequence (repetition at different pitch level)
  applySequence(motif) {
    const sequenceInterval = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 scale degrees
    
    motif.forEach(step => {
      if (step && step.degree) {
        step.degree = ((step.degree - 1 + sequenceInterval) % 7) + 1;
        step.note = this.getNoteFromDegree(step.degree, 5);
      }
    });
  }

  // Apply inversion (upside down)
  applyInversion(motif) {
    const notes = motif.filter(step => step && step.degree).map(step => step.degree);
    if (notes.length === 0) return;
    
    const firstDegree = notes[0];
    
    motif.forEach(step => {
      if (step && step.degree) {
        const interval = step.degree - firstDegree;
        step.degree = firstDegree - interval;
        
        // Wrap around scale
        while (step.degree < 1) step.degree += 7;
        while (step.degree > 7) step.degree -= 7;
        
        step.note = this.getNoteFromDegree(step.degree, 5);
      }
    });
  }

  // Apply retrograde (backwards)
  applyRetrograde(motif) {
    const validSteps = motif.filter(step => step !== null);
    const reversed = [...validSteps].reverse();
    
    let reversedIndex = 0;
    motif.forEach((step, index) => {
      if (step !== null) {
        motif[index] = reversed[reversedIndex++];
      }
    });
  }

  // Apply augmentation (longer durations)
  applyAugmentation(motif) {
    motif.forEach(step => {
      if (step && step.duration) {
        step.duration *= 1.5;
      }
    });
  }

  // Apply diminution (shorter durations)
  applyDiminution(motif) {
    motif.forEach(step => {
      if (step && step.duration) {
        step.duration *= 0.75;
      }
    });
  }

  // Apply melodic development
  applyMelodicDevelopment(melody) {
    // Add overall shape to melody
    const length = melody.length;
    const center = Math.floor(length / 2);
    
    melody.forEach((step, index) => {
      if (step && step.degree) {
        // Create overall arch shape
        const progress = index / (length - 1);
        const archFactor = 4 * progress * (1 - progress); // Parabolic curve
        
        // Adjust degree based on arch
        const adjustment = Math.round(archFactor * 2) - 1; // -1 to 3
        let newDegree = step.degree + adjustment;
        
        // Wrap around scale
        while (newDegree < 1) newDegree += 7;
        while (newDegree > 7) newDegree -= 7;
        
        step.degree = newDegree;
        step.note = this.getNoteFromDegree(newDegree, 5);
      }
    });
  }

  // Apply ornamentation
  applyOrnamentation(melody) {
    melody.forEach((step, index) => {
      if (step && Math.random() < this.melodicRules.ornamentationLevel) {
        const ornamentType = this.selectOrnamentType();
        if (ornamentType) {
          step.ornament = ornamentType;
        }
      }
    });
  }

  // Select ornament type
  selectOrnamentType() {
    const ornaments = Object.keys(this.ornamentationPatterns);
    const probabilities = [
      this.melodicRules.trillProbability,
      this.melodicRules.graceNoteProbability,
      this.melodicRules.graceNoteProbability * 0.5
    ];
    
    for (let i = 0; i < ornaments.length; i++) {
      if (Math.random() < probabilities[i] || probabilities[i]) {
        return ornaments[i];
      }
    }
    
    return null;
  }

  // Get note from degree
  getNoteFromDegree(degree, octave) {
    const scale = this.scaleKeyManager.getCurrentScale();
    const keyOffset = this.scaleKeyManager.getKeyOffset(this.scaleKeyManager.getCurrentKey());
    
    const degreeIndex = (degree - 1) % scale.semitones.length;
    const semitone = scale.semitones[degreeIndex];
    const noteNumber = (octave * 12) + keyOffset + semitone;
    
    return this.scaleKeyManager.midiToNote(noteNumber);
  }

  // Calculate velocity
  calculateVelocity(rhythm) {
    const baseVelocity = rhythm * 0.8 + 0.2;
    const variation = (Math.random() - 0.5) * 0.3;
    return Math.max(0.1, Math.min(1.0, baseVelocity + variation));
  }

  // Calculate duration
  calculateDuration(rhythm) {
    const baseDuration = rhythm * 0.5 + 0.25;
    const variation = (Math.random() - 0.5) * 0.2;
    return Math.max(0.1, Math.min(1.0, baseDuration + variation));
  }

  // Update melodic rules
  updateMelodicRules(rules) {
    this.melodicRules = { ...this.melodicRules, ...rules };
  }

  // Get current melodic rules
  getMelodicRules() {
    return { ...this.melodicRules };
  }

  // Generate melody based on chord progression
  generateMelodyOverChords(chordProgression, length = 16) {
    const melody = [];
    const chordsPerBeat = Math.ceil(length / chordProgression.length);
    
    for (let i = 0; i < length; i++) {
      const chordIndex = Math.floor(i / chordsPerBeat) % chordProgression.length;
      const chord = chordProgression[chordIndex];
      
      if (chord && chord.notes) {
        // Prefer chord tones
        if (Math.random() < this.melodicRules.chordTonePreference) {
          const chordTone = chord.notes[Math.floor(Math.random() * chord.notes.length)];
          melody.push({
            note: chordTone,
            degree: this.scaleKeyManager.getScaleDegree(chordTone),
            velocity: this.calculateVelocity(0.7),
            duration: this.calculateDuration(0.7),
            ornament: null
          });
        } else {
          // Use scale tone
          const degree = this.getRandomScaleDegree();
          const note = this.getNoteFromDegree(degree, 5);
          melody.push({
            note: note,
            degree: degree,
            velocity: this.calculateVelocity(0.7),
            duration: this.calculateDuration(0.7),
            ornament: null
          });
        }
      } else {
        melody.push(null);
      }
    }
    
    return melody;
  }

  // Get random scale degree
  getRandomScaleDegree() {
    const scale = this.scaleKeyManager.getCurrentScale();
    return Math.floor(Math.random() * scale.semitones.length) + 1;
  }

  // Export configuration
  exportConfiguration() {
    return {
      melodicRules: this.melodicRules,
      currentMotif: this.currentMotif,
      melodyHistory: this.melodyHistory,
      timestamp: new Date().toISOString()
    };
  }

  // Import configuration
  importConfiguration(config) {
    if (config.melodicRules) {
      this.updateMelodicRules(config.melodicRules);
    }
    if (config.currentMotif) {
      this.currentMotif = config.currentMotif;
    }
    if (config.melodyHistory) {
      this.melodyHistory = config.melodyHistory;
    }
  }
}