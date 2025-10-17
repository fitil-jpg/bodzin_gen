import { 
  STEP_COUNT, 
  STEP_DURATION, 
  LOOP_DURATION, 
  SECTION_DEFINITIONS,
  LFO_DEFINITIONS,
  SECTION_SEQUENCE_ACTIVITY 
} from '../utils/constants.js';
import { setBusLevel, clamp } from '../utils/helpers.js';
import { ProbabilityManager } from './probability-manager.js';

export class AudioEngine {
  constructor() {
    this.master = null;
    this.buses = null;
    this.nodes = null;
    this.instruments = null;
    this.sequences = null;
    this.sequencesStarted = false;
    this.probabilityManager = new ProbabilityManager();
    this.useProbabilityTriggers = false;
    this.currentStep = 0;
    this.currentSection = null;
  }

  initialize() {
    this.master = new Tone.Gain(0.9);
    const limiter = new Tone.Limiter(-1);
    
    this.buses = {
      drums: new Tone.Gain(0.8),
      bass: new Tone.Gain(0.8),
      lead: new Tone.Gain(0.8),
      fx: new Tone.Gain(0.5)
    };

    this.nodes = this.createEffects();
    
    // Connect master chain with overdrive
    this.master.chain(this.nodes.masterOverdrive, limiter);
    limiter.toDestination();
    
    // Connect buses to master (except drums which go through distortion)
    this.buses.bass.connect(this.master);
    this.buses.lead.connect(this.master);
    this.buses.fx.connect(this.master);

    this.instruments = this.createInstruments();
    this.sequences = this.buildSequences(this.instruments);
    this.probabilityManager.initializeProbabilityTracks();

    this.connectEffects();
    this.connectBuses();
    return this;
  }

  createEffects() {
    const delay = new Tone.FeedbackDelay('8n', 0.38);
    const reverb = new Tone.Reverb({ decay: 6, wet: 0.28, preDelay: 0.02 });
    const leadFilter = new Tone.Filter(520, 'lowpass', -12);
    const leadFxSend = new Tone.Gain(0.45);
    const bassFilter = new Tone.Filter(140, 'lowpass', -12);
    const bassDrive = new Tone.Distortion(0.35);
    
    // New distortion and overdrive effects
    const leadDistortion = new Tone.Distortion({
      distortion: 0.2,
      oversample: '2x'
    });
    const leadOverdrive = new Tone.Overdrive({
      drive: 0.3,
      output: 0.8
    });
    const drumDistortion = new Tone.Distortion({
      distortion: 0.15,
      oversample: '4x'
    });
    const masterOverdrive = new Tone.Overdrive({
      drive: 0.1,
      output: 0.9
    });

    // Sidechain compression
    const sidechainCompressor = new Tone.Compressor({
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.1,
      knee: 30
    });

    const sidechainGain = new Tone.Gain(1);

    return {
      delay,
      reverb,
      leadFilter,
      leadFxSend,
      bassFilter,
      bassDrive,
      sidechainCompressor,
      sidechainGain
      leadDistortion,
      leadOverdrive,
      drumDistortion,
      masterOverdrive
    };
  }

  connectEffects() {
    this.buses.fx.connect(this.nodes.delay);
    this.buses.fx.connect(this.nodes.reverb);
    this.nodes.delay.connect(this.master);
    this.nodes.reverb.connect(this.master);
    
    // Initialize sidechain state
    this.sidechainEnabled = true;
  }

  connectBuses() {
    // Connect buses with sidechain compression
    this.buses.drums.connect(this.master);
    this.buses.fx.connect(this.master);
    
    // Connect sidechain compressor to master
    this.nodes.sidechainCompressor.connect(this.nodes.sidechainGain);
    this.nodes.sidechainGain.connect(this.master);
    
    // Initial routing
    this.updateSidechainRouting();
    // Connect drum distortion
    this.buses.drums.connect(this.nodes.drumDistortion);
    this.nodes.drumDistortion.connect(this.master);
    
    // Note: Master overdrive is connected in initialize
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
    lead.chain(
      this.nodes.leadDistortion,
      this.nodes.leadOverdrive,
      this.nodes.leadFilter,
      this.buses.lead
    );
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
        // Trigger sidechain compression
        this.triggerSidechain();
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

  /**
   * Enable or disable probability-based triggers
   */
  setProbabilityTriggersEnabled(enabled) {
    this.useProbabilityTriggers = enabled;
  }

  /**
   * Update current step and section for probability calculations
   */
  updateStepContext(step, section = null) {
    this.currentStep = step;
    this.currentSection = section;
  }

  /**
   * Process probability-based triggers for all instruments
   */
  processProbabilityTriggers(time) {
    if (!this.useProbabilityTriggers) return;

    const context = {
      step: this.currentStep,
      section: this.currentSection
    };

    // Process each instrument
    const instruments = ['kick', 'snare', 'hats', 'bass', 'lead', 'fx'];
    
    instruments.forEach(instrument => {
      if (this.probabilityManager.shouldTrigger(instrument, this.currentStep, context)) {
        const triggerInfo = this.probabilityManager.getTriggerInfo(instrument, this.currentStep, context);
        this.triggerInstrument(instrument, time, triggerInfo);
      }
    });
  }

  /**
   * Trigger a specific instrument with probability-based parameters
   */
  triggerInstrument(instrument, time, triggerInfo) {
    const { velocity, isAccent, isGhost } = triggerInfo;
    
    switch (instrument) {
      case 'kick':
        this.instruments.kick.triggerAttackRelease('C1', '8n', time, velocity);
        break;
        
      case 'snare':
        this.instruments.snare.triggerAttackRelease('16n', time, velocity);
        break;
        
      case 'hats':
        this.instruments.hats.triggerAttackRelease('32n', time, velocity);
        break;
        
      case 'bass':
        // Use a simple bass pattern for probability triggers
        const bassNotes = ['C2', 'G1', 'A1', 'D2'];
        const noteIndex = this.currentStep % bassNotes.length;
        const note = bassNotes[noteIndex];
        if (note) {
          this.instruments.bass.triggerAttackRelease(note, '8n', time, velocity);
        }
        break;
        
      case 'lead':
        // Use a simple lead pattern for probability triggers
        const leadNotes = [['E4', 'B4'], ['G4'], ['A4'], ['B4', 'D5']];
        const leadIndex = this.currentStep % leadNotes.length;
        const notes = leadNotes[leadIndex];
        if (notes && notes.length) {
          notes.forEach(note => {
            this.instruments.lead.triggerAttackRelease(note, '16n', time, velocity);
          });
        }
        break;
        
      case 'fx':
        this.instruments.noiseFx.triggerAttackRelease('2n', time, velocity);
        break;
    }
  }

  /**
   * Get probability manager for external configuration
   */
  getProbabilityManager() {
    return this.probabilityManager;
  }

  /**
   * Set probability curve for an instrument
   */
  setProbabilityCurve(instrument, curve, curveType) {
    this.probabilityManager.setProbabilityCurve(instrument, curve, curveType);
  }

  /**
   * Set base probability for an instrument
   */
  setBaseProbability(instrument, probability) {
    this.probabilityManager.setBaseProbability(instrument, probability);
  }

  /**
   * Set humanization for an instrument
   */
  setHumanization(instrument, amount) {
    this.probabilityManager.setHumanization(instrument, amount);
  }

  /**
   * Set accent settings for an instrument
   */
  setAccentSettings(instrument, probability, multiplier) {
    this.probabilityManager.setAccentSettings(instrument, probability, multiplier);
  }

  /**
   * Set ghost note settings for an instrument
   */
  setGhostNoteSettings(instrument, probability, multiplier) {
    this.probabilityManager.setGhostNoteSettings(instrument, probability, multiplier);
  }

  /**
   * Set pattern lock for an instrument
   */
  setPatternLock(instrument, enabled, steps) {
    this.probabilityManager.setPatternLock(instrument, enabled, steps);
  }

  /**
   * Set global entropy
   */
  setEntropy(entropy) {
    this.probabilityManager.setEntropy(entropy);
  }

  /**
   * Set quantization
   */
  setQuantization(quantization) {
    this.probabilityManager.setQuantization(quantization);
  }

  /**
   * Export probability settings
   */
  exportProbabilitySettings() {
    return this.probabilityManager.exportSettings();
  }

  /**
   * Import probability settings
   */
  importProbabilitySettings(data) {
    this.probabilityManager.importSettings(data);
  }

  /**
   * Reset probability settings to defaults
   */
  resetProbabilitySettings() {
    this.probabilityManager.resetToDefaults();
  }
}
  // Sidechain compression methods
  triggerSidechain() {
    if (!this.sidechainEnabled) return;
    
    // Create a quick ducking effect by temporarily reducing the sidechain gain
    const originalGain = this.nodes.sidechainGain.gain.value;
    this.nodes.sidechainGain.gain.rampTo(0.1, 0.01);
    this.nodes.sidechainGain.gain.rampTo(originalGain, 0.2);
  }

  updateSidechainRouting() {
    // Disconnect all buses from their current destinations
    this.buses.bass.disconnect();
    this.buses.lead.disconnect();
    
    if (this.sidechainEnabled) {
      // Route through sidechain compression
      this.buses.bass.connect(this.nodes.sidechainCompressor);
      this.buses.lead.connect(this.nodes.sidechainCompressor);
    } else {
      // Route directly to master
      this.buses.bass.connect(this.master);
      this.buses.lead.connect(this.master);
    }
  }
}

export { AudioEngine };
