import { CONTROL_SCHEMA } from '../utils/constants.js';
import { formatDb, formatHz, clamp } from '../utils/helpers.js';

export class UIControls {
  constructor(app) {
    this.app = app;
    this.controls = new Map();
  }

  render() {
    const container = document.getElementById('controls');
    container.innerHTML = '';
    
    CONTROL_SCHEMA.forEach(section => {
      const sectionEl = document.createElement('section');
      sectionEl.className = 'control-section';
      sectionEl.setAttribute('data-group', section.group);

      const heading = document.createElement('h3');
      heading.textContent = section.group;
      
      // Add compressor status indicator
      if (section.group === 'Compressor/Limiter') {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'compressor-status';
        statusIndicator.id = 'compressorStatus';
        heading.appendChild(statusIndicator);
        
        // Add gain reduction display
        const gainReductionDisplay = document.createElement('div');
        gainReductionDisplay.className = 'compressor-ratio-display';
        gainReductionDisplay.id = 'gainReductionDisplay';
        gainReductionDisplay.textContent = '0.0 dB';
        sectionEl.appendChild(gainReductionDisplay);
      }
      
      sectionEl.appendChild(heading);

      if (section.description) {
        const description = document.createElement('p');
        description.className = 'control-description';
        description.textContent = section.description;
        sectionEl.appendChild(description);
      }

      container.appendChild(sectionEl);

      section.controls.forEach(control => {
        this.createControlRow(sectionEl, control);
      });
    });
    
    // Add pattern chaining controls
    this.setupPatternChainingControls();
  }

  createControlRow(sectionEl, control) {
    const row = document.createElement('label');
    row.className = 'control-row';
    row.dataset.controlId = control.id;

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = control.label;
    row.appendChild(label);

    const valueEl = document.createElement('span');
    valueEl.className = 'control-value';

    let input;
    if (control.type === 'select') {
      input = document.createElement('select');
      control.options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.label;
        input.appendChild(opt);
      });
    } else if (control.type === 'checkbox') {
      input = document.createElement('input');
      input.type = 'checkbox';
    } else {
      input = document.createElement('input');
      input.type = 'range';
      input.min = String(control.min);
      input.max = String(control.max);
      input.step = String(control.step);
    }
    input.id = control.id;
    input.dataset.controlId = control.id;

    const wrap = document.createElement('div');
    wrap.className = 'control-input';
    wrap.appendChild(input);
    row.appendChild(wrap);
    row.appendChild(valueEl);

    // Add gain reduction meter for compressor controls
    if (control.id.includes('compressor') && control.id !== 'compressorBypass' && control.id !== 'compressorSidechain') {
      const meterContainer = document.createElement('div');
      meterContainer.className = 'gain-reduction-meter';
      const meterBar = document.createElement('div');
      meterBar.className = 'gain-reduction-bar';
      meterContainer.appendChild(meterBar);
      row.appendChild(meterContainer);
    }

    // Add threshold indicator for compressor threshold control
    if (control.id === 'compressorThreshold') {
      const thresholdIndicator = document.createElement('div');
      thresholdIndicator.className = 'threshold-indicator';
      row.appendChild(thresholdIndicator);
    }

    sectionEl.appendChild(row);

    const entry = { control, input, valueEl, row };
    this.controls.set(control.id, entry);

    const storedValue = this.app.controlState[control.id];
    this.setControlValue(control, storedValue, { silent: true, skipSave: true });

    this.setupControlEvents(control, input);
  }

  setupControlEvents(control, input) {
    input.addEventListener('input', event => {
      const val = this.getInputValue(control, event.target);
      this.setControlValue(control, val, { silent: true, skipSave: true });
    });
    
    input.addEventListener('change', event => {
      const val = this.getInputValue(control, event.target);
      this.setControlValue(control, val);
    });

    if (control.type === 'range') {
      const midiHandler = () => {
        if (this.app.midi && this.app.midi.learning) {
          this.app.midi.setPendingControl(control.id);
        }
      };
      input.addEventListener('pointerdown', midiHandler);
      input.addEventListener('mousedown', midiHandler);
      input.addEventListener('touchstart', midiHandler, { passive: true });
    }
  }

  getInputValue(control, input) {
    if (control.type === 'select') {
      return input.value;
    } else if (control.type === 'checkbox') {
      return input.checked;
    }
    const numeric = parseFloat(input.value);
    if (!Number.isFinite(numeric)) {
      return control.default;
    }
    return numeric;
  }

  setControlValue(control, value, options = {}) {
    const { silent = false, skipSave = false } = options;
    const entry = this.controls.get(control.id);
    let normalizedValue = value;
    
    if (control.type === 'checkbox') {
      normalizedValue = Boolean(value);
    } else if (control.type !== 'select') {
      const min = Number(control.min);
      const max = Number(control.max);
      normalizedValue = clamp(typeof value === 'number' ? value : parseFloat(value), min, max);
    }
    
    this.app.controlState[control.id] = normalizedValue;

    if (entry) {
      if (control.type === 'select') {
        entry.input.value = String(normalizedValue);
      } else if (control.type === 'checkbox') {
        entry.input.checked = normalizedValue;
        entry.valueEl.textContent = normalizedValue ? 'ON' : 'OFF';
      } else {
        entry.input.value = String(normalizedValue);
        entry.valueEl.textContent = this.formatControlValue(control, normalizedValue);
      }
      
      if (control.type !== 'checkbox') {
        entry.valueEl.textContent = this.formatControlValue(control, normalizedValue);
      }
      
      // Add visual feedback animation
      entry.row.style.transform = 'scale(1.02)';
      entry.valueEl.style.color = '#49a9ff';
      
      // Enhanced feedback for EQ controls
      if (control.id.includes('eq')) {
        entry.row.style.background = 'linear-gradient(90deg, rgba(73, 169, 255, 0.1), transparent)';
        entry.row.style.borderLeftColor = 'rgba(73, 169, 255, 0.8)';
        entry.valueEl.style.textShadow = '0 0 12px rgba(73, 169, 255, 0.6)';
        entry.valueEl.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
          entry.row.style.transform = '';
          entry.valueEl.style.color = '';
          entry.row.style.background = '';
          entry.row.style.borderLeftColor = '';
          entry.valueEl.style.textShadow = '';
          entry.valueEl.style.transform = '';
        }, 300);
      } else {
        setTimeout(() => {
          entry.row.style.transform = '';
          entry.valueEl.style.color = '';
        }, 200);
      }
    }

    if (control.apply) {
      control.apply(normalizedValue, this.app);
    }

    // Update EQ visualizer if this is an EQ control
    if (control.id.includes('eq') && this.app.eqVisualizer) {
      this.app.eqVisualizer.update();
    }

    if (control.affectsAutomation && this.app.timeline) {
      this.app.timeline.applyAutomationForStep(this.app.timeline.currentStep);
      this.app.timeline.draw();
    }

    if (!skipSave && this.app.storage) {
      this.app.storage.saveControlState(this.app.controlState);
    }
    
    if (!silent && this.app.status) {
      this.app.status.set(`${control.label} → ${this.formatControlValue(control, normalizedValue)}`);
    }
  }

  formatControlValue(control, value) {
    if (control.format) {
      return control.format(value);
    }
    if (control.type === 'select') {
      const option = control.options.find(opt => opt.value === value);
      return option ? option.label : String(value);
    }
    return typeof value === 'number' ? value.toFixed(2) : String(value);
  }

  getControlValue(id) {
    if (id in this.app.controlState) {
      return this.app.controlState[id];
    }
    const control = this.getControlDefinition(id);
    return control ? control.default : 0;
  }

  getControlDefinition(id) {
    for (const section of CONTROL_SCHEMA) {
      const control = section.controls.find(item => item.id === id);
      if (control) return control;
    }
    return null;
  }

  buildDefaultControlState() {
    const state = {};
    CONTROL_SCHEMA.forEach(section => {
      section.controls.forEach(control => {
        state[control.id] = control.default;
      });
    });
    return state;
  }

  updateAllControls() {
    // Ensure UI reflects current app.controlState values
    this.controls.forEach(({ control }) => {
      if (Object.prototype.hasOwnProperty.call(this.app.controlState, control.id)) {
        const value = this.app.controlState[control.id];
        this.setControlValue(control, value, { silent: true, skipSave: true });
      }
    });
  }

  updateMidiLearningState(controlId) {
    this.controls.forEach(entry => {
      if (controlId && entry.control.id === controlId) {
        entry.row.classList.add('midi-learning');
      } else {
        entry.row.classList.remove('midi-learning');
      }
    });
  }

  // Update gain reduction meters for compressor visualization
  updateGainReductionMeters() {
    if (!this.app.audio || !this.app.audio.compressor) return;
    
    const gainReduction = this.app.audio.getGainReduction();
    const reductionPercent = Math.min(Math.abs(gainReduction) / 20, 1) * 100; // Scale to 0-100%
    
    this.controls.forEach(entry => {
      if (entry.control.id.includes('compressor') && entry.control.id !== 'compressorBypass' && entry.control.id !== 'compressorSidechain') {
        const meterBar = entry.row.querySelector('.gain-reduction-bar');
        if (meterBar) {
          meterBar.style.width = `${reductionPercent}%`;
        }
      }
    });
  }

  // Start gain reduction meter animation
  startGainReductionAnimation() {
    const updateMeters = () => {
      this.updateGainReductionMeters();
      this.updateCompressorStatus();
      requestAnimationFrame(updateMeters);
    };
    updateMeters();
  }

  // Update compressor status indicator
  updateCompressorStatus() {
    const statusIndicator = document.getElementById('compressorStatus');
    if (!statusIndicator || !this.app.audio || !this.app.audio.compressor) return;
    
    const gainReduction = this.app.audio.getGainReduction();
    const isCompressing = Math.abs(gainReduction) > 0.1;
    
    statusIndicator.classList.toggle('active', isCompressing);
    statusIndicator.classList.toggle('compressing', isCompressing && Math.abs(gainReduction) > 3);
    
    // Update gain reduction display
    const gainReductionDisplay = document.getElementById('gainReductionDisplay');
    if (gainReductionDisplay) {
      gainReductionDisplay.textContent = `${gainReduction.toFixed(1)} dB`;
  setupPatternChainingControls() {
    // Pattern chaining toggle
    const chainingToggle = document.getElementById('patternChainingToggle');
    const chainingStatus = document.getElementById('chainingStatus');
    
    if (chainingToggle) {
      chainingToggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        if (this.app.patternChain) {
          if (enabled) {
            this.app.patternChain.startChaining();
            chainingStatus.textContent = 'On';
            chainingStatus.style.color = '#49a9ff';
          } else {
            this.app.patternChain.stopChaining();
            chainingStatus.textContent = 'Off';
            chainingStatus.style.color = '#9a9aac';
          }
        }
      });
    }

    // Chain length slider
    const chainLengthSlider = document.getElementById('chainLengthSlider');
    const chainLengthValue = document.getElementById('chainLengthValue');
    
    if (chainLengthSlider) {
      chainLengthSlider.addEventListener('input', (e) => {
        const length = parseInt(e.target.value);
        chainLengthValue.textContent = length;
        if (this.app.patternChain) {
          this.app.patternChain.setChainLength(length);
          // Update chain position slider max
          const chainPositionSlider = document.getElementById('chainPositionSlider');
          if (chainPositionSlider) {
            chainPositionSlider.max = length - 1;
            this.updateChainPositionDisplay();
          }
        }
      });
    }

    // Variation intensity slider
    const variationIntensitySlider = document.getElementById('variationIntensitySlider');
    const variationIntensityValue = document.getElementById('variationIntensityValue');
    
    if (variationIntensitySlider) {
      variationIntensitySlider.addEventListener('input', (e) => {
        const intensity = parseFloat(e.target.value);
        variationIntensityValue.textContent = Math.round(intensity * 100) + '%';
        if (this.app.patternChain) {
          this.app.patternChain.setVariationIntensity(intensity);
        }
      });
    }

    // Transition mode select
    const transitionModeSelect = document.getElementById('transitionModeSelect');
    const transitionModeValue = document.getElementById('transitionModeValue');
    
    if (transitionModeSelect) {
      transitionModeSelect.addEventListener('change', (e) => {
        const mode = e.target.value;
        transitionModeValue.textContent = mode;
        if (this.app.patternChain) {
          this.app.patternChain.setTransitionMode(mode);
        }
      });
    }

    // Chain position slider (read-only, shows current position)
    const chainPositionSlider = document.getElementById('chainPositionSlider');
    const chainPositionValue = document.getElementById('chainPositionValue');
    
    if (chainPositionSlider) {
      // Update position display periodically
      setInterval(() => {
        this.updateChainPositionDisplay();
      }, 100);
    }
  }

  updateChainPositionDisplay() {
    const chainPositionSlider = document.getElementById('chainPositionSlider');
    const chainPositionValue = document.getElementById('chainPositionValue');
    
    if (this.app.patternChain && chainPositionSlider && chainPositionValue) {
      const status = this.app.patternChain.getChainStatus();
      chainPositionSlider.value = status.chainPosition;
      chainPositionValue.textContent = `${status.chainPosition + 1}/${status.chainLength}`;
    }
  }
}