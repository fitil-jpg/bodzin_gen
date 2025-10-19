# Bodzin Generator Toolkit

A comprehensive web-based music generator inspired by Stephan Bodzin's style, featuring advanced procedural music theory and Wolfram Language integration.

## Features

### Core Functionality
- **Real-time Audio Engine**: Built with Tone.js for professional audio processing
- **Pattern Variations**: Advanced pattern morphing and variation system
- **Automation System**: Comprehensive automation with curve editing
- **Preset Management**: Save, load, and share presets with versioning
- **MIDI Support**: Full MIDI input/output support
- **Mobile Gestures**: Touch-friendly interface for mobile devices

### Procedural Music Theory (NEW!)
- **Advanced Music Theory Engine**: Comprehensive scale, chord, and progression system
- **Wolfram Language Integration**: Advanced analysis and generation using Wolfram Cloud API
- **Procedural Pattern Generation**: AI-powered pattern generation with multiple styles
- **Real-time Analysis**: Harmonic analysis, voice leading, and tension analysis
- **Style System**: Multiple musical styles (Bodzin, Ambient, Cinematic, Jazz, Experimental)
- **Pattern Export/Import**: Seamless integration with existing automation system

## Quick Start

### Option 1: Python Server (Recommended)
```bash
cd site
python3 server.py
```
Then open: http://localhost:8000

### Option 2: Node.js Server
```bash
cd site
npm install
node server.js
```
Then open: http://localhost:8000

### Option 3: Start Server Script
```bash
cd site
chmod +x start-server.sh
./start-server.sh
```

## Procedural Music Theory Usage

1. **Open Interface**: Click the "🎵 Procedural Music Theory" button
2. **Select Style**: Choose from Bodzin, Ambient, Cinematic, Jazz, or Experimental
3. **Adjust Parameters**: Use complexity and randomness sliders
4. **Generate Patterns**: Click "Generate New Patterns"
5. **Export to Sequencer**: Use "Export Patterns" to apply to main sequencer

### Wolfram Integration

For advanced analysis and generation:
1. Get a Wolfram Cloud API key
2. Enter it in the Settings tab
3. Use the Wolfram tab for advanced music theory computations

## Architecture

### Core Modules
- `audio-engine.js`: Audio processing and synthesis
- `ui-controls.js`: User interface controls
- `timeline-renderer.js`: Visual timeline representation
- `pattern-variation-manager.js`: Pattern morphing system
- `preset-manager.js`: Preset save/load system

### Procedural Music Theory Modules
- `music-theory-engine.js`: Core music theory algorithms
- `wolfram-connector.js`: Wolfram Language integration
- `procedural-pattern-generator.js`: Advanced pattern generation
- `procedural-music-ui.js`: User interface for music theory

## Documentation

- [Procedural Music Theory Guide](PROCEDURAL_MUSIC_THEORY.md)
- [Pattern Variations System](PATTERN_VARIATIONS_README.md)
- [Preset Versioning](PRESET_VERSIONING.md)

## Requirements

- Modern web browser with Web Audio API support
- Internet connection (for Wolfram integration)
- Python 3.x or Node.js (for local server)

## Browser Support

- Chrome 66+
- Firefox 60+
- Safari 11.1+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Credits

- **Stephan Bodzin**: Musical inspiration
- **Tone.js**: Audio framework
- **Wolfram Research**: Advanced music theory computation
- **Community**: Contributors and testers
