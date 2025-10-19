export class WolframClient {
  constructor(app) {
    this.app = app;
    this.baseUrl = '/api/wolfram';
  }

  async compose(options = {}) {
    const payload = {
      bpm: options.bpm || this.getBpm(),
      scale: options.scale || 'C minor',
      mood: options.mood || 'energetic',
      seed: options.seed || Date.now()
    };

    const resp = await fetch(`${this.baseUrl}/compose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Wolfram compose failed: ${errText}`);
    }
    const data = await resp.json();
    return data;
  }

  applyToApp(result) {
    if (!result || !result.sequences || !this.app?.audio?.sequences) return false;

    const { sequences } = result;
    const byInstrument = this.app.audio.sequences.byInstrument;

    // Translate simple arrays to Tone.Sequence event lists
    this.applyDrumPattern(byInstrument.kick, sequences.kick, (v) => v);
    this.applyDrumPattern(byInstrument.snare, sequences.snare, (v) => v);
    this.applyDrumPattern(byInstrument.hats, sequences.hats, (v) => v);

    this.applyNotePattern(byInstrument.bass, sequences.bass);
    this.applyChordPattern(byInstrument.lead, sequences.lead);

    this.applyFxPattern(byInstrument.fx, sequences.fx);

    if (typeof result.bpm === 'number') {
      Tone.Transport.bpm.value = result.bpm;
    }

    // Redraw timeline and update state
    if (this.app.timeline) this.app.timeline.draw();
    return true;
  }

  applyDrumPattern(sequence, steps, velocityTransform) {
    if (!sequence || !Array.isArray(steps)) return;
    const events = steps.slice(0, 16).map((value, i) => ({ time: i * 0.25, value: velocityTransform(value || 0) }));
    sequence.events = events;
  }

  applyFxPattern(sequence, steps) {
    if (!sequence || !Array.isArray(steps)) return;
    const events = steps.slice(0, 16).map((value, i) => ({ time: i * 0.25, value: value ? 1 : 0 }));
    sequence.events = events;
  }

  applyNotePattern(sequence, steps) {
    if (!sequence || !Array.isArray(steps)) return;
    const events = steps.slice(0, 16).map((note, i) => ({ time: i * 0.25, value: note || null }));
    sequence.events = events;
  }

  applyChordPattern(sequence, steps) {
    if (!sequence || !Array.isArray(steps)) return;
    const events = steps.slice(0, 16).map((notes, i) => ({ time: i * 0.25, value: Array.isArray(notes) ? notes : (notes ? [notes] : null) }));
    sequence.events = events;
  }

  getBpm() {
    try {
      return Tone.Transport.bpm.value;
    } catch {
      return 124;
    }
  }
}
