/**
 * Harmonic Analysis UI Module
 * Provides user interface for harmonic analysis and key management
 */

export class HarmonicAnalysisUI {
  constructor(app) {
    this.app = app;
    this.harmonicAnalysis = app.harmonicAnalysis;
    this.scaleKeyManager = app.scaleKeyManager;
    this.chordProgressionEngine = app.chordProgressionEngine;
    this.musicTheoryUtils = app.musicTheoryUtils;
    
    this.isOpen = false;
    this.currentAnalysis = null;
    this.selectedKey = 'C';
    this.selectedMode = 'major';
    
    this.createUI();
    this.setupEventListeners();
  }

  /**
   * Create the harmonic analysis UI
   */
  createUI() {
    const container = document.createElement('div');
    container.id = 'harmonic-analysis-panel';
    container.className = 'panel harmonic-analysis-panel';
    container.style.display = 'none';
    
    container.innerHTML = `
      <div class="panel-header">
        <h3>Harmonic Analysis</h3>
        <button class="close-btn" id="close-harmonic-analysis">&times;</button>
      </div>
      
      <div class="panel-content">
        <!-- Key and Scale Selection -->
        <div class="section">
          <h4>Key & Scale</h4>
          <div class="key-selection">
            <div class="control-group">
              <label for="key-select">Key:</label>
              <select id="key-select" class="control-select">
                <option value="C">C</option>
                <option value="C#">C#</option>
                <option value="D">D</option>
                <option value="D#">D#</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="F#">F#</option>
                <option value="G">G</option>
                <option value="G#">G#</option>
                <option value="A">A</option>
                <option value="A#">A#</option>
                <option value="B">B</option>
              </select>
            </div>
            
            <div class="control-group">
              <label for="mode-select">Mode:</label>
              <select id="mode-select" class="control-select">
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="dorian">Dorian</option>
                <option value="phrygian">Phrygian</option>
                <option value="lydian">Lydian</option>
                <option value="mixolydian">Mixolydian</option>
                <option value="locrian">Locrian</option>
                <option value="harmonic_minor">Harmonic Minor</option>
                <option value="melodic_minor">Melodic Minor</option>
                <option value="pentatonic_major">Major Pentatonic</option>
                <option value="pentatonic_minor">Minor Pentatonic</option>
                <option value="blues">Blues Scale</option>
              </select>
            </div>
            
            <button id="apply-key" class="btn btn-primary">Apply Key</button>
          </div>
          
          <div class="scale-display">
            <h5>Current Scale:</h5>
            <div id="scale-notes" class="scale-notes"></div>
          </div>
        </div>
        
        <!-- Chord Progression Generator -->
        <div class="section">
          <h4>Chord Progression</h4>
          <div class="progression-controls">
            <div class="control-group">
              <label for="progression-style">Style:</label>
              <select id="progression-style" class="control-select">
                <option value="common">Common</option>
                <option value="jazz">Jazz</option>
                <option value="blues">Blues</option>
                <option value="classical">Classical</option>
                <option value="modal">Modal</option>
              </select>
            </div>
            
            <div class="control-group">
              <label for="progression-length">Length:</label>
              <input type="number" id="progression-length" class="control-input" value="4" min="2" max="8">
            </div>
            
            <button id="generate-progression" class="btn btn-primary">Generate</button>
            <button id="clear-progression" class="btn btn-secondary">Clear</button>
          </div>
          
          <div class="progression-display">
            <h5>Current Progression:</h5>
            <div id="progression-chords" class="progression-chords"></div>
          </div>
        </div>
        
        <!-- Harmonic Analysis Results -->
        <div class="section">
          <h4>Analysis Results</h4>
          <div class="analysis-controls">
            <button id="analyze-audio" class="btn btn-primary">Analyze Audio</button>
            <button id="analyze-progression" class="btn btn-secondary">Analyze Progression</button>
          </div>
          
          <div class="analysis-results">
            <div id="chord-analysis" class="analysis-section">
              <h6>Chord Analysis</h6>
              <div id="chord-info"></div>
            </div>
            
            <div id="key-analysis" class="analysis-section">
              <h6>Key Analysis</h6>
              <div id="key-info"></div>
            </div>
            
            <div id="harmonic-content" class="analysis-section">
              <h6>Harmonic Content</h6>
              <div id="harmonic-info"></div>
            </div>
          </div>
        </div>
        
        <!-- Scale Visualizer -->
        <div class="section">
          <h4>Scale Visualizer</h4>
          <div class="scale-visualizer">
            <canvas id="scale-canvas" width="400" height="200"></canvas>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    this.container = container;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Close button
    document.getElementById('close-harmonic-analysis').addEventListener('click', () => {
      this.close();
    });
    
    // Key selection
    document.getElementById('key-select').addEventListener('change', (e) => {
      this.selectedKey = e.target.value;
      this.updateScaleDisplay();
    });
    
    document.getElementById('mode-select').addEventListener('change', (e) => {
      this.selectedMode = e.target.value;
      this.updateScaleDisplay();
    });
    
    document.getElementById('apply-key').addEventListener('click', () => {
      this.applyKey();
    });
    
    // Progression controls
    document.getElementById('generate-progression').addEventListener('click', () => {
      this.generateProgression();
    });
    
    document.getElementById('clear-progression').addEventListener('click', () => {
      this.clearProgression();
    });
    
    // Analysis controls
    document.getElementById('analyze-audio').addEventListener('click', () => {
      this.analyzeAudio();
    });
    
    document.getElementById('analyze-progression').addEventListener('click', () => {
      this.analyzeProgression();
    });
    
    // Initialize display
    this.updateScaleDisplay();
  }

  /**
   * Show the harmonic analysis panel
   */
  show() {
    this.container.style.display = 'block';
    this.isOpen = true;
    this.updateScaleDisplay();
  }

  /**
   * Hide the harmonic analysis panel
   */
  close() {
    this.container.style.display = 'none';
    this.isOpen = false;
  }

  /**
   * Toggle the harmonic analysis panel
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.show();
    }
  }

  /**
   * Update scale display
   */
  updateScaleDisplay() {
    const scale = this.scaleKeyManager.getScale(this.selectedKey, this.selectedMode);
    const scaleNotesEl = document.getElementById('scale-notes');
    
    scaleNotesEl.innerHTML = scale.map(note => 
      `<span class="scale-note">${note}</span>`
    ).join(' ');
    
    // Update scale visualizer
    this.updateScaleVisualizer(scale);
  }

  /**
   * Update scale visualizer canvas
   */
  updateScaleVisualizer(scale) {
    const canvas = document.getElementById('scale-canvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw piano keys
    this.drawPianoKeys(ctx, canvas.width, canvas.height, scale);
  }

  /**
   * Draw piano keys on canvas
   */
  drawPianoKeys(ctx, width, height, scale) {
    const keyWidth = width / 12;
    const keyHeight = height * 0.7;
    const y = height * 0.15;
    
    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
    
    // Draw white keys
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    
    whiteKeys.forEach((note, index) => {
      const x = index * keyWidth;
      const isInScale = scale.includes(note);
      
      ctx.fillStyle = isInScale ? '#4CAF50' : '#ffffff';
      ctx.fillRect(x, y, keyWidth, keyHeight);
      ctx.strokeRect(x, y, keyWidth, keyHeight);
      
      // Draw note name
      ctx.fillStyle = isInScale ? '#ffffff' : '#333333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(note, x + keyWidth / 2, y + keyHeight / 2 + 4);
    });
    
    // Draw black keys
    ctx.fillStyle = '#333333';
    blackKeys.forEach((note, index) => {
      const x = (index + 0.7) * keyWidth;
      const isInScale = scale.includes(note);
      
      ctx.fillStyle = isInScale ? '#8BC34A' : '#333333';
      ctx.fillRect(x, y, keyWidth * 0.6, keyHeight * 0.6);
      
      // Draw note name
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(note, x + keyWidth * 0.3, y + keyHeight * 0.3 + 3);
    });
  }

  /**
   * Apply selected key and mode
   */
  applyKey() {
    this.scaleKeyManager.setKey(this.selectedKey, this.selectedMode);
    this.harmonicAnalysis.setKey(this.selectedKey, this.selectedMode);
    
    // Update UI
    this.updateScaleDisplay();
    this.showStatus(`Key changed to ${this.selectedKey} ${this.selectedMode}`);
  }

  /**
   * Generate chord progression
   */
  generateProgression() {
    const style = document.getElementById('progression-style').value;
    const length = parseInt(document.getElementById('progression-length').value);
    
    const progression = this.chordProgressionEngine.generateProgression(
      this.selectedKey, 
      this.selectedMode, 
      style, 
      length
    );
    
    this.updateProgressionDisplay(progression);
    this.showStatus(`Generated ${style} progression in ${this.selectedKey} ${this.selectedMode}`);
  }

  /**
   * Update progression display
   */
  updateProgressionDisplay(progression) {
    const progressionChordsEl = document.getElementById('progression-chords');
    
    progressionChordsEl.innerHTML = progression.map((chord, index) => {
      if (!chord) return `<div class="chord-slot empty">Empty</div>`;
      
      const chordSymbol = this.musicTheoryUtils.getChordSymbol(chord.root, chord.type);
      return `
        <div class="chord-slot">
          <div class="chord-symbol">${chordSymbol}</div>
          <div class="chord-notes">${chord.notes.join(' ')}</div>
          <div class="chord-degree">${chord.romanNumeral}</div>
        </div>
      `;
    }).join('');
  }

  /**
   * Clear progression
   */
  clearProgression() {
    this.chordProgressionEngine.clearProgression();
    document.getElementById('progression-chords').innerHTML = '';
    this.showStatus('Progression cleared');
  }

  /**
   * Analyze current audio
   */
  async analyzeAudio() {
    try {
      // Get audio data from the app's audio engine
      const audioData = this.app.audioEngine?.getCurrentAudioData();
      if (!audioData) {
        this.showStatus('No audio data available for analysis');
        return;
      }
      
      const analysis = this.harmonicAnalysis.analyzeHarmonicContent(audioData, 44100);
      this.displayAnalysisResults(analysis);
      this.showStatus('Audio analysis completed');
      
    } catch (error) {
      console.error('Audio analysis failed:', error);
      this.showStatus('Audio analysis failed');
    }
  }

  /**
   * Analyze current progression
   */
  analyzeProgression() {
    const progression = this.chordProgressionEngine.getCurrentProgression();
    if (!progression || progression.length === 0) {
      this.showStatus('No progression to analyze');
      return;
    }
    
    const analysis = this.chordProgressionEngine.analyzeProgression(progression);
    this.displayProgressionAnalysis(analysis);
    this.showStatus('Progression analysis completed');
  }

  /**
   * Display analysis results
   */
  displayAnalysisResults(analysis) {
    const chordInfoEl = document.getElementById('chord-info');
    const keyInfoEl = document.getElementById('key-info');
    const harmonicInfoEl = document.getElementById('harmonic-info');
    
    // Chord analysis
    if (analysis.chord) {
      chordInfoEl.innerHTML = `
        <div class="analysis-item">
          <strong>Root:</strong> ${analysis.chord.root}
        </div>
        <div class="analysis-item">
          <strong>Type:</strong> ${analysis.chord.type}
        </div>
        <div class="analysis-item">
          <strong>Notes:</strong> ${analysis.chord.notes.join(', ')}
        </div>
        <div class="analysis-item">
          <strong>Intervals:</strong> ${analysis.chord.intervals.join(', ')}
        </div>
      `;
    } else {
      chordInfoEl.innerHTML = '<div class="analysis-item">No chord detected</div>';
    }
    
    // Key analysis
    const currentKey = this.scaleKeyManager.getCurrentKey();
    keyInfoEl.innerHTML = `
      <div class="analysis-item">
        <strong>Current Key:</strong> ${currentKey.key} ${currentKey.mode}
      </div>
      <div class="analysis-item">
        <strong>Scale:</strong> ${currentKey.scale.join(', ')}
      </div>
    `;
    
    // Harmonic content
    harmonicInfoEl.innerHTML = `
      <div class="analysis-item">
        <strong>Harmonicity:</strong> ${(analysis.harmonicity * 100).toFixed(1)}%
      </div>
      <div class="analysis-item">
        <strong>Peaks Detected:</strong> ${analysis.peaks.length}
      </div>
    `;
  }

  /**
   * Display progression analysis
   */
  displayProgressionAnalysis(analysis) {
    const chordInfoEl = document.getElementById('chord-info');
    
    chordInfoEl.innerHTML = `
      <div class="analysis-item">
        <strong>Tonic Chords:</strong> ${analysis.tonicChords.length}
      </div>
      <div class="analysis-item">
        <strong>Dominant Chords:</strong> ${analysis.dominantChords.length}
      </div>
      <div class="analysis-item">
        <strong>Subdominant Chords:</strong> ${analysis.subdominantChords.length}
      </div>
      <div class="analysis-item">
        <strong>Cadences:</strong> ${analysis.cadences.length}
      </div>
      <div class="analysis-item">
        <strong>Voice Leading Smoothness:</strong> ${(analysis.voiceLeading.reduce((sum, vl) => sum + vl.smoothness, 0) / analysis.voiceLeading.length * 100).toFixed(1)}%
      </div>
    `;
  }

  /**
   * Show status message
   */
  showStatus(message) {
    if (this.app.ui && this.app.ui.setStatus) {
      this.app.ui.setStatus(message);
    } else {
      console.log('Status:', message);
    }
  }

  /**
   * Update UI when key changes externally
   */
  updateFromExternalKey(key, mode) {
    this.selectedKey = key;
    this.selectedMode = mode;
    
    document.getElementById('key-select').value = key;
    document.getElementById('mode-select').value = mode;
    
    this.updateScaleDisplay();
  }

  /**
   * Get current analysis data
   */
  getCurrentAnalysis() {
    return {
      key: this.selectedKey,
      mode: this.selectedMode,
      scale: this.scaleKeyManager.getScale(this.selectedKey, this.selectedMode),
      progression: this.chordProgressionEngine.getCurrentProgression(),
      analysis: this.currentAnalysis
    };
  }
}