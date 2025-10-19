import { WolframIntegration } from './wolfram-integration.js';
import { STEP_COUNT } from '../utils/constants.js';

export class WolframPatternManager {
  constructor(app) {
    this.app = app;
    this.wolfram = new WolframIntegration(app);
    this.patterns = new Map();
    this.currentPattern = null;
    this.patternHistory = [];
    this.maxHistorySize = 50;
    
    // Initialize with some default Wolfram patterns
    this.initializeDefaultPatterns();
  }

  initializeDefaultPatterns() {
    // Create some default Wolfram-based patterns
    this.createPattern('fibonacci_basic', 'Fibonacci Basic', 'fibonacci', {
      start: 0.2,
      end: 0.8,
      scale: 0.6
    });
    
    this.createPattern('golden_ratio_harmonic', 'Golden Ratio Harmonic', 'goldenRatio', {
      start: 0.1,
      end: 0.9,
      frequency: 2,
      phase: 0
    });
    
    this.createPattern('lorenz_chaos', 'Lorenz Chaos', 'lorenz', {
      start: 0.3,
      end: 0.7,
      sigma: 10,
      rho: 28,
      beta: 8/3
    });
    
    this.createPattern('fourier_complex', 'Fourier Complex', 'fourier', {
      start: 0.2,
      end: 0.8,
      frequencies: [1, 2, 3, 5, 8],
      amplitudes: [1, 0.7, 0.5, 0.3, 0.2],
      phases: [0, Math.PI/4, Math.PI/2, Math.PI, Math.PI*1.5]
    });
    
    this.createPattern('mandelbrot_fractal', 'Mandelbrot Fractal', 'mandelbrot', {
      start: 0.1,
      end: 0.9,
      maxIterations: 50,
      zoom: 2,
      centerX: -0.5,
      centerY: 0
    });
  }

  async createPattern(id, name, patternType, params = {}) {
    try {
      const values = await this.wolfram.generateWolframPattern(patternType, STEP_COUNT, params);
      if (!values) {
        console.error(`Failed to generate pattern: ${patternType}`);
        return false;
      }

      const pattern = {
        id,
        name,
        type: 'wolfram',
        patternType,
        values: [...values],
        parameters: { ...params },
        metadata: {
          createdAt: new Date().toISOString(),
          generatedBy: 'wolfram',
          patternType,
          parameters: params
        }
      };

      this.patterns.set(id, pattern);
      this.addToHistory(pattern);
      return true;
    } catch (error) {
      console.error('Error creating Wolfram pattern:', error);
      return false;
    }
  }

  async generatePatternVariations(basePatternId, count = 3) {
    const basePattern = this.patterns.get(basePatternId);
    if (!basePattern) return [];

    const variations = [];
    const patternType = basePattern.patternType;
    const baseParams = basePattern.parameters;

    for (let i = 0; i < count; i++) {
      const variationId = `${basePatternId}_var_${i + 1}`;
      const variationName = `${basePattern.name} Variation ${i + 1}`;
      
      // Create parameter variations
      const variationParams = this.createParameterVariation(baseParams, patternType);
      
      const success = await this.createPattern(variationId, variationName, patternType, variationParams);
      if (success) {
        variations.push(variationId);
      }
    }

    return variations;
  }

  createParameterVariation(baseParams, patternType) {
    const variation = { ...baseParams };
    
    // Add random variations to parameters based on pattern type
    switch (patternType) {
      case 'fibonacci':
        variation.scale = (baseParams.scale || 1) * (0.8 + Math.random() * 0.4);
        variation.offset = (baseParams.offset || 0) + (Math.random() - 0.5) * 0.2;
        break;
        
      case 'goldenRatio':
        variation.frequency = (baseParams.frequency || 1) * (0.5 + Math.random() * 1.5);
        variation.phase = (baseParams.phase || 0) + (Math.random() - 0.5) * Math.PI;
        break;
        
      case 'lorenz':
        variation.sigma = (baseParams.sigma || 10) * (0.8 + Math.random() * 0.4);
        variation.rho = (baseParams.rho || 28) * (0.8 + Math.random() * 0.4);
        variation.beta = (baseParams.beta || 8/3) * (0.8 + Math.random() * 0.4);
        break;
        
      case 'fourier':
        if (variation.frequencies) {
          variation.frequencies = variation.frequencies.map(f => f * (0.8 + Math.random() * 0.4));
        }
        if (variation.amplitudes) {
          variation.amplitudes = variation.amplitudes.map(a => a * (0.8 + Math.random() * 0.4));
        }
        break;
        
      case 'mandelbrot':
        variation.zoom = (baseParams.zoom || 1) * (0.5 + Math.random() * 1.5);
        variation.centerX = (baseParams.centerX || -0.5) + (Math.random() - 0.5) * 0.4;
        variation.centerY = (baseParams.centerY || 0) + (Math.random() - 0.5) * 0.4;
        break;
        
      default:
        // Generic variation for other pattern types
        Object.keys(variation).forEach(key => {
          if (typeof variation[key] === 'number') {
            variation[key] *= (0.8 + Math.random() * 0.4);
          }
        });
    }
    
    return variation;
  }

  async morphPatterns(pattern1Id, pattern2Id, progress) {
    const pattern1 = this.patterns.get(pattern1Id);
    const pattern2 = this.patterns.get(pattern2Id);
    
    if (!pattern1 || !pattern2) return null;
    
    const morphedValues = this.wolfram.morphPatterns(pattern1.values, pattern2.values, progress);
    
    const morphedPattern = {
      id: `morph_${pattern1Id}_${pattern2Id}_${Date.now()}`,
      name: `Morph: ${pattern1.name} → ${pattern2.name}`,
      type: 'wolfram_morph',
      values: morphedValues,
      metadata: {
        createdAt: new Date().toISOString(),
        generatedBy: 'wolfram_morph',
        sourcePatterns: [pattern1Id, pattern2Id],
        morphProgress: progress
      }
    };
    
    this.patterns.set(morphedPattern.id, morphedPattern);
    this.addToHistory(morphedPattern);
    
    return morphedPattern;
  }

  async combinePatterns(patternIds, weights = null) {
    const patterns = patternIds.map(id => this.patterns.get(id)).filter(p => p);
    
    if (patterns.length === 0) return null;
    
    const combinedValues = this.wolfram.combinePatterns(
      patterns.map(p => p.values),
      weights
    );
    
    const combinedPattern = {
      id: `combined_${Date.now()}`,
      name: `Combined: ${patterns.map(p => p.name).join(' + ')}`,
      type: 'wolfram_combined',
      values: combinedValues,
      metadata: {
        createdAt: new Date().toISOString(),
        generatedBy: 'wolfram_combined',
        sourcePatterns: patternIds,
        weights: weights
      }
    };
    
    this.patterns.set(combinedPattern.id, combinedPattern);
    this.addToHistory(combinedPattern);
    
    return combinedPattern;
  }

  applyPatternToAutomation(patternId) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;
    
    this.currentPattern = patternId;
    
    // Apply to automation tracks
    if (this.app.automation && this.app.automation.tracks) {
      this.app.automation.tracks.forEach(track => {
        // Apply the Wolfram pattern to the track
        track.values = [...pattern.values];
        
        // Add some variation based on track characteristics
        if (track.id === 'filter') {
          // Apply different scaling for filter
          track.values = pattern.values.map(v => v * 0.8 + 0.1);
        } else if (track.id === 'volume') {
          // Apply different scaling for volume
          track.values = pattern.values.map(v => v * 0.6 + 0.2);
        }
      });
    }
    
    // Trigger UI update
    if (this.app.timeline) {
      this.app.timeline.draw();
    }
    
    return true;
  }

  addToHistory(pattern) {
    this.patternHistory.unshift(pattern);
    if (this.patternHistory.length > this.maxHistorySize) {
      this.patternHistory = this.patternHistory.slice(0, this.maxHistorySize);
    }
  }

  getPattern(patternId) {
    return this.patterns.get(patternId);
  }

  getAllPatterns() {
    return Array.from(this.patterns.values());
  }

  getPatternsByType(patternType) {
    return Array.from(this.patterns.values()).filter(p => p.patternType === patternType);
  }

  getAvailablePatternTypes() {
    return this.wolfram.getAvailablePatternTypes();
  }

  getPatternMetadata(patternType) {
    return this.wolfram.getPatternMetadata(patternType);
  }

  getHistory() {
    return [...this.patternHistory];
  }

  clearHistory() {
    this.patternHistory = [];
  }

  deletePattern(patternId) {
    return this.patterns.delete(patternId);
  }

  exportPatterns() {
    const patterns = {};
    this.patterns.forEach((pattern, id) => {
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
      if (patternData && patternData.values && patternData.type === 'wolfram') {
        this.patterns.set(id, patternData);
        importedCount++;
      }
    });

    return importedCount > 0;
  }

  // Advanced pattern analysis
  analyzePattern(patternId) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return null;
    
    const analysis = {
      id: patternId,
      name: pattern.name,
      type: pattern.type,
      patternType: pattern.patternType,
      length: pattern.values.length,
      statistics: this.calculateStatistics(pattern.values),
      characteristics: this.analyzeCharacteristics(pattern.values),
      complexity: this.calculateComplexity(pattern.values),
      energy: this.calculateEnergy(pattern.values)
    };
    
    return analysis;
  }

  calculateStatistics(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean,
      variance,
      standardDeviation: stdDev,
      min: Math.min(...values),
      max: Math.max(...values),
      range: Math.max(...values) - Math.min(...values)
    };
  }

  analyzeCharacteristics(values) {
    let zeroCrossings = 0;
    let peaks = 0;
    let valleys = 0;
    
    for (let i = 1; i < values.length - 1; i++) {
      if ((values[i] >= 0.5) !== (values[i - 1] >= 0.5)) {
        zeroCrossings++;
      }
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        peaks++;
      }
      if (values[i] < values[i - 1] && values[i] < values[i + 1]) {
        valleys++;
      }
    }
    
    return {
      zeroCrossings,
      peaks,
      valleys,
      peakValleyRatio: peaks / Math.max(valleys, 1),
      activity: zeroCrossings / values.length
    };
  }

  calculateComplexity(values) {
    // Calculate complexity based on variation and unpredictability
    let complexity = 0;
    
    for (let i = 1; i < values.length; i++) {
      const diff = Math.abs(values[i] - values[i - 1]);
      complexity += diff;
    }
    
    return complexity / values.length;
  }

  calculateEnergy(values) {
    return values.reduce((sum, val) => sum + val * val, 0) / values.length;
  }

  // Search and filter patterns
  searchPatterns(query) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    this.patterns.forEach((pattern, id) => {
      if (pattern.name.toLowerCase().includes(searchTerm) ||
          pattern.patternType.toLowerCase().includes(searchTerm) ||
          (pattern.metadata.description && pattern.metadata.description.toLowerCase().includes(searchTerm))) {
        results.push(pattern);
      }
    });
    
    return results;
  }

  filterPatternsByType(patternType) {
    return Array.from(this.patterns.values()).filter(p => p.patternType === patternType);
  }

  filterPatternsByComplexity(minComplexity, maxComplexity) {
    return Array.from(this.patterns.values()).filter(p => {
      const complexity = this.calculateComplexity(p.values);
      return complexity >= minComplexity && complexity <= maxComplexity;
    });
  }

  // Preset integration
  getPatternForPreset() {
    return {
      currentPattern: this.currentPattern,
      patterns: this.exportPatterns(),
      history: this.getHistory()
    };
  }

  applyPatternFromPreset(presetData) {
    if (presetData.patterns) {
      this.importPatterns(presetData.patterns);
    }
    
    if (presetData.currentPattern) {
      this.currentPattern = presetData.currentPattern;
    }
    
    if (presetData.history) {
      this.patternHistory = presetData.history;
    }
  }
}