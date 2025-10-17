import { STORAGE_KEYS } from '../utils/constants.js';

export class StorageManager {
  constructor() {
    this.keys = STORAGE_KEYS;
  }

  saveControlState(state) {
    try {
      localStorage.setItem(this.keys.controlState, JSON.stringify(state));
    } catch (err) {
      console.warn('Unable to persist control state', err);
    }
  }

  loadControlState() {
    try {
      const raw = localStorage.getItem(this.keys.controlState);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.warn('Unable to read stored control state', err);
      return {};
    }
  }

  savePresetState(preset) {
    try {
      localStorage.setItem(this.keys.preset, JSON.stringify(preset));
    } catch (err) {
      console.warn('Unable to store preset', err);
    }
  }

  loadPresetState() {
    try {
      const raw = localStorage.getItem(this.keys.preset);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('Unable to load preset', err);
      return null;
    }
  }

  saveMidiMappings(mappings) {
    try {
      localStorage.setItem(this.keys.midi, JSON.stringify(mappings));
    } catch (err) {
      console.warn('Unable to persist MIDI mappings', err);
    }
  }

  loadMidiMappings() {
    try {
      const raw = localStorage.getItem(this.keys.midi);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.warn('Unable to load MIDI mappings', err);
      return {};
    }
  }

  savePresetHistory(history) {
    try {
      const existingHistory = this.loadPresetHistory();
      const updatedHistory = [...existingHistory, history].slice(-50); // Keep last 50 entries
      localStorage.setItem(this.keys.presetHistory, JSON.stringify(updatedHistory));
    } catch (err) {
      console.warn('Unable to save preset history', err);
    }
  }

  loadPresetHistory() {
    try {
      const raw = localStorage.getItem(this.keys.presetHistory);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('Unable to load preset history', err);
      return [];
    }
  }

  clearPresetHistory() {
    try {
      localStorage.removeItem(this.keys.presetHistory);
    } catch (err) {
      console.warn('Unable to clear preset history', err);
    }
  }
}