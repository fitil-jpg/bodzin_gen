/**
 * Procedural Pattern Generator
 * Advanced pattern generation using music theory and Wolfram integration
 */

import { MusicTheoryEngine } from './music-theory-engine.js';
import { WolframConnector } from './wolfram-connector.js';

export class ProceduralPatternGenerator {
  constructor(app) {
    this.app = app;
    this.musicTheory = new MusicTheoryEngine();
    this.wolfram = new WolframConnector();
    this.patterns = new Map();
    this.generationHistory = [];
    this.currentStyle = 'bodzin';
    this.complexity = 0.5;
    this.randomness = 0.3;
    
    this.initializeStyles();
  }

  async initialize() {
    await this.wolfram.initialize();
    this.generateDefaultPatterns();
  }

  initializeStyles() {
    this.styles = {
      bodzin: {
        name: 'Bodzin',
        characteristics: {
          tempo: 120,
          key: 'C minor',
          scale: 'harmonicMinor',
          chordProgression: 'bodzin',
          rhythmStyle: 'fourOnFloor',
          complexity: 0.6,
          tension: 0.4
        }
      },
      ambient: {
        name: 'Ambient',
        characteristics: {
          tempo: 80,
          key: 'F major',
          scale: 'lydian',
          chordProgression: 'ambient',
          rhythmStyle: 'shuffle',
          complexity: 0.3,
          tension: 0.2
        }
      },
      cinematic: {
        name: 'Cinematic',
        characteristics: {
          tempo: 100,
          key: 'D minor',
          scale: 'dorian',
          chordProgression: 'cinematic',
          rhythmStyle: 'breakbeat',
          complexity: 0.8,
          tension: 0.7
        }
      },
      jazz: {
        name: 'Jazz',
        characteristics: {
          tempo: 140,
          key: 'Bb major',
          scale: 'major',
          chordProgression: 'iiV7I',
          rhythmStyle: 'syncopated',
          complexity: 0.9,
          tension: 0.8
        }
      },
      experimental: {
        name: 'Experimental',
        characteristics: {
          tempo: 90,
          key: 'C',
          scale: 'chromatic',
          chordProgression: 'random',
          rhythmStyle: 'polyrhythm',
          complexity: 1.0,
          tension: 0.9
        }
      }
    };
  }

  generateDefaultPatterns() {
    // Generate patterns for each instrument based on current style
    const style = this.styles[this.currentStyle];
    
    this.patterns.set('kick', this.generateKickPattern(style));
    this.patterns.set('snare', this.generateSnarePattern(style));
    this.patterns.set('hihat', this.generateHihatPattern(style));
    this.patterns.set('bass', this.generateBassPattern(style));
    this.patterns.set('lead', this.generateLeadPattern(style));
    this.patterns.set('fx', this.generateFxPattern(style));
  }

  // Pattern Generation Methods
  generateKickPattern(style) {
    const basePattern = this.musicTheory.rhythms.get(style.rhythmStyle)?.pattern || [1, 0, 0, 0];
    const variations = this.generateRhythmicVariations(basePattern, style);
    
    return {
      pattern: variations,
      velocity: this.generateVelocityPattern(variations, 0.8, 1.0),
      timing: this.generateTimingVariations(variations, 0.1),
      accent: this.generateAccentPattern(variations, style.tension)
    };
  }

  generateSnarePattern(style) {
    const basePattern = this.musicTheory.rhythms.get('bodzinSnare')?.pattern || [0, 0, 0, 0, 1, 0, 0, 0];
    const variations = this.generateRhythmicVariations(basePattern, style);
    
    return {
      pattern: variations,
      velocity: this.generateVelocityPattern(variations, 0.6, 0.9),
      timing: this.generateTimingVariations(variations, 0.15),
      accent: this.generateAccentPattern(variations, style.tension * 0.8)
    };
  }

  generateHihatPattern(style) {
    const basePattern = this.musicTheory.rhythms.get('bodzinHihat')?.pattern || [0, 1, 0, 1];
    const variations = this.generateRhythmicVariations(basePattern, style);
    
    return {
      pattern: variations,
      velocity: this.generateVelocityPattern(variations, 0.3, 0.6),
      timing: this.generateTimingVariations(variations, 0.2),
      accent: this.generateAccentPattern(variations, style.tension * 0.5)
    };
  }

  generateBassPattern(style) {
    const scale = this.musicTheory.scales.get(style.scale);
    const progression = this.musicTheory.progressions.get(style.chordProgression);
    
    if (!scale || !progression) {
      return this.generateFallbackBassPattern();
    }
    
    const chordProgression = progression.getChords(0, style.scale);
    const melody = this.generateMelodicPattern(scale, chordProgression, style);
    
    return {
      pattern: melody.notes,
      velocity: melody.velocities,
      timing: melody.timing,
      accent: melody.accents,
      harmony: chordProgression
    };
  }

  generateLeadPattern(style) {
    const scale = this.musicTheory.scales.get(style.scale);
    const progression = this.musicTheory.progressions.get(style.chordProgression);
    
    if (!scale || !progression) {
      return this.generateFallbackLeadPattern();
    }
    
    const chordProgression = progression.getChords(0, style.scale);
    const melody = this.generateMelodicPattern(scale, chordProgression, style, 'lead');
    
    return {
      pattern: melody.notes,
      velocity: melody.velocities,
      timing: melody.timing,
      accent: melody.accents,
      harmony: chordProgression,
      effects: this.generateEffectPattern(melody.notes, style)
    };
  }

  generateFxPattern(style) {
    const basePattern = this.generateRandomPattern(16, 0.3);
    
    return {
      pattern: basePattern,
      velocity: this.generateVelocityPattern(basePattern, 0.2, 0.8),
      timing: this.generateTimingVariations(basePattern, 0.3),
      accent: this.generateAccentPattern(basePattern, style.tension * 0.6),
      effects: this.generateEffectPattern(basePattern, style)
    };
  }

  // Advanced Pattern Generation
  generateMelodicPattern(scale, chordProgression, style, type = 'bass') {
    const length = 16;
    const notes = [];
    const velocities = [];
    const timing = [];
    const accents = [];
    
    for (let i = 0; i < length; i++) {
      const chordIndex = Math.floor(i / (length / chordProgression.length));
      const currentChord = chordProgression[chordIndex % chordProgression.length];
      const scaleNotes = scale.getNotes();
      
      // Generate note based on chord and scale
      let note;
      if (type === 'bass') {
        // Bass typically plays chord roots or scale notes
        note = this.selectBassNote(currentChord, scaleNotes, i);
      } else {
        // Lead can play any chord tone or scale note
        note = this.selectLeadNote(currentChord, scaleNotes, i, style);
      }
      
      notes.push(note);
      velocities.push(this.calculateVelocity(note, i, style));
      timing.push(this.calculateTiming(i, style));
      accents.push(this.calculateAccent(i, style));
    }
    
    return { notes, velocities, timing, accents };
  }

  selectBassNote(chord, scaleNotes, position) {
    // Bass typically plays chord roots or scale notes
    const chordRoot = chord[0];
    const scaleNote = scaleNotes[position % scaleNotes.length];
    
    // 70% chance to play chord root, 30% chance to play scale note
    return Math.random() < 0.7 ? chordRoot : scaleNote;
  }

  selectLeadNote(chord, scaleNotes, position, style) {
    // Lead can play any chord tone or scale note
    const allNotes = [...chord, ...scaleNotes];
    const weightedNotes = this.calculateNoteWeights(allNotes, position, style);
    
    return this.selectWeightedNote(weightedNotes);
  }

  calculateNoteWeights(notes, position, style) {
    const weights = new Map();
    
    notes.forEach(note => {
      let weight = 1.0;
      
      // Higher notes for higher positions
      weight += (note - 60) * 0.01;
      
      // Chord tones get higher weight
      if (this.isChordTone(note)) {
        weight *= 1.5;
      }
      
      // Scale notes get medium weight
      if (this.isScaleNote(note)) {
        weight *= 1.2;
      }
      
      // Add randomness based on style
      weight *= (1 + (Math.random() - 0.5) * style.complexity);
      
      weights.set(note, weight);
    });
    
    return weights;
  }

  selectWeightedNote(weights) {
    const totalWeight = Array.from(weights.values()).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [note, weight] of weights) {
      random -= weight;
      if (random <= 0) {
        return note;
      }
    }
    
    return Array.from(weights.keys())[0];
  }

  generateRhythmicVariations(basePattern, style) {
    const variations = [...basePattern];
    
    // Apply complexity-based variations
    for (let i = 0; i < variations.length; i++) {
      if (variations[i] === 1) {
        // Add ghost notes
        if (Math.random() < style.complexity * 0.3) {
          variations[i] = 0.5;
        }
      } else {
        // Add hits
        if (Math.random() < style.complexity * 0.2) {
          variations[i] = 1;
        }
      }
    }
    
    // Apply syncopation
    if (style.complexity > 0.5) {
      this.applySyncopation(variations, style.complexity);
    }
    
    return variations;
  }

  applySyncopation(pattern, intensity) {
    for (let i = 1; i < pattern.length - 1; i++) {
      if (pattern[i] === 0 && pattern[i - 1] === 1 && pattern[i + 1] === 1) {
        if (Math.random() < intensity * 0.4) {
          pattern[i] = 1;
          pattern[i - 1] = 0;
        }
      }
    }
  }

  generateVelocityPattern(pattern, minVel, maxVel) {
    return pattern.map(beat => {
      if (beat === 0) return 0;
      if (beat === 0.5) return minVel + (maxVel - minVel) * 0.5;
      return minVel + (maxVel - minVel) * (0.7 + Math.random() * 0.3);
    });
  }

  generateTimingVariations(pattern, intensity) {
    return pattern.map(beat => {
      if (beat === 0) return 0;
      return (Math.random() - 0.5) * intensity;
    });
  }

  generateAccentPattern(pattern, tension) {
    return pattern.map((beat, index) => {
      if (beat === 0) return 0;
      
      let accent = 0.5;
      
      // Strong accent on first beat
      if (index === 0) accent = 1.0;
      
      // Medium accent on downbeats
      else if (index % 4 === 0) accent = 0.8;
      
      // Light accent on even beats
      else if (index % 2 === 0) accent = 0.6;
      
      // Add tension-based variation
      accent += (Math.random() - 0.5) * tension;
      
      return Math.max(0, Math.min(1, accent));
    });
  }

  generateEffectPattern(notes, style) {
    const effects = [];
    
    for (let i = 0; i < notes.length; i++) {
      const effect = {
        reverb: Math.random() * style.tension,
        delay: Math.random() * style.complexity,
        filter: Math.random() * 0.8,
        distortion: Math.random() * style.tension * 0.5
      };
      
      effects.push(effect);
    }
    
    return effects;
  }

  generateRandomPattern(length, density) {
    const pattern = [];
    for (let i = 0; i < length; i++) {
      pattern.push(Math.random() < density ? 1 : 0);
    }
    return pattern;
  }

  // Utility Methods
  isChordTone(note) {
    // Simplified chord tone detection
    const chordTones = [0, 4, 7, 10, 14, 17, 21];
    return chordTones.includes(note % 12);
  }

  isScaleNote(note) {
    // Simplified scale note detection
    const scaleNotes = [0, 2, 4, 5, 7, 9, 11];
    return scaleNotes.includes(note % 12);
  }

  calculateVelocity(note, position, style) {
    let velocity = 0.5;
    
    // Higher notes get higher velocity
    velocity += (note - 60) * 0.01;
    
    // Position-based velocity
    velocity += Math.sin(position * Math.PI / 8) * 0.2;
    
    // Style-based variation
    velocity += (Math.random() - 0.5) * style.complexity * 0.3;
    
    return Math.max(0.1, Math.min(1.0, velocity));
  }

  calculateTiming(position, style) {
    // Add slight timing variations
    return (Math.random() - 0.5) * style.complexity * 0.1;
  }

  calculateAccent(position, style) {
    let accent = 0.5;
    
    // Strong accent on first beat
    if (position === 0) accent = 1.0;
    
    // Medium accent on downbeats
    else if (position % 4 === 0) accent = 0.8;
    
    // Light accent on even beats
    else if (position % 2 === 0) accent = 0.6;
    
    // Add style-based variation
    accent += (Math.random() - 0.5) * style.tension;
    
    return Math.max(0, Math.min(1, accent));
  }

  // Fallback Methods
  generateFallbackBassPattern() {
    return {
      pattern: [60, 0, 60, 0, 60, 0, 60, 0, 60, 0, 60, 0, 60, 0, 60, 0],
      velocity: [0.8, 0, 0.8, 0, 0.8, 0, 0.8, 0, 0.8, 0, 0.8, 0, 0.8, 0, 0.8, 0],
      timing: new Array(16).fill(0),
      accent: [1, 0, 0.8, 0, 0.6, 0, 0.8, 0, 0.8, 0, 0.6, 0, 0.8, 0, 0.8, 0]
    };
  }

  generateFallbackLeadPattern() {
    return {
      pattern: [72, 0, 74, 0, 76, 0, 77, 0, 79, 0, 81, 0, 83, 0, 84, 0],
      velocity: [0.6, 0, 0.7, 0, 0.8, 0, 0.7, 0, 0.6, 0, 0.7, 0, 0.8, 0, 0.7, 0],
      timing: new Array(16).fill(0),
      accent: [0.8, 0, 0.6, 0, 0.7, 0, 0.6, 0, 0.8, 0, 0.6, 0, 0.7, 0, 0.6, 0],
      effects: new Array(16).fill({ reverb: 0.3, delay: 0.2, filter: 0.5, distortion: 0.1 })
    };
  }

  // Style Management
  setStyle(styleName) {
    if (this.styles[styleName]) {
      this.currentStyle = styleName;
      this.generateDefaultPatterns();
      return true;
    }
    return false;
  }

  setComplexity(complexity) {
    this.complexity = Math.max(0, Math.min(1, complexity));
    this.generateDefaultPatterns();
  }

  setRandomness(randomness) {
    this.randomness = Math.max(0, Math.min(1, randomness));
    this.generateDefaultPatterns();
  }

  // Pattern Export/Import
  exportPatterns() {
    return {
      style: this.currentStyle,
      complexity: this.complexity,
      randomness: this.randomness,
      patterns: Object.fromEntries(this.patterns),
      timestamp: new Date().toISOString()
    };
  }

  importPatterns(data) {
    if (data.style) this.setStyle(data.style);
    if (data.complexity !== undefined) this.setComplexity(data.complexity);
    if (data.randomness !== undefined) this.setRandomness(data.randomness);
    if (data.patterns) {
      this.patterns = new Map(Object.entries(data.patterns));
    }
  }

  // Get Current Patterns
  getPatterns() {
    return Object.fromEntries(this.patterns);
  }

  getPattern(instrument) {
    return this.patterns.get(instrument);
  }
}