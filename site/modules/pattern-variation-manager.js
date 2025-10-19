import { 
  STEP_COUNT, 
  AUTOMATION_TRACK_DEFINITIONS,
  CURVE_TYPES 
} from '../utils/constants.js';
import { clamp, lerp } from '../utils/helpers.js';

export class PatternVariationManager {
  constructor(app) {
    this.app = app;
    this.variations = new Map();
    this.currentPattern = 'A';
    this.variationIntensity = 0.5;
    this.morphingEnabled = false;
    this.morphingSpeed = 0.1;
    this.randomizationEnabled = false;
    this.randomizationAmount = 0.2;
    
    // Initialize default patterns
    this.initializeDefaultPatterns();
  }

  initializeDefaultPatterns() {
    // Create pattern A (original)
    this.variations.set('A', this.createPatternVariation('A', AUTOMATION_TRACK_DEFINITIONS));
    
    // Create pattern B (variation)
    this.variations.set('B', this.createPatternVariation('B', AUTOMATION_TRACK_DEFINITIONS));
    
    // Create pattern C (alternative variation)
    this.variations.set('C', this.createPatternVariation('C', AUTOMATION_TRACK_DEFINITIONS));
  }

  createPatternVariation(patternId, trackDefinitions) {
    const variation = {
      id: patternId,
      name: `Pattern ${patternId}`,
      tracks: trackDefinitions.map(definition => ({
        id: definition.id,
        label: definition.label,
        color: definition.color,
        values: this.generateVariationValues(definition.curve, patternId),
        curveType: definition.curveType || CURVE_TYPES.LINEAR,
        lfo: definition.lfo || null,
        breakpoints: definition.breakpoints || []
      })),
      sections: this.generateSectionVariation(patternId),
      // Add musical patterns if key signature is available
      musicalPatterns: this.generateMusicalPatterns(patternId),
      metadata: {
        createdAt: new Date().toISOString(),
        intensity: this.variationIntensity,
        characteristics: this.getPatternCharacteristics(patternId)
      }
    };
    
    return variation;
  }

  generateVariationValues(baseCurve, patternId) {
    if (!Array.isArray(baseCurve) || baseCurve.length === 0) {
      return new Array(STEP_COUNT).fill(0.5);
    }

    const variationFactors = this.getVariationFactors(patternId);
    const intensity = this.variationIntensity;
    
    return baseCurve.map((value, index) => {
      let variation = 0;
      
      // Apply pattern-specific variation
      switch (patternId) {
        case 'A':
          // Original pattern - minimal variation
          variation = (Math.random() - 0.5) * 0.05;
          break;
        case 'B':
          // More dynamic variation
          variation = Math.sin(index * Math.PI / STEP_COUNT) * 0.3 * intensity;
          variation += (Math.random() - 0.5) * 0.1 * intensity;
          break;
        case 'C':
          // Complex variation with multiple harmonics
          variation = Math.sin(index * Math.PI * 2 / STEP_COUNT) * 0.2 * intensity;
          variation += Math.sin(index * Math.PI * 4 / STEP_COUNT) * 0.15 * intensity;
          variation += (Math.random() - 0.5) * 0.15 * intensity;
          break;
        default:
          variation = (Math.random() - 0.5) * 0.2 * intensity;
      }
      
      // Apply randomization if enabled
      if (this.randomizationEnabled) {
        variation += (Math.random() - 0.5) * this.randomizationAmount;
      }
      
      const newValue = value + variation;
      return clamp(newValue, 0, 1);
    });
  }

  generateSectionVariation(patternId) {
    const baseSections = [
      { name: 'Intro', start: 0, end: 3, color: 'rgba(73, 169, 255, 0.05)' },
      { name: 'Lift', start: 4, end: 7, color: 'rgba(255, 73, 175, 0.04)' },
      { name: 'Peak', start: 8, end: 11, color: 'rgba(148, 255, 73, 0.04)' },
      { name: 'Break', start: 12, end: 15, color: 'rgba(255, 180, 73, 0.05)' }
    ];

    switch (patternId) {
      case 'A':
        return baseSections;
      case 'B':
        // Extended sections
        return [
          { name: 'Intro', start: 0, end: 2, color: 'rgba(73, 169, 255, 0.05)' },
          { name: 'Build', start: 3, end: 5, color: 'rgba(255, 73, 175, 0.04)' },
          { name: 'Lift', start: 6, end: 9, color: 'rgba(255, 73, 175, 0.04)' },
          { name: 'Peak', start: 10, end: 13, color: 'rgba(148, 255, 73, 0.04)' },
          { name: 'Break', start: 14, end: 15, color: 'rgba(255, 180, 73, 0.05)' }
        ];
      case 'C':
        // Compressed sections
        return [
          { name: 'Intro', start: 0, end: 1, color: 'rgba(73, 169, 255, 0.05)' },
          { name: 'Peak', start: 2, end: 7, color: 'rgba(148, 255, 73, 0.04)' },
          { name: 'Break', start: 8, end: 11, color: 'rgba(255, 180, 73, 0.05)' },
          { name: 'Outro', start: 12, end: 15, color: 'rgba(73, 169, 255, 0.05)' }
        ];
      default:
        return baseSections;
    }
  }

  getVariationFactors(patternId) {
    const factors = {
      'A': { harmonic: 1, random: 0.05, phase: 0 },
      'B': { harmonic: 2, random: 0.15, phase: Math.PI / 4 },
      'C': { harmonic: 4, random: 0.25, phase: Math.PI / 2 }
    };
    return factors[patternId] || factors['A'];
  }

  getPatternCharacteristics(patternId) {
    const characteristics = {
      'A': { energy: 0.5, complexity: 0.3, stability: 0.9 },
      'B': { energy: 0.7, complexity: 0.6, stability: 0.6 },
      'C': { energy: 0.9, complexity: 0.8, stability: 0.4 }
    };
    return characteristics[patternId] || characteristics['A'];
  }

  /**
   * Generate musical patterns based on key signature
   * @param {string} patternId - Pattern identifier
   * @returns {Object} Musical patterns for different instruments
   */
  generateMusicalPatterns(patternId) {
    if (!this.app.keySignature || !this.app.keySignature.enabled) {
      return this.getDefaultMusicalPatterns(patternId);
    }

    const keySignature = this.app.keySignature;
    const melodicPattern = keySignature.generateMelodicPattern(
      keySignature.melodicPatternLength || 8,
      keySignature.melodicPatternType || 'random'
    );
    const harmonicPattern = keySignature.generateHarmonicPattern(4);

    return {
      lead: {
        notes: melodicPattern,
        pattern: this.generateLeadPattern(patternId, melodicPattern),
        type: 'melodic'
      },
      bass: {
        notes: this.generateBassPattern(patternId, harmonicPattern),
        pattern: this.generateBassPattern(patternId, harmonicPattern),
        type: 'harmonic'
      },
      chords: {
        progression: harmonicPattern,
        pattern: this.generateChordPattern(patternId, harmonicPattern),
        type: 'harmonic'
      },
      drums: {
        notes: this.generateDrumPattern(patternId),
        pattern: this.generateDrumPattern(patternId),
        type: 'rhythmic'
      }
    };
  }

  /**
   * Generate lead pattern based on melodic notes
   * @param {string} patternId - Pattern identifier
   * @param {Array} melodicNotes - Array of note names
   * @returns {Array} Lead pattern with note triggers
   */
  generateLeadPattern(patternId, melodicNotes) {
    const pattern = new Array(STEP_COUNT).fill(null);
    
    switch (patternId) {
      case 'A':
        // Sparse, melodic pattern
        for (let i = 0; i < STEP_COUNT; i += 2) {
          const noteIndex = Math.floor(i / 2) % melodicNotes.length;
          pattern[i] = melodicNotes[noteIndex];
        }
        break;
      case 'B':
        // More active pattern
        for (let i = 0; i < STEP_COUNT; i++) {
          if (i % 3 !== 0) { // Skip every 3rd step
            const noteIndex = i % melodicNotes.length;
            pattern[i] = melodicNotes[noteIndex];
          }
        }
        break;
      case 'C':
        // Dense, complex pattern
        for (let i = 0; i < STEP_COUNT; i++) {
          const noteIndex = (i + Math.floor(i / 4)) % melodicNotes.length;
          pattern[i] = melodicNotes[noteIndex];
        }
        break;
    }
    
    return pattern;
  }

  /**
   * Generate bass pattern based on harmonic progression
   * @param {string} patternId - Pattern identifier
   * @param {Array} harmonicPattern - Array of chord objects
   * @returns {Array} Bass pattern with root notes
   */
  generateBassPattern(patternId, harmonicPattern) {
    const pattern = new Array(STEP_COUNT).fill(null);
    const chordsPerStep = Math.ceil(STEP_COUNT / harmonicPattern.length);
    
    for (let i = 0; i < STEP_COUNT; i++) {
      const chordIndex = Math.floor(i / chordsPerStep) % harmonicPattern.length;
      const chord = harmonicPattern[chordIndex];
      
      if (chord && chord.notes && chord.notes.length > 0) {
        // Use root note for bass
        pattern[i] = chord.notes[0];
      }
    }
    
    return pattern;
  }

  /**
   * Generate chord pattern based on harmonic progression
   * @param {string} patternId - Pattern identifier
   * @param {Array} harmonicPattern - Array of chord objects
   * @returns {Array} Chord pattern
   */
  generateChordPattern(patternId, harmonicPattern) {
    const pattern = new Array(STEP_COUNT).fill(null);
    const chordsPerStep = Math.ceil(STEP_COUNT / harmonicPattern.length);
    
    for (let i = 0; i < STEP_COUNT; i++) {
      const chordIndex = Math.floor(i / chordsPerStep) % harmonicPattern.length;
      const chord = harmonicPattern[chordIndex];
      
      if (chord && chord.notes) {
        pattern[i] = chord.notes;
      }
    }
    
    return pattern;
  }

  /**
   * Generate drum pattern (rhythmic, not melodic)
   * @param {string} patternId - Pattern identifier
   * @returns {Array} Drum pattern
   */
  generateDrumPattern(patternId) {
    const pattern = new Array(STEP_COUNT).fill(null);
    
    switch (patternId) {
      case 'A':
        // Basic 4/4 pattern
        pattern[0] = 'kick';
        pattern[4] = 'kick';
        pattern[8] = 'kick';
        pattern[12] = 'kick';
        pattern[2] = 'snare';
        pattern[6] = 'snare';
        pattern[10] = 'snare';
        pattern[14] = 'snare';
        break;
      case 'B':
        // More complex pattern
        pattern[0] = 'kick';
        pattern[3] = 'kick';
        pattern[6] = 'kick';
        pattern[9] = 'kick';
        pattern[12] = 'kick';
        pattern[15] = 'kick';
        pattern[1] = 'snare';
        pattern[5] = 'snare';
        pattern[9] = 'snare';
        pattern[13] = 'snare';
        break;
      case 'C':
        // Dense, complex pattern
        for (let i = 0; i < STEP_COUNT; i++) {
          if (i % 2 === 0) {
            pattern[i] = 'kick';
          } else if (i % 4 === 1) {
            pattern[i] = 'snare';
          } else if (i % 8 === 3) {
            pattern[i] = 'hihat';
          }
        }
        break;
    }
    
    return pattern;
  }

  /**
   * Get default musical patterns when key signature is disabled
   * @param {string} patternId - Pattern identifier
   * @returns {Object} Default musical patterns
   */
  getDefaultMusicalPatterns(patternId) {
    return {
      lead: {
        notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
        pattern: this.generateLeadPattern(patternId, ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']),
        type: 'melodic'
      },
      bass: {
        notes: ['C3', 'F3', 'G3', 'C3'],
        pattern: this.generateBassPattern(patternId, [{ notes: ['C3'] }, { notes: ['F3'] }, { notes: ['G3'] }, { notes: ['C3'] }]),
        type: 'harmonic'
      },
      chords: {
        progression: [{ notes: ['C4', 'E4', 'G4'] }, { notes: ['F4', 'A4', 'C5'] }, { notes: ['G4', 'B4', 'D5'] }, { notes: ['C4', 'E4', 'G4'] }],
        pattern: this.generateChordPattern(patternId, [{ notes: ['C4', 'E4', 'G4'] }, { notes: ['F4', 'A4', 'C5'] }, { notes: ['G4', 'B4', 'D5'] }, { notes: ['C4', 'E4', 'G4'] }]),
        type: 'harmonic'
      },
      drums: {
        notes: ['kick', 'snare', 'hihat'],
        pattern: this.generateDrumPattern(patternId),
        type: 'rhythmic'
      }
    };
  }

  // Pattern switching methods
  switchPattern(patternId) {
    if (!this.variations.has(patternId)) {
      console.warn(`Pattern ${patternId} not found`);
      return false;
    }
    
    this.currentPattern = patternId;
    this.applyPatternToAutomation(patternId);
    return true;
  }

  applyPatternToAutomation(patternId) {
    const pattern = this.variations.get(patternId);
    if (!pattern) return;

    // Update automation tracks
    if (this.app.automation && this.app.automation.tracks) {
      pattern.tracks.forEach(patternTrack => {
        const automationTrack = this.app.automation.tracks.find(track => track.id === patternTrack.id);
        if (automationTrack) {
          automationTrack.values = [...patternTrack.values];
          automationTrack.curveType = patternTrack.curveType;
          automationTrack.breakpoints = [...patternTrack.breakpoints];
        }
      });
    }

    // Update sections
    if (this.app.automation) {
      this.app.automation.sections = [...pattern.sections];
    }

    // Trigger UI update
    if (this.app.timeline) {
      this.app.timeline.draw();
    }
  }

  // Morphing between patterns
  morphBetweenPatterns(fromPatternId, toPatternId, progress) {
    const fromPattern = this.variations.get(fromPatternId);
    const toPattern = this.variations.get(toPatternId);
    
    if (!fromPattern || !toPattern) return;

    const morphedPattern = {
      id: `${fromPatternId}→${toPatternId}`,
      name: `Morph ${fromPatternId}→${toPatternId}`,
      tracks: fromPattern.tracks.map((fromTrack, index) => {
        const toTrack = toPattern.tracks[index];
        if (!toTrack) return fromTrack;

        return {
          ...fromTrack,
          values: fromTrack.values.map((value, stepIndex) => {
            const toValue = toTrack.values[stepIndex] || value;
            return lerp(value, toValue, progress);
          })
        };
      }),
      sections: this.morphSections(fromPattern.sections, toPattern.sections, progress)
    };

    return morphedPattern;
  }

  morphSections(fromSections, toSections, progress) {
    // Simple section morphing - could be enhanced
    if (progress < 0.5) {
      return fromSections;
    } else {
      return toSections;
    }
  }

  // Randomization methods
  randomizePattern(patternId, intensity = 0.2) {
    const pattern = this.variations.get(patternId);
    if (!pattern) return;

    pattern.tracks.forEach(track => {
      track.values = track.values.map(value => {
        const randomVariation = (Math.random() - 0.5) * intensity;
        return clamp(value + randomVariation, 0, 1);
      });
    });

    this.applyPatternToAutomation(patternId);
  }

  randomizeAllPatterns(intensity = 0.2) {
    this.variations.forEach((pattern, patternId) => {
      this.randomizePattern(patternId, intensity);
    });
  }

  // Pattern management
  createCustomPattern(patternId, name, basePatternId = 'A') {
    const basePattern = this.variations.get(basePatternId);
    if (!basePattern) return false;

    const customPattern = JSON.parse(JSON.stringify(basePattern));
    customPattern.id = patternId;
    customPattern.name = name;
    customPattern.metadata.createdAt = new Date().toISOString();
    customPattern.metadata.isCustom = true;

    this.variations.set(patternId, customPattern);
    return true;
  }

  deletePattern(patternId) {
    if (['A', 'B', 'C'].includes(patternId)) {
      console.warn('Cannot delete default patterns');
      return false;
    }
    
    return this.variations.delete(patternId);
  }

  // Getters
  getCurrentPattern() {
    return this.variations.get(this.currentPattern);
  }

  getPattern(patternId) {
    return this.variations.get(patternId);
  }

  getAllPatterns() {
    return Array.from(this.variations.values());
  }

  getPatternIds() {
    return Array.from(this.variations.keys());
  }

  // Settings
  setVariationIntensity(intensity) {
    this.variationIntensity = clamp(intensity, 0, 1);
  }

  setMorphingEnabled(enabled) {
    this.morphingEnabled = enabled;
  }

  setMorphingSpeed(speed) {
    this.morphingSpeed = clamp(speed, 0.01, 1);
  }

  setRandomizationEnabled(enabled) {
    this.randomizationEnabled = enabled;
  }

  setRandomizationAmount(amount) {
    this.randomizationAmount = clamp(amount, 0, 1);
  }

  // Export/Import
  exportPatterns() {
    const patterns = {};
    this.variations.forEach((pattern, id) => {
      patterns[id] = {
        ...pattern,
        metadata: {
          ...pattern.metadata,
          exportedAt: new Date().toISOString()
        }
      };
    });
    return patterns;
  }

  importPatterns(patternsData) {
    if (!patternsData || typeof patternsData !== 'object') return false;

    let importedCount = 0;
    Object.entries(patternsData).forEach(([id, patternData]) => {
      if (patternData && patternData.tracks && patternData.sections) {
        this.variations.set(id, patternData);
        importedCount++;
      }
    });

    return importedCount > 0;
  }

  // Advanced pattern features
  createPatternFromCurrentState(patternId, name) {
    if (!this.app.automation) return false;
    
    const currentAutomation = {
      tracks: this.app.automation.tracks.map(track => ({
        id: track.id,
        label: track.label,
        color: track.color,
        values: [...track.values],
        curveType: track.curveType,
        lfo: track.lfo,
        breakpoints: [...(track.breakpoints || [])]
      })),
      sections: this.app.automation.sections.map(section => ({ ...section }))
    };
    
    const customPattern = {
      id: patternId,
      name: name || `Custom Pattern ${patternId}`,
      tracks: currentAutomation.tracks,
      sections: currentAutomation.sections,
      metadata: {
        createdAt: new Date().toISOString(),
        intensity: this.variationIntensity,
        characteristics: this.getPatternCharacteristics(patternId),
        isCustom: true,
        source: 'current_state'
      }
    };
    
    this.variations.set(patternId, customPattern);
    return true;
  }

  generatePatternVariations(basePatternId, count = 3) {
    const basePattern = this.variations.get(basePatternId);
    if (!basePattern) return false;
    
    const variations = [];
    for (let i = 0; i < count; i++) {
      const variationId = `${basePatternId}_var_${i + 1}`;
      const variation = this.createPatternVariation(variationId, basePattern.tracks.map(t => ({
        id: t.id,
        label: t.label,
        color: t.color,
        curve: t.values
      })));
      variation.name = `${basePattern.name} Variation ${i + 1}`;
      variation.metadata.source = 'generated';
      variation.metadata.basePattern = basePatternId;
      
      this.variations.set(variationId, variation);
      variations.push(variationId);
    }
    
    return variations;
  }

  analyzePatternSimilarity(patternId1, patternId2) {
    const pattern1 = this.variations.get(patternId1);
    const pattern2 = this.variations.get(patternId2);
    
    if (!pattern1 || !pattern2) return 0;
    
    let totalSimilarity = 0;
    let trackCount = 0;
    
    pattern1.tracks.forEach(track1 => {
      const track2 = pattern2.tracks.find(t => t.id === track1.id);
      if (track2) {
        const similarity = this.calculateTrackSimilarity(track1.values, track2.values);
        totalSimilarity += similarity;
        trackCount++;
      }
    });
    
    return trackCount > 0 ? totalSimilarity / trackCount : 0;
  }

  calculateTrackSimilarity(values1, values2) {
    if (values1.length !== values2.length) return 0;
    
    let sumSquaredDiff = 0;
    for (let i = 0; i < values1.length; i++) {
      const diff = values1[i] - values2[i];
      sumSquaredDiff += diff * diff;
    }
    
    const meanSquaredDiff = sumSquaredDiff / values1.length;
    const similarity = 1 - Math.sqrt(meanSquaredDiff);
    return Math.max(0, similarity);
  }

  // Preset integration
  getPatternForPreset() {
    return {
      currentPattern: this.currentPattern,
      variationIntensity: this.variationIntensity,
      morphingEnabled: this.morphingEnabled,
      morphingSpeed: this.morphingSpeed,
      randomizationEnabled: this.randomizationEnabled,
      randomizationAmount: this.randomizationAmount,
      patterns: this.exportPatterns()
    };
  }

  applyPatternFromPreset(presetData) {
    if (!presetData.patterns) return;

    this.currentPattern = presetData.currentPattern || 'A';
    this.variationIntensity = presetData.variationIntensity || 0.5;
    this.morphingEnabled = presetData.morphingEnabled || false;
    this.morphingSpeed = presetData.morphingSpeed || 0.1;
    this.randomizationEnabled = presetData.randomizationEnabled || false;
    this.randomizationAmount = presetData.randomizationAmount || 0.2;

    this.importPatterns(presetData.patterns);
    this.applyPatternToAutomation(this.currentPattern);
  }
}