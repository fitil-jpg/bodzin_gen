# Scale-Aware Note Generation System

A comprehensive musical intelligence system for generating scale-aware notes, melodies, and chord progressions in the Bodzin Generator Toolkit.

## Overview

The Scale-Aware Note Generation System provides intelligent musical content generation that respects musical theory, scales, keys, and harmonic relationships. It consists of four main modules that work together to create musically coherent patterns and progressions.

## Architecture

### Core Modules

1. **ScaleKeyManager** - Manages musical scales, keys, and harmonic relationships
2. **NoteGenerationEngine** - Generates scale-aware notes and patterns
3. **ChordProgressionManager** - Creates harmonic progressions and chord sequences
4. **MelodyGenerator** - Generates melodic lines with musical intelligence

### Integration

The system integrates seamlessly with the existing AudioEngine, providing new methods for scale-aware pattern generation while maintaining compatibility with the current pattern system.

## Features

### ScaleKeyManager

- **13 Musical Scales**: Major, minor (natural, harmonic, melodic), modes (Dorian, Phrygian, Lydian, Mixolydian, Locrian), pentatonic scales, blues scale, and chromatic
- **17 Keys**: All chromatic keys with enharmonic equivalents
- **Scale Characteristics**: Brightness, stability, and tension levels for mood mapping
- **Harmonic Functions**: Tonic, subdominant, dominant classifications
- **Chord Generation**: Triads, sevenths, extensions, and inversions

### NoteGenerationEngine

- **Pattern Templates**: Pre-defined patterns for bass, lead, and chord instruments
- **Mood-Based Generation**: Different patterns for happy, sad, energetic, calm, mysterious, and dramatic moods
- **Melodic Contours**: Ascending, descending, balanced, arch, valley, and random contours
- **Humanization**: Timing and velocity variations for natural feel
- **Octave Management**: Intelligent octave selection and range management

### ChordProgressionManager

- **Style-Specific Progressions**: Classical, jazz, pop, and electronic styles
- **Voice Leading**: Smooth voice leading with configurable rules
- **Chord Substitutions**: Tonic, subdominant, and dominant substitutions
- **Cadence Types**: Perfect authentic, imperfect authentic, plagal, deceptive, half, and Phrygian cadences
- **Harmonic Rhythm**: Configurable chord change patterns

### MelodyGenerator

- **Motif Templates**: Ascending, descending, balanced, and ornamented motifs
- **Phrase Structures**: Question-answer, AABA, ABAC, through-composed, and period structures
- **Variation Techniques**: Sequence, inversion, retrograde, augmentation, and diminution
- **Ornamentation**: Trills, mordents, turns, appoggiaturas, and acciaccaturas
- **Harmonic Awareness**: Chord tone preferences and tension resolution

## Usage

### Basic Setup

```javascript
import { ScaleKeyManager } from './modules/scale-key-manager.js';
import { NoteGenerationEngine } from './modules/note-generation-engine.js';
import { ChordProgressionManager } from './modules/chord-progression-manager.js';
import { MelodyGenerator } from './modules/melody-generator.js';

// Initialize the system
const scaleKeyManager = new ScaleKeyManager();
const noteGenerationEngine = new NoteGenerationEngine(scaleKeyManager);
const chordProgressionManager = new ChordProgressionManager(scaleKeyManager);
const melodyGenerator = new MelodyGenerator(scaleKeyManager);
```

### Setting Scale and Key

```javascript
// Set key and scale
scaleKeyManager.setKey('C');
scaleKeyManager.setScale('major');

// Get scale notes
const scaleNotes = scaleKeyManager.getScaleNotes(4); // Octave 4
console.log(scaleNotes); // ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
```

### Generating Patterns

```javascript
// Generate bass pattern
const bassPattern = noteGenerationEngine.generateBassPattern(16, 'root_fifth');

// Generate lead melody
const leadPattern = noteGenerationEngine.generateLeadMelody(16, 'melodic');

// Generate chord progression
const progression = chordProgressionManager.generateProgression(4, 'classical', 'balanced');
```

### Mood-Based Generation

```javascript
// Generate patterns based on mood
const happyBass = noteGenerationEngine.generateMoodPattern('happy', 'bass', 16);
const sadMelody = noteGenerationEngine.generateMoodPattern('sad', 'lead', 16);
const energeticChords = noteGenerationEngine.generateMoodPattern('energetic', 'chord', 4);
```

### Integration with AudioEngine

```javascript
// Enable scale-aware generation
audioEngine.enableScaleAwareGeneration(true);

// Set scale and key
audioEngine.setScaleAndKey('D', 'minor');

// Set generation style and mood
audioEngine.setGenerationStyle('jazz', 'mysterious');

// Set complexity levels
audioEngine.setGenerationComplexity({
  harmonicComplexity: 0.8,
  melodicComplexity: 0.6,
  rhythmComplexity: 0.7
});
```

## Configuration

### ScaleKeyManager Settings

```javascript
const scaleInfo = scaleKeyManager.getCurrentScale();
console.log(scaleInfo.characteristics);
// { brightness: 1.0, stability: 0.8, tension: 0.3 }
```

### NoteGenerationEngine Settings

```javascript
noteGenerationEngine.updateSettings({
  octaveRange: { min: 3, max: 5 },
  noteDensity: 0.7,
  rhythmComplexity: 0.5,
  melodicContour: 'balanced',
  harmonicComplexity: 0.6,
  tensionLevel: 0.5,
  humanization: 0.3
});
```

### ChordProgressionManager Settings

```javascript
// Set harmonic rhythm
chordProgressionManager.setHarmonicRhythm([1, 0, 1, 0]); // Change, hold, change, hold

// Update voice leading rules
chordProgressionManager.updateVoiceLeadingRules({
  smoothMotion: true,
  avoidParallels: true,
  resolveTritones: true
});
```

### MelodyGenerator Settings

```javascript
melodyGenerator.updateMelodicRules({
  maxLeap: 12,
  preferStepwise: 0.7,
  avoidAugmented: true,
  resolveLeaps: true,
  ornamentationLevel: 0.3
});
```

## Available Scales

### Major Scales
- **Major**: Bright, stable, commonly used
- **Lydian**: Brightest mode, dreamy quality
- **Mixolydian**: Bright but with dominant feel

### Minor Scales
- **Natural Minor**: Dark, stable
- **Harmonic Minor**: Dark with exotic feel
- **Melodic Minor**: Dark but with major 6th and 7th
- **Dorian**: Dark but with major 6th
- **Phrygian**: Darkest mode, Spanish feel
- **Locrian**: Unstable, rarely used

### Pentatonic Scales
- **Pentatonic Major**: Simple, stable, widely used
- **Pentatonic Minor**: Bluesy, commonly used in rock/blues
- **Blues Scale**: Pentatonic minor with blue note

### Other Scales
- **Chromatic**: All semitones, atonal possibilities

## Available Keys

All 12 chromatic keys are supported:
- **Sharp keys**: C, C#, D, D#, E, F#, G, G#, A, A#, B
- **Flat keys**: C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B

## Generation Styles

### Classical
- Traditional harmonic progressions
- Voice leading rules
- Cadential patterns
- Motif development

### Jazz
- Extended chords (7ths, 9ths, 13ths)
- Chord substitutions
- Complex progressions
- Syncopated rhythms

### Pop
- Simple, memorable progressions
- I-V-vi-IV and similar patterns
- Catchy melodies
- Repetitive structures

### Electronic
- Modal progressions
- Minimal harmonic movement
- Rhythmic emphasis
- Atmospheric qualities

## Moods

### Happy
- Ascending melodic contours
- Major scales preferred
- Bright, stable harmonies
- Higher note density

### Sad
- Descending melodic contours
- Minor scales preferred
- Dark, unstable harmonies
- Lower note density

### Energetic
- Random melodic contours
- High tension levels
- Complex rhythms
- High note density

### Calm
- Balanced contours
- Low tension levels
- Simple rhythms
- Low note density

### Mysterious
- Valley contours
- Modal scales
- Moderate tension
- Ornamented melodies

### Dramatic
- Arch contours
- High tension
- Complex harmonies
- Wide melodic ranges

## API Reference

### ScaleKeyManager

#### Methods
- `setKey(key)` - Set the current key
- `setScale(scale)` - Set the current scale
- `getScaleNotes(octave)` - Get scale notes for octave
- `getScaleNotesRange(startOctave, endOctave)` - Get scale notes across octaves
- `getChordNotes(degree, octave, chordType)` - Get chord notes
- `getChordProgression(functionSequence, octave)` - Get chord progression
- `isNoteInScale(note)` - Check if note is in current scale
- `getClosestScaleNote(note)` - Get closest scale note
- `getScaleDegree(note)` - Get scale degree of note

### NoteGenerationEngine

#### Methods
- `generateBassPattern(length, template)` - Generate bass pattern
- `generateLeadMelody(length, template)` - Generate lead melody
- `generateChordProgression(length, progressionType)` - Generate chord progression
- `generateMoodPattern(mood, instrument, length)` - Generate mood-based pattern
- `updateSettings(settings)` - Update generation settings
- `generateVariations(basePattern, count)` - Generate pattern variations

### ChordProgressionManager

#### Methods
- `generateProgression(length, style, mood)` - Generate chord progression
- `generateCadence(type)` - Generate cadence
- `substituteChords(progression, level)` - Apply chord substitutions
- `setHarmonicRhythm(pattern)` - Set harmonic rhythm
- `updateVoiceLeadingRules(rules)` - Update voice leading rules

### MelodyGenerator

#### Methods
- `generateMelody(length, style, mood)` - Generate complete melody
- `generateMelodyOverChords(chordProgression, length)` - Generate melody over chords
- `updateMelodicRules(rules)` - Update melodic rules
- `generateVariations(basePattern, count)` - Generate melody variations

## Examples

### Basic Pattern Generation

```javascript
// Set up C major
scaleKeyManager.setKey('C');
scaleKeyManager.setScale('major');

// Generate a simple bass pattern
const bassPattern = noteGenerationEngine.generateBassPattern(16, 'root_fifth');
console.log(bassPattern.map(step => step ? step.note : null));

// Generate a lead melody
const leadPattern = noteGenerationEngine.generateLeadMelody(16, 'melodic');
console.log(leadPattern.map(step => step ? step.note : null));
```

### Chord Progression Generation

```javascript
// Generate a jazz progression in D minor
scaleKeyManager.setKey('D');
scaleKeyManager.setScale('minor');

const progression = chordProgressionManager.generateProgression(4, 'jazz', 'mysterious');
console.log(progression.map(chord => chord.symbol));
// ['i', 'VI', 'ii°', 'V']
```

### Mood-Based Generation

```javascript
// Generate happy patterns
const happyBass = noteGenerationEngine.generateMoodPattern('happy', 'bass', 16);
const happyMelody = noteGenerationEngine.generateMoodPattern('happy', 'lead', 16);

// Generate sad patterns
const sadBass = noteGenerationEngine.generateMoodPattern('sad', 'bass', 16);
const sadMelody = noteGenerationEngine.generateMoodPattern('sad', 'lead', 16);
```

### Complex Melody Generation

```javascript
// Generate a melody over a chord progression
const progression = chordProgressionManager.generateProgression(4, 'classical', 'balanced');
const melody = melodyGenerator.generateMelodyOverChords(progression, 16);

console.log(melody.map(step => step ? step.note : null));
```

## Demo

A complete demo is available at `demo-scale-generation.html` that showcases all the features of the scale-aware generation system. The demo includes:

- Interactive scale and key selection
- Style and mood controls
- Complexity sliders
- Real-time pattern generation
- Audio playback of generated patterns
- Visual display of scale notes and chord progressions

## Future Enhancements

- **Machine Learning Integration**: Use ML models for more sophisticated pattern generation
- **User Pattern Learning**: Learn from user preferences and patterns
- **Advanced Voice Leading**: More sophisticated voice leading algorithms
- **Microtonal Support**: Support for microtonal scales and tunings
- **Real-time Collaboration**: Multiple users generating patterns together
- **Pattern Analysis**: Analyze existing patterns for style and mood
- **Export/Import**: Save and share generated patterns and configurations

## Contributing

The scale-aware generation system is designed to be extensible. New scales, patterns, and generation algorithms can be easily added by extending the existing modules.

## License

This system is part of the Bodzin Generator Toolkit and follows the same licensing terms.