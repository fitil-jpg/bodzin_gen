# Pattern Variations System

This document describes the pattern variation system added to the Bodzin Generator Toolkit, which provides randomization, A/B pattern switching, and probability triggers for creating dynamic musical arrangements.

## Overview

The pattern variation system adds several layers of musical variation to the existing sequencer:

1. **Randomization** - Adds controlled randomness to pattern playback
2. **A/B Pattern Switching** - Automatically switches between different pattern variations
3. **Probability Triggers** - Randomly skips or accents steps based on probability
4. **Extended Pattern Library** - 6 different pattern variations (A-F) for each instrument

## Features

### 1. Randomization System
- **Random Intensity**: Controls how much randomization affects patterns (0-100%)
- **Random Frequency**: Controls how often randomization occurs (0-100%)
- Applies subtle variations to velocity, timing, and pattern elements

### 2. A/B Pattern Switching
- **Switch Probability**: Probability of switching between patterns (0-100%)
- **Current Pattern**: Tracks which pattern is currently active
- **Individual Instrument Control**: Each instrument can have different patterns
- **Automatic Switching**: Patterns change during playback based on probability

### 3. Probability Triggers
- **Skip Probability**: Randomly skips steps (0-50%)
- **Accent Probability**: Randomly accents steps with higher velocity (0-50%)
- **Accent Multiplier**: Controls how much accenting affects velocity (1x-3x)

### 4. Extended Pattern Library
Each instrument now has 6 pattern variations:

#### Kick Patterns
- **A**: Default 4/4 kick pattern
- **B**: Syncopated kick pattern
- **C**: Double time kick pattern
- **D**: Half time kick pattern
- **E**: Triplet feel kick pattern
- **F**: Complex kick pattern

#### Snare Patterns
- **A**: Default snare on 2 and 4
- **B**: More frequent snare hits
- **C**: Sparse snare pattern
- **D**: Roll pattern
- **E**: Single hit pattern
- **F**: Roll pattern variation

#### Hi-Hat Patterns
- **A**: Default hi-hat pattern with variations
- **B**: Dense hi-hat pattern
- **C**: Sparse hi-hat pattern
- **D**: Steady hi-hat pattern
- **E**: Steady 16th note pattern
- **F**: Accented 8th note pattern

#### Bass Patterns
- **A**: Default bass line
- **B**: Dense bass pattern
- **C**: Sparse bass pattern
- **D**: Arpeggio pattern
- **E**: Drone pattern
- **F**: Arpeggio variation

#### Lead Patterns
- **A**: Default lead melody
- **B**: Dense lead pattern
- **C**: Sparse lead pattern
- **D**: Arpeggio pattern
- **E**: Chord progression
- **F**: Scale run pattern

#### FX Patterns
- **A**: Default FX pattern
- **B**: More frequent FX hits
- **C**: Sparse FX pattern
- **D**: Quarter note FX pattern
- **E**: Silent pattern
- **F**: Constant FX pattern

## Controls

### Pattern Variations Section
- **Enable Variations**: Master toggle for the entire system
- **Random Intensity**: Controls randomization strength (0-100%)
- **Random Frequency**: Controls how often randomization occurs (0-100%)
- **A/B Switch Prob**: Probability of pattern switching (0-100%)
- **Skip Probability**: Probability of skipping steps (0-50%)
- **Accent Probability**: Probability of accenting steps (0-50%)
- **Accent Multiplier**: Multiplier for accented steps (1x-3x)
- **Reset Patterns**: Reset all patterns to A or randomize all

### Manual Controls
- **Trigger Variation Button**: Manually trigger pattern variations
- **Pattern Reset**: Reset patterns to default or randomize

## Visual Indicators

The timeline now shows visual indicators for pattern variations:
- **Pattern Color Bars**: Top of timeline shows current pattern colors
- **Instrument Indicators**: Individual instrument pattern indicators
- **Color Coding**: Each pattern (A-F) has a unique color

## Technical Implementation

### Core Functions
- `applyPatternVariations()`: Applies randomization and probability triggers
- `updatePatternVariations()`: Updates patterns during playback
- `triggerPatternVariation()`: Manually triggers pattern changes
- `rebuildSequencesWithVariations()`: Rebuilds sequences with new patterns

### Data Structures
- `PATTERN_VARIATIONS`: Basic pattern library (A-D)
- `EXTENDED_PATTERN_VARIATIONS`: Extended pattern library (E-F)
- `PATTERN_VARIATION_CONFIG`: Configuration for the system
- `app.patternVariations`: Runtime state and settings

### Integration
- Seamlessly integrates with existing Tone.js sequences
- Preserves all existing functionality
- Adds pattern variation state to presets
- Works with MIDI control and automation

## Usage Examples

### Basic Setup
1. Enable pattern variations in the controls
2. Set randomization intensity to 30%
3. Set A/B switch probability to 20%
4. Start playback to hear variations

### Advanced Configuration
1. Enable all pattern variation features
2. Set high randomization intensity (70%)
3. Set frequent pattern switching (40%)
4. Add probability triggers for accents (25%)
5. Use manual trigger button for live control

### Live Performance
1. Use the "Trigger Variation" button for live pattern changes
2. Adjust controls in real-time during playback
3. Save different variation presets for different sections
4. Use MIDI control for hands-free operation

## Preset Integration

Pattern variations are fully integrated with the preset system:
- **Save**: Pattern variation settings are saved with presets
- **Load**: Pattern variations are restored when loading presets
- **Export**: Pattern variations are included in exported presets
- **Import**: Pattern variations are imported with preset files

## Performance Considerations

- Pattern variations add minimal CPU overhead
- Randomization calculations are lightweight
- Pattern switching only occurs when needed
- Visual indicators are rendered efficiently
- Memory usage is minimal for pattern storage

## Future Enhancements

Potential future improvements:
- More pattern variations (G, H, I, J)
- Pattern morphing between variations
- Section-specific pattern variations
- MIDI pattern triggering
- Pattern variation automation
- Custom pattern creation interface