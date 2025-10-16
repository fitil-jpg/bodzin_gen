import { 
  STEP_COUNT, 
  STEP_DURATION, 
  LOOP_DURATION, 
  SECTION_DEFINITIONS,
  LFO_DEFINITIONS,
  ENVELOPE_FOLLOWER_DEFINITIONS,
  SECTION_SEQUENCE_ACTIVITY 
} from '../utils/constants.js';
import { setBusLevel, clamp } from '../utils/helpers.js';
import { createToneEnvelopeFollower } from './envelope-follower.js';

export class AudioEngine {
  constructor() {
    this.master = null;
    this.buses = null;
    this.nodes = null;
    this.instruments = null;
    this.sequences = null;
    this.sequencesStarted = false;
    this.envelopeFollowers = null;
    this.lfos = null;
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
    this.envelopeFollowers = this.createEnvelopeFollowers();
    this.lfos = this.createLFOs();

    this.connectEffects();
    this.connectEnvelopeFollowers();
    this.connectLFOs();
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

  createEnvelopeFollowers() {
    const followers = {};
    
    ENVELOPE_FOLLOWER_DEFINITIONS.forEach(def => {
      if (def.enabled) {
        const follower = createToneEnvelopeFollower({
          attackTime: def.attackTime,
          releaseTime: def.releaseTime,
          sensitivity: def.sensitivity,
          threshold: def.threshold,
          gate: def.gate
        });
        
        followers[def.id] = {
          node: follower,
          definition: def,
          target: null
        };
      }
    });
    
    return followers;
  }

  createLFOs() {
    const lfos = {};
    
    LFO_DEFINITIONS.forEach(def => {
      if (def.enabled) {
        const lfo = new Tone.LFO({
          frequency: def.rate,
          type: def.waveform,
          amplitude: def.depth
        });
        
        lfo.start();
        
        lfos[def.id] = {
          node: lfo,
          definition: def,
          target: null
        };
      }
    });
    
    return lfos;
  }

  connectEnvelopeFollowers() {
    Object.values(this.envelopeFollowers).forEach(follower => {
      const { node, definition } = follower;
      const source = this.getAudioSource(definition.source);
      const target = this.getParameterTarget(definition.target);
      
      if (source && target) {
        // Connect source to envelope follower
        source.connect(node);
        
        // Store target for later modulation
        follower.target = target;
      }
    });
  }

  connectLFOs() {
    Object.values(this.lfos).forEach(lfo => {
      const { node, definition } = lfo;
      const target = this.getParameterTarget(definition.target);
      
      if (target) {
        // Connect LFO to target parameter
        node.connect(target);
        lfo.target = target;
      }
    });
  }

  getAudioSource(sourceName) {
    switch (sourceName) {
      case 'lead':
        return this.instruments?.lead;
      case 'bass':
        return this.instruments?.bass;
      case 'drums':
        return this.buses?.drums;
      case 'fx':
        return this.buses?.fx;
      default:
        return null;
    }
  }

  getParameterTarget(targetName) {
    switch (targetName) {
      case 'leadFilter':
        return this.nodes?.leadFilter?.frequency;
      case 'bassFilter':
        return this.nodes?.bassFilter?.frequency;
      case 'fxSend':
        return this.nodes?.leadFxSend?.gain;
      case 'reverbDecay':
        return this.nodes?.reverb?.decay;
      case 'delayFeedback':
        return this.nodes?.delay?.feedback;
      case 'bassDrive':
        return this.nodes?.bassDrive?.distortion;
      case 'leadResonance':
        return this.nodes?.leadFilter?.Q;
      case 'masterVolume':
        return this.master?.gain;
      default:
        return null;
    }
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

  // Envelope Follower Controls
  setEnvelopeFollowerEnabled(followerId, enabled) {
    const follower = this.envelopeFollowers[followerId];
    if (follower) {
      if (enabled && !follower.node.context) {
        // Recreate follower if it was disabled
        const def = follower.definition;
        follower.node = createToneEnvelopeFollower({
          attackTime: def.attackTime,
          releaseTime: def.releaseTime,
          sensitivity: def.sensitivity,
          threshold: def.threshold,
          gate: def.gate
        });
        
        const source = this.getAudioSource(def.source);
        const target = this.getParameterTarget(def.target);
        
        if (source && target) {
          source.connect(follower.node);
          follower.target = target;
        }
      } else if (!enabled && follower.node.context) {
        // Disconnect and dispose
        follower.node.disconnect();
        follower.target = null;
      }
    }
  }

  setEnvelopeFollowerConfig(followerId, config) {
    const follower = this.envelopeFollowers[followerId];
    if (follower && follower.node) {
      follower.node.setConfig(config);
    }
  }

  getEnvelopeFollowerLevel(followerId) {
    const follower = this.envelopeFollowers[followerId];
    return follower?.node?.getLevel() || 0;
  }

  getEnvelopeFollowerInputLevel(followerId) {
    const follower = this.envelopeFollowers[followerId];
    return follower?.node?.getInputLevel() || 0;
  }

  isEnvelopeFollowerActive(followerId) {
    const follower = this.envelopeFollowers[followerId];
    return follower?.node?.isEnvelopeActive() || false;
  }

  // LFO Controls
  setLFOEnabled(lfoId, enabled) {
    const lfo = this.lfos[lfoId];
    if (lfo) {
      if (enabled) {
        lfo.node.start();
      } else {
        lfo.node.stop();
      }
    }
  }

  setLFOConfig(lfoId, config) {
    const lfo = this.lfos[lfoId];
    if (lfo && lfo.node) {
      if (config.frequency !== undefined) {
        lfo.node.frequency.value = config.frequency;
      }
      if (config.amplitude !== undefined) {
        lfo.node.amplitude.value = config.amplitude;
      }
      if (config.type !== undefined) {
        lfo.node.type = config.type;
      }
    }
  }

  getLFOValue(lfoId) {
    const lfo = this.lfos[lfoId];
    return lfo?.node?.value || 0;
  }

  // Get all envelope follower levels for visualization
  getAllEnvelopeFollowerLevels() {
    const levels = {};
    Object.keys(this.envelopeFollowers).forEach(id => {
      levels[id] = this.getEnvelopeFollowerLevel(id);
    });
    return levels;
  }

  // Get all LFO values for visualization
  getAllLFOValues() {
    const values = {};
    Object.keys(this.lfos).forEach(id => {
      values[id] = this.getLFOValue(id);
    });
    return values;
  }
}