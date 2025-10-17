# Pattern Variations System

This document describes the pattern variations system implemented for the Bodzin Generator Toolkit.

## Features Implemented

### 1. Randomization System
- **Intensity Control**: Adjusts how much randomization is applied (0-100%)
- **Frequency Control**: Controls how often randomization occurs (0-100%)
- **Dynamic Value Modification**: Randomly adjusts velocity, timing, and intensity of notes

### 2. A/B Pattern Switching
- **Multiple Pattern Sets**: A, B, C, D, E, F patterns for each instrument
- **Switch Probability**: Configurable probability for pattern switching
- **Individual Instrument Control**: Each instrument can have different patterns
- **Real-time Switching**: Patterns can change during playback

### 3. Probability Triggers
- **Skip Probability**: Chance of skipping a note entirely
- **Accent Probability**: Chance of accenting a note with higher velocity
- **Accent Multiplier**: Multiplier for accented notes (1x-3x)

### 4. Pattern Definitions

#### Kick Patterns
- **A**: Standard 4/4 kick pattern
- **B**: Syncopated pattern
- **C**: Double-time pattern
- **D**: Half-time pattern
- **E**: Triplet feel pattern
- **F**: Complex pattern

#### Snare Patterns
- **A**: Standard backbeat
- **B**: More hits
- **C**: Sparse pattern
- **D**: Roll pattern
- **E**: Single hit
- **F**: Roll pattern

#### Hi-Hat Patterns
- **A**: Default groove
- **B**: Dense pattern
- **C**: Sparse pattern
- **D**: Steady pattern
- **E**: Steady 16ths
- **F**: Accented 8ths

#### Bass Patterns
- **A**: Default bassline
- **B**: Dense pattern
- **C**: Sparse pattern
- **D**: Arpeggio pattern
- **E**: Drone pattern
- **F**: Arpeggio pattern

#### Lead Patterns
- **A**: Default melody
- **B**: Dense chords
- **C**: Sparse melody
- **D**: Arpeggio pattern
- **E**: Chord progression
- **F**: Scale run

#### FX Patterns
- **A**: Default FX hits
- **B**: More hits
- **C**: Sparse
- **D**: Quarter notes
- **E**: Silent
- **F**: Constant

### 5. UI Controls

#### Pattern Variations Section
- **Enable Variations**: Toggle pattern variations on/off
- **Random Intensity**: Control randomization intensity (0-100%)
- **Random Frequency**: Control randomization frequency (0-100%)
- **A/B Switch Probability**: Control pattern switching probability (0-100%)
- **Skip Probability**: Control note skipping probability (0-50%)
- **Accent Probability**: Control note accenting probability (0-50%)
- **Accent Multiplier**: Control accent intensity (1x-3x)
- **Reset Patterns**: Reset all patterns to A or randomize all

#### Transport Controls
- **Trigger Variation**: Manually trigger pattern variation

### 6. Visual Indicators
- **Pattern Color Coding**: Different colors for each pattern type
- **Timeline Indicators**: Visual representation of current patterns
- **Instrument Indicators**: Individual pattern indicators for each instrument

### 7. Preset Integration
- **Pattern State Persistence**: Pattern variations are saved in presets
- **State Restoration**: Pattern variations are restored when loading presets
- **Export/Import**: Pattern variations are included in preset files

## Technical Implementation

### Core Functions
- `applyPatternVariations()`: Applies randomization and probability triggers
- `updatePatternVariations()`: Updates patterns during playback
- `triggerPatternVariation()`: Manually triggers pattern changes
- `rebuildSequencesWithVariations()`: Rebuilds sequences with new patterns

### Integration Points
- **Sequence Building**: Patterns are applied during sequence creation
- **Automation Scheduling**: Pattern updates are triggered during playback
- **Control System**: Pattern controls are integrated with the existing control system
- **Preset System**: Pattern variations are included in preset save/load

### Performance Considerations
- **Efficient Pattern Switching**: Patterns are only rebuilt when necessary
- **Minimal CPU Impact**: Randomization is applied only when needed
- **Memory Management**: Patterns are stored efficiently in memory

## Usage

1. **Enable Pattern Variations**: Toggle "Enable Variations" in the Pattern Variations section
2. **Adjust Randomization**: Set intensity and frequency for randomization
3. **Configure Probability Triggers**: Set skip and accent probabilities
4. **Manual Triggering**: Use "Trigger Variation" button for manual pattern changes
5. **Reset Patterns**: Use "Reset Patterns" to return to default or randomize all

## Benefits

- **Dynamic Arrangements**: Creates constantly evolving musical patterns
- **Performance Variation**: Adds human-like variation to electronic music
- **Creative Inspiration**: Provides unexpected musical moments
- **Live Performance**: Enables real-time pattern manipulation
- **Preset Diversity**: Each preset can have unique pattern behaviors

The pattern variations system transforms the static Bodzin Generator into a dynamic, evolving musical instrument that creates unique performances every time it's played.