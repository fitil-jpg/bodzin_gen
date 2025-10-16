// Audio Engine Module
// Handles all audio synthesis, effects, and transport control

export class AudioEngine {
  constructor() {
    this.synth = null;
    this.delay = null;
    this.reverb = null;
    this.filter = null;
    this.compressor = null;
    this.analyser = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize Tone.js
      await Tone.start();
      
      // Create audio chain
      this.synth = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 }
      });

      this.delay = new Tone.FeedbackDelay({
        delayTime: '8n',
        feedback: 0.3,
        wet: 0.2
      });

      this.reverb = new Tone.Reverb({
        decay: 2,
        wet: 0.3
      });

      this.filter = new Tone.Filter({
        type: 'lowpass',
        frequency: 2000,
        rolloff: -24,
        Q: 1
      });

      this.compressor = new Tone.Compressor({
        threshold: -20,
        ratio: 4,
        attack: 0.1,
        release: 0.1
      });

      this.analyser = new Tone.Analyser('waveform', 1024);

      // Connect audio chain
      this.synth
        .connect(this.filter)
        .connect(this.delay)
        .connect(this.reverb)
        .connect(this.compressor)
        .connect(this.analyser)
        .connect(Tone.Destination);

      this.isInitialized = true;
      console.log('Audio engine initialized');
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      throw error;
    }
  }

  updateParameter(parameter, value) {
    if (!this.isInitialized) return;

    switch (parameter) {
      case 'oscillatorType':
        this.synth.oscillator.type = value;
        break;
      case 'attack':
        this.synth.envelope.attack = value;
        break;
      case 'decay':
        this.synth.envelope.decay = value;
        break;
      case 'sustain':
        this.synth.envelope.sustain = value;
        break;
      case 'release':
        this.synth.envelope.release = value;
        break;
      case 'filterFrequency':
        this.filter.frequency.value = value;
        break;
      case 'filterQ':
        this.filter.Q.value = value;
        break;
      case 'delayTime':
        this.delay.delayTime.value = value;
        break;
      case 'delayFeedback':
        this.delay.feedback.value = value;
        break;
      case 'delayWet':
        this.delay.wet.value = value;
        break;
      case 'reverbDecay':
        this.reverb.decay = value;
        break;
      case 'reverbWet':
        this.reverb.wet.value = value;
        break;
      case 'compressorThreshold':
        this.compressor.threshold.value = value;
        break;
      case 'compressorRatio':
        this.compressor.ratio.value = value;
        break;
    }
  }

  triggerNote(frequency, velocity = 0.8) {
    if (!this.isInitialized) return;
    this.synth.triggerAttackRelease(frequency, '8n', undefined, velocity);
  }

  getAnalyserData() {
    if (!this.analyser) return new Uint8Array(1024);
    return this.analyser.getValue();
  }

  async startTransport() {
    if (!this.isInitialized) await this.initialize();
    Tone.Transport.start();
  }

  stopTransport() {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
  }

  setBPM(bpm) {
    Tone.Transport.bpm.value = bpm;
  }

  getBPM() {
    return Tone.Transport.bpm.value;
  }
}
