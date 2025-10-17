import { STEP_COUNT, STEP_DURATION } from '../utils/constants.js';

export class PatternChainManager {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.patternChains = new Map();
    this.currentChain = null;
    this.chainPosition = 0;
    this.transitionMode = 'immediate'; // 'immediate', 'fade', 'crossfade'
    this.variationIntensity = 0.3; // 0-1, how much to vary patterns
    this.chainLength = 4; // Number of patterns in a chain
    this.isChaining = false;
    
    this.initializeDefaultChains();
  }

  initializeDefaultChains() {
    // Create default pattern chains for each instrument group
    const instruments = ['kick', 'snare', 'hats', 'bass', 'lead', 'fx'];
    
    instruments.forEach(instrument => {
      this.patternChains.set(instrument, {
        patterns: this.generatePatternVariations(instrument, 4),
        currentIndex: 0,
        transitionPoints: this.generateTransitionPoints(4),
        variations: this.generateVariationMatrix(instrument)
      });
    });
  }

  generatePatternVariations(instrument, count) {
    const basePattern = this.getBasePattern(instrument);
    const variations = [basePattern];
    
    for (let i = 1; i < count; i++) {
      variations.push(this.createPatternVariation(basePattern, i));
    }
    
    return variations;
  }

  getBasePattern(instrument) {
    // Get the current pattern from audio engine
    const sequences = this.audioEngine.sequences;
    if (!sequences || !sequences.byInstrument[instrument]) {
      return this.getDefaultPattern(instrument);
    }
    
    return sequences.byInstrument[instrument].values || this.getDefaultPattern(instrument);
  }

  getDefaultPattern(instrument) {
    const defaultPatterns = {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      hats: [0.6, 0, 0.45, 0, 0.7, 0.25, 0.5, 0.25, 0.65, 0, 0.45, 0, 0.75, 0.3, 0.55, 0.35],
      bass: ['C2', null, 'G1', null, 'C2', 'D2', null, 'G1', 'C2', null, 'A1', null, 'C2', 'D2', null, 'G1'],
      lead: [['E4', 'B4'], null, ['G4'], null, ['A4'], null, ['B4', 'D5'], null, ['E5'], null, ['G4'], null, ['A4', 'C5'], null, ['B4'], null],
      fx: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0]
    };
    
    return defaultPatterns[instrument] || Array(STEP_COUNT).fill(0);
  }

  createPatternVariation(basePattern, variationIndex) {
    const variation = [...basePattern];
    const variationIntensity = this.variationIntensity * (0.5 + variationIndex * 0.1);
    
    // Apply different variation strategies based on pattern type
    if (this.isNumericPattern(basePattern)) {
      return this.varyNumericPattern(variation, variationIntensity);
    } else if (this.isNotePattern(basePattern)) {
      return this.varyNotePattern(variation, variationIntensity);
    } else if (this.isChordPattern(basePattern)) {
      return this.varyChordPattern(variation, variationIntensity);
    }
    
    return variation;
  }

  isNumericPattern(pattern) {
    return pattern.every(step => typeof step === 'number');
  }

  isNotePattern(pattern) {
    return pattern.some(step => typeof step === 'string' && step.length <= 3);
  }

  isChordPattern(pattern) {
    return pattern.some(step => Array.isArray(step));
  }

  varyNumericPattern(pattern, intensity) {
    return pattern.map((value, index) => {
      if (Math.random() < intensity) {
        // Vary the value
        const variation = (Math.random() - 0.5) * 0.4;
        return Math.max(0, Math.min(1, value + variation));
      }
      return value;
    });
  }

  varyNotePattern(pattern, intensity) {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const octaves = [1, 2, 3, 4, 5];
    
    return pattern.map((note, index) => {
      if (note && Math.random() < intensity) {
        // Vary the note
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        const randomOctave = octaves[Math.floor(Math.random() * octaves.length)];
        return `${randomNote}${randomOctave}`;
      }
      return note;
    });
  }

  varyChordPattern(pattern, intensity) {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const octaves = [3, 4, 5];
    
    return pattern.map((chord, index) => {
      if (Array.isArray(chord) && Math.random() < intensity) {
        // Vary the chord
        const chordSize = Math.floor(Math.random() * 3) + 2; // 2-4 notes
        const newChord = [];
        for (let i = 0; i < chordSize; i++) {
          const note = notes[Math.floor(Math.random() * notes.length)];
          const octave = octaves[Math.floor(Math.random() * octaves.length)];
          newChord.push(`${note}${octave}`);
        }
        return newChord;
      }
      return chord;
    });
  }

  generateTransitionPoints(chainLength) {
    // Generate smooth transition points between patterns
    const points = [];
    for (let i = 0; i < chainLength - 1; i++) {
      points.push({
        from: i,
        to: i + 1,
        transitionStep: this.calculateTransitionStep(i, chainLength),
        transitionType: this.getRandomTransitionType(),
        transitionDuration: this.calculateTransitionDuration(),
        crossfadeCurve: this.generateCrossfadeCurve()
      });
    }
    return points;
  }

  calculateTransitionStep(fromIndex, chainLength) {
    // Calculate transition step based on pattern position and type
    const baseStep = Math.floor(STEP_COUNT * 0.75);
    const variation = Math.floor(STEP_COUNT * 0.1 * (Math.random() - 0.5));
    return Math.max(0, Math.min(STEP_COUNT - 1, baseStep + variation));
  }

  calculateTransitionDuration() {
    // Calculate transition duration in steps
    const durations = [1, 2, 4, 8]; // 1, 2, 4, or 8 steps
    return durations[Math.floor(Math.random() * durations.length)];
  }

  generateCrossfadeCurve() {
    // Generate crossfade curve for smooth transitions
    const curves = ['linear', 'exponential', 'logarithmic', 'sine'];
    return curves[Math.floor(Math.random() * curves.length)];
  }

  getRandomTransitionType() {
    const types = ['immediate', 'fade', 'crossfade', 'stutter'];
    return types[Math.floor(Math.random() * types.length)];
  }

  generateVariationMatrix(instrument) {
    // Generate a matrix of possible variations for each pattern
    const matrix = [];
    for (let i = 0; i < this.chainLength; i++) {
      matrix.push({
        patternIndex: i,
        variations: this.generateMicroVariations(instrument, i),
        probability: Math.random() * 0.5 + 0.25 // 25-75% chance of variation
      });
    }
    return matrix;
  }

  generateMicroVariations(instrument, patternIndex) {
    // Generate small variations within each pattern
    const variations = [];
    for (let i = 0; i < 3; i++) {
      variations.push({
        type: this.getRandomVariationType(),
        intensity: Math.random() * 0.3,
        steps: this.getRandomStepIndices()
      });
    }
    return variations;
  }

  getRandomVariationType() {
    const types = ['velocity', 'timing', 'note', 'rhythm', 'silence'];
    return types[Math.floor(Math.random() * types.length)];
  }

  getRandomStepIndices() {
    const count = Math.floor(Math.random() * 4) + 1; // 1-4 steps
    const indices = [];
    for (let i = 0; i < count; i++) {
      indices.push(Math.floor(Math.random() * STEP_COUNT));
    }
    return indices;
  }

  startChaining() {
    this.isChaining = true;
    this.chainPosition = 0;
    this.updateAllChains();
  }

  stopChaining() {
    this.isChaining = false;
    this.resetToOriginalPatterns();
  }

  updateAllChains() {
    if (!this.isChaining) return;
    
    this.patternChains.forEach((chain, instrument) => {
      this.updateChainForInstrument(instrument, chain);
    });
  }

  updateChainForInstrument(instrument, chain) {
    const currentPattern = chain.patterns[chain.currentIndex];
    const sequences = this.audioEngine.sequences;
    
    if (sequences && sequences.byInstrument[instrument]) {
      // Update the sequence with current pattern
      sequences.byInstrument[instrument].values = [...currentPattern];
      
      // Apply variations if probability allows
      this.applyVariations(instrument, chain);
    }
  }

  applyVariations(instrument, chain) {
    const variationMatrix = chain.variations[chain.currentIndex];
    if (Math.random() < variationMatrix.probability) {
      const randomVariation = variationMatrix.variations[
        Math.floor(Math.random() * variationMatrix.variations.length)
      ];
      this.applyVariationToPattern(instrument, randomVariation);
    }
  }

  applyVariationToPattern(instrument, variation) {
    const sequences = this.audioEngine.sequences;
    if (!sequences || !sequences.byInstrument[instrument]) return;
    
    const pattern = sequences.byInstrument[instrument].values;
    
    switch (variation.type) {
      case 'velocity':
        this.applyVelocityVariation(pattern, variation);
        break;
      case 'timing':
        this.applyTimingVariation(pattern, variation);
        break;
      case 'note':
        this.applyNoteVariation(pattern, variation);
        break;
      case 'rhythm':
        this.applyRhythmVariation(pattern, variation);
        break;
      case 'silence':
        this.applySilenceVariation(pattern, variation);
        break;
    }
  }

  applyVelocityVariation(pattern, variation) {
    variation.steps.forEach(stepIndex => {
      if (typeof pattern[stepIndex] === 'number') {
        pattern[stepIndex] *= (1 + (Math.random() - 0.5) * variation.intensity);
        pattern[stepIndex] = Math.max(0, Math.min(1, pattern[stepIndex]));
      }
    });
  }

  applyTimingVariation(pattern, variation) {
    // This would require more complex timing manipulation
    // For now, we'll just vary the values slightly
    this.applyVelocityVariation(pattern, variation);
  }

  applyNoteVariation(pattern, variation) {
    variation.steps.forEach(stepIndex => {
      if (typeof pattern[stepIndex] === 'string' || Array.isArray(pattern[stepIndex])) {
        // Apply note variation logic
        if (Math.random() < variation.intensity) {
          pattern[stepIndex] = null; // Silence some notes
        }
      }
    });
  }

  applyRhythmVariation(pattern, variation) {
    // Shift some steps slightly
    const shiftAmount = Math.floor(variation.intensity * 2);
    if (shiftAmount > 0) {
      variation.steps.forEach(stepIndex => {
        const newIndex = (stepIndex + shiftAmount) % STEP_COUNT;
        const temp = pattern[stepIndex];
        pattern[stepIndex] = pattern[newIndex];
        pattern[newIndex] = temp;
      });
    }
  }

  applySilenceVariation(pattern, variation) {
    variation.steps.forEach(stepIndex => {
      if (Math.random() < variation.intensity) {
        if (typeof pattern[stepIndex] === 'number') {
          pattern[stepIndex] = 0;
        } else {
          pattern[stepIndex] = null;
        }
      }
    });
  }

  advanceChain() {
    if (!this.isChaining) return;
    
    const previousPosition = this.chainPosition;
    this.chainPosition++;
    
    this.patternChains.forEach((chain, instrument) => {
      const previousIndex = chain.currentIndex;
      chain.currentIndex = (chain.currentIndex + 1) % chain.patterns.length;
      
      // Execute transition if available
      this.executeTransition(instrument, chain, previousIndex, chain.currentIndex);
      
      this.updateChainForInstrument(instrument, chain);
    });
  }

  executeTransition(instrument, chain, fromIndex, toIndex) {
    const transitionPoint = chain.transitionPoints.find(tp => 
      tp.from === fromIndex && tp.to === toIndex
    );
    
    if (!transitionPoint) return;
    
    const sequences = this.audioEngine.sequences;
    if (!sequences || !sequences.byInstrument[instrument]) return;
    
    const sequence = sequences.byInstrument[instrument];
    const fromPattern = chain.patterns[fromIndex];
    const toPattern = chain.patterns[toIndex];
    
    switch (transitionPoint.transitionType) {
      case 'fade':
        this.executeFadeTransition(sequence, fromPattern, toPattern, transitionPoint);
        break;
      case 'crossfade':
        this.executeCrossfadeTransition(sequence, fromPattern, toPattern, transitionPoint);
        break;
      case 'stutter':
        this.executeStutterTransition(sequence, fromPattern, toPattern, transitionPoint);
        break;
      case 'immediate':
      default:
        // Immediate transition - no special handling needed
        break;
    }
  }

  executeFadeTransition(sequence, fromPattern, toPattern, transitionPoint) {
    // Fade out current pattern, fade in new pattern
    const transitionSteps = transitionPoint.transitionDuration;
    const startStep = transitionPoint.transitionStep;
    
    for (let i = 0; i < transitionSteps && startStep + i < STEP_COUNT; i++) {
      const stepIndex = startStep + i;
      const fadeOut = 1 - (i / transitionSteps);
      const fadeIn = i / transitionSteps;
      
      if (typeof fromPattern[stepIndex] === 'number' && typeof toPattern[stepIndex] === 'number') {
        sequence.values[stepIndex] = (fromPattern[stepIndex] * fadeOut) + (toPattern[stepIndex] * fadeIn);
      }
    }
  }

  executeCrossfadeTransition(sequence, fromPattern, toPattern, transitionPoint) {
    // Smooth crossfade between patterns
    const transitionSteps = transitionPoint.transitionDuration;
    const startStep = transitionPoint.transitionStep;
    
    for (let i = 0; i < transitionSteps && startStep + i < STEP_COUNT; i++) {
      const stepIndex = startStep + i;
      const progress = i / transitionSteps;
      const curve = this.applyCrossfadeCurve(progress, transitionPoint.crossfadeCurve);
      
      if (typeof fromPattern[stepIndex] === 'number' && typeof toPattern[stepIndex] === 'number') {
        sequence.values[stepIndex] = (fromPattern[stepIndex] * (1 - curve)) + (toPattern[stepIndex] * curve);
      }
    }
  }

  executeStutterTransition(sequence, fromPattern, toPattern, transitionPoint) {
    // Stutter effect during transition
    const transitionSteps = transitionPoint.transitionDuration;
    const startStep = transitionPoint.transitionStep;
    
    for (let i = 0; i < transitionSteps && startStep + i < STEP_COUNT; i++) {
      const stepIndex = startStep + i;
      const stutterRate = 0.3; // 30% chance of stutter
      
      if (Math.random() < stutterRate) {
        // Create stutter by repeating previous step
        const prevStep = Math.max(0, stepIndex - 1);
        sequence.values[stepIndex] = sequence.values[prevStep];
      } else {
        // Normal transition
        const progress = i / transitionSteps;
        if (typeof fromPattern[stepIndex] === 'number' && typeof toPattern[stepIndex] === 'number') {
          sequence.values[stepIndex] = (fromPattern[stepIndex] * (1 - progress)) + (toPattern[stepIndex] * progress);
        }
      }
    }
  }

  applyCrossfadeCurve(progress, curveType) {
    switch (curveType) {
      case 'exponential':
        return progress * progress;
      case 'logarithmic':
        return Math.sqrt(progress);
      case 'sine':
        return 0.5 * (1 - Math.cos(progress * Math.PI));
      case 'linear':
      default:
        return progress;
    }
  }

  resetToOriginalPatterns() {
    this.patternChains.forEach((chain, instrument) => {
      chain.currentIndex = 0;
      this.updateChainForInstrument(instrument, chain);
    });
  }

  setChainLength(length) {
    this.chainLength = Math.max(2, Math.min(8, length));
    this.initializeDefaultChains();
  }

  setVariationIntensity(intensity) {
    this.variationIntensity = Math.max(0, Math.min(1, intensity));
  }

  setTransitionMode(mode) {
    this.transitionMode = mode;
  }

  getChainStatus() {
    return {
      isChaining: this.isChaining,
      chainPosition: this.chainPosition,
      chainLength: this.chainLength,
      variationIntensity: this.variationIntensity,
      transitionMode: this.transitionMode
    };
  }

  exportChainConfiguration() {
    const config = {
      chainLength: this.chainLength,
      variationIntensity: this.variationIntensity,
      transitionMode: this.transitionMode,
      chains: {}
    };
    
    this.patternChains.forEach((chain, instrument) => {
      config.chains[instrument] = {
        patterns: chain.patterns,
        currentIndex: chain.currentIndex,
        transitionPoints: chain.transitionPoints,
        variations: chain.variations
      };
    });
    
    return config;
  }

  importChainConfiguration(config) {
    if (config.chainLength) this.chainLength = config.chainLength;
    if (config.variationIntensity) this.variationIntensity = config.variationIntensity;
    if (config.transitionMode) this.transitionMode = config.transitionMode;
    
    if (config.chains) {
      Object.entries(config.chains).forEach(([instrument, chainData]) => {
        this.patternChains.set(instrument, chainData);
      });
    }
  }
}