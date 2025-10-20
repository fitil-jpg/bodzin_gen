import { clamp } from '../utils/helpers.js';

export class WolframIntegration {
  constructor(app) {
    this.app = app;
    this.apiKey = null;
    this.baseUrl = 'https://api.wolframalpha.com/v2';
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
    
    // Mathematical pattern generators
    this.patternGenerators = {
      fibonacci: this.generateFibonacciPattern.bind(this),
      prime: this.generatePrimePattern.bind(this),
      goldenRatio: this.generateGoldenRatioPattern.bind(this),
      mandelbrot: this.generateMandelbrotPattern.bind(this),
      julia: this.generateJuliaPattern.bind(this),
      lorenz: this.generateLorenzPattern.bind(this),
      logistic: this.generateLogisticPattern.bind(this),
      sine: this.generateSinePattern.bind(this),
      cosine: this.generateCosinePattern.bind(this),
      exponential: this.generateExponentialPattern.bind(this),
      logarithmic: this.generateLogarithmicPattern.bind(this),
      polynomial: this.generatePolynomialPattern.bind(this),
      fourier: this.generateFourierPattern.bind(this),
      wavelet: this.generateWaveletPattern.bind(this),
      chaos: this.generateChaosPattern.bind(this),
      cellular: this.generateCellularAutomatonPattern.bind(this)
    };
    
    // Mathematical constants
    this.constants = {
      PI: Math.PI,
      E: Math.E,
      PHI: (1 + Math.sqrt(5)) / 2, // Golden ratio
      EULER: 0.5772156649015329,
      CATALAN: 0.9159655941772190,
      APERY: 1.2020569031595942
    };
  }

  // API Configuration
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  // Cache management
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedResult(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Wolfram Alpha API integration
  async queryWolframAlpha(query) {
    if (!this.apiKey) {
      console.warn('Wolfram Alpha API key not set');
      return null;
    }

    const cacheKey = `wolfram_${query}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/query?input=${encodeURIComponent(query)}&appid=${this.apiKey}&format=plaintext`);
      const data = await response.json();
      
      this.setCachedResult(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Wolfram Alpha API error:', error);
      return null;
    }
  }

  // Mathematical pattern generators
  generateFibonacciPattern(length, params = {}) {
    const { start = 0, end = 1, offset = 0, scale = 1 } = params;
    const values = [];
    
    let a = 0, b = 1;
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        values.push(a);
      } else if (i === 1) {
        values.push(b);
      } else {
        const next = a + b;
        a = b;
        b = next;
        values.push(next);
      }
    }
    
    // Normalize to 0-1 range
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    return values.map(val => {
      const normalized = range > 0 ? (val - min) / range : 0.5;
      return clamp(start + (end - start) * normalized * scale + offset, 0, 1);
    });
  }

  generatePrimePattern(length, params = {}) {
    const { start = 0, end = 1, offset = 0, scale = 1 } = params;
    const values = [];
    
    for (let i = 0; i < length; i++) {
      const prime = this.getNthPrime(i + 1);
      values.push(prime);
    }
    
    // Normalize to 0-1 range
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    return values.map(val => {
      const normalized = range > 0 ? (val - min) / range : 0.5;
      return clamp(start + (end - start) * normalized * scale + offset, 0, 1);
    });
  }

  generateGoldenRatioPattern(length, params = {}) {
    const { start = 0, end = 1, frequency = 1, phase = 0 } = params;
    const phi = this.constants.PHI;
    
    return Array.from({ length }, (_, i) => {
      const t = i / (length - 1);
      const value = Math.sin(2 * Math.PI * frequency * t * phi + phase);
      return clamp(start + (end - start) * (value * 0.5 + 0.5), 0, 1);
    });
  }

  generateMandelbrotPattern(length, params = {}) {
    const { start = 0, end = 1, maxIterations = 100, zoom = 1, centerX = -0.5, centerY = 0 } = params;
    const values = [];
    
    for (let i = 0; i < length; i++) {
      const x = (i / length) * 2 * zoom + centerX;
      const y = centerY;
      
      let zx = 0, zy = 0;
      let iterations = 0;
      
      while (zx * zx + zy * zy < 4 && iterations < maxIterations) {
        const temp = zx * zx - zy * zy + x;
        zy = 2 * zx * zy + y;
        zx = temp;
        iterations++;
      }
      
      values.push(iterations / maxIterations);
    }
    
    return values.map(val => clamp(start + (end - start) * val, 0, 1));
  }

  generateJuliaPattern(length, params = {}) {
    const { start = 0, end = 1, maxIterations = 100, cReal = -0.7, cImag = 0.27015 } = params;
    const values = [];
    
    for (let i = 0; i < length; i++) {
      const x = (i / length) * 4 - 2;
      const y = 0;
      
      let zx = x, zy = y;
      let iterations = 0;
      
      while (zx * zx + zy * zy < 4 && iterations < maxIterations) {
        const temp = zx * zx - zy * zy + cReal;
        zy = 2 * zx * zy + cImag;
        zx = temp;
        iterations++;
      }
      
      values.push(iterations / maxIterations);
    }
    
    return values.map(val => clamp(start + (end - start) * val, 0, 1));
  }

  generateLorenzPattern(length, params = {}) {
    const { start = 0, end = 1, sigma = 10, rho = 28, beta = 8/3, dt = 0.01 } = params;
    const values = [];
    
    let x = 1, y = 1, z = 1;
    
    for (let i = 0; i < length; i++) {
      const dx = sigma * (y - x) * dt;
      const dy = (x * (rho - z) - y) * dt;
      const dz = (x * y - beta * z) * dt;
      
      x += dx;
      y += dy;
      z += dz;
      
      values.push(x);
    }
    
    // Normalize to 0-1 range
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    return values.map(val => {
      const normalized = range > 0 ? (val - min) / range : 0.5;
      return clamp(start + (end - start) * normalized, 0, 1);
    });
  }

  generateLogisticPattern(length, params = {}) {
    const { start = 0, end = 1, r = 3.7, x0 = 0.5 } = params;
    const values = [];
    let x = x0;
    
    for (let i = 0; i < length; i++) {
      x = r * x * (1 - x);
      values.push(x);
    }
    
    return values.map(val => clamp(start + (end - start) * val, 0, 1));
  }

  generateSinePattern(length, params = {}) {
    const { start = 0, end = 1, frequency = 1, amplitude = 1, phase = 0, harmonics = 1 } = params;
    const values = [];
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      let value = 0;
      
      for (let h = 1; h <= harmonics; h++) {
        value += Math.sin(2 * Math.PI * frequency * h * t + phase) / h;
      }
      
      values.push(value);
    }
    
    // Normalize to 0-1 range
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    return values.map(val => {
      const normalized = range > 0 ? (val - min) / range : 0.5;
      return clamp(start + (end - start) * normalized, 0, 1);
    });
  }

  generateCosinePattern(length, params = {}) {
    const { start = 0, end = 1, frequency = 1, amplitude = 1, phase = 0, harmonics = 1 } = params;
    const values = [];
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      let value = 0;
      
      for (let h = 1; h <= harmonics; h++) {
        value += Math.cos(2 * Math.PI * frequency * h * t + phase) / h;
      }
      
      values.push(value);
    }
    
    // Normalize to 0-1 range
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    return values.map(val => {
      const normalized = range > 0 ? (val - min) / range : 0.5;
      return clamp(start + (end - start) * normalized, 0, 1);
    });
  }

  generateExponentialPattern(length, params = {}) {
    const { start = 0, end = 1, base = Math.E, scale = 1, offset = 0 } = params;
    const values = [];
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      const value = Math.pow(base, scale * t + offset);
      values.push(value);
    }
    
    // Normalize to 0-1 range
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    return values.map(val => {
      const normalized = range > 0 ? (val - min) / range : 0.5;
      return clamp(start + (end - start) * normalized, 0, 1);
    });
  }

  generateLogarithmicPattern(length, params = {}) {
    const { start = 0, end = 1, base = Math.E, scale = 1, offset = 1 } = params;
    const values = [];
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      const value = Math.log(scale * t + offset) / Math.log(base);
      values.push(value);
    }
    
    // Normalize to 0-1 range
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    return values.map(val => {
      const normalized = range > 0 ? (val - min) / range : 0.5;
      return clamp(start + (end - start) * normalized, 0, 1);
    });
  }

  generatePolynomialPattern(length, params = {}) {
    const { start = 0, end = 1, coefficients = [0, 0, 1, -1], scale = 1 } = params;
    const values = [];
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      let value = 0;
      
      for (let j = 0; j < coefficients.length; j++) {
        value += coefficients[j] * Math.pow(t, j);
      }
      
      values.push(value * scale);
    }
    
    // Normalize to 0-1 range
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    return values.map(val => {
      const normalized = range > 0 ? (val - min) / range : 0.5;
      return clamp(start + (end - start) * normalized, 0, 1);
    });
  }

  generateFourierPattern(length, params = {}) {
    const { start = 0, end = 1, frequencies = [1, 2, 3], amplitudes = [1, 0.5, 0.25], phases = [0, 0, 0] } = params;
    const values = [];
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      let value = 0;
      
      for (let j = 0; j < frequencies.length; j++) {
        value += amplitudes[j] * Math.sin(2 * Math.PI * frequencies[j] * t + phases[j]);
      }
      
      values.push(value);
    }
    
    // Normalize to 0-1 range
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    return values.map(val => {
      const normalized = range > 0 ? (val - min) / range : 0.5;
      return clamp(start + (end - start) * normalized, 0, 1);
    });
  }

  generateWaveletPattern(length, params = {}) {
    const { start = 0, end = 1, waveletType = 'morlet', frequency = 1, scale = 1 } = params;
    const values = [];
    
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      let value = 0;
      
      switch (waveletType) {
        case 'morlet':
          value = Math.exp(-Math.pow(t - 0.5, 2) / (2 * scale * scale)) * Math.cos(2 * Math.PI * frequency * t);
          break;
        case 'mexican':
          value = (1 - Math.pow(t - 0.5, 2) / scale) * Math.exp(-Math.pow(t - 0.5, 2) / (2 * scale * scale));
          break;
        case 'gaussian':
          value = Math.exp(-Math.pow(t - 0.5, 2) / (2 * scale * scale));
          break;
        default:
          value = Math.sin(2 * Math.PI * frequency * t);
      }
      
      values.push(value);
    }
    
    // Normalize to 0-1 range
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    return values.map(val => {
      const normalized = range > 0 ? (val - min) / range : 0.5;
      return clamp(start + (end - start) * normalized, 0, 1);
    });
  }

  generateChaosPattern(length, params = {}) {
    const { start = 0, end = 1, chaosType = 'tent', a = 1.5, b = 0.5 } = params;
    const values = [];
    let x = 0.5;
    
    for (let i = 0; i < length; i++) {
      switch (chaosType) {
        case 'tent':
          x = x < 0.5 ? 2 * a * x : 2 * a * (1 - x);
          break;
        case 'sine':
          x = a * Math.sin(Math.PI * x);
          break;
        case 'quadratic':
          x = a * x * (1 - x);
          break;
        case 'cubic':
          x = a * x * (1 - x) * (1 - b * x);
          break;
        default:
          x = a * x * (1 - x);
      }
      
      values.push(x);
    }
    
    return values.map(val => clamp(start + (end - start) * val, 0, 1));
  }

  generateCellularAutomatonPattern(length, params = {}) {
    const { start = 0, end = 1, rule = 30, generations = 50 } = params;
    const values = [];
    
    // Initialize first generation
    let currentGen = new Array(length).fill(0);
    currentGen[Math.floor(length / 2)] = 1;
    
    for (let gen = 0; gen < generations; gen++) {
      const nextGen = new Array(length).fill(0);
      
      for (let i = 0; i < length; i++) {
        const left = currentGen[(i - 1 + length) % length];
        const center = currentGen[i];
        const right = currentGen[(i + 1) % length];
        
        const pattern = (left << 2) | (center << 1) | right;
        nextGen[i] = (rule >> pattern) & 1;
      }
      
      currentGen = nextGen;
      
      // Use the current generation as pattern values
      if (gen >= generations - length) {
        values.push(...currentGen);
      }
    }
    
    return values.slice(0, length).map(val => clamp(start + (end - start) * val, 0, 1));
  }

  // Utility functions
  getNthPrime(n) {
    if (n === 1) return 2;
    if (n === 2) return 3;
    
    let count = 2;
    let candidate = 5;
    
    while (count < n) {
      if (this.isPrime(candidate)) {
        count++;
        if (count === n) return candidate;
      }
      candidate += 2;
    }
    
    return candidate;
  }

  isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    
    return true;
  }

  // Pattern combination and manipulation
  combinePatterns(patterns, weights = null) {
    if (patterns.length === 0) return [];
    
    const length = patterns[0].length;
    const result = new Array(length).fill(0);
    
    if (!weights) {
      weights = new Array(patterns.length).fill(1 / patterns.length);
    }
    
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const weight = weights[i];
      
      for (let j = 0; j < length; j++) {
        result[j] += pattern[j] * weight;
      }
    }
    
    return result.map(val => clamp(val, 0, 1));
  }

  morphPatterns(pattern1, pattern2, t) {
    if (pattern1.length !== pattern2.length) return pattern1;
    
    return pattern1.map((val, i) => {
      return val + (pattern2[i] - val) * t;
    });
  }

  // Generate pattern with Wolfram Alpha integration
  async generateWolframPattern(patternType, length, params = {}) {
    const generator = this.patternGenerators[patternType];
    if (!generator) {
      console.warn(`Unknown pattern type: ${patternType}`);
      return null;
    }
    
    return generator(length, params);
  }

  // Get available pattern types
  getAvailablePatternTypes() {
    return Object.keys(this.patternGenerators);
  }

  // Get pattern metadata
  getPatternMetadata(patternType) {
    const metadata = {
      fibonacci: {
        name: 'Fibonacci Sequence',
        description: 'Pattern based on Fibonacci numbers',
        parameters: ['start', 'end', 'offset', 'scale']
      },
      prime: {
        name: 'Prime Numbers',
        description: 'Pattern based on prime number sequence',
        parameters: ['start', 'end', 'offset', 'scale']
      },
      goldenRatio: {
        name: 'Golden Ratio',
        description: 'Pattern based on golden ratio mathematics',
        parameters: ['start', 'end', 'frequency', 'phase']
      },
      mandelbrot: {
        name: 'Mandelbrot Set',
        description: 'Pattern based on Mandelbrot fractal',
        parameters: ['start', 'end', 'maxIterations', 'zoom', 'centerX', 'centerY']
      },
      julia: {
        name: 'Julia Set',
        description: 'Pattern based on Julia fractal',
        parameters: ['start', 'end', 'maxIterations', 'cReal', 'cImag']
      },
      lorenz: {
        name: 'Lorenz Attractor',
        description: 'Pattern based on Lorenz chaotic system',
        parameters: ['start', 'end', 'sigma', 'rho', 'beta', 'dt']
      },
      logistic: {
        name: 'Logistic Map',
        description: 'Pattern based on logistic map chaos',
        parameters: ['start', 'end', 'r', 'x0']
      },
      sine: {
        name: 'Sine Wave',
        description: 'Pattern based on sine wave harmonics',
        parameters: ['start', 'end', 'frequency', 'amplitude', 'phase', 'harmonics']
      },
      cosine: {
        name: 'Cosine Wave',
        description: 'Pattern based on cosine wave harmonics',
        parameters: ['start', 'end', 'frequency', 'amplitude', 'phase', 'harmonics']
      },
      exponential: {
        name: 'Exponential',
        description: 'Pattern based on exponential function',
        parameters: ['start', 'end', 'base', 'scale', 'offset']
      },
      logarithmic: {
        name: 'Logarithmic',
        description: 'Pattern based on logarithmic function',
        parameters: ['start', 'end', 'base', 'scale', 'offset']
      },
      polynomial: {
        name: 'Polynomial',
        description: 'Pattern based on polynomial function',
        parameters: ['start', 'end', 'coefficients', 'scale']
      },
      fourier: {
        name: 'Fourier Series',
        description: 'Pattern based on Fourier series',
        parameters: ['start', 'end', 'frequencies', 'amplitudes', 'phases']
      },
      wavelet: {
        name: 'Wavelet',
        description: 'Pattern based on wavelet functions',
        parameters: ['start', 'end', 'waveletType', 'frequency', 'scale']
      },
      chaos: {
        name: 'Chaos Theory',
        description: 'Pattern based on chaos theory',
        parameters: ['start', 'end', 'chaosType', 'a', 'b']
      },
      cellular: {
        name: 'Cellular Automaton',
        description: 'Pattern based on cellular automaton',
        parameters: ['start', 'end', 'rule', 'generations']
      }
    };
    
    return metadata[patternType] || null;
  }
}