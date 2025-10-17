import { STORAGE_KEYS } from '../utils/constants.js';

export class MidiHandler {
  constructor(app) {
    this.app = app;
    this.access = null;
    this.mappings = this.loadMappings();
    this.learning = false;
    this.pendingControl = null;
  }

  async initialize() {
    if (!navigator.requestMIDIAccess) {
      console.info('WebMIDI not supported in this browser.');
      return;
    }

    try {
      this.access = await navigator.requestMIDIAccess();
      this.setupInputs();
      this.access.addEventListener('statechange', () => {
        this.setupInputs();
      });
      
      if (this.app.status) {
        this.app.status.set('MIDI ready');
      }
    } catch (error) {
      console.warn('MIDI access denied', error);
      if (this.app.status) {
        this.app.status.set('MIDI unavailable');
      }
    }
  }

  setupInputs() {
    this.access.inputs.forEach(input => {
      input.onmidimessage = message => this.handleMessage(message);
    });
  }

  setLearning(enabled) {
    this.learning = enabled;
    if (!enabled) {
      this.setPendingControl(null);
    }
    
    if (this.app.status) {
      this.app.status.set(enabled ? 'MIDI Learn enabled' : 'MIDI Learn disabled');
    }
  }

  setPendingControl(controlId) {
    this.pendingControl = controlId;
    
    if (this.app.uiControls) {
      this.app.uiControls.updateMidiLearningState(controlId);
    }
  }

  handleMessage(message) {
    const [status, data1, data2] = message.data;
    const command = status & 0xf0;
    const channel = (status & 0x0f) + 1;
    
    if (command !== 0xb0) return; // CC only
    const cc = data1;
    const value = data2;

    if (this.learning && this.pendingControl) {
      this.assignControl(this.pendingControl, channel, cc);
      return;
    }

    this.processMidiControl(channel, cc, value);
  }

  assignControl(controlId, channel, cc) {
    this.mappings[controlId] = { channel, cc };
    this.saveMappings();
    this.setPendingControl(null);
    
    if (this.app.status) {
      this.app.status.set(`Assigned CC ${cc} (Ch ${channel})`);
    }
  }

  processMidiControl(channel, cc, value) {
    Object.entries(this.mappings).forEach(([controlId, mapping]) => {
      if (!mapping) return;
      if (mapping.channel && mapping.channel !== channel) return;
      if (mapping.cc !== cc) return;
      
      const control = this.getControlDefinition(controlId);
      if (!control || control.type !== 'range') return;
      
      const min = Number(control.min);
      const max = Number(control.max);
      const scaled = min + (max - min) * (value / 127);
      
      if (this.app.uiControls) {
        this.app.uiControls.setControlValue(control, scaled, { silent: true });
      }
    });
  }

  getControlDefinition(id) {
    if (!this.app.uiControls) return null;
    return this.app.uiControls.getControlDefinition(id);
  }

  saveMappings() {
    try {
      localStorage.setItem(STORAGE_KEYS.midi, JSON.stringify(this.mappings));
    } catch (err) {
      console.warn('Unable to persist MIDI mappings', err);
    }
  }

  loadMappings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.midi);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.warn('Unable to load MIDI mappings', err);
      return {};
    }
  }
}