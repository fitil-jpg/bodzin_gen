import { CurveMath } from './curve-math.js';

export class CurvePresets {
  constructor() {
    this.curveMath = new CurveMath();
    this.presets = this.initializePresets();
  }

  initializePresets() {
    return {
      // Basic shapes
      linear: {
        name: 'Linear Rise',
        description: 'Smooth linear progression from 0 to 1',
        category: 'Basic',
        curve: this.curveMath.generateLinearCurve(16, 0, 1),
        tags: ['basic', 'linear', 'smooth']
      },
      
      linearFall: {
        name: 'Linear Fall',
        description: 'Smooth linear progression from 1 to 0',
        category: 'Basic',
        curve: this.curveMath.generateLinearCurve(16, 1, 0),
        tags: ['basic', 'linear', 'smooth']
      },
      
      // Exponential curves
      exponential: {
        name: 'Exponential Rise',
        description: 'Exponential growth curve',
        category: 'Exponential',
        curve: this.curveMath.generateCurve('exponential', 16, { start: 0, end: 1 }),
        tags: ['exponential', 'growth', 'intense']
      },
      
      exponentialFall: {
        name: 'Exponential Fall',
        description: 'Exponential decay curve',
        category: 'Exponential',
        curve: this.curveMath.generateCurve('exponential', 16, { start: 1, end: 0 }),
        tags: ['exponential', 'decay', 'intense']
      },
      
      // Logarithmic curves
      logarithmic: {
        name: 'Logarithmic Rise',
        description: 'Logarithmic growth curve',
        category: 'Logarithmic',
        curve: this.curveMath.generateCurve('logarithmic', 16, { start: 0, end: 1 }),
        tags: ['logarithmic', 'growth', 'smooth']
      },
      
      logarithmicFall: {
        name: 'Logarithmic Fall',
        description: 'Logarithmic decay curve',
        category: 'Logarithmic',
        curve: this.curveMath.generateCurve('logarithmic', 16, { start: 1, end: 0 }),
        tags: ['logarithmic', 'decay', 'smooth']
      },
      
      // Sine waves
      sine: {
        name: 'Sine Wave',
        description: 'Complete sine wave cycle',
        category: 'Oscillatory',
        curve: this.curveMath.generateSineCurve(16, 0, 1, 1, 1, 0),
        tags: ['sine', 'wave', 'oscillatory']
      },
      
      sineHalf: {
        name: 'Sine Half Wave',
        description: 'Half sine wave (0 to π)',
        category: 'Oscillatory',
        curve: this.curveMath.generateSineCurve(16, 0, 1, 0.5, 1, 0),
        tags: ['sine', 'half', 'smooth']
      },
      
      // Triangle waves
      triangle: {
        name: 'Triangle Wave',
        description: 'Linear triangle wave',
        category: 'Oscillatory',
        curve: this.curveMath.generateTriangleCurve(16, 0, 1, 1, 0),
        tags: ['triangle', 'wave', 'linear']
      },
      
      triangleHalf: {
        name: 'Triangle Half Wave',
        description: 'Half triangle wave',
        category: 'Oscillatory',
        curve: this.curveMath.generateTriangleCurve(16, 0, 1, 0.5, 0),
        tags: ['triangle', 'half', 'linear']
      },
      
      // Sawtooth waves
      sawtooth: {
        name: 'Sawtooth Wave',
        description: 'Linear sawtooth wave',
        category: 'Oscillatory',
        curve: this.curveMath.generateSawtoothCurve(16, 0, 1, 1, 0),
        tags: ['sawtooth', 'wave', 'linear']
      },
      
      sawtoothHalf: {
        name: 'Sawtooth Half Wave',
        description: 'Half sawtooth wave',
        category: 'Oscillatory',
        curve: this.curveMath.generateSawtoothCurve(16, 0, 1, 0.5, 0),
        tags: ['sawtooth', 'half', 'linear']
      },
      
      // Square waves
      square: {
        name: 'Square Wave',
        description: 'Digital square wave',
        category: 'Oscillatory',
        curve: this.curveMath.generateSquareCurve(16, 0, 1, 1, 0),
        tags: ['square', 'wave', 'digital']
      },
      
      squareHalf: {
        name: 'Square Half Wave',
        description: 'Half square wave',
        category: 'Oscillatory',
        curve: this.curveMath.generateSquareCurve(16, 0, 1, 0.5, 0),
        tags: ['square', 'half', 'digital']
      },
      
      // Music-specific patterns
      buildUp: {
        name: 'Build Up',
        description: 'Classic EDM build-up pattern',
        category: 'Music',
        curve: this.generateBuildUpCurve(),
        tags: ['build', 'edm', 'intense', 'progressive']
      },
      
      drop: {
        name: 'Drop',
        description: 'Sudden drop pattern',
        category: 'Music',
        curve: this.generateDropCurve(),
        tags: ['drop', 'edm', 'sudden', 'impact']
      },
      
      breakdown: {
        name: 'Breakdown',
        description: 'Gradual breakdown pattern',
        category: 'Music',
        curve: this.generateBreakdownCurve(),
        tags: ['breakdown', 'ambient', 'gradual', 'calm']
      },
      
      filterSweep: {
        name: 'Filter Sweep',
        description: 'Classic filter sweep pattern',
        category: 'Music',
        curve: this.generateFilterSweepCurve(),
        tags: ['filter', 'sweep', 'smooth', 'classic']
      },
      
      // Automation patterns
      volumeFade: {
        name: 'Volume Fade',
        description: 'Smooth volume fade in/out',
        category: 'Automation',
        curve: this.generateVolumeFadeCurve(),
        tags: ['volume', 'fade', 'smooth', 'automation']
      },
      
      reverbTail: {
        name: 'Reverb Tail',
        description: 'Exponential reverb decay',
        category: 'Automation',
        curve: this.generateReverbTailCurve(),
        tags: ['reverb', 'tail', 'decay', 'exponential']
      },
      
      delayFeedback: {
        name: 'Delay Feedback',
        description: 'Delay feedback build-up',
        category: 'Automation',
        curve: this.generateDelayFeedbackCurve(),
        tags: ['delay', 'feedback', 'build', 'intense']
      },
      
      // Random and organic
      randomWalk: {
        name: 'Random Walk',
        description: 'Organic random walk pattern',
        category: 'Organic',
        curve: this.curveMath.generateRandomWalkCurve(16, 0, 1, 0.1),
        tags: ['random', 'walk', 'organic', 'natural']
      },
      
      noise: {
        name: 'Noise',
        description: 'Random noise pattern',
        category: 'Organic',
        curve: this.curveMath.generateNoiseCurve(16, 0, 1),
        tags: ['noise', 'random', 'texture', 'organic']
      },
      
      // Complex patterns
      sCurve: {
        name: 'S-Curve',
        description: 'Sigmoid curve for smooth transitions',
        category: 'Complex',
        curve: this.generateSCurve(),
        tags: ['sigmoid', 'smooth', 'transition', 'complex']
      },
      
      bellCurve: {
        name: 'Bell Curve',
        description: 'Gaussian bell curve',
        category: 'Complex',
        curve: this.generateBellCurve(),
        tags: ['gaussian', 'bell', 'peak', 'complex']
      },
      
      // Bodzin-specific patterns
      bodzinFilter: {
        name: 'Bodzin Filter',
        description: 'Classic Bodzin filter automation',
        category: 'Bodzin',
        curve: this.generateBodzinFilterCurve(),
        tags: ['bodzin', 'filter', 'classic', 'techno']
      },
      
      bodzinBuild: {
        name: 'Bodzin Build',
        description: 'Bodzin-style build pattern',
        category: 'Bodzin',
        curve: this.generateBodzinBuildCurve(),
        tags: ['bodzin', 'build', 'techno', 'progressive']
      },
      
      bodzinBreak: {
        name: 'Bodzin Break',
        description: 'Bodzin-style breakdown',
        category: 'Bodzin',
        curve: this.generateBodzinBreakCurve(),
        tags: ['bodzin', 'break', 'techno', 'ambient']
      }
    };
  }

  // Music-specific curve generators
  generateBuildUpCurve() {
    const curve = [];
    const length = 16;
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      // Exponential build with slight curve
      const exponential = Math.pow(t, 1.5);
      // Add some sine wave modulation for interest
      const modulation = 0.1 * Math.sin(t * Math.PI * 4);
      curve.push(clamp(exponential + modulation, 0, 1));
    }
    
    return curve;
  }

  generateDropCurve() {
    const curve = [];
    const length = 16;
    const dropPoint = 8; // Drop at halfway point
    
    for (let i = 0; i < length; i++) {
      if (i < dropPoint) {
        // Build up to drop
        const t = i / dropPoint;
        curve.push(Math.pow(t, 0.8));
      } else {
        // Sudden drop
        const t = (i - dropPoint) / (length - dropPoint);
        curve.push(Math.pow(1 - t, 3));
      }
    }
    
    return curve;
  }

  generateBreakdownCurve() {
    const curve = [];
    const length = 16;
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      // Gradual decay with some fluctuation
      const decay = Math.pow(1 - t, 1.2);
      const fluctuation = 0.05 * Math.sin(t * Math.PI * 6);
      curve.push(clamp(decay + fluctuation, 0, 1));
    }
    
    return curve;
  }

  generateFilterSweepCurve() {
    const curve = [];
    const length = 16;
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      // Smooth filter sweep with slight curve
      const sweep = Math.pow(t, 0.7);
      curve.push(sweep);
    }
    
    return curve;
  }

  generateVolumeFadeCurve() {
    const curve = [];
    const length = 16;
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      // Smooth logarithmic fade
      const fade = Math.sqrt(t);
      curve.push(fade);
    }
    
    return curve;
  }

  generateReverbTailCurve() {
    const curve = [];
    const length = 16;
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      // Exponential decay for reverb tail
      const decay = Math.exp(-t * 3);
      curve.push(decay);
    }
    
    return curve;
  }

  generateDelayFeedbackCurve() {
    const curve = [];
    const length = 16;
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      // Build up feedback, then slight decay
      if (t < 0.7) {
        curve.push(Math.pow(t / 0.7, 1.5));
      } else {
        const decayT = (t - 0.7) / 0.3;
        curve.push(1 - Math.pow(decayT, 2) * 0.3);
      }
    }
    
    return curve;
  }

  // Complex curve generators
  generateSCurve() {
    const curve = [];
    const length = 16;
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      // Sigmoid function
      const sigmoid = 1 / (1 + Math.exp(-6 * (t - 0.5)));
      curve.push(sigmoid);
    }
    
    return curve;
  }

  generateBellCurve() {
    const curve = [];
    const length = 16;
    const center = 8; // Peak at center
    const width = 4; // Width of the bell
    
    for (let i = 0; i < length; i++) {
      const x = (i - center) / width;
      const gaussian = Math.exp(-x * x / 2);
      curve.push(gaussian);
    }
    
    return curve;
  }

  // Bodzin-specific curve generators
  generateBodzinFilterCurve() {
    const curve = [];
    const length = 16;
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      // Bodzin-style filter with slight modulation
      const base = Math.pow(t, 0.6);
      const modulation = 0.08 * Math.sin(t * Math.PI * 3);
      curve.push(clamp(base + modulation, 0, 1));
    }
    
    return curve;
  }

  generateBodzinBuildCurve() {
    const curve = [];
    const length = 16;
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      // Progressive build with techno character
      const build = Math.pow(t, 1.2);
      const technoMod = 0.05 * Math.sin(t * Math.PI * 8);
      curve.push(clamp(build + technoMod, 0, 1));
    }
    
    return curve;
  }

  generateBodzinBreakCurve() {
    const curve = [];
    const length = 16;
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      // Gradual breakdown with ambient character
      const breakdown = Math.pow(1 - t, 0.8);
      const ambientMod = 0.03 * Math.sin(t * Math.PI * 12);
      curve.push(clamp(breakdown + ambientMod, 0, 1));
    }
    
    return curve;
  }

  // Utility methods
  getPresetsByCategory(category) {
    return Object.entries(this.presets)
      .filter(([_, preset]) => preset.category === category)
      .map(([key, preset]) => ({ key, ...preset }));
  }

  getPresetsByTag(tag) {
    return Object.entries(this.presets)
      .filter(([_, preset]) => preset.tags.includes(tag))
      .map(([key, preset]) => ({ key, ...preset }));
  }

  searchPresets(query) {
    const lowerQuery = query.toLowerCase();
    return Object.entries(this.presets)
      .filter(([_, preset]) => 
        preset.name.toLowerCase().includes(lowerQuery) ||
        preset.description.toLowerCase().includes(lowerQuery) ||
        preset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
      .map(([key, preset]) => ({ key, ...preset }));
  }

  getPreset(key) {
    return this.presets[key] || null;
  }

  getAllPresets() {
    return Object.entries(this.presets).map(([key, preset]) => ({ key, ...preset }));
  }

  getCategories() {
    const categories = new Set();
    Object.values(this.presets).forEach(preset => {
      categories.add(preset.category);
    });
    return Array.from(categories).sort();
  }

  getTags() {
    const tags = new Set();
    Object.values(this.presets).forEach(preset => {
      preset.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  // Preset management
  addCustomPreset(key, preset) {
    this.presets[key] = {
      ...preset,
      custom: true,
      createdAt: new Date().toISOString()
    };
  }

  removeCustomPreset(key) {
    if (this.presets[key]?.custom) {
      delete this.presets[key];
      return true;
    }
    return false;
  }

  exportPresets() {
    const customPresets = {};
    Object.entries(this.presets).forEach(([key, preset]) => {
      if (preset.custom) {
        customPresets[key] = preset;
      }
    });
    return customPresets;
  }

  importPresets(presets) {
    Object.entries(presets).forEach(([key, preset]) => {
      this.presets[key] = {
        ...preset,
        custom: true,
        importedAt: new Date().toISOString()
      };
    });
  }
}

// Utility function for clamping values
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}