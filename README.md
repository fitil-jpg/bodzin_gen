# Bodzin Generator Toolkit

A web-based music generator inspired by Stephan Bodzin's style, featuring advanced pattern generation and mathematical integration.

## Features

### Core Functionality
- **Real-time Audio Engine**: Built with Web Audio API and Tone.js
- **Automation System**: 16-step automation tracks with curve editing
- **Pattern Variations**: A/B/C pattern system with morphing capabilities
- **Preset Management**: Save, load, and share presets
- **MIDI Integration**: Full MIDI learn and control support

### Wolfram Integration 🧮
- **Mathematical Pattern Generation**: Generate patterns using mathematical functions
- **Fractal Patterns**: Mandelbrot Set, Julia Set, and other fractal-based patterns
- **Chaos Theory**: Lorenz Attractor, Logistic Map, and chaos-based patterns
- **Harmonic Analysis**: Fourier Series, Wavelet transforms, and spectral patterns
- **Sequential Patterns**: Fibonacci, Prime Numbers, Golden Ratio sequences
- **Cellular Automata**: Rule-based pattern generation
- **Pattern Morphing**: Blend between different mathematical patterns
- **Preset Integration**: Save Wolfram patterns as part of your presets

### Pattern Types Available
- **Sequential**: Fibonacci, Prime Numbers, Golden Ratio
- **Fractals**: Mandelbrot Set, Julia Set
- **Chaos Theory**: Lorenz Attractor, Logistic Map, Chaos Maps
- **Harmonic**: Sine Wave, Cosine Wave, Fourier Series
- **Mathematical**: Exponential, Logarithmic, Polynomial
- **Wavelets**: Morlet, Mexican Hat, Gaussian
- **Cellular**: Cellular Automaton (Rule 30, 110, etc.)

## Getting Started

1. Open `site/index.html` in a modern web browser
2. Click "Start" to begin audio playback
3. Use the automation timeline to create patterns
4. Click the 🧮 Wolfram button to access mathematical pattern generation
5. Visit `demo-wolfram.html` for a comprehensive demo of Wolfram features

## File Structure

```
site/
├── index.html              # Main application
├── demo-wolfram.html       # Wolfram integration demo
├── app-modular.js          # Main application logic
├── modules/
│   ├── wolfram-integration.js      # Wolfram API and mathematical functions
│   ├── wolfram-pattern-manager.js  # Pattern management and storage
│   ├── wolfram-ui.js              # User interface for Wolfram features
│   └── ...                        # Other modules
└── utils/
    ├── constants.js        # Application constants
    └── helpers.js          # Utility functions
```

## Wolfram Integration Usage

```javascript
// Generate a Fibonacci pattern
const wolframManager = new WolframPatternManager(app);
await wolframManager.createPattern('my-fibonacci', 'My Fibonacci', 'fibonacci', {
  start: 0.2,
  end: 0.8,
  scale: 0.6
});

// Apply to automation
wolframManager.applyPatternToAutomation('my-fibonacci');

// Create variations
const variations = await wolframManager.generatePatternVariations('my-fibonacci', 3);

// Morph between patterns
const morphed = await wolframManager.morphPatterns('pattern1', 'pattern2', 0.5);
```

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License - see LICENSE file for details.
