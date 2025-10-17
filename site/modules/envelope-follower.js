import { clamp } from '../utils/helpers.js';

/**
 * EnvelopeFollower class for tracking audio signal amplitude
 * Provides attack and release envelope following with configurable parameters
 */
export class EnvelopeFollower {
  constructor(options = {}) {
    this.attackTime = options.attackTime || 0.01; // 10ms default attack
    this.releaseTime = options.releaseTime || 0.1; // 100ms default release
    this.sensitivity = options.sensitivity || 1.0; // Input sensitivity multiplier
    this.threshold = options.threshold || 0.0; // Minimum threshold for activation
    this.gate = options.gate || false; // Gate mode - only output when above threshold
    
    // Internal state
    this.currentLevel = 0;
    this.lastInput = 0;
    this.isActive = false;
    
    // Sample rate for time-based calculations
    this.sampleRate = 44100; // Default, will be updated when connected
    
    // Pre-calculated coefficients for efficiency
    this.attackCoeff = 0;
    this.releaseCoeff = 0;
    this.updateCoefficients();
  }

  /**
   * Update attack and release coefficients based on current time settings
   */
  updateCoefficients() {
    if (this.sampleRate <= 0) return;
    
    // Convert time to sample-based coefficients
    // Using exponential approach: coeff = 1 - exp(-1 / (time * sampleRate))
    this.attackCoeff = this.attackTime > 0 
      ? 1 - Math.exp(-1 / (this.attackTime * this.sampleRate))
      : 1;
    this.releaseCoeff = this.releaseTime > 0
      ? 1 - Math.exp(-1 / (this.releaseTime * this.sampleRate))
      : 1;
  }

  /**
   * Set the sample rate and recalculate coefficients
   * @param {number} sampleRate - Audio sample rate in Hz
   */
  setSampleRate(sampleRate) {
    this.sampleRate = sampleRate;
    this.updateCoefficients();
  }

  /**
   * Set attack time and recalculate coefficient
   * @param {number} time - Attack time in seconds
   */
  setAttackTime(time) {
    this.attackTime = Math.max(0, time);
    this.updateCoefficients();
  }

  /**
   * Set release time and recalculate coefficient
   * @param {number} time - Release time in seconds
   */
  setReleaseTime(time) {
    this.releaseTime = Math.max(0, time);
    this.updateCoefficients();
  }

  /**
   * Set input sensitivity
   * @param {number} sensitivity - Sensitivity multiplier (0-10)
   */
  setSensitivity(sensitivity) {
    this.sensitivity = clamp(sensitivity, 0, 10);
  }

  /**
   * Set threshold for gate mode
   * @param {number} threshold - Threshold level (0-1)
   */
  setThreshold(threshold) {
    this.threshold = clamp(threshold, 0, 1);
  }

  /**
   * Enable or disable gate mode
   * @param {boolean} enabled - Whether to enable gate mode
   */
  setGateMode(enabled) {
    this.gate = enabled;
  }

  /**
   * Process a single sample through the envelope follower
   * @param {number} input - Input sample value
   * @returns {number} Envelope output value (0-1)
   */
  process(input) {
    // Apply sensitivity and get absolute value
    const scaledInput = Math.abs(input * this.sensitivity);
    
    // Check threshold for gate mode
    const aboveThreshold = scaledInput >= this.threshold;
    
    if (this.gate) {
      this.isActive = aboveThreshold;
    } else {
      this.isActive = true; // Always active in non-gate mode
    }
    
    if (!this.isActive) {
      // In gate mode, when below threshold, use release
      this.currentLevel *= (1 - this.releaseCoeff);
    } else {
      // Determine whether to use attack or release
      const shouldAttack = scaledInput > this.currentLevel;
      const coeff = shouldAttack ? this.attackCoeff : this.releaseCoeff;
      
      // Apply envelope following
      this.currentLevel += (scaledInput - this.currentLevel) * coeff;
    }
    
    // Clamp output to valid range
    this.currentLevel = clamp(this.currentLevel, 0, 1);
    this.lastInput = scaledInput;
    
    return this.currentLevel;
  }

  /**
   * Process an array of samples
   * @param {Float32Array|Array} input - Input samples
   * @returns {Float32Array} Envelope output samples
   */
  processBuffer(input) {
    const output = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) {
      output[i] = this.process(input[i]);
    }
    return output;
  }

  /**
   * Reset the envelope follower state
   */
  reset() {
    this.currentLevel = 0;
    this.lastInput = 0;
    this.isActive = false;
  }

  /**
   * Get current envelope level
   * @returns {number} Current envelope level (0-1)
   */
  getLevel() {
    return this.currentLevel;
  }

  /**
   * Get current input level
   * @returns {number} Current input level (0-1)
   */
  getInputLevel() {
    return this.lastInput;
  }

  /**
   * Check if envelope is currently active (above threshold in gate mode)
   * @returns {boolean} Whether envelope is active
   */
  isEnvelopeActive() {
    return this.isActive;
  }

  /**
   * Get current configuration as an object
   * @returns {Object} Current configuration
   */
  getConfig() {
    return {
      attackTime: this.attackTime,
      releaseTime: this.releaseTime,
      sensitivity: this.sensitivity,
      threshold: this.threshold,
      gate: this.gate,
      sampleRate: this.sampleRate
    };
  }

  /**
   * Set configuration from an object
   * @param {Object} config - Configuration object
   */
  setConfig(config) {
    if (config.attackTime !== undefined) this.setAttackTime(config.attackTime);
    if (config.releaseTime !== undefined) this.setReleaseTime(config.releaseTime);
    if (config.sensitivity !== undefined) this.setSensitivity(config.sensitivity);
    if (config.threshold !== undefined) this.setThreshold(config.threshold);
    if (config.gate !== undefined) this.setGateMode(config.gate);
    if (config.sampleRate !== undefined) this.setSampleRate(config.sampleRate);
  }
}

/**
 * Create a Tone.js-compatible envelope follower node
 * @param {Object} options - Configuration options
 * @returns {Tone.AudioNode} Tone.js audio node
 */
export function createToneEnvelopeFollower(options = {}) {
  const follower = new EnvelopeFollower(options);
  
  // Create a custom Tone.js node
  const node = new Tone.AudioNode();
  
  // Set up the envelope follower processing
  node._follower = follower;
  
  // Override the connect method to set sample rate
  const originalConnect = node.connect.bind(node);
  node.connect = function(destination, outputNum, inputNum) {
    const result = originalConnect(destination, outputNum, inputNum);
    
    // Try to get sample rate from context
    if (Tone.context && Tone.context.sampleRate) {
      follower.setSampleRate(Tone.context.sampleRate);
    }
    
    return result;
  };
  
  // Add envelope follower methods to the node
  node.setAttackTime = (time) => follower.setAttackTime(time);
  node.setReleaseTime = (time) => follower.setReleaseTime(time);
  node.setSensitivity = (sensitivity) => follower.setSensitivity(sensitivity);
  node.setThreshold = (threshold) => follower.setThreshold(threshold);
  node.setGateMode = (enabled) => follower.setGateMode(enabled);
  node.getLevel = () => follower.getLevel();
  node.getInputLevel = () => follower.getInputLevel();
  node.isEnvelopeActive = () => follower.isEnvelopeActive();
  node.reset = () => follower.reset();
  node.getConfig = () => follower.getConfig();
  node.setConfig = (config) => follower.setConfig(config);
  
  // Create the processing function
  node._process = function(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (input.length > 0 && output.length > 0) {
      const inputChannel = input[0];
      const outputChannel = output[0];
      
      for (let i = 0; i < inputChannel.length; i++) {
        outputChannel[i] = follower.process(inputChannel[i]);
      }
    }
  };
  
  return node;
}