import { CURVE_TYPES } from '../utils/constants.js';
import { clamp } from '../utils/helpers.js';

export class CurveMath {
  constructor() {
    this.smoothingAlgorithms = {
      gaussian: this.gaussianSmooth.bind(this),
      movingAverage: this.movingAverageSmooth.bind(this),
      savitzkyGolay: this.savitzkyGolaySmooth.bind(this),
      exponential: this.exponentialSmooth.bind(this)
    };
    
    this.interpolationMethods = {
      linear: this.linearInterpolation.bind(this),
      cubic: this.cubicInterpolation.bind(this),
      hermite: this.hermiteInterpolation.bind(this),
      catmullRom: this.catmullRomInterpolation.bind(this),
      bezier: this.bezierInterpolation.bind(this)
    };
  }

  // Advanced smoothing algorithms
  gaussianSmooth(values, sigma = 1.0) {
    if (values.length < 3) return [...values];
    
    const kernel = this.createGaussianKernel(sigma);
    const result = new Array(values.length).fill(0);
    
    for (let i = 0; i < values.length; i++) {
      let sum = 0;
      let weightSum = 0;
      
      for (let j = 0; j < kernel.length; j++) {
        const index = i - Math.floor(kernel.length / 2) + j;
        if (index >= 0 && index < values.length) {
          sum += values[index] * kernel[j];
          weightSum += kernel[j];
        }
      }
      
      result[i] = weightSum > 0 ? sum / weightSum : values[i];
    }
    
    return result;
  }

  createGaussianKernel(sigma) {
    const size = Math.ceil(sigma * 3) * 2 + 1;
    const kernel = new Array(size);
    const center = Math.floor(size / 2);
    
    for (let i = 0; i < size; i++) {
      const x = i - center;
      kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    }
    
    return kernel;
  }

  movingAverageSmooth(values, windowSize = 3) {
    if (values.length < windowSize) return [...values];
    
    const result = new Array(values.length);
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let i = 0; i < values.length; i++) {
      let sum = 0;
      let count = 0;
      
      for (let j = Math.max(0, i - halfWindow); j <= Math.min(values.length - 1, i + halfWindow); j++) {
        sum += values[j];
        count++;
      }
      
      result[i] = sum / count;
    }
    
    return result;
  }

  savitzkyGolaySmooth(values, windowSize = 5, polynomialOrder = 2) {
    if (values.length < windowSize || polynomialOrder >= windowSize) {
      return this.movingAverageSmooth(values, windowSize);
    }
    
    const coefficients = this.calculateSavitzkyGolayCoefficients(windowSize, polynomialOrder);
    const result = new Array(values.length);
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let i = 0; i < values.length; i++) {
      let sum = 0;
      
      for (let j = 0; j < windowSize; j++) {
        const index = i - halfWindow + j;
        if (index >= 0 && index < values.length) {
          sum += values[index] * coefficients[j];
        }
      }
      
      result[i] = sum;
    }
    
    return result;
  }

  calculateSavitzkyGolayCoefficients(windowSize, polynomialOrder) {
    // Simplified Savitzky-Golay coefficients calculation
    // In a full implementation, this would use matrix operations
    const coefficients = new Array(windowSize);
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let i = 0; i < windowSize; i++) {
      const x = i - halfWindow;
      let sum = 0;
      
      for (let k = 0; k <= polynomialOrder; k++) {
        sum += Math.pow(x, k) * this.binomialCoefficient(polynomialOrder, k);
      }
      
      coefficients[i] = sum / windowSize;
    }
    
    return coefficients;
  }

  binomialCoefficient(n, k) {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    return result;
  }

  exponentialSmooth(values, alpha = 0.3) {
    if (values.length === 0) return [];
    
    const result = [values[0]];
    
    for (let i = 1; i < values.length; i++) {
      result[i] = alpha * values[i] + (1 - alpha) * result[i - 1];
    }
    
    return result;
  }

  // Advanced interpolation methods
  linearInterpolation(points, t) {
    if (points.length < 2) return points[0] || 0;
    
    const scaledT = t * (points.length - 1);
    const index = Math.floor(scaledT);
    const fraction = scaledT - index;
    
    if (index >= points.length - 1) return points[points.length - 1];
    if (index < 0) return points[0];
    
    return points[index] + (points[index + 1] - points[index]) * fraction;
  }

  cubicInterpolation(points, t) {
    if (points.length < 2) return points[0] || 0;
    if (points.length === 2) return this.linearInterpolation(points, t);
    
    const scaledT = t * (points.length - 1);
    const index = Math.floor(scaledT);
    const fraction = scaledT - index;
    
    if (index >= points.length - 1) return points[points.length - 1];
    if (index < 0) return points[0];
    
    const p0 = index > 0 ? points[index - 1] : points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = index < points.length - 2 ? points[index + 2] : points[index + 1];
    
    return this.cubicHermite(p0, p1, p2, p3, fraction);
  }

  cubicHermite(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    
    const h1 = 2 * t3 - 3 * t2 + 1;
    const h2 = -2 * t3 + 3 * t2;
    const h3 = t3 - 2 * t2 + t;
    const h4 = t3 - t2;
    
    const m1 = (p2 - p0) * 0.5;
    const m2 = (p3 - p1) * 0.5;
    
    return h1 * p1 + h2 * p2 + h3 * m1 + h4 * m2;
  }

  hermiteInterpolation(points, t) {
    if (points.length < 2) return points[0] || 0;
    
    const scaledT = t * (points.length - 1);
    const index = Math.floor(scaledT);
    const fraction = scaledT - index;
    
    if (index >= points.length - 1) return points[points.length - 1];
    if (index < 0) return points[0];
    
    const p0 = index > 0 ? points[index - 1] : points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = index < points.length - 2 ? points[index + 2] : points[index + 1];
    
    return this.hermite(p0, p1, p2, p3, fraction);
  }

  hermite(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    
    const m0 = (p2 - p0) * 0.5;
    const m1 = (p3 - p1) * 0.5;
    
    return h00 * p1 + h10 * m0 + h01 * p2 + h11 * m1;
  }

  catmullRomInterpolation(points, t) {
    if (points.length < 2) return points[0] || 0;
    
    const scaledT = t * (points.length - 1);
    const index = Math.floor(scaledT);
    const fraction = scaledT - index;
    
    if (index >= points.length - 1) return points[points.length - 1];
    if (index < 0) return points[0];
    
    const p0 = index > 0 ? points[index - 1] : points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = index < points.length - 2 ? points[index + 2] : points[index + 1];
    
    return this.catmullRom(p0, p1, p2, p3, fraction);
  }

  catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    
    return 0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
  }

  bezierInterpolation(points, t) {
    if (points.length < 2) return points[0] || 0;
    if (points.length === 2) return this.linearInterpolation(points, t);
    
    const scaledT = t * (points.length - 1);
    const index = Math.floor(scaledT);
    const fraction = scaledT - index;
    
    if (index >= points.length - 1) return points[points.length - 1];
    if (index < 0) return points[0];
    
    const p0 = points[index];
    const p1 = points[index + 1];
    
    // Create control points for smooth bezier
    const cp0 = index > 0 ? points[index - 1] : p0;
    const cp1 = index < points.length - 2 ? points[index + 2] : p1;
    
    const c1 = p0 + (p1 - cp0) * 0.3;
    const c2 = p1 - (cp1 - p0) * 0.3;
    
    return this.cubicBezier(p0, c1, c2, p1, fraction);
  }

  cubicBezier(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
  }

  // Curve analysis and manipulation
  analyzeCurve(values) {
    if (values.length === 0) return null;
    
    const analysis = {
      min: Math.min(...values),
      max: Math.max(...values),
      range: 0,
      mean: 0,
      variance: 0,
      standardDeviation: 0,
      skewness: 0,
      kurtosis: 0,
      energy: 0,
      zeroCrossings: 0,
      peaks: [],
      valleys: []
    };
    
    analysis.range = analysis.max - analysis.min;
    analysis.mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate variance
    analysis.variance = values.reduce((sum, val) => sum + Math.pow(val - analysis.mean, 2), 0) / values.length;
    analysis.standardDeviation = Math.sqrt(analysis.variance);
    
    // Calculate skewness
    const skewSum = values.reduce((sum, val) => {
      const diff = val - analysis.mean;
      return sum + Math.pow(diff, 3);
    }, 0);
    analysis.skewness = skewSum / (values.length * Math.pow(analysis.standardDeviation, 3));
    
    // Calculate kurtosis
    const kurtSum = values.reduce((sum, val) => {
      const diff = val - analysis.mean;
      return sum + Math.pow(diff, 4);
    }, 0);
    analysis.kurtosis = (kurtSum / (values.length * Math.pow(analysis.standardDeviation, 4))) - 3;
    
    // Calculate energy
    analysis.energy = values.reduce((sum, val) => sum + val * val, 0);
    
    // Find zero crossings
    for (let i = 1; i < values.length; i++) {
      if ((values[i] >= 0) !== (values[i - 1] >= 0)) {
        analysis.zeroCrossings++;
      }
    }
    
    // Find peaks and valleys
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        analysis.peaks.push({ index: i, value: values[i] });
      }
      if (values[i] < values[i - 1] && values[i] < values[i + 1]) {
        analysis.valleys.push({ index: i, value: values[i] });
      }
    }
    
    return analysis;
  }

  // Curve transformation methods
  normalizeCurve(values, targetMin = 0, targetMax = 1) {
    if (values.length === 0) return [];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    if (range === 0) return values.map(() => (targetMin + targetMax) / 2);
    
    return values.map(value => {
      const normalized = (value - min) / range;
      return targetMin + normalized * (targetMax - targetMin);
    });
  }

  quantizeCurve(values, levels = 16) {
    return values.map(value => {
      const quantized = Math.round(value * (levels - 1)) / (levels - 1);
      return clamp(quantized, 0, 1);
    });
  }

  reverseCurve(values) {
    return [...values].reverse();
  }

  invertCurve(values) {
    return values.map(value => 1 - value);
  }

  scaleCurve(values, factor) {
    return values.map(value => clamp(value * factor, 0, 1));
  }

  offsetCurve(values, offset) {
    return values.map(value => clamp(value + offset, 0, 1));
  }

  // Curve generation methods
  generateCurve(type, length, params = {}) {
    const { start = 0, end = 1, frequency = 1, amplitude = 1, phase = 0 } = params;
    
    switch (type) {
      case 'sine':
        return this.generateSineCurve(length, start, end, frequency, amplitude, phase);
      case 'cosine':
        return this.generateCosineCurve(length, start, end, frequency, amplitude, phase);
      case 'triangle':
        return this.generateTriangleCurve(length, start, end, frequency, phase);
      case 'sawtooth':
        return this.generateSawtoothCurve(length, start, end, frequency, phase);
      case 'square':
        return this.generateSquareCurve(length, start, end, frequency, phase);
      case 'noise':
        return this.generateNoiseCurve(length, start, end, params.seed);
      case 'randomWalk':
        return this.generateRandomWalkCurve(length, start, end, params.stepSize);
      default:
        return this.generateLinearCurve(length, start, end);
    }
  }

  generateSineCurve(length, start, end, frequency, amplitude, phase) {
    return Array.from({ length }, (_, i) => {
      const t = i / (length - 1);
      const sine = Math.sin(2 * Math.PI * frequency * t + phase);
      return start + (end - start) * (sine * amplitude * 0.5 + 0.5);
    });
  }

  generateCosineCurve(length, start, end, frequency, amplitude, phase) {
    return Array.from({ length }, (_, i) => {
      const t = i / (length - 1);
      const cosine = Math.cos(2 * Math.PI * frequency * t + phase);
      return start + (end - start) * (cosine * amplitude * 0.5 + 0.5);
    });
  }

  generateTriangleCurve(length, start, end, frequency, phase) {
    return Array.from({ length }, (_, i) => {
      const t = i / (length - 1);
      const triangle = 2 * Math.abs(2 * (frequency * t + phase) - Math.floor(2 * (frequency * t + phase) + 0.5)) - 1;
      return start + (end - start) * (triangle * 0.5 + 0.5);
    });
  }

  generateSawtoothCurve(length, start, end, frequency, phase) {
    return Array.from({ length }, (_, i) => {
      const t = i / (length - 1);
      const sawtooth = 2 * ((frequency * t + phase) - Math.floor(frequency * t + phase + 0.5));
      return start + (end - start) * (sawtooth * 0.5 + 0.5);
    });
  }

  generateSquareCurve(length, start, end, frequency, phase) {
    return Array.from({ length }, (_, i) => {
      const t = i / (length - 1);
      const square = Math.sign(Math.sin(2 * Math.PI * frequency * t + phase));
      return start + (end - start) * (square * 0.5 + 0.5);
    });
  }

  generateNoiseCurve(length, start, end, seed = 0) {
    const values = [];
    let current = start + (end - start) * 0.5;
    
    for (let i = 0; i < length; i++) {
      const noise = (Math.random() - 0.5) * 0.1;
      current += noise;
      current = clamp(current, start, end);
      values.push(current);
    }
    
    return values;
  }

  generateRandomWalkCurve(length, start, end, stepSize = 0.1) {
    const values = [];
    let current = start + (end - start) * 0.5;
    
    for (let i = 0; i < length; i++) {
      const step = (Math.random() - 0.5) * stepSize;
      current += step;
      current = clamp(current, start, end);
      values.push(current);
    }
    
    return values;
  }

  generateLinearCurve(length, start, end) {
    return Array.from({ length }, (_, i) => {
      const t = i / (length - 1);
      return start + (end - start) * t;
    });
  }

  // Curve comparison and similarity
  calculateSimilarity(curve1, curve2) {
    if (curve1.length !== curve2.length) return 0;
    
    const correlation = this.calculateCorrelation(curve1, curve2);
    const mse = this.calculateMSE(curve1, curve2);
    const mae = this.calculateMAE(curve1, curve2);
    
    return {
      correlation,
      mse,
      mae,
      similarity: Math.max(0, correlation - mse)
    };
  }

  calculateCorrelation(curve1, curve2) {
    const n = curve1.length;
    const mean1 = curve1.reduce((sum, val) => sum + val, 0) / n;
    const mean2 = curve2.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = curve1[i] - mean1;
      const diff2 = curve2[i] - mean2;
      
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sumSq1 * sumSq2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  calculateMSE(curve1, curve2) {
    const n = curve1.length;
    let sum = 0;
    
    for (let i = 0; i < n; i++) {
      const diff = curve1[i] - curve2[i];
      sum += diff * diff;
    }
    
    return sum / n;
  }

  calculateMAE(curve1, curve2) {
    const n = curve1.length;
    let sum = 0;
    
    for (let i = 0; i < n; i++) {
      sum += Math.abs(curve1[i] - curve2[i]);
    }
    
    return sum / n;
  }
}