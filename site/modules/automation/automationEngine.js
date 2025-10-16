// Automation Engine Module
// Handles automation tracks, LFO modulation, and parameter automation

export class AutomationEngine {
  constructor() {
    this.tracks = [];
    this.currentStep = 0;
    this.lfo = null;
    this.isInitialized = false;
  }

  initialize() {
    this.createDefaultTracks();
    this.setupLFO();
    this.isInitialized = true;
  }

  createDefaultTracks() {
    this.tracks = [
      {
        id: 'filterFrequency',
        name: 'Filter Frequency',
        values: new Array(16).fill(0.5),
        color: 'rgba(73, 169, 255, 0.8)',
        enabled: true
      },
      {
        id: 'delayWet',
        name: 'Delay Wet',
        values: new Array(16).fill(0.2),
        color: 'rgba(255, 73, 175, 0.8)',
        enabled: true
      },
      {
        id: 'reverbWet',
        name: 'Reverb Wet',
        values: new Array(16).fill(0.3),
        color: 'rgba(148, 255, 73, 0.8)',
        enabled: true
      }
    ];
  }

  setupLFO() {
    this.lfo = new Tone.LFO({
      frequency: 0.5,
      type: 'sine',
      min: 0,
      max: 1
    });
    this.lfo.start();
  }

  applyAutomationForStep(controlManager) {
    this.tracks.forEach(track => {
      if (track.enabled && track.values[this.currentStep] !== undefined) {
        const value = track.values[this.currentStep];
        const control = controlManager.controlDefinitions.find(c => c.id === track.id);
        if (control) {
          // Normalize value to control range
          const normalizedValue = this.normalizeValue(value, control);
          controlManager.setControlValue(control, normalizedValue, { silent: true });
        }
      }
    });
  }

  normalizeValue(value, control) {
    if (control.type === 'select') return value;
    const min = Number(control.min);
    const max = Number(control.max);
    return min + (value * (max - min));
  }

  setTrackValue(trackId, step, value) {
    const track = this.tracks.find(t => t.id === trackId);
    if (track && step >= 0 && step < track.values.length) {
      track.values[step] = Math.max(0, Math.min(1, value));
    }
  }

  getTrackValue(trackId, step) {
    const track = this.tracks.find(t => t.id === trackId);
    if (track && step >= 0 && step < track.values.length) {
      return track.values[step];
    }
    return 0;
  }

  toggleTrack(trackId) {
    const track = this.tracks.find(t => t.id === trackId);
    if (track) {
      track.enabled = !track.enabled;
    }
  }

  addTrack(parameterId, name) {
    const track = {
      id: parameterId,
      name: name,
      values: new Array(16).fill(0.5),
      color: this.getRandomColor(),
      enabled: true
    };
    this.tracks.push(track);
  }

  removeTrack(trackId) {
    this.tracks = this.tracks.filter(t => t.id !== trackId);
  }

  getRandomColor() {
    const colors = [
      'rgba(73, 169, 255, 0.8)',
      'rgba(255, 73, 175, 0.8)',
      'rgba(148, 255, 73, 0.8)',
      'rgba(255, 193, 7, 0.8)',
      'rgba(255, 107, 107, 0.8)',
      'rgba(138, 43, 226, 0.8)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  updateLFO(frequency, type = 'sine') {
    if (this.lfo) {
      this.lfo.frequency.value = frequency;
      this.lfo.type = type;
    }
  }

  getLFOSignal() {
    if (this.lfo) {
      return this.lfo.getValue();
    }
    return 0;
  }

  exportAutomation() {
    return {
      tracks: this.tracks,
      currentStep: this.currentStep
    };
  }

  importAutomation(data) {
    if (data.tracks) {
      this.tracks = data.tracks;
    }
    if (data.currentStep !== undefined) {
      this.currentStep = data.currentStep;
    }
  }

  clearAllTracks() {
    this.tracks.forEach(track => {
      track.values.fill(0.5);
    });
  }

  randomizeTrack(trackId) {
    const track = this.tracks.find(t => t.id === trackId);
    if (track) {
      for (let i = 0; i < track.values.length; i++) {
        track.values[i] = Math.random();
      }
    }
  }
}
