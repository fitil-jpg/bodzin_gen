'use strict';

// Lightweight Wolfram-inspired procedural generators (no external deps)
// - Cellular automata (Rule 30/90/110) for rhythmic gates/velocities
// - 1D maps for probability curves
// - Scale-degree melody/chord generators

export class WolframIntegration {
  constructor(app) {
    this.app = app;
  }

  // =========================
  // Cellular Automata Rhythms
  // =========================
  generateCARhythm({ steps = 16, rule = 30, seedRow = null }) {
    const row0 = Array.isArray(seedRow)
      ? seedRow.slice(0, steps).map(v => (v ? 1 : 0))
      : this._seedRow(steps);
    const ruleMap = this._compileCARule(rule);
    const row = [ ...row0 ];
    // Evolve once per step and sample center cell as trigger
    const triggers = new Array(steps).fill(0);
    let current = row;
    for (let i = 0; i < steps; i++) {
      // Sample some index; use i to sweep across for variety
      const idx = i % current.length;
      triggers[i] = current[idx];
      current = this._nextCARow(current, ruleMap);
    }
    // Convert 0/1 to velocities with light humanization
    return triggers.map(v => (v ? (0.7 + Math.random() * 0.3) : 0));
  }

  _seedRow(steps) {
    const row = new Array(steps).fill(0);
    const center = Math.floor(steps / 2);
    row[center] = 1;
    return row;
  }

  _compileCARule(ruleNumber) {
    // Map neighborhood (111..000) to next state using 8-bit rule number
    const map = {};
    for (let pat = 0; pat < 8; pat++) {
      const bit = (ruleNumber >> pat) & 1;
      const key = pat.toString(2).padStart(3, '0');
      map[key] = bit;
    }
    return map;
  }

  _nextCARow(row, ruleMap) {
    const n = row.length;
    const next = new Array(n);
    for (let i = 0; i < n; i++) {
      const l = row[(i - 1 + n) % n];
      const c = row[i];
      const r = row[(i + 1) % n];
      const key = `${l}${c}${r}`;
      next[i] = ruleMap[key] ? 1 : 0;
    }
    return next;
  }

  // =========================
  // Probability Curve Generators
  // =========================
  // Logistic map-inspired curve (x_{n+1} = r x_n (1 - x_n))
  generateLogisticCurve({ steps = 16, r = 3.8, x0 = 0.5, scale = 1.0 }) {
    const values = new Array(steps);
    let x = this._clamp(x0, 0.0001, 0.9999);
    for (let i = 0; i < steps; i++) {
      values[i] = this._clamp(x * scale, 0, 1);
      x = r * x * (1 - x);
    }
    return values;
  }

  // Simple 1D CA probability by averaging neighborhood activity
  generateCAProbability({ steps = 16, rule = 110 }) {
    const rhythm = this.generateCARhythm({ steps, rule });
    // Smooth with a small neighborhood average
    const smooth = rhythm.map((_, i) => {
      const l = rhythm[(i - 1 + steps) % steps];
      const c = rhythm[i];
      const r = rhythm[(i + 1) % steps];
      return this._clamp((l + c + r) / 3, 0, 1);
    });
    return smooth;
  }

  // =========================
  // Melody and Chord Generators
  // =========================
  generateScaleDegrees({
    steps = 16,
    root = 'C',
    octave = 4,
    scale = 'minor',
    density = 0.5
  }) {
    const pitchClasses = this._scalePitches(scale);
    const pattern = new Array(steps).fill(null);
    for (let i = 0; i < steps; i++) {
      if (Math.random() < density) {
        const pc = pitchClasses[Math.floor(Math.random() * pitchClasses.length)];
        pattern[i] = `${this._transposeRoot(root, pc)}${octave + (Math.random() < 0.2 ? 1 : 0)}`;
      }
    }
    return pattern;
  }

  generateChordBursts({
    steps = 16,
    root = 'C',
    octave = 4,
    scale = 'minor',
    chordSize = 2,
    every = 4
  }) {
    const pitchClasses = this._scalePitches(scale);
    const pattern = new Array(steps).fill(null);
    for (let i = 0; i < steps; i += every) {
      const chord = [];
      for (let n = 0; n < chordSize; n++) {
        const pc = pitchClasses[(i / every + n * 2) % pitchClasses.length];
        chord.push(`${this._transposeRoot(root, pc)}${octave + (n > 1 ? 1 : 0)}`);
      }
      pattern[i] = chord;
    }
    return pattern;
  }

  // =========================
  // Apply helpers
  // =========================
  applyRhythmToInstrument(instrument, velocities) {
    const audio = this.app?.audio;
    if (!audio?.sequences?.byInstrument?.[instrument]) return false;
    const seq = audio.sequences.byInstrument[instrument];
    seq.events = velocities.map((v, i) => ({ time: i * 0.25, value: v }));
    return true;
  }

  applyMelodyToInstrument(instrument, notes) {
    const audio = this.app?.audio;
    if (!audio?.sequences?.byInstrument?.[instrument]) return false;
    const seq = audio.sequences.byInstrument[instrument];
    seq.events = notes.map((v, i) => ({ time: i * 0.25, value: v }));
    return true;
  }

  applyProbabilityCurve(instrument, curve) {
    if (!this.app?.audio) return false;
    this.app.audio.setProbabilityCurve(instrument, curve, 'linear');
    return true;
  }

  // =========================
  // Utilities
  // =========================
  _clamp(x, lo, hi) { return Math.min(Math.max(x, lo), hi); }

  _scalePitches(mode) {
    // Semitone offsets from root for common scales
    const scales = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      dorian: [0, 2, 3, 5, 7, 9, 10],
      phrygian: [0, 1, 3, 5, 7, 8, 10]
    };
    return scales[mode] || scales.minor;
  }

  _transposeRoot(root, semis) {
    // Basic pitch class mapping without accidentals handling complexity
    const order = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const idx = order.indexOf(root);
    if (idx < 0) return root;
    return order[(idx + semis) % 12];
  }
}
