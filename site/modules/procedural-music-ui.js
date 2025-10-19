/**
 * Procedural Music Theory UI Module
 * User interface for advanced music theory and pattern generation
 */

export class ProceduralMusicUI {
  constructor(app) {
    this.app = app;
    this.patternGenerator = null;
    this.musicTheory = null;
    this.wolfram = null;
    this.isVisible = false;
    this.currentTab = 'patterns';
    
    this.initializeUI();
  }

  initializeUI() {
    this.createUI();
    this.bindEvents();
  }

  createUI() {
    // Create main container
    const container = document.createElement('div');
    container.id = 'procedural-music-ui';
    container.className = 'procedural-music-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      display: none;
      overflow-y: auto;
    `;

    // Create header
    const header = this.createHeader();
    container.appendChild(header);

    // Create tab navigation
    const tabs = this.createTabs();
    container.appendChild(tabs);

    // Create content area
    const content = this.createContent();
    container.appendChild(content);

    // Add to page
    document.body.appendChild(container);
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'procedural-music-header';
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const title = document.createElement('h2');
    title.textContent = 'Procedural Music Theory';
    title.style.cssText = `
      margin: 0;
      font-size: 24px;
      font-weight: 300;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 30px;
      cursor: pointer;
      padding: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    closeBtn.addEventListener('click', () => this.hide());

    header.appendChild(title);
    header.appendChild(closeBtn);

    return header;
  }

  createTabs() {
    const tabs = document.createElement('div');
    tabs.className = 'procedural-music-tabs';
    tabs.style.cssText = `
      background: #2c3e50;
      display: flex;
      border-bottom: 1px solid #34495e;
    `;

    const tabNames = [
      { id: 'patterns', name: 'Pattern Generation' },
      { id: 'theory', name: 'Music Theory' },
      { id: 'wolfram', name: 'Wolfram Analysis' },
      { id: 'settings', name: 'Settings' }
    ];

    tabNames.forEach(tab => {
      const tabElement = document.createElement('button');
      tabElement.textContent = tab.name;
      tabElement.className = 'procedural-music-tab';
      tabElement.dataset.tab = tab.id;
      tabElement.style.cssText = `
        background: none;
        border: none;
        color: #ecf0f1;
        padding: 15px 25px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        border-bottom: 3px solid transparent;
      `;

      tabElement.addEventListener('click', () => this.switchTab(tab.id));
      tabs.appendChild(tabElement);
    });

    return tabs;
  }

  createContent() {
    const content = document.createElement('div');
    content.className = 'procedural-music-content';
    content.style.cssText = `
      padding: 30px;
      background: #34495e;
      min-height: calc(100vh - 140px);
    `;

    // Create tab content
    content.appendChild(this.createPatternsTab());
    content.appendChild(this.createTheoryTab());
    content.appendChild(this.createWolframTab());
    content.appendChild(this.createSettingsTab());

    return content;
  }

  createPatternsTab() {
    const tab = document.createElement('div');
    tab.id = 'tab-patterns';
    tab.className = 'procedural-music-tab-content';
    tab.style.cssText = `
      display: none;
      color: #ecf0f1;
    `;

    // Style selector
    const styleSection = this.createSection('Musical Style');
    const styleSelect = document.createElement('select');
    styleSelect.id = 'style-select';
    styleSelect.style.cssText = `
      width: 100%;
      padding: 10px;
      border: 1px solid #7f8c8d;
      border-radius: 4px;
      background: #2c3e50;
      color: #ecf0f1;
      font-size: 14px;
    `;

    const styles = [
      { value: 'bodzin', text: 'Bodzin Style' },
      { value: 'ambient', text: 'Ambient' },
      { value: 'cinematic', text: 'Cinematic' },
      { value: 'jazz', text: 'Jazz' },
      { value: 'experimental', text: 'Experimental' }
    ];

    styles.forEach(style => {
      const option = document.createElement('option');
      option.value = style.value;
      option.textContent = style.text;
      styleSelect.appendChild(option);
    });

    styleSection.appendChild(styleSelect);
    tab.appendChild(styleSection);

    // Complexity controls
    const complexitySection = this.createSection('Pattern Complexity');
    const complexitySlider = this.createSlider('complexity', 0.5, 0, 1, 0.1);
    complexitySection.appendChild(complexitySlider);
    tab.appendChild(complexitySection);

    // Randomness controls
    const randomnessSection = this.createSection('Randomness');
    const randomnessSlider = this.createSlider('randomness', 0.3, 0, 1, 0.1);
    randomnessSection.appendChild(randomnessSlider);
    tab.appendChild(randomnessSection);

    // Pattern generation buttons
    const buttonSection = this.createSection('Actions');
    const generateBtn = this.createButton('Generate New Patterns', () => this.generatePatterns());
    const randomizeBtn = this.createButton('Randomize All', () => this.randomizePatterns());
    const exportBtn = this.createButton('Export Patterns', () => this.exportPatterns());
    const importBtn = this.createButton('Import Patterns', () => this.importPatterns());

    buttonSection.appendChild(generateBtn);
    buttonSection.appendChild(randomizeBtn);
    buttonSection.appendChild(exportBtn);
    buttonSection.appendChild(importBtn);
    tab.appendChild(buttonSection);

    // Pattern preview
    const previewSection = this.createSection('Pattern Preview');
    const previewCanvas = document.createElement('canvas');
    previewCanvas.id = 'pattern-preview';
    previewCanvas.width = 800;
    previewCanvas.height = 400;
    previewCanvas.style.cssText = `
      width: 100%;
      max-width: 800px;
      height: 400px;
      border: 1px solid #7f8c8d;
      border-radius: 4px;
      background: #2c3e50;
    `;
    previewSection.appendChild(previewCanvas);
    tab.appendChild(previewSection);

    return tab;
  }

  createTheoryTab() {
    const tab = document.createElement('div');
    tab.id = 'tab-theory';
    tab.className = 'procedural-music-tab-content';
    tab.style.cssText = `
      display: none;
      color: #ecf0f1;
    `;

    // Scale analysis
    const scaleSection = this.createSection('Scale Analysis');
    const scaleSelect = document.createElement('select');
    scaleSelect.id = 'scale-select';
    scaleSelect.style.cssText = `
      width: 100%;
      padding: 10px;
      border: 1px solid #7f8c8d;
      border-radius: 4px;
      background: #2c3e50;
      color: #ecf0f1;
      font-size: 14px;
    `;

    const scales = [
      'major', 'minor', 'harmonicMinor', 'melodicMinor',
      'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian',
      'pentatonicMajor', 'pentatonicMinor', 'blues', 'wholeTone'
    ];

    scales.forEach(scale => {
      const option = document.createElement('option');
      option.value = scale;
      option.textContent = scale.charAt(0).toUpperCase() + scale.slice(1);
      scaleSelect.appendChild(option);
    });

    scaleSection.appendChild(scaleSelect);
    tab.appendChild(scaleSection);

    // Chord analysis
    const chordSection = this.createSection('Chord Analysis');
    const chordInput = document.createElement('input');
    chordInput.type = 'text';
    chordInput.placeholder = 'Enter chord (e.g., Cmaj7, Dm7, G7)';
    chordInput.style.cssText = `
      width: 100%;
      padding: 10px;
      border: 1px solid #7f8c8d;
      border-radius: 4px;
      background: #2c3e50;
      color: #ecf0f1;
      font-size: 14px;
    `;
    chordSection.appendChild(chordInput);
    tab.appendChild(chordSection);

    // Analysis results
    const resultsSection = this.createSection('Analysis Results');
    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'analysis-results';
    resultsDiv.style.cssText = `
      background: #2c3e50;
      border: 1px solid #7f8c8d;
      border-radius: 4px;
      padding: 15px;
      min-height: 200px;
      font-family: monospace;
      font-size: 12px;
    `;
    resultsSection.appendChild(resultsDiv);
    tab.appendChild(resultsSection);

    return tab;
  }

  createWolframTab() {
    const tab = document.createElement('div');
    tab.id = 'tab-wolfram';
    tab.className = 'procedural-music-tab-content';
    tab.style.cssText = `
      display: none;
      color: #ecf0f1;
    `;

    // Wolfram connection status
    const statusSection = this.createSection('Wolfram Connection');
    const statusDiv = document.createElement('div');
    statusDiv.id = 'wolfram-status';
    statusDiv.style.cssText = `
      padding: 10px;
      border-radius: 4px;
      background: #e74c3c;
      color: white;
      text-align: center;
    `;
    statusDiv.textContent = 'Not Connected';
    statusSection.appendChild(statusDiv);
    tab.appendChild(statusSection);

    // Wolfram code input
    const codeSection = this.createSection('Wolfram Code');
    const codeTextarea = document.createElement('textarea');
    codeTextarea.id = 'wolfram-code';
    codeTextarea.placeholder = 'Enter Wolfram Language code here...';
    codeTextarea.style.cssText = `
      width: 100%;
      height: 200px;
      padding: 10px;
      border: 1px solid #7f8c8d;
      border-radius: 4px;
      background: #2c3e50;
      color: #ecf0f1;
      font-family: monospace;
      font-size: 12px;
      resize: vertical;
    `;
    codeSection.appendChild(codeTextarea);
    tab.appendChild(codeSection);

    // Execute button
    const executeBtn = this.createButton('Execute Code', () => this.executeWolframCode());
    codeSection.appendChild(executeBtn);

    // Results
    const resultsSection = this.createSection('Results');
    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'wolfram-results';
    resultsDiv.style.cssText = `
      background: #2c3e50;
      border: 1px solid #7f8c8d;
      border-radius: 4px;
      padding: 15px;
      min-height: 200px;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
    `;
    resultsSection.appendChild(resultsDiv);
    tab.appendChild(resultsSection);

    return tab;
  }

  createSettingsTab() {
    const tab = document.createElement('div');
    tab.id = 'tab-settings';
    tab.className = 'procedural-music-tab-content';
    tab.style.cssText = `
      display: none;
      color: #ecf0f1;
    `;

    // Wolfram API key
    const apiSection = this.createSection('Wolfram API Configuration');
    const apiInput = document.createElement('input');
    apiInput.type = 'password';
    apiInput.placeholder = 'Enter Wolfram API Key';
    apiInput.id = 'wolfram-api-key';
    apiInput.style.cssText = `
      width: 100%;
      padding: 10px;
      border: 1px solid #7f8c8d;
      border-radius: 4px;
      background: #2c3e50;
      color: #ecf0f1;
      font-size: 14px;
    `;
    apiSection.appendChild(apiInput);
    tab.appendChild(apiSection);

    // Save settings button
    const saveBtn = this.createButton('Save Settings', () => this.saveSettings());
    apiSection.appendChild(saveBtn);

    // Export/Import settings
    const exportSection = this.createSection('Export/Import');
    const exportSettingsBtn = this.createButton('Export Settings', () => this.exportSettings());
    const importSettingsBtn = this.createButton('Import Settings', () => this.importSettings());
    
    exportSection.appendChild(exportSettingsBtn);
    exportSection.appendChild(importSettingsBtn);
    tab.appendChild(exportSection);

    return tab;
  }

  createSection(title) {
    const section = document.createElement('div');
    section.className = 'procedural-music-section';
    section.style.cssText = `
      margin-bottom: 30px;
      padding: 20px;
      background: #2c3e50;
      border-radius: 8px;
      border: 1px solid #34495e;
    `;

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.cssText = `
      margin: 0 0 15px 0;
      color: #3498db;
      font-size: 16px;
      font-weight: 500;
    `;

    section.appendChild(titleElement);
    return section;
  }

  createSlider(id, value, min, max, step) {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
    `;

    const label = document.createElement('label');
    label.textContent = id.charAt(0).toUpperCase() + id.slice(1);
    label.style.cssText = `
      min-width: 100px;
      font-size: 14px;
    `;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = id;
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;
    slider.style.cssText = `
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: #7f8c8d;
      outline: none;
    `;

    const valueDisplay = document.createElement('span');
    valueDisplay.id = `${id}-value`;
    valueDisplay.textContent = value;
    valueDisplay.style.cssText = `
      min-width: 40px;
      text-align: right;
      font-size: 14px;
      color: #3498db;
    `;

    slider.addEventListener('input', (e) => {
      valueDisplay.textContent = e.target.value;
    });

    container.appendChild(label);
    container.appendChild(slider);
    container.appendChild(valueDisplay);

    return container;
  }

  createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin: 5px;
      transition: all 0.3s ease;
    `;

    button.addEventListener('click', onClick);
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = 'none';
    });

    return button;
  }

  bindEvents() {
    // Tab switching
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('procedural-music-tab')) {
        this.switchTab(e.target.dataset.tab);
      }
    });

    // Style change
    const styleSelect = document.getElementById('style-select');
    if (styleSelect) {
      styleSelect.addEventListener('change', (e) => {
        if (this.patternGenerator) {
          this.patternGenerator.setStyle(e.target.value);
          this.updatePatternPreview();
        }
      });
    }

    // Complexity change
    const complexitySlider = document.getElementById('complexity');
    if (complexitySlider) {
      complexitySlider.addEventListener('input', (e) => {
        if (this.patternGenerator) {
          this.patternGenerator.setComplexity(parseFloat(e.target.value));
          this.updatePatternPreview();
        }
      });
    }

    // Randomness change
    const randomnessSlider = document.getElementById('randomness');
    if (randomnessSlider) {
      randomnessSlider.addEventListener('input', (e) => {
        if (this.patternGenerator) {
          this.patternGenerator.setRandomness(parseFloat(e.target.value));
          this.updatePatternPreview();
        }
      });
    }
  }

  switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.procedural-music-tab-content').forEach(tab => {
      tab.style.display = 'none';
    });

    // Remove active class from all tabs
    document.querySelectorAll('.procedural-music-tab').forEach(tab => {
      tab.style.borderBottomColor = 'transparent';
      tab.style.color = '#ecf0f1';
    });

    // Show selected tab
    const selectedTab = document.getElementById(`tab-${tabId}`);
    if (selectedTab) {
      selectedTab.style.display = 'block';
    }

    // Add active class to selected tab
    const selectedTabButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (selectedTabButton) {
      selectedTabButton.style.borderBottomColor = '#3498db';
      selectedTabButton.style.color = '#3498db';
    }

    this.currentTab = tabId;
  }

  show() {
    const container = document.getElementById('procedural-music-ui');
    if (container) {
      container.style.display = 'block';
      this.isVisible = true;
      this.updateWolframStatus();
    }
  }

  hide() {
    const container = document.getElementById('procedural-music-ui');
    if (container) {
      container.style.display = 'none';
      this.isVisible = false;
    }
  }

  setPatternGenerator(generator) {
    this.patternGenerator = generator;
  }

  setMusicTheory(musicTheory) {
    this.musicTheory = musicTheory;
  }

  setWolfram(wolfram) {
    this.wolfram = wolfram;
  }

  // Pattern generation methods
  generatePatterns() {
    if (this.patternGenerator) {
      this.patternGenerator.generateDefaultPatterns();
      this.updatePatternPreview();
    }
  }

  randomizePatterns() {
    if (this.patternGenerator) {
      this.patternGenerator.setRandomness(1.0);
      this.patternGenerator.generateDefaultPatterns();
      this.updatePatternPreview();
    }
  }

  exportPatterns() {
    if (this.patternGenerator) {
      const data = this.patternGenerator.exportPatterns();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'procedural-patterns.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  importPatterns() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (this.patternGenerator) {
              this.patternGenerator.importPatterns(data);
              this.updatePatternPreview();
            }
          } catch (error) {
            console.error('Error importing patterns:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  updatePatternPreview() {
    const canvas = document.getElementById('pattern-preview');
    if (!canvas || !this.patternGenerator) return;

    const ctx = canvas.getContext('2d');
    const patterns = this.patternGenerator.getPatterns();
    
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw patterns
    const instruments = Object.keys(patterns);
    const stepWidth = canvas.width / 16;
    const instrumentHeight = canvas.height / instruments.length;

    instruments.forEach((instrument, i) => {
      const pattern = patterns[instrument];
      const y = i * instrumentHeight;
      
      // Draw instrument name
      ctx.fillStyle = '#3498db';
      ctx.font = '12px Arial';
      ctx.fillText(instrument, 10, y + 20);

      // Draw pattern
      if (pattern.pattern) {
        pattern.pattern.forEach((beat, step) => {
          if (beat > 0) {
            const x = step * stepWidth;
            const height = beat * (instrumentHeight - 20);
            const alpha = beat === 1 ? 1 : beat;
            
            ctx.fillStyle = `rgba(52, 152, 219, ${alpha})`;
            ctx.fillRect(x + 2, y + 25, stepWidth - 4, height);
          }
        });
      }
    });
  }

  updateWolframStatus() {
    const statusDiv = document.getElementById('wolfram-status');
    if (statusDiv && this.wolfram) {
      if (this.wolfram.isConnected) {
        statusDiv.textContent = 'Connected to Wolfram';
        statusDiv.style.background = '#27ae60';
      } else {
        statusDiv.textContent = 'Not Connected (Offline Mode)';
        statusDiv.style.background = '#e74c3c';
      }
    }
  }

  executeWolframCode() {
    const codeTextarea = document.getElementById('wolfram-code');
    const resultsDiv = document.getElementById('wolfram-results');
    
    if (!codeTextarea || !resultsDiv || !this.wolfram) return;

    const code = codeTextarea.value.trim();
    if (!code) return;

    resultsDiv.textContent = 'Executing...';
    
    this.wolfram.executeWolframCode(code)
      .then(result => {
        resultsDiv.textContent = JSON.stringify(result, null, 2);
      })
      .catch(error => {
        resultsDiv.textContent = `Error: ${error.message}`;
      });
  }

  saveSettings() {
    const apiKey = document.getElementById('wolfram-api-key').value;
    if (apiKey && this.wolfram) {
      this.wolfram.apiKey = apiKey;
      this.wolfram.isConnected = true;
      this.updateWolframStatus();
    }
  }

  exportSettings() {
    const settings = {
      wolframApiKey: this.wolfram?.apiKey || '',
      currentStyle: this.patternGenerator?.currentStyle || 'bodzin',
      complexity: this.patternGenerator?.complexity || 0.5,
      randomness: this.patternGenerator?.randomness || 0.3
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'procedural-music-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target.result);
            if (settings.wolframApiKey) {
              document.getElementById('wolfram-api-key').value = settings.wolframApiKey;
            }
            if (this.patternGenerator) {
              if (settings.currentStyle) this.patternGenerator.setStyle(settings.currentStyle);
              if (settings.complexity !== undefined) this.patternGenerator.setComplexity(settings.complexity);
              if (settings.randomness !== undefined) this.patternGenerator.setRandomness(settings.randomness);
            }
          } catch (error) {
            console.error('Error importing settings:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
}