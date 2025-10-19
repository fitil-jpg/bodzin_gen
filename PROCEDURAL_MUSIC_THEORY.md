# Procedural Music Theory with Wolfram Integration

## Overview

This document describes the advanced procedural music theory system integrated into the Bodzin Generator Toolkit. The system combines traditional music theory with modern computational approaches and Wolfram Language integration for sophisticated pattern generation and analysis.

## Features

### 1. Core Music Theory Engine (`music-theory-engine.js`)

#### Scale System
- **Major Scales**: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian
- **Minor Scales**: Natural, Harmonic, Melodic
- **Pentatonic Scales**: Major and Minor pentatonic
- **Special Scales**: Blues, Whole Tone, Diminished, Augmented, Chromatic
- **Mode Generation**: Automatic mode generation from any scale
- **Chord Building**: Automatic chord construction from scales

#### Chord System
- **Basic Triads**: Major, Minor, Diminished, Augmented
- **Seventh Chords**: Major7, Minor7, Dominant7, Diminished7, Half-Diminished7
- **Extended Chords**: 9th, 11th, 13th chords
- **Suspended Chords**: Sus2, Sus4
- **Add Chords**: Add9, Add11, Add13
- **Inversions**: All chord inversions
- **Extensions**: Automatic chord extension generation

#### Chord Progressions
- **Common Progressions**: ii-V-I, vi-IV-V, I-vi-IV-V
- **Jazz Progressions**: ii-V7-I7, iii-VI-ii-V
- **Modal Progressions**: Dorian, Phrygian, Lydian, Mixolydian
- **Electronic Styles**: Ambient, Cinematic, Epic, Mysterious
- **Bodzin Styles**: Multiple Bodzin-inspired progressions
- **Variation Generation**: Automatic progression variations

#### Rhythm Patterns
- **Basic Patterns**: 4/4, 3/4, 2/4
- **Electronic Patterns**: Four-on-floor, Breakbeat, Shuffle, Triplet
- **Complex Patterns**: Polyrhythm, Syncopated, Offbeat
- **Bodzin Patterns**: Kick, Snare, Hi-hat, Complex patterns
- **Variation Generation**: Rhythmic variations and accents

### 2. Wolfram Language Connector (`wolfram-connector.js`)

#### Advanced Analysis
- **Scale Analysis**: Wolfram's Scale[] function integration
- **Chord Analysis**: Wolfram's Chord[] function integration
- **Harmonic Analysis**: Wolfram's Harmony[] function integration
- **Rhythm Analysis**: Wolfram's Rhythm[] function integration
- **Melodic Analysis**: Wolfram's Melody[] function integration

#### Generation Functions
- **Complex Chord Progressions**: Wolfram's GenerateChordProgression[]
- **Rhythmic Patterns**: Wolfram's GenerateRhythm[]
- **Melodic Lines**: Wolfram's GenerateMelody[]
- **Voice Leading**: Wolfram's VoiceLeading[] analysis
- **Spectral Analysis**: Wolfram's Fourier[] analysis

#### Offline Fallbacks
- **JavaScript Implementations**: Fallback functions when Wolfram is unavailable
- **Cached Results**: Intelligent caching system for API responses
- **Error Handling**: Graceful degradation to offline mode

### 3. Procedural Pattern Generator (`procedural-pattern-generator.js`)

#### Style System
- **Bodzin Style**: 120 BPM, C minor, Harmonic minor, Four-on-floor
- **Ambient Style**: 80 BPM, F major, Lydian, Shuffle
- **Cinematic Style**: 100 BPM, D minor, Dorian, Breakbeat
- **Jazz Style**: 140 BPM, Bb major, Major, Syncopated
- **Experimental Style**: 90 BPM, C, Chromatic, Polyrhythm

#### Pattern Generation
- **Kick Patterns**: Bass drum patterns with velocity and timing variations
- **Snare Patterns**: Snare drum patterns with accent generation
- **Hi-hat Patterns**: Hi-hat patterns with ghost note generation
- **Bass Patterns**: Bass line generation with harmonic analysis
- **Lead Patterns**: Melodic lead generation with chord tone selection
- **FX Patterns**: Effect patterns with randomization

#### Advanced Features
- **Melodic Generation**: Scale-based melody generation
- **Harmonic Analysis**: Real-time harmonic analysis
- **Voice Leading**: Smooth voice leading between chords
- **Tension Analysis**: Harmonic tension calculation
- **Resolution Detection**: Automatic cadence detection

### 4. User Interface (`procedural-music-ui.js`)

#### Tabbed Interface
- **Pattern Generation**: Style selection, complexity controls, randomness controls
- **Music Theory**: Scale analysis, chord analysis, harmonic analysis
- **Wolfram Analysis**: Wolfram code execution, advanced analysis
- **Settings**: API configuration, export/import functionality

#### Interactive Controls
- **Style Selector**: Dropdown for musical style selection
- **Complexity Slider**: Real-time complexity adjustment (0-1)
- **Randomness Slider**: Real-time randomness adjustment (0-1)
- **Pattern Preview**: Visual pattern representation
- **Export/Import**: Pattern and settings export/import

#### Real-time Updates
- **Pattern Preview**: Live pattern visualization
- **Wolfram Status**: Connection status indicator
- **Analysis Results**: Real-time analysis display

## Usage

### Basic Usage

1. **Open Procedural Music Theory**: Click the "🎵 Procedural Music Theory" button
2. **Select Style**: Choose from available musical styles
3. **Adjust Parameters**: Use sliders to adjust complexity and randomness
4. **Generate Patterns**: Click "Generate New Patterns" to create new patterns
5. **Export to Automation**: Use "Export Patterns" to apply to the main sequencer

### Advanced Usage

#### Wolfram Integration

1. **Configure API Key**: Enter your Wolfram API key in Settings
2. **Execute Code**: Write Wolfram Language code in the Wolfram tab
3. **Analyze Results**: View analysis results in real-time
4. **Export Data**: Export analysis results for further processing

#### Custom Pattern Generation

1. **Select Custom Style**: Choose "Experimental" for maximum flexibility
2. **Adjust Complexity**: Set complexity to 1.0 for maximum variation
3. **Adjust Randomness**: Set randomness to 1.0 for maximum unpredictability
4. **Generate Patterns**: Create unique patterns based on your parameters

### Keyboard Shortcuts

- **Ctrl/Cmd + M**: Open Procedural Music Theory interface
- **Escape**: Close Procedural Music Theory interface

## API Reference

### MusicTheoryEngine

```javascript
// Initialize
const musicTheory = new MusicTheoryEngine();

// Get scale
const majorScale = musicTheory.scales.get('major');
const notes = majorScale.getNotes(60); // C major scale starting at C4

// Get chord
const majorChord = musicTheory.chords.get('major');
const chordNotes = majorChord.getNotes(60); // C major chord

// Get progression
const progression = musicTheory.progressions.get('iiV7I');
const chords = progression.getChords(0, 'major'); // C major key

// Generate melody
const melody = musicTheory.generateMelody(majorScale, 8, 'random');
```

### WolframConnector

```javascript
// Initialize
const wolfram = new WolframConnector();
await wolfram.initialize('your-api-key');

// Analyze scale
const scaleAnalysis = await wolfram.analyzeScale('major', 0);

// Analyze chord
const chordAnalysis = await wolfram.analyzeChord('Cmaj7', 60);

// Generate progression
const progression = await wolfram.generateChordProgression(0, 'jazz', 4);

// Execute custom code
const result = await wolfram.executeWolframCode('Scale[Major, 0]');
```

### ProceduralPatternGenerator

```javascript
// Initialize
const generator = new ProceduralPatternGenerator(app);
await generator.initialize();

// Set style
generator.setStyle('bodzin');

// Set parameters
generator.setComplexity(0.8);
generator.setRandomness(0.5);

// Get patterns
const patterns = generator.getPatterns();
const kickPattern = generator.getPattern('kick');

// Export/Import
const data = generator.exportPatterns();
generator.importPatterns(data);
```

## Integration with Existing System

### Automation Integration

The procedural music theory system integrates seamlessly with the existing automation system:

1. **Pattern Export**: Procedural patterns can be exported to automation tracks
2. **Pattern Import**: Existing automation can be imported as procedural patterns
3. **Real-time Sync**: Changes in procedural patterns update automation in real-time
4. **Preset Integration**: Procedural patterns are included in preset save/load

### UI Integration

The system adds a new button to the existing control panel and provides a comprehensive interface for advanced music theory operations.

### Audio Integration

Generated patterns are automatically converted to the appropriate format for the audio engine and can be played back immediately.

## Configuration

### Wolfram API Setup

1. **Get API Key**: Sign up for Wolfram Cloud API access
2. **Configure Key**: Enter API key in the Settings tab
3. **Test Connection**: Verify connection in the Wolfram tab

### Style Customization

Styles can be customized by modifying the `styles` object in `procedural-pattern-generator.js`:

```javascript
const customStyle = {
  name: 'Custom Style',
  characteristics: {
    tempo: 110,
    key: 'G minor',
    scale: 'harmonicMinor',
    chordProgression: 'custom',
    rhythmStyle: 'custom',
    complexity: 0.7,
    tension: 0.6
  }
};
```

## Performance Considerations

### Caching

- **Wolfram Results**: API responses are cached for 5 minutes
- **Pattern Generation**: Generated patterns are cached until parameters change
- **Analysis Results**: Analysis results are cached to avoid redundant computation

### Memory Management

- **Pattern Storage**: Patterns are stored efficiently in memory
- **Cache Limits**: Cache size is limited to prevent memory issues
- **Cleanup**: Automatic cleanup of unused patterns and analysis results

### Optimization

- **Lazy Loading**: Modules are loaded only when needed
- **Efficient Algorithms**: Optimized algorithms for pattern generation
- **Minimal DOM Updates**: UI updates are batched for better performance

## Troubleshooting

### Common Issues

1. **Wolfram API Errors**: Check API key and internet connection
2. **Pattern Generation Fails**: Ensure all required modules are loaded
3. **UI Not Responsive**: Check for JavaScript errors in console
4. **Audio Issues**: Ensure audio context is properly initialized

### Debug Mode

Enable debug mode by setting `window.DEBUG_PROCEDURAL_MUSIC = true` in the browser console.

### Error Handling

The system includes comprehensive error handling:
- **Graceful Degradation**: Falls back to offline mode when Wolfram is unavailable
- **User Feedback**: Clear error messages for common issues
- **Recovery**: Automatic recovery from transient errors

## Future Enhancements

### Planned Features

1. **Machine Learning Integration**: AI-powered pattern generation
2. **Real-time Collaboration**: Multi-user pattern sharing
3. **Advanced Visualization**: 3D pattern visualization
4. **MIDI Integration**: Direct MIDI pattern export
5. **Audio Analysis**: Real-time audio analysis and pattern matching

### Extension Points

The system is designed for easy extension:
- **Custom Scales**: Add new scale types
- **Custom Chords**: Add new chord types
- **Custom Styles**: Add new musical styles
- **Custom Analysis**: Add new analysis functions

## Contributing

### Code Style

- **ES6 Modules**: Use modern JavaScript module syntax
- **Documentation**: Comprehensive JSDoc comments
- **Error Handling**: Proper error handling and user feedback
- **Testing**: Unit tests for all major functions

### Pull Requests

1. **Fork Repository**: Create a fork of the repository
2. **Create Branch**: Create a feature branch
3. **Implement Changes**: Implement your changes with tests
4. **Submit PR**: Submit a pull request with description

## License

This procedural music theory system is part of the Bodzin Generator Toolkit and follows the same MIT license.

## Support

For support and questions:
1. **Documentation**: Check this documentation first
2. **Issues**: Create an issue on GitHub
3. **Discussions**: Use GitHub Discussions for questions
4. **Community**: Join the community Discord server

---

*This system represents a significant advancement in procedural music generation, combining traditional music theory with modern computational approaches and Wolfram Language integration for sophisticated pattern generation and analysis.*