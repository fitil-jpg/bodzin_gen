import { 
  MUSICAL_KEYS, 
  SCALE_PATTERNS, 
  CHORD_PROGRESSIONS, 
  CHORD_TYPES, 
  NOTE_NAMES, 
  NOTE_NAMES_FLAT,
  MIDI_NOTES,
  DEFAULT_KEY_SIGNATURE 
} from '../utils/constants.js';

export class KeySignatureManager {
  constructor(app) {
    this.app = app;
    this.currentKey = DEFAULT_KEY_SIGNATURE.key;
    this.currentScale = DEFAULT_KEY_SIGNATURE.scale;
    this.currentChordProgression = DEFAULT_KEY_SIGNATURE.chordProgression;
    this.octave = DEFAULT_KEY_SIGNATURE.octave;
    this.enabled = DEFAULT_KEY_SIGNATURE.enabled;
    
    // Cache for generated notes and chords
    this.noteCache = new Map();
    this.chordCache = new Map();
    
    // Initialize with default key
    this.updateKeySignature(this.currentKey, this.currentScale);
  }

  /**
   * Update the current key signature
   * @param {string} key - The musical key (e.g., 'C', 'G', 'Am', 'F#m')
   * @param {string} scale - The scale type (e.g., 'major', 'minor', 'dorian')
   */
  updateKeySignature(key, scale = 'major') {
    this.currentKey = key;
    this.currentScale = scale;
    
    // Clear caches when key changes
    this.noteCache.clear();
    this.chordCache.clear();
    
    // Update root note
    const keyInfo = MUSICAL_KEYS[key];
    if (keyInfo) {
      this.rootNote = `${keyInfo.root}${this.octave}`;
    }
    
    // Generate scale notes
    this.scaleNotes = this.generateScaleNotes(key, scale);
    
    // Generate chord progression
    this.chordProgression = this.generateChordProgression(key, scale, this.currentChordProgression);
    
    console.log(`Key signature updated: ${key} ${scale}`, {
      scaleNotes: this.scaleNotes,
      chordProgression: this.chordProgression
    });
  }

  /**
   * Generate notes for a given key and scale
   * @param {string} key - The musical key
   * @param {string} scale - The scale type
   * @returns {Array} Array of note names
   */
  generateScaleNotes(key, scale) {
    const cacheKey = `${key}-${scale}`;
    if (this.noteCache.has(cacheKey)) {
      return this.noteCache.get(cacheKey);
    }

    const keyInfo = MUSICAL_KEYS[key];
    if (!keyInfo) {
      console.warn(`Unknown key: ${key}`);
      return [];
    }

    const scalePattern = SCALE_PATTERNS[scale];
    if (!scalePattern) {
      console.warn(`Unknown scale: ${scale}`);
      return [];
    }

    // Find the root note index
    const rootIndex = this.getNoteIndex(keyInfo.root);
    if (rootIndex === -1) {
      console.warn(`Unknown root note: ${keyInfo.root}`);
      return [];
    }

    // Generate scale notes
    const scaleNotes = scalePattern.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return NOTE_NAMES[noteIndex];
    });

    // Add octave information
    const notesWithOctave = scaleNotes.map(note => `${note}${this.octave}`);
    
    this.noteCache.set(cacheKey, notesWithOctave);
    return notesWithOctave;
  }

  /**
   * Generate chord progression for a given key and scale
   * @param {string} key - The musical key
   * @param {string} scale - The scale type
   * @param {string} progressionName - The chord progression name
   * @returns {Array} Array of chord objects
   */
  generateChordProgression(key, scale, progressionName) {
    const cacheKey = `${key}-${scale}-${progressionName}`;
    if (this.chordCache.has(cacheKey)) {
      return this.chordCache.get(cacheKey);
    }

    const keyInfo = MUSICAL_KEYS[key];
    if (!keyInfo) {
      console.warn(`Unknown key: ${key}`);
      return [];
    }

    const scalePattern = SCALE_PATTERNS[scale];
    if (!scalePattern) {
      console.warn(`Unknown scale: ${scale}`);
      return [];
    }

    // Get progression pattern
    const progressionType = keyInfo.type === 'major' ? 'major' : 'minor';
    const progressionPattern = CHORD_PROGRESSIONS[progressionType]?.[progressionName];
    if (!progressionPattern) {
      console.warn(`Unknown chord progression: ${progressionName}`);
      return [];
    }

    // Generate chords
    const chords = progressionPattern.map(romanNumeral => {
      const chordRoot = this.getChordRoot(romanNumeral, scalePattern);
      const chordType = this.getChordType(romanNumeral, keyInfo.type);
      const chordNotes = this.buildChord(chordRoot, chordType);
      
      return {
        romanNumeral,
        root: chordRoot,
        type: chordType,
        notes: chordNotes,
        midiNotes: chordNotes.map(note => this.getMidiNote(note))
      };
    });

    this.chordCache.set(cacheKey, chords);
    return chords;
  }

  /**
   * Get the root note of a chord based on roman numeral
   * @param {string} romanNumeral - Roman numeral (e.g., 'I', 'V', 'vi')
   * @param {Array} scalePattern - The scale pattern intervals
   * @returns {string} Root note name
   */
  getChordRoot(romanNumeral, scalePattern) {
    const romanToIndex = {
      'I': 0, 'ii': 1, 'II': 1, 'iii': 2, 'III': 2, 'iv': 3, 'IV': 3,
      'V': 4, 'vi': 5, 'VI': 5, 'vii': 6, 'VII': 6
    };

    const chordIndex = romanToIndex[romanNumeral];
    if (chordIndex === undefined) {
      console.warn(`Unknown roman numeral: ${romanNumeral}`);
      return 'C';
    }

    const keyInfo = MUSICAL_KEYS[this.currentKey];
    const rootIndex = this.getNoteIndex(keyInfo.root);
    const chordRootIndex = (rootIndex + scalePattern[chordIndex]) % 12;
    
    return NOTE_NAMES[chordRootIndex];
  }

  /**
   * Get chord type based on roman numeral and key type
   * @param {string} romanNumeral - Roman numeral
   * @param {string} keyType - 'major' or 'minor'
   * @returns {string} Chord type
   */
  getChordType(romanNumeral, keyType) {
    const majorChordTypes = {
      'I': 'major', 'ii': 'minor', 'iii': 'minor', 'IV': 'major',
      'V': 'major', 'vi': 'minor', 'vii': 'diminished'
    };

    const minorChordTypes = {
      'i': 'minor', 'ii': 'diminished', 'III': 'major', 'iv': 'minor',
      'V': 'major', 'VI': 'major', 'VII': 'major'
    };

    if (keyType === 'major') {
      return majorChordTypes[romanNumeral] || 'major';
    } else {
      return minorChordTypes[romanNumeral] || 'minor';
    }
  }

  /**
   * Build a chord from root note and chord type
   * @param {string} root - Root note name
   * @param {string} chordType - Chord type
   * @returns {Array} Array of note names
   */
  buildChord(root, chordType) {
    const rootIndex = this.getNoteIndex(root);
    if (rootIndex === -1) {
      console.warn(`Unknown root note: ${root}`);
      return [root];
    }

    const chordIntervals = CHORD_TYPES[chordType];
    if (!chordIntervals) {
      console.warn(`Unknown chord type: ${chordType}`);
      return [root];
    }

    const chordNotes = chordIntervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return NOTE_NAMES[noteIndex];
    });

    // Add octave information
    return chordNotes.map(note => `${note}${this.octave}`);
  }

  /**
   * Get note index in the chromatic scale
   * @param {string} note - Note name (e.g., 'C', 'F#', 'Bb')
   * @returns {number} Note index (0-11)
   */
  getNoteIndex(note) {
    // Handle sharp notes
    if (note.includes('#')) {
      const baseNote = note.replace('#', '');
      const index = NOTE_NAMES.indexOf(baseNote);
      return index !== -1 ? (index + 1) % 12 : -1;
    }
    
    // Handle flat notes
    if (note.includes('b')) {
      const baseNote = note.replace('b', '');
      const index = NOTE_NAMES_FLAT.indexOf(note);
      if (index !== -1) {
        return index;
      }
    }
    
    // Handle natural notes
    return NOTE_NAMES.indexOf(note);
  }

  /**
   * Get MIDI note number for a note name
   * @param {string} noteName - Note name with octave (e.g., 'C4', 'F#5')
   * @returns {number} MIDI note number
   */
  getMidiNote(noteName) {
    // Check if it's already a MIDI note number
    if (typeof noteName === 'number') {
      return noteName;
    }

    // Parse note name and octave
    const match = noteName.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) {
      console.warn(`Invalid note format: ${noteName}`);
      return 60; // Default to C4
    }

    const [, note, octave] = match;
    const octaveNum = parseInt(octave);
    
    // Get base note index
    const noteIndex = this.getNoteIndex(note);
    if (noteIndex === -1) {
      console.warn(`Invalid note: ${note}`);
      return 60;
    }

    // Calculate MIDI note number
    return 12 + (octaveNum * 12) + noteIndex;
  }

  /**
   * Generate a melodic pattern based on the current key signature
   * @param {number} length - Number of notes to generate
   * @param {string} patternType - Type of pattern ('ascending', 'descending', 'random', 'arpeggio')
   * @returns {Array} Array of note names
   */
  generateMelodicPattern(length = 8, patternType = 'random') {
    if (!this.enabled || !this.scaleNotes) {
      return [];
    }

    const notes = [];
    
    switch (patternType) {
      case 'ascending':
        for (let i = 0; i < length; i++) {
          const noteIndex = i % this.scaleNotes.length;
          notes.push(this.scaleNotes[noteIndex]);
        }
        break;
        
      case 'descending':
        for (let i = 0; i < length; i++) {
          const noteIndex = (this.scaleNotes.length - 1) - (i % this.scaleNotes.length);
          notes.push(this.scaleNotes[noteIndex]);
        }
        break;
        
      case 'arpeggio':
        if (this.chordProgression && this.chordProgression.length > 0) {
          const chord = this.chordProgression[i % this.chordProgression.length];
          const noteIndex = i % chord.notes.length;
          notes.push(chord.notes[noteIndex]);
        }
        break;
        
      case 'random':
      default:
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * this.scaleNotes.length);
          notes.push(this.scaleNotes[randomIndex]);
        }
        break;
    }
    
    return notes;
  }

  /**
   * Generate a harmonic pattern (chord progression)
   * @param {number} length - Number of chords to generate
   * @returns {Array} Array of chord objects
   */
  generateHarmonicPattern(length = 4) {
    if (!this.enabled || !this.chordProgression) {
      return [];
    }

    const chords = [];
    for (let i = 0; i < length; i++) {
      const chordIndex = i % this.chordProgression.length;
      chords.push(this.chordProgression[chordIndex]);
    }
    
    return chords;
  }

  /**
   * Get available keys for a given scale type
   * @param {string} scaleType - Scale type ('major', 'minor', etc.)
   * @returns {Array} Array of key names
   */
  getAvailableKeys(scaleType = 'major') {
    return Object.keys(MUSICAL_KEYS).filter(key => {
      const keyInfo = MUSICAL_KEYS[key];
      return keyInfo.type === scaleType || scaleType === 'all';
    });
  }

  /**
   * Get available scales
   * @returns {Array} Array of scale names
   */
  getAvailableScales() {
    return Object.keys(SCALE_PATTERNS);
  }

  /**
   * Get available chord progressions for a key type
   * @param {string} keyType - 'major' or 'minor'
   * @returns {Array} Array of progression names
   */
  getAvailableChordProgressions(keyType = 'major') {
    return Object.keys(CHORD_PROGRESSIONS[keyType] || {});
  }

  /**
   * Set chord progression
   * @param {string} progressionName - Name of the chord progression
   */
  setChordProgression(progressionName) {
    this.currentChordProgression = progressionName;
    this.chordProgression = this.generateChordProgression(
      this.currentKey, 
      this.currentScale, 
      progressionName
    );
  }

  /**
   * Set octave
   * @param {number} octave - Octave number (3-6)
   */
  setOctave(octave) {
    this.octave = Math.max(3, Math.min(6, octave));
    this.updateKeySignature(this.currentKey, this.currentScale);
  }

  /**
   * Enable/disable key signature system
   * @param {boolean} enabled - Whether to enable the system
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Get current key signature info
   * @returns {Object} Current key signature information
   */
  getCurrentKeySignature() {
    return {
      key: this.currentKey,
      scale: this.currentScale,
      chordProgression: this.currentChordProgression,
      octave: this.octave,
      enabled: this.enabled,
      scaleNotes: this.scaleNotes,
      chordProgression: this.chordProgression
    };
  }

  /**
   * Export key signature settings for presets
   * @returns {Object} Key signature settings
   */
  exportSettings() {
    return {
      key: this.currentKey,
      scale: this.currentScale,
      chordProgression: this.currentChordProgression,
      octave: this.octave,
      enabled: this.enabled
    };
  }

  /**
   * Import key signature settings from presets
   * @param {Object} settings - Key signature settings
   */
  importSettings(settings) {
    if (settings.key) this.currentKey = settings.key;
    if (settings.scale) this.currentScale = settings.scale;
    if (settings.chordProgression) this.currentChordProgression = settings.chordProgression;
    if (settings.octave) this.octave = settings.octave;
    if (settings.enabled !== undefined) this.enabled = settings.enabled;
    
    this.updateKeySignature(this.currentKey, this.currentScale);
  }
}