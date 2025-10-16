// Control Manager Module
// Handles all control rendering, state management, and parameter updates

export class ControlManager {
  constructor() {
    this.controls = new Map();
    this.controlState = {};
    this.controlDefinitions = this.getControlDefinitions();
  }

  getControlDefinitions() {
    return [
      {
        id: 'oscillatorType',
        label: 'Oscillator',
        type: 'select',
        options: ['sine', 'square', 'sawtooth', 'triangle'],
        value: 'sawtooth'
      },
      {
        id: 'attack',
        label: 'Attack',
        type: 'range',
        min: 0,
        max: 2,
        step: 0.01,
        value: 0.1
      },
      {
        id: 'decay',
        label: 'Decay',
        type: 'range',
        min: 0,
        max: 2,
        step: 0.01,
        value: 0.2
      },
      {
        id: 'sustain',
        label: 'Sustain',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.3
      },
      {
        id: 'release',
        label: 'Release',
        type: 'range',
        min: 0,
        max: 2,
        step: 0.01,
        value: 0.8
      },
      {
        id: 'filterFrequency',
        label: 'Filter Freq',
        type: 'range',
        min: 100,
        max: 8000,
        step: 1,
        value: 2000
      },
      {
        id: 'filterQ',
        label: 'Filter Q',
        type: 'range',
        min: 0.1,
        max: 10,
        step: 0.1,
        value: 1
      },
      {
        id: 'delayTime',
        label: 'Delay Time',
        type: 'range',
        min: 0.1,
        max: 1,
        step: 0.01,
        value: 0.5
      },
      {
        id: 'delayFeedback',
        label: 'Delay Feedback',
        type: 'range',
        min: 0,
        max: 0.9,
        step: 0.01,
        value: 0.3
      },
      {
        id: 'delayWet',
        label: 'Delay Wet',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.2
      },
      {
        id: 'reverbDecay',
        label: 'Reverb Decay',
        type: 'range',
        min: 0.1,
        max: 10,
        step: 0.1,
        value: 2
      },
      {
        id: 'reverbWet',
        label: 'Reverb Wet',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.3
      },
      {
        id: 'compressorThreshold',
        label: 'Comp Threshold',
        type: 'range',
        min: -60,
        max: 0,
        step: 1,
        value: -20
      },
      {
        id: 'compressorRatio',
        label: 'Comp Ratio',
        type: 'range',
        min: 1,
        max: 20,
        step: 0.1,
        value: 4
      }
    ];
  }

  renderControls(container) {
    container.innerHTML = '';
    
    this.controlDefinitions.forEach(control => {
      const controlRow = this.createControlRow(control);
      container.appendChild(controlRow);
      
      // Store reference for updates
      this.controls.set(control.id, {
        row: controlRow,
        input: controlRow.querySelector('input, select'),
        valueEl: controlRow.querySelector('.control-value')
      });
      
      // Initialize state
      this.controlState[control.id] = control.value;
    });
  }

  createControlRow(control) {
    const row = document.createElement('div');
    row.className = 'control-row';
    
    const label = document.createElement('label');
    label.textContent = control.label;
    label.className = 'control-label';
    
    const valueEl = document.createElement('div');
    valueEl.className = 'control-value';
    valueEl.textContent = this.formatControlValue(control, control.value);
    
    let input;
    if (control.type === 'select') {
      input = document.createElement('select');
      control.options.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option;
        optionEl.textContent = option;
        if (option === control.value) optionEl.selected = true;
        input.appendChild(optionEl);
      });
    } else {
      input = document.createElement('input');
      input.type = 'range';
      input.min = control.min;
      input.max = control.max;
      input.step = control.step || 0.01;
      input.value = control.value;
    }
    
    input.className = 'control-input';
    input.addEventListener('input', (e) => this.handleControlChange(control, e.target.value));
    
    row.appendChild(label);
    row.appendChild(input);
    row.appendChild(valueEl);
    
    return row;
  }

  handleControlChange(control, value) {
    this.setControlValue(control, value);
  }

  setControlValue(control, value, options = {}) {
    const { silent = false, skipSave = false } = options;
    const entry = this.controls.get(control.id);
    let normalizedValue = value;
    
    if (control.type !== 'select') {
      const min = Number(control.min);
      const max = Number(control.max);
      normalizedValue = this.clamp(typeof value === 'number' ? value : parseFloat(value), min, max);
    }
    
    this.controlState[control.id] = normalizedValue;
    
    if (entry) {
      if (control.type === 'select') {
        entry.input.value = String(normalizedValue);
      } else {
        entry.input.value = String(normalizedValue);
      }
      
      // Animate value change
      this.animateValueChange(entry.valueEl, this.formatControlValue(control, normalizedValue));
      this.addParameterChangeAnimation(entry, control);
    }
    
    if (!skipSave) {
      this.saveControlState();
    }
    
    if (!silent) {
      this.onParameterChange?.(control.id, normalizedValue);
    }
  }

  animateValueChange(element, newValue) {
    element.classList.remove('value-changing');
    element.offsetHeight; // Force reflow
    element.classList.add('value-changing');
    element.textContent = newValue;
    setTimeout(() => {
      element.classList.remove('value-changing');
    }, 400);
  }

  addParameterChangeAnimation(entry, control) {
    entry.row.classList.remove('parameter-changing');
    if (control.type === 'range') {
      entry.input.classList.remove('slider-changing');
    }
    entry.row.offsetHeight; // Force reflow
    entry.row.classList.add('parameter-changing');
    if (control.type === 'range') {
      entry.input.classList.add('slider-changing');
    }
    setTimeout(() => {
      entry.row.classList.remove('parameter-changing');
      if (control.type === 'range') {
        entry.input.classList.remove('slider-changing');
      }
    }, 600);
  }

  formatControlValue(control, value) {
    if (control.type === 'select') return value;
    if (control.id.includes('Frequency')) return Math.round(value) + ' Hz';
    if (control.id.includes('Decay') || control.id.includes('Time')) return value.toFixed(2) + 's';
    if (control.id.includes('Wet') || control.id.includes('Sustain')) return Math.round(value * 100) + '%';
    if (control.id.includes('Threshold')) return value + ' dB';
    if (control.id.includes('Ratio')) return value.toFixed(1) + ':1';
    return value.toFixed(2);
  }

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  saveControlState() {
    localStorage.setItem('controlState', JSON.stringify(this.controlState));
  }

  loadControlState() {
    const saved = localStorage.getItem('controlState');
    if (saved) {
      try {
        this.controlState = JSON.parse(saved);
        this.controlDefinitions.forEach(control => {
          if (this.controlState[control.id] !== undefined) {
            this.setControlValue(control, this.controlState[control.id], { silent: true });
          }
        });
      } catch (error) {
        console.error('Failed to load control state:', error);
      }
    }
  }

  getControlValue(id) {
    return this.controlState[id];
  }

  setOnParameterChange(callback) {
    this.onParameterChange = callback;
  }
}
