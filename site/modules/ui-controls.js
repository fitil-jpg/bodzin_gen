import { CONTROL_SCHEMA } from '../utils/constants.js';
import { formatDb, formatHz, clamp } from '../utils/helpers.js';
import { KEYS, SCALES, PROGRESSIONS } from './scale-manager.js';

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

    // Add Key & Scale controls
    this.setupScaleControls();
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

  // Key & Scale controls section
  setupScaleControls() {
    const container = document.getElementById('controls');
    if (!container) return;

    const sectionEl = document.createElement('section');
    sectionEl.className = 'control-section';
    sectionEl.setAttribute('data-group', 'Key & Scale');

    const heading = document.createElement('h3');
    heading.textContent = 'Key & Scale';
    sectionEl.appendChild(heading);

    const description = document.createElement('p');
    description.className = 'control-description';
    description.textContent = 'Manage musical key, scale and chord progression.';
    sectionEl.appendChild(description);

    // Key select
    const keyRow = document.createElement('label');
    keyRow.className = 'control-row';
    keyRow.dataset.controlId = 'musicKey';
    const keyLabel = document.createElement('span');
    keyLabel.className = 'label';
    keyLabel.textContent = 'Key';
    const keyWrap = document.createElement('div');
    keyWrap.className = 'control-input';
    const keySelect = document.createElement('select');
    keySelect.id = 'musicKey';
    KEYS.forEach(k => {
      const opt = document.createElement('option');
      opt.value = k; opt.textContent = k; keySelect.appendChild(opt);
    });
    keyWrap.appendChild(keySelect);
    const keyValue = document.createElement('span');
    keyValue.className = 'control-value';
    keyRow.appendChild(keyLabel);
    keyRow.appendChild(keyWrap);
    keyRow.appendChild(keyValue);
    sectionEl.appendChild(keyRow);

    // Scale select
    const scaleRow = document.createElement('label');
    scaleRow.className = 'control-row';
    scaleRow.dataset.controlId = 'musicScale';
    const scaleLabel = document.createElement('span');
    scaleLabel.className = 'label';
    scaleLabel.textContent = 'Scale';
    const scaleWrap = document.createElement('div');
    scaleWrap.className = 'control-input';
    const scaleSelect = document.createElement('select');
    scaleSelect.id = 'musicScale';
    Object.keys(SCALES).forEach(id => {
      const opt = document.createElement('option');
      opt.value = id; opt.textContent = id.replace(/_/g, ' ');
      scaleSelect.appendChild(opt);
    });
    scaleWrap.appendChild(scaleSelect);
    const scaleValue = document.createElement('span');
    scaleValue.className = 'control-value';
    scaleRow.appendChild(scaleLabel);
    scaleRow.appendChild(scaleWrap);
    scaleRow.appendChild(scaleValue);
    sectionEl.appendChild(scaleRow);

    // Progression template select
    const progRow = document.createElement('label');
    progRow.className = 'control-row';
    progRow.dataset.controlId = 'progressionTemplate';
    const progLabel = document.createElement('span');
    progLabel.className = 'label';
    progLabel.textContent = 'Chord Progression';
    const progWrap = document.createElement('div');
    progWrap.className = 'control-input';
    const progSelect = document.createElement('select');
    progSelect.id = 'progressionTemplate';
    Object.keys(PROGRESSIONS).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name; opt.textContent = name;
      progSelect.appendChild(opt);
    });
    progWrap.appendChild(progSelect);
    const progValue = document.createElement('span');
    progValue.className = 'control-value';
    progRow.appendChild(progLabel);
    progRow.appendChild(progWrap);
    progRow.appendChild(progValue);
    sectionEl.appendChild(progRow);

    // Steps per chord slider
    const spcRow = document.createElement('label');
    spcRow.className = 'control-row';
    spcRow.dataset.controlId = 'stepsPerChord';
    const spcLabel = document.createElement('span');
    spcLabel.className = 'label';
    spcLabel.textContent = 'Chord Length (steps)';
    const spcWrap = document.createElement('div');
    spcWrap.className = 'control-input';
    const spcInput = document.createElement('input');
    spcInput.type = 'range'; spcInput.min = '1'; spcInput.max = '16'; spcInput.step = '1'; spcInput.id = 'stepsPerChord';
    spcWrap.appendChild(spcInput);
    const spcValue = document.createElement('span');
    spcValue.className = 'control-value';
    spcRow.appendChild(spcLabel);
    spcRow.appendChild(spcWrap);
    spcRow.appendChild(spcValue);
    sectionEl.appendChild(spcRow);

    // Lock to scale checkbox
    const lockRow = document.createElement('label');
    lockRow.className = 'control-row';
    lockRow.dataset.controlId = 'lockToScale';
    const lockLabel = document.createElement('span');
    lockLabel.className = 'label';
    lockLabel.textContent = 'Lock To Scale';
    const lockWrap = document.createElement('div');
    lockWrap.className = 'control-input';
    const lockInput = document.createElement('input');
    lockInput.type = 'checkbox'; lockInput.id = 'lockToScale';
    lockWrap.appendChild(lockInput);
    const lockValue = document.createElement('span');
    lockValue.className = 'control-value';
    lockRow.appendChild(lockLabel);
    lockRow.appendChild(lockWrap);
    lockRow.appendChild(lockValue);
    sectionEl.appendChild(lockRow);

    container.appendChild(sectionEl);

    // Initialize values from manager
    this.updateScaleUI();

    // Wire events
    keySelect.addEventListener('change', () => {
      this.app.scaleManager?.setKey(keySelect.value);
      keyValue.textContent = keySelect.value;
    });
    scaleSelect.addEventListener('change', () => {
      this.app.scaleManager?.setScale(scaleSelect.value);
      scaleValue.textContent = scaleSelect.value.replace(/_/g, ' ');
    });
    progSelect.addEventListener('change', () => {
      this.app.scaleManager?.setProgressionTemplate(progSelect.value);
      progValue.textContent = progSelect.value;
    });
    spcInput.addEventListener('input', () => {
      spcValue.textContent = `${spcInput.value} steps`;
    });
    spcInput.addEventListener('change', () => {
      this.app.scaleManager?.setStepsPerChord(parseInt(spcInput.value));
    });
    lockInput.addEventListener('change', () => {
      this.app.scaleManager?.setLockToScale(lockInput.checked);
      lockValue.textContent = lockInput.checked ? 'ON' : 'OFF';
    });
  }

  updateScaleUI() {
    const sm = this.app.scaleManager;
    if (!sm) return;
    const keySelect = document.getElementById('musicKey');
    const scaleSelect = document.getElementById('musicScale');
    const progSelect = document.getElementById('progressionTemplate');
    const spcInput = document.getElementById('stepsPerChord');
    const lockInput = document.getElementById('lockToScale');
    if (keySelect) keySelect.value = sm.currentKey;
    if (scaleSelect) scaleSelect.value = sm.currentScale;
    if (progSelect) progSelect.value = sm.progressionTemplate;
    if (spcInput) spcInput.value = String(sm.stepsPerChord);
    if (lockInput) lockInput.checked = !!sm.lockToScale;
  }
}