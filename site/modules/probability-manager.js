import { 
  STEP_COUNT, 
  CURVE_TYPES 
} from '../utils/constants.js';
import { clamp } from '../utils/helpers.js';

export class ProbabilityManager {
  constructor() {
    this.probabilityTracks = new Map();
    this.triggerHistory = new Map();
    this.randomSeed = Math.random() * 1000000;
    this.entropy = 0.5; // Controls randomness vs predictability
    this.quantization = 1; // Steps between probability evaluations
  }

  /**
   * Initialize probability tracks for all instruments
   */
  initializeProbabilityTracks() {
    const instruments = ['kick', 'snare', 'hats', 'bass', 'lead', 'fx'];
    
    instruments.forEach(instrument => {
      this.probabilityTracks.set(instrument, {
        baseProbability: 0.5,
        probabilityCurve: this.createDefaultProbabilityCurve(),
        curveType: CURVE_TYPES.LINEAR,
        humanization: 0.1, // Adds slight randomness to timing
        accentProbability: 0.2, // Chance of accent/velocity boost
        accentMultiplier: 1.5,
        ghostNoteProbability: 0.1, // Chance of softer ghost notes
        ghostMultiplier: 0.3,
        patternLock: false, // When true, locks to current pattern
        patternLockSteps: 4, // Steps to lock pattern for
        lastTriggerStep: -1,
        consecutiveMisses: 0,
        maxConsecutiveMisses: 3 // Force trigger after this many misses
      });
    });

    // Set instrument-specific defaults
    this.setInstrumentDefaults();
  }

  /**
   * Set instrument-specific probability defaults
   */
  setInstrumentDefaults() {
    const defaults = {
      kick: { baseProbability: 0.8, accentProbability: 0.3, ghostNoteProbability: 0.05 },
      snare: { baseProbability: 0.6, accentProbability: 0.4, ghostNoteProbability: 0.15 },
      hats: { baseProbability: 0.7, accentProbability: 0.1, ghostNoteProbability: 0.2 },
      bass: { baseProbability: 0.6, accentProbability: 0.2, ghostNoteProbability: 0.1 },
      lead: { baseProbability: 0.5, accentProbability: 0.3, ghostNoteProbability: 0.05 },
      fx: { baseProbability: 0.3, accentProbability: 0.5, ghostNoteProbability: 0.0 }
    };

    Object.entries(defaults).forEach(([instrument, settings]) => {
      const track = this.probabilityTracks.get(instrument);
      if (track) {
        Object.assign(track, settings);
      }
    });
  }

  /**
   * Create a default probability curve
   */
  createDefaultProbabilityCurve() {
    return Array.from({ length: STEP_COUNT }, (_, i) => {
      // Create a wave-like pattern with some variation
      const base = 0.5;
      const wave = Math.sin((i / STEP_COUNT) * Math.PI * 2) * 0.2;
      const variation = (Math.random() - 0.5) * 0.1;
      return clamp(base + wave + variation, 0, 1);
    });
  }

  /**
   * Calculate probability for a specific instrument at a specific step
   */
  calculateProbability(instrument, step, context = {}) {
    const track = this.probabilityTracks.get(instrument);
    if (!track) return 0;

    // Get base probability from curve
    const curveIndex = step % track.probabilityCurve.length;
    let probability = track.probabilityCurve[curveIndex];

    // Apply base probability scaling
    probability *= track.baseProbability;

    // Apply pattern lock logic
    if (track.patternLock && step - track.lastTriggerStep < track.patternLockSteps) {
      probability = 0.9; // High probability to continue pattern
    }

    // Apply consecutive miss logic
    if (track.consecutiveMisses >= track.maxConsecutiveMisses) {
      probability = Math.min(probability + 0.3, 1.0);
    }

    // Apply section-based modifiers
    if (context.section) {
      probability = this.applySectionModifiers(probability, instrument, context.section);
    }

    // Apply humanization
    const humanizationFactor = 1 + (Math.random() - 0.5) * track.humanization;
    probability *= humanizationFactor;

    return clamp(probability, 0, 1);
  }

  /**
   * Apply section-based probability modifiers
   */
  applySectionModifiers(probability, instrument, section) {
    const sectionModifiers = {
      'Intro': {
        kick: 0.8,
        snare: 0.3,
        hats: 0.4,
        bass: 0.2,
        lead: 0.1,
        fx: 0.1
      },
      'Lift': {
        kick: 0.9,
        snare: 0.7,
        hats: 0.8,
        bass: 0.8,
        lead: 0.3,
        fx: 0.6
      },
      'Peak': {
        kick: 1.0,
        snare: 1.0,
        hats: 1.0,
        bass: 1.0,
        lead: 1.0,
        fx: 1.0
      },
      'Break': {
        kick: 0.6,
        snare: 0.4,
        hats: 0.5,
        bass: 0.3,
        lead: 0.2,
        fx: 0.8
      }
    };

    const modifier = sectionModifiers[section.name]?.[instrument] || 1.0;
    return probability * modifier;
  }

  /**
   * Determine if a trigger should occur
   */
  shouldTrigger(instrument, step, context = {}) {
    const probability = this.calculateProbability(instrument, step, context);
    const randomValue = this.getSeededRandom(step);
    
    const shouldTrigger = randomValue < probability;
    
    // Update trigger history
    this.updateTriggerHistory(instrument, step, shouldTrigger);
    
    return shouldTrigger;
  }

  /**
   * Get velocity and accent information for a trigger
   */
  getTriggerInfo(instrument, step, context = {}) {
    const track = this.probabilityTracks.get(instrument);
    if (!track) return { velocity: 0.8, isAccent: false, isGhost: false };

    const baseVelocity = 0.8;
    let velocity = baseVelocity;
    let isAccent = false;
    let isGhost = false;

    // Check for accent
    const accentRandom = this.getSeededRandom(step + 1000);
    if (accentRandom < track.accentProbability) {
      isAccent = true;
      velocity *= track.accentMultiplier;
    }

    // Check for ghost note
    const ghostRandom = this.getSeededRandom(step + 2000);
    if (ghostRandom < track.ghostNoteProbability) {
      isGhost = true;
      velocity *= track.ghostMultiplier;
    }

    // Apply humanization to velocity
    const velocityVariation = 1 + (Math.random() - 0.5) * 0.2;
    velocity *= velocityVariation;

    return {
      velocity: clamp(velocity, 0.1, 1.0),
      isAccent,
      isGhost
    };
  }

  /**
   * Update trigger history for pattern analysis
   */
  updateTriggerHistory(instrument, step, triggered) {
    const track = this.probabilityTracks.get(instrument);
    if (!track) return;

    if (triggered) {
      track.lastTriggerStep = step;
      track.consecutiveMisses = 0;
    } else {
      track.consecutiveMisses++;
    }

    // Store in history for pattern analysis
    if (!this.triggerHistory.has(instrument)) {
      this.triggerHistory.set(instrument, []);
    }
    
    const history = this.triggerHistory.get(instrument);
    history.push({ step, triggered, timestamp: Date.now() });
    
    // Keep only last 64 steps of history
    if (history.length > 64) {
      history.shift();
    }
  }

  /**
   * Get seeded random number for consistent results
   */
  getSeededRandom(seed) {
    const x = Math.sin(seed + this.randomSeed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Set probability curve for an instrument
   */
  setProbabilityCurve(instrument, curve, curveType = CURVE_TYPES.LINEAR) {
    const track = this.probabilityTracks.get(instrument);
    if (track) {
      track.probabilityCurve = curve;
      track.curveType = curveType;
    }
  }

  /**
   * Set base probability for an instrument
   */
  setBaseProbability(instrument, probability) {
    const track = this.probabilityTracks.get(instrument);
    if (track) {
      track.baseProbability = clamp(probability, 0, 1);
    }
  }

  /**
   * Set humanization amount
   */
  setHumanization(instrument, amount) {
    const track = this.probabilityTracks.get(instrument);
    if (track) {
      track.humanization = clamp(amount, 0, 1);
    }
  }

  /**
   * Set accent probability and multiplier
   */
  setAccentSettings(instrument, probability, multiplier) {
    const track = this.probabilityTracks.get(instrument);
    if (track) {
      track.accentProbability = clamp(probability, 0, 1);
      track.accentMultiplier = clamp(multiplier, 0.1, 3.0);
    }
  }

  /**
   * Set ghost note probability and multiplier
   */
  setGhostNoteSettings(instrument, probability, multiplier) {
    const track = this.probabilityTracks.get(instrument);
    if (track) {
      track.ghostNoteProbability = clamp(probability, 0, 1);
      track.ghostMultiplier = clamp(multiplier, 0.1, 1.0);
    }
  }

  /**
   * Enable/disable pattern lock
   */
  setPatternLock(instrument, enabled, steps = 4) {
    const track = this.probabilityTracks.get(instrument);
    if (track) {
      track.patternLock = enabled;
      track.patternLockSteps = Math.max(1, steps);
    }
  }

  /**
   * Set global entropy (randomness vs predictability)
   */
  setEntropy(entropy) {
    this.entropy = clamp(entropy, 0, 1);
  }

  /**
   * Set quantization (steps between probability evaluations)
   */
  setQuantization(quantization) {
    this.quantization = Math.max(1, quantization);
  }

  /**
   * Get current probability track data
   */
  getProbabilityTrack(instrument) {
    return this.probabilityTracks.get(instrument);
  }

  /**
   * Get all probability tracks
   */
  getAllProbabilityTracks() {
    return Object.fromEntries(this.probabilityTracks);
  }

  /**
   * Reset all probability tracks to defaults
   */
  resetToDefaults() {
    this.initializeProbabilityTracks();
    this.triggerHistory.clear();
  }

  /**
   * Export probability settings for presets
   */
  exportSettings() {
    const settings = {};
    this.probabilityTracks.forEach((track, instrument) => {
      settings[instrument] = {
        baseProbability: track.baseProbability,
        probabilityCurve: [...track.probabilityCurve],
        curveType: track.curveType,
        humanization: track.humanization,
        accentProbability: track.accentProbability,
        accentMultiplier: track.accentMultiplier,
        ghostNoteProbability: track.ghostNoteProbability,
        ghostMultiplier: track.ghostMultiplier,
        patternLock: track.patternLock,
        patternLockSteps: track.patternLockSteps,
        maxConsecutiveMisses: track.maxConsecutiveMisses
      };
    });
    return {
      settings,
      entropy: this.entropy,
      quantization: this.quantization,
      randomSeed: this.randomSeed
    };
  }

  /**
   * Import probability settings from presets
   */
  importSettings(data) {
    if (data.settings) {
      Object.entries(data.settings).forEach(([instrument, settings]) => {
        const track = this.probabilityTracks.get(instrument);
        if (track && settings) {
          Object.assign(track, settings);
        }
      });
    }
    
    if (typeof data.entropy === 'number') {
      this.entropy = data.entropy;
    }
    
    if (typeof data.quantization === 'number') {
      this.quantization = data.quantization;
    }
    
    if (typeof data.randomSeed === 'number') {
      this.randomSeed = data.randomSeed;
    }
  }
}