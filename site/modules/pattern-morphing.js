import { 
  STEP_COUNT, 
  SECTION_DEFINITIONS,
  AUTOMATION_TRACK_DEFINITIONS,
  CURVE_TYPES 
} from '../utils/constants.js';
import { clamp, lerp } from '../utils/helpers.js';

export class PatternMorphing {
  constructor(app) {
    this.app = app;
    this.morphingState = {
      isActive: false,
      sourceSection: null,
      targetSection: null,
      morphProgress: 0,
      morphDuration: 4, // steps
      morphType: 'linear',
      easingFunction: 'easeInOut'
    };
    
    this.sectionPatterns = this.initializeSectionPatterns();
    this.morphingCurves = this.initializeMorphingCurves();
  }

  initializeSectionPatterns() {
    const patterns = {};
    
    SECTION_DEFINITIONS.forEach(section => {
      patterns[section.name] = this.createSectionPattern(section.name);
    });
    
    return patterns;
  }

  createSectionPattern(sectionName) {
    const pattern = {
      automation: {},
      rhythm: {},
      harmony: {},
      dynamics: {}
    };

    // Create unique automation patterns for each section
    AUTOMATION_TRACK_DEFINITIONS.forEach(trackDef => {
      pattern.automation[trackDef.id] = this.generateSectionAutomation(trackDef, sectionName);
    });

    // Generate rhythm patterns
    pattern.rhythm = this.generateRhythmPattern(sectionName);
    
    // Generate harmony patterns
    pattern.harmony = this.generateHarmonyPattern(sectionName);
    
    // Generate dynamics patterns
    pattern.dynamics = this.generateDynamicsPattern(sectionName);

    return pattern;
  }

  generateSectionAutomation(trackDef, sectionName) {
    const baseCurve = [...trackDef.curve];
    const sectionModifier = this.getSectionModifier(sectionName, trackDef.id);
    
    return baseCurve.map((value, index) => {
      const stepProgress = index / (STEP_COUNT - 1);
      const sectionInfluence = this.calculateSectionInfluence(sectionName, stepProgress);
      const modifiedValue = value * sectionModifier * sectionInfluence;
      return clamp(modifiedValue, 0, 1);
    });
  }

  getSectionModifier(sectionName, trackId) {
    const modifiers = {
      'Intro': {
        'leadFilter': 0.3,
        'fxSend': 0.1,
        'bassFilter': 0.2,
        'reverbDecay': 0.4,
        'delayFeedback': 0.1,
        'bassDrive': 0.2,
        'leadResonance': 0.1,
        'masterVolume': 0.6
      },
      'Lift': {
        'leadFilter': 0.6,
        'fxSend': 0.4,
        'bassFilter': 0.7,
        'reverbDecay': 0.6,
        'delayFeedback': 0.3,
        'bassDrive': 0.5,
        'leadResonance': 0.4,
        'masterVolume': 0.8
      },
      'Peak': {
        'leadFilter': 1.0,
        'fxSend': 0.8,
        'bassFilter': 1.0,
        'reverbDecay': 0.9,
        'delayFeedback': 0.6,
        'bassDrive': 0.8,
        'leadResonance': 0.9,
        'masterVolume': 1.0
      },
      'Break': {
        'leadFilter': 0.2,
        'fxSend': 0.9,
        'bassFilter': 0.1,
        'reverbDecay': 1.0,
        'delayFeedback': 0.8,
        'bassDrive': 0.1,
        'leadResonance': 0.2,
        'masterVolume': 0.4
      }
    };
    
    return modifiers[sectionName]?.[trackId] || 1.0;
  }

  calculateSectionInfluence(sectionName, stepProgress) {
    const influences = {
      'Intro': this.easeInOut(stepProgress, 0.3, 0.8),
      'Lift': this.easeInOut(stepProgress, 0.6, 1.0),
      'Peak': 1.0,
      'Break': this.easeInOut(stepProgress, 1.0, 0.2)
    };
    
    return influences[sectionName] || 1.0;
  }

  generateRhythmPattern(sectionName) {
    const patterns = {
      'Intro': { density: 0.3, complexity: 0.2, syncopation: 0.1 },
      'Lift': { density: 0.6, complexity: 0.4, syncopation: 0.3 },
      'Peak': { density: 1.0, complexity: 0.8, syncopation: 0.6 },
      'Break': { density: 0.2, complexity: 0.9, syncopation: 0.8 }
    };
    
    return patterns[sectionName] || { density: 0.5, complexity: 0.5, syncopation: 0.5 };
  }

  generateHarmonyPattern(sectionName) {
    const patterns = {
      'Intro': { tension: 0.2, movement: 0.1, consonance: 0.9 },
      'Lift': { tension: 0.5, movement: 0.4, consonance: 0.7 },
      'Peak': { tension: 0.8, movement: 0.8, consonance: 0.5 },
      'Break': { tension: 0.9, movement: 0.2, consonance: 0.3 }
    };
    
    return patterns[sectionName] || { tension: 0.5, movement: 0.5, consonance: 0.5 };
  }

  generateDynamicsPattern(sectionName) {
    const patterns = {
      'Intro': { attack: 0.3, sustain: 0.4, release: 0.8 },
      'Lift': { attack: 0.6, sustain: 0.7, release: 0.6 },
      'Peak': { attack: 0.9, sustain: 1.0, release: 0.3 },
      'Break': { attack: 0.1, sustain: 0.2, release: 1.0 }
    };
    
    return patterns[sectionName] || { attack: 0.5, sustain: 0.5, release: 0.5 };
  }

  initializeMorphingCurves() {
    return {
      linear: (t) => t,
      easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeIn: (t) => t * t,
      easeOut: (t) => t * (2 - t),
      bezier: (t) => 3 * t * t - 2 * t * t * t,
      exponential: (t) => Math.pow(t, 2),
      logarithmic: (t) => Math.sqrt(t),
      sine: (t) => (1 - Math.cos(t * Math.PI)) / 2
    };
  }

  startMorphing(sourceSection, targetSection, duration = 4, morphType = 'linear') {
    if (!this.sectionPatterns[sourceSection] || !this.sectionPatterns[targetSection]) {
      console.warn(`Invalid section names: ${sourceSection} -> ${targetSection}`);
      return false;
    }

    this.morphingState = {
      isActive: true,
      sourceSection,
      targetSection,
      morphProgress: 0,
      morphDuration: duration,
      morphType,
      easingFunction: 'easeInOut'
    };

    this.app.status.updateStatus(`Morphing: ${sourceSection} → ${targetSection}`);
    return true;
  }

  updateMorphing(stepProgress) {
    if (!this.morphingState.isActive) return;

    const morphStep = Math.floor(stepProgress * this.morphingState.morphDuration);
    const localProgress = (stepProgress * this.morphingState.morphDuration) % 1;
    
    this.morphingState.morphProgress = localProgress;
    
    // Check if morphing is complete
    if (morphStep >= this.morphingState.morphDuration) {
      this.completeMorphing();
    }
  }

  completeMorphing() {
    this.morphingState.isActive = false;
    this.morphingState.morphProgress = 1;
    this.app.status.updateStatus(`Morph complete: ${this.morphingState.targetSection}`);
  }

  getMorphedPattern() {
    if (!this.morphingState.isActive) {
      return this.getCurrentSectionPattern();
    }

    const sourcePattern = this.sectionPatterns[this.morphingState.sourceSection];
    const targetPattern = this.sectionPatterns[this.morphingState.targetSection];
    
    if (!sourcePattern || !targetPattern) {
      return this.getCurrentSectionPattern();
    }

    const easedProgress = this.getEasedProgress();
    return this.interpolatePatterns(sourcePattern, targetPattern, easedProgress);
  }

  getEasedProgress() {
    const easingFunction = this.morphingCurves[this.morphingState.easingFunction];
    return easingFunction ? easingFunction(this.morphingState.morphProgress) : this.morphingState.morphProgress;
  }

  interpolatePatterns(sourcePattern, targetPattern, progress) {
    const morphedPattern = {
      automation: {},
      rhythm: {},
      harmony: {},
      dynamics: {}
    };

    // Interpolate automation patterns
    Object.keys(sourcePattern.automation).forEach(trackId => {
      const sourceValues = sourcePattern.automation[trackId];
      const targetValues = targetPattern.automation[trackId];
      
      if (sourceValues && targetValues) {
        morphedPattern.automation[trackId] = this.interpolateArrays(sourceValues, targetValues, progress);
      }
    });

    // Interpolate rhythm patterns
    morphedPattern.rhythm = this.interpolateObjects(sourcePattern.rhythm, targetPattern.rhythm, progress);
    
    // Interpolate harmony patterns
    morphedPattern.harmony = this.interpolateObjects(sourcePattern.harmony, targetPattern.harmony, progress);
    
    // Interpolate dynamics patterns
    morphedPattern.dynamics = this.interpolateObjects(sourcePattern.dynamics, targetPattern.dynamics, progress);

    return morphedPattern;
  }

  interpolateArrays(sourceArray, targetArray, progress) {
    const length = Math.max(sourceArray.length, targetArray.length);
    const result = [];
    
    for (let i = 0; i < length; i++) {
      const sourceValue = sourceArray[i] || 0;
      const targetValue = targetArray[i] || 0;
      result.push(lerp(sourceValue, targetValue, progress));
    }
    
    return result;
  }

  interpolateObjects(sourceObj, targetObj, progress) {
    const result = {};
    const allKeys = new Set([...Object.keys(sourceObj), ...Object.keys(targetObj)]);
    
    allKeys.forEach(key => {
      const sourceValue = sourceObj[key] || 0;
      const targetValue = targetObj[key] || 0;
      result[key] = lerp(sourceValue, targetValue, progress);
    });
    
    return result;
  }

  getCurrentSectionPattern() {
    const currentSection = this.getCurrentSection();
    return this.sectionPatterns[currentSection] || this.sectionPatterns['Intro'];
  }

  getCurrentSection() {
    if (!this.app.automation?.sections) return 'Intro';
    
    const currentStep = this.app.automationStep || 0;
    const section = this.app.automation.sections.find(s => 
      currentStep >= s.start && currentStep <= s.end
    );
    
    return section ? section.name : 'Intro';
  }

  // Easing functions
  easeInOut(t, start, end) {
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    return lerp(start, end, eased);
  }

  // Get morphing visualization data
  getMorphingVisualization() {
    if (!this.morphingState.isActive) return null;

    return {
      sourceSection: this.morphingState.sourceSection,
      targetSection: this.morphingState.targetSection,
      progress: this.morphingState.morphProgress,
      easedProgress: this.getEasedProgress(),
      isActive: true
    };
  }

  // Get detailed morphing information for debugging
  getMorphingDebugInfo() {
    const currentPattern = this.getCurrentSectionPattern();
    const morphedPattern = this.getMorphedPattern();
    
    return {
      morphingState: this.morphingState,
      currentSection: this.getCurrentSection(),
      currentPattern: currentPattern,
      morphedPattern: morphedPattern,
      sectionPatterns: Object.keys(this.sectionPatterns).reduce((acc, key) => {
        acc[key] = {
          automation: Object.keys(this.sectionPatterns[key].automation).reduce((trackAcc, trackId) => {
            trackAcc[trackId] = this.sectionPatterns[key].automation[trackId].slice(0, 4); // First 4 values
            return trackAcc;
          }, {})
        };
        return acc;
      }, {})
    };
  }

  // Apply morphed pattern to automation
  applyMorphedPattern() {
    const morphedPattern = this.getMorphedPattern();
    
    if (!morphedPattern || !this.app.automation?.tracks) return;

    this.app.automation.tracks.forEach(track => {
      if (morphedPattern.automation[track.id]) {
        track.values = [...morphedPattern.automation[track.id]];
      }
    });
  }

  // Get pattern preview for a specific section
  getPatternPreview(sectionName) {
    return this.sectionPatterns[sectionName] || null;
  }

  // Reset morphing state
  resetMorphing() {
    this.morphingState = {
      isActive: false,
      sourceSection: null,
      targetSection: null,
      morphProgress: 0,
      morphDuration: 4,
      morphType: 'linear',
      easingFunction: 'easeInOut'
    };
  }

  // Manual morphing for testing
  manualMorph(sourceSection, targetSection, duration = 4, morphType = 'easeInOut') {
    console.log(`Starting manual morph: ${sourceSection} → ${targetSection}`);
    const success = this.startMorphing(sourceSection, targetSection, duration, morphType);
    if (success) {
      console.log('Morphing started successfully');
      return true;
    } else {
      console.error('Failed to start morphing');
      return false;
    }
  }
}