import { LFO_DEFINITIONS } from '../utils/constants.js';
import { clamp } from '../utils/helpers.js';

export class LFOManager {
  constructor(app) {
    this.app = app;
    this.lfos = new Map();
    this.modulationTargets = new Map();
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return this;
    
    // Create LFO instances based on definitions
    LFO_DEFINITIONS.forEach(definition => {
      this.createLFO(definition);
    });

    // Set up modulation targets
    this.setupModulationTargets();
    
    this.isInitialized = true;
    return this;
  }

  createLFO(definition) {
    try {
      const lfo = new Tone.LFO({
        frequency: definition.rate,
        type: definition.waveform,
        amplitude: definition.depth,
        min: 0,
        max: 1
      });

      lfo.id = definition.id;
      lfo.label = definition.label;
      lfo.color = definition.color;
      lfo.enabled = definition.enabled;
      lfo.target = definition.target;
      lfo.baseValue = 0.5; // Default base value for modulation

      // Start the LFO
      lfo.start();

      this.lfos.set(definition.id, lfo);
      return lfo;
    } catch (error) {
      console.error(`Failed to create LFO ${definition.id}:`, error);
      return null;
    }
  }

  setupModulationTargets() {
    // Map automation track IDs to their corresponding audio parameters
    this.modulationTargets.set('leadFilter', {
      getValue: () => this.app.audio?.nodes?.leadFilter?.frequency?.value || 520,
      setValue: (value) => {
        if (this.app.audio?.nodes?.leadFilter) {
          this.app.audio.nodes.leadFilter.frequency.value = value;
        }
      },
      baseValue: 520,
      range: [240, 2200]
    });

    this.modulationTargets.set('fxSend', {
      getValue: () => this.app.audio?.nodes?.leadFxSend?.gain?.value || 0.45,
      setValue: (value) => {
        if (this.app.audio?.nodes?.leadFxSend) {
          this.app.audio.nodes.leadFxSend.gain.value = value;
        }
      },
      baseValue: 0.45,
      range: [0, 1]
    });

    this.modulationTargets.set('bassFilter', {
      getValue: () => this.app.audio?.nodes?.bassFilter?.frequency?.value || 140,
      setValue: (value) => {
        if (this.app.audio?.nodes?.bassFilter) {
          this.app.audio.nodes.bassFilter.frequency.value = value;
        }
      },
      baseValue: 140,
      range: [80, 420]
    });

    this.modulationTargets.set('reverbDecay', {
      getValue: () => this.app.audio?.nodes?.reverb?.decay || 6,
      setValue: (value) => {
        if (this.app.audio?.nodes?.reverb) {
          this.app.audio.nodes.reverb.decay = value;
        }
      },
      baseValue: 6,
      range: [1, 12]
    });

    this.modulationTargets.set('delayFeedback', {
      getValue: () => this.app.audio?.nodes?.delay?.feedback?.value || 0.38,
      setValue: (value) => {
        if (this.app.audio?.nodes?.delay) {
          this.app.audio.nodes.delay.feedback.value = value;
        }
      },
      baseValue: 0.38,
      range: [0, 0.9]
    });

    this.modulationTargets.set('bassDrive', {
      getValue: () => this.app.audio?.nodes?.bassDrive?.wet?.value || 0.35,
      setValue: (value) => {
        if (this.app.audio?.nodes?.bassDrive) {
          this.app.audio.nodes.bassDrive.wet.value = value;
        }
      },
      baseValue: 0.35,
      range: [0, 1]
    });

    this.modulationTargets.set('leadResonance', {
      getValue: () => this.app.audio?.nodes?.leadFilter?.Q?.value || 0.7,
      setValue: (value) => {
        if (this.app.audio?.nodes?.leadFilter) {
          this.app.audio.nodes.leadFilter.Q.value = value;
        }
      },
      baseValue: 0.7,
      range: [0.1, 2]
    });

    this.modulationTargets.set('masterVolume', {
      getValue: () => this.app.audio?.master?.volume?.value || -3,
      setValue: (value) => {
        if (this.app.audio?.master) {
          this.app.audio.master.volume.value = value;
        }
      },
      baseValue: -3,
      range: [-24, 6]
    });
  }

  updateLFO(lfoId, params) {
    const lfo = this.lfos.get(lfoId);
    if (!lfo) return;

    if (params.rate !== undefined) {
      lfo.frequency.rampTo(params.rate, 0.1);
    }
    
    if (params.depth !== undefined) {
      lfo.amplitude.rampTo(params.depth, 0.1);
    }
    
    if (params.waveform !== undefined) {
      lfo.type = params.waveform;
    }
    
    if (params.enabled !== undefined) {
      lfo.enabled = params.enabled;
      if (params.enabled) {
        lfo.start();
      } else {
        lfo.stop();
      }
    }
    
    if (params.target !== undefined) {
      lfo.target = params.target;
    }
  }

  applyModulation() {
    this.lfos.forEach(lfo => {
      try {
        if (!lfo.enabled || !lfo.target) return;

        const target = this.modulationTargets.get(lfo.target);
        if (!target) return;

        // Get the LFO value (0 to 1)
        const lfoValue = lfo.getValue();
        
        // Convert to modulation range
        const [min, max] = target.range;
        const range = max - min;
        const modulatedValue = target.baseValue + (lfoValue - 0.5) * range * lfo.amplitude.value;
        
        // Clamp to valid range
        const clampedValue = clamp(modulatedValue, min, max);
        
        // Apply the modulation
        target.setValue(clampedValue);
      } catch (error) {
        console.error(`Error applying LFO modulation for ${lfo.id}:`, error);
      }
    });
  }

  getLFOValue(lfoId) {
    const lfo = this.lfos.get(lfoId);
    return lfo ? lfo.getValue() : 0;
  }

  getLFOState(lfoId) {
    const lfo = this.lfos.get(lfoId);
    if (!lfo) return null;

    return {
      id: lfo.id,
      label: lfo.label,
      color: lfo.color,
      rate: lfo.frequency.value,
      depth: lfo.amplitude.value,
      waveform: lfo.type,
      enabled: lfo.enabled,
      target: lfo.target,
      value: lfo.getValue()
    };
  }

  getAllLFOStates() {
    const states = [];
    this.lfos.forEach(lfo => {
      states.push(this.getLFOState(lfo.id));
    });
    return states;
  }

  setLFOEnabled(lfoId, enabled) {
    const lfo = this.lfos.get(lfoId);
    if (!lfo) return;

    lfo.enabled = enabled;
    if (enabled) {
      lfo.start();
    } else {
      lfo.stop();
    }
  }

  setLFOTarget(lfoId, targetId) {
    const lfo = this.lfos.get(lfoId);
    if (!lfo) return;

    lfo.target = targetId;
  }

  setLFOWaveform(lfoId, waveform) {
    const lfo = this.lfos.get(lfoId);
    if (!lfo) return;

    lfo.type = waveform;
  }

  setLFORate(lfoId, rate) {
    const lfo = this.lfos.get(lfoId);
    if (!lfo) return;

    lfo.frequency.rampTo(rate, 0.1);
  }

  setLFODepth(lfoId, depth) {
    const lfo = this.lfos.get(lfoId);
    if (!lfo) return;

    lfo.amplitude.rampTo(depth, 0.1);
  }

  // Method to sync LFO state with control state
  syncWithControlState(controlState) {
    LFO_DEFINITIONS.forEach(definition => {
      const lfoId = definition.id;
      const rateKey = `${lfoId}Rate`;
      const depthKey = `${lfoId}Depth`;
      const waveformKey = `${lfoId}Waveform`;
      const targetKey = `${lfoId}Target`;
      const enabledKey = `${lfoId}Enabled`;

      if (controlState[rateKey] !== undefined) {
        this.setLFORate(lfoId, controlState[rateKey]);
      }
      if (controlState[depthKey] !== undefined) {
        this.setLFODepth(lfoId, controlState[depthKey]);
      }
      if (controlState[waveformKey] !== undefined) {
        this.setLFOWaveform(lfoId, controlState[waveformKey]);
      }
      if (controlState[targetKey] !== undefined) {
        this.setLFOTarget(lfoId, controlState[targetKey]);
      }
      if (controlState[enabledKey] !== undefined) {
        this.setLFOEnabled(lfoId, controlState[enabledKey]);
      }
    });
  }

  // Method to get default control state for LFOs
  getDefaultControlState() {
    const state = {};
    LFO_DEFINITIONS.forEach(definition => {
      state[`${definition.id}Rate`] = definition.rate;
      state[`${definition.id}Depth`] = definition.depth;
      state[`${definition.id}Waveform`] = definition.waveform;
      state[`${definition.id}Target`] = definition.target;
      state[`${definition.id}Enabled`] = definition.enabled;
    });
    return state;
  }

  // Cleanup method
  dispose() {
    this.lfos.forEach(lfo => {
      lfo.dispose();
    });
    this.lfos.clear();
    this.modulationTargets.clear();
    this.isInitialized = false;
  }
}