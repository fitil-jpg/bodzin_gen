import { 
  STEP_COUNT, 
  STEP_DURATION, 
  LOOP_DURATION, 
  SECTION_DEFINITIONS,
  LFO_DEFINITIONS,
  SECTION_SEQUENCE_ACTIVITY 
} from '../utils/constants.js';
import { setBusLevel, clamp } from '../utils/helpers.js';

export class AudioEngine {
  constructor() {
    this.master = null;
    this.buses = null;
    this.nodes = null;
    this.instruments = null;
    this.sequences = null;
    this.sequencesStarted = false;
  }

  initialize() {
    this.master = new Tone.Gain(0.9);
    const limiter = new Tone.Limiter(-1);
    this.master.connect(limiter);
    limiter.toDestination();

    this.buses = {
      drums: new Tone.Gain(0.8),
      bass: new Tone.Gain(0.8),
      lead: new Tone.Gain(0.8),
      fx: new Tone.Gain(0.5)
    };
    Object.values(this.buses).forEach(bus => bus.connect(this.master));

    this.nodes = this.createEffects();
    this.instruments = this.createInstruments();
    this.sequences = this.buildSequences(this.instruments);

    this.connectEffects();
    return this;
  }

  createEffects() {
    const delay = new Tone.FeedbackDelay('8n', 0.38);
    const reverb = new Tone.Reverb({ decay: 6, wet: 0.28, preDelay: 0.02 });
    const leadFilter = new Tone.Filter(520, 'lowpass', -12);
    const leadFxSend = new Tone.Gain(0.45);
    const bassFilter = new Tone.Filter(140, 'lowpass', -12);
    const bassDrive = new Tone.Distortion(0.35);

    return {
      delay,
      reverb,
      leadFilter,
      leadFxSend,
      bassFilter,
      bassDrive
    };
  }

  connectEffects() {
    this.buses.fx.connect(this.nodes.delay);
    this.buses.fx.connect(this.nodes.reverb);
    this.nodes.delay.connect(this.master);
    this.nodes.reverb.connect(this.master);
  }

  createInstruments() {
    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.28, sustain: 0.0001, release: 0.2 }
    }).connect(this.buses.drums);

    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
    }).connect(this.buses.drums);

    const hats = new Tone.MetalSynth({
      frequency: 320,
      envelope: { attack: 0.001, decay: 0.09, release: 0.12 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 3000,
      octaves: 1.3
    }).connect(this.buses.drums);

    const bass = new Tone.MonoSynth({
      oscillator: { type: 'square' },
      filter: { type: 'lowpass', rolloff: -12 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.6 },
      envelope: { attack: 0.005, decay: 0.25, sustain: 0.6, release: 0.4 }
    });
    bass.chain(this.nodes.bassDrive, this.nodes.bassFilter, this.buses.bass);

    const lead = new Tone.PolySynth(Tone.Synth, {
      maxPolyphony: 4,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.35, sustain: 0.4, release: 0.7 }
    });
    lead.connect(this.nodes.leadFilter);
    this.nodes.leadFilter.connect(this.buses.lead);
    this.nodes.leadFilter.connect(this.nodes.leadFxSend);
    this.nodes.leadFxSend.connect(this.buses.fx);

    const noiseFx = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.5, decay: 2.4, sustain: 0 },
      volume: -20
    }).connect(this.buses.fx);

    return { kick, snare, hats, bass, lead, noiseFx };
  }

  buildSequences(instruments) {
    const kickPattern = [
      1, 0, 0, 0,
      1, 0, 0, 0,
      1, 0, 0, 0,
      1, 0, 0, 0
    ];
    const snarePattern = [
      0, 0, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 0,
      0, 0, 1, 0
    ];
    const hatPattern = [
      0.6, 0, 0.45, 0,
      0.7, 0.25, 0.5, 0.25,
      0.65, 0, 0.45, 0,
      0.75, 0.3, 0.55, 0.35
    ];
    const bassPattern = [
      'C2', null, 'G1', null,
      'C2', 'D2', null, 'G1',
      'C2', null, 'A1', null,
      'C2', 'D2', null, 'G1'
    ];
    const leadPattern = [
      ['E4', 'B4'], null, ['G4'], null,
      ['A4'], null, ['B4', 'D5'], null,
      ['E5'], null, ['G4'], null,
      ['A4', 'C5'], null, ['B4'], null
    ];
    const fxPattern = [
      0, 0, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 0,
      0, 0, 1, 0
    ];

    const kickSeq = new Tone.Sequence((time, velocity) => {
      if (velocity) {
        instruments.kick.triggerAttackRelease('C1', '8n', time, velocity);
      }
    }, kickPattern, '16n');

    const snareSeq = new Tone.Sequence((time, hit) => {
      if (hit) {
        instruments.snare.triggerAttackRelease('16n', time, 0.8);
      }
    }, snarePattern, '16n');

    const hatSeq = new Tone.Sequence((time, velocity) => {
      if (velocity) {
        instruments.hats.triggerAttackRelease('32n', time, velocity);
      }
    }, hatPattern, '16n');

    const bassSeq = new Tone.Sequence((time, note) => {
      if (note) {
        instruments.bass.triggerAttackRelease(note, '8n', time, 0.9);
      }
    }, bassPattern, '16n');

    const leadSeq = new Tone.Sequence((time, notes) => {
      if (notes && notes.length) {
        notes.forEach(note => instruments.lead.triggerAttackRelease(note, '16n', time, 0.8));
      }
    }, leadPattern, '16n');

    const fxSeq = new Tone.Sequence((time, trigger) => {
      if (trigger) {
        instruments.noiseFx.triggerAttackRelease('2n', time, 0.35);
      }
    }, fxPattern, '16n');

    const groups = {
      drums: [kickSeq, snareSeq, hatSeq],
      bass: [bassSeq],
      lead: [leadSeq],
      fx: [fxSeq]
    };

    const sequencesByInstrument = {
      kick: kickSeq,
      snare: snareSeq,
      hats: hatSeq,
      bass: bassSeq,
      lead: leadSeq,
      fx: fxSeq
    };

    return {
      all: [].concat(...Object.values(groups)),
      groups,
      byInstrument: sequencesByInstrument
    };
  }

  configureTransport() {
    Tone.Transport.bpm.value = 124;
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = LOOP_DURATION;
    Tone.Transport.swing = 0.08;
    Tone.Transport.swingSubdivision = '8n';
  }

  async startSequences() {
    if (!this.sequencesStarted) {
      const sequenceList = this.sequences && Array.isArray(this.sequences.all)
        ? this.sequences.all
        : [];
      sequenceList.forEach(seq => seq.start(0));
      this.sequencesStarted = true;
    }
  }

  updateSectionPlayback(section) {
    if (!this.sequences || !this.sequences.groups) {
      return;
    }
    
    const arrangement = section ? SECTION_SEQUENCE_ACTIVITY[section.name] : null;
    const groups = this.sequences.groups;
    const defaultState = { drums: true, bass: true, lead: true, fx: true };

    Object.entries(groups).forEach(([groupName, seqs]) => {
      const hasExplicitSetting = arrangement && Object.prototype.hasOwnProperty.call(arrangement, groupName);
      const shouldEnable = hasExplicitSetting
        ? Boolean(arrangement[groupName])
        : defaultState[groupName] !== undefined
          ? defaultState[groupName]
          : true;
      seqs.forEach(seq => {
        seq.mute = !shouldEnable;
      });
    });
  }

  setBusLevel(busName, db) {
    const bus = this.buses[busName];
    if (bus) {
      setBusLevel(bus, db);
    }
  }

  // Pattern randomization methods
  randomizeDrums() {
    if (!this.sequences || !this.sequences.groups.drums) return;

    const drums = this.sequences.groups.drums;
    
    // Randomize kick pattern (more sparse, emphasis on 1 and 9)
    const kickPattern = this.generateKickPattern();
    drums[0].events = kickPattern.map((hit, i) => ({ time: i * 0.25, value: hit }));
    
    // Randomize snare pattern (typically on 2 and 4, but add variation)
    const snarePattern = this.generateSnarePattern();
    drums[1].events = snarePattern.map((hit, i) => ({ time: i * 0.25, value: hit }));
    
    // Randomize hi-hat pattern (more complex, varying velocities)
    const hatPattern = this.generateHatPattern();
    drums[2].events = hatPattern.map((vel, i) => ({ time: i * 0.25, value: vel }));
  }

  randomizeBass() {
    if (!this.sequences || !this.sequences.groups.bass) return;

    const bass = this.sequences.groups.bass[0];
    const bassPattern = this.generateBassPattern();
    bass.events = bassPattern.map((note, i) => ({ time: i * 0.25, value: note }));
  }

  randomizeLead() {
    if (!this.sequences || !this.sequences.groups.lead) return;

    const lead = this.sequences.groups.lead[0];
    const leadPattern = this.generateLeadPattern();
    lead.events = leadPattern.map((notes, i) => ({ time: i * 0.25, value: notes }));
  }

  randomizeFx() {
    if (!this.sequences || !this.sequences.groups.fx) return;

    const fx = this.sequences.groups.fx[0];
    const fxPattern = this.generateFxPattern();
    fx.events = fxPattern.map((trigger, i) => ({ time: i * 0.25, value: trigger }));
  }

  randomizeAll() {
    this.randomizeDrums();
    this.randomizeBass();
    this.randomizeLead();
    this.randomizeFx();
  }

  // Pattern generation methods
  generateKickPattern() {
    const pattern = new Array(16).fill(0);
    
    // Always have kick on beat 1
    pattern[0] = 1;
    
    // 80% chance for kick on beat 9
    if (Math.random() < 0.8) pattern[8] = 1;
    
    // 30% chance for additional kicks
    for (let i = 1; i < 16; i++) {
      if (i !== 8 && Math.random() < 0.3) {
        pattern[i] = Math.random() * 0.8 + 0.2; // Varying velocity
      }
    }
    
    return pattern;
  }

  generateSnarePattern() {
    const pattern = new Array(16).fill(0);
    
    // Snare typically on beats 4 and 12 (2 and 4 in 4/4)
    pattern[3] = Math.random() < 0.9 ? 1 : 0;
    pattern[11] = Math.random() < 0.9 ? 1 : 0;
    
    // 20% chance for ghost notes
    for (let i = 0; i < 16; i++) {
      if (i !== 3 && i !== 11 && Math.random() < 0.2) {
        pattern[i] = Math.random() * 0.4 + 0.1; // Soft ghost notes
      }
    }
    
    return pattern;
  }

  generateHatPattern() {
    const pattern = new Array(16).fill(0);
    
    // Hi-hats are more frequent, with varying velocities
    for (let i = 0; i < 16; i++) {
      if (Math.random() < 0.7) {
        pattern[i] = Math.random() * 0.8 + 0.2;
      }
    }
    
    return pattern;
  }

  generateBassPattern() {
    const notes = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3'];
    const pattern = new Array(16).fill(null);
    
    // Bass typically plays on strong beats
    const strongBeats = [0, 4, 8, 12];
    strongBeats.forEach(beat => {
      if (Math.random() < 0.8) {
        pattern[beat] = notes[Math.floor(Math.random() * notes.length)];
      }
    });
    
    // Add some off-beat notes
    for (let i = 1; i < 16; i += 2) {
      if (Math.random() < 0.3) {
        pattern[i] = notes[Math.floor(Math.random() * notes.length)];
      }
    }
    
    return pattern;
  }

  generateLeadPattern() {
    const chordProgressions = [
      [['E4', 'G4', 'B4'], ['A4', 'C5'], ['B4', 'D5'], ['E5', 'G5']],
      [['C4', 'E4', 'G4'], ['D4', 'F4', 'A4'], ['E4', 'G4', 'B4'], ['F4', 'A4', 'C5']],
      [['G4', 'B4', 'D5'], ['A4', 'C5', 'E5'], ['B4', 'D5', 'F5'], ['C5', 'E5', 'G5']]
    ];
    
    const progression = chordProgressions[Math.floor(Math.random() * chordProgressions.length)];
    const pattern = new Array(16).fill(null);
    
    // Lead typically plays on every 4th beat
    for (let i = 0; i < 16; i += 4) {
      if (Math.random() < 0.8) {
        const chordIndex = Math.floor(i / 4) % progression.length;
        pattern[i] = progression[chordIndex];
      }
    }
    
    // Add some melodic fills
    for (let i = 2; i < 16; i += 4) {
      if (Math.random() < 0.4) {
        const singleNote = progression[Math.floor(i / 4) % progression.length][0];
        pattern[i] = [singleNote];
      }
    }
    
    return pattern;
  }

  generateFxPattern() {
    const pattern = new Array(16).fill(0);
    
    // FX typically sparse, on specific beats
    const fxBeats = [3, 7, 11, 15];
    fxBeats.forEach(beat => {
      if (Math.random() < 0.6) {
        pattern[beat] = 1;
      }
    });
    
    return pattern;
  }
}