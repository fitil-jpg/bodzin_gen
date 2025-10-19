import { WolframPatternManager } from './wolfram-pattern-manager.js';

export class WolframUI {
  constructor(app) {
    this.app = app;
    this.wolframManager = new WolframPatternManager(app);
    this.isVisible = false;
    this.currentPatternType = 'fibonacci';
    this.currentParams = {};
    
    this.createUI();
    this.bindEvents();
  }

  createUI() {
    // Create main Wolfram panel
    this.panel = document.createElement('div');
    this.panel.className = 'wolfram-panel';
    this.panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      background: rgba(20, 20, 20, 0.95);
      border: 1px solid #333;
      border-radius: 8px;
      padding: 20px;
      z-index: 1000;
      font-family: 'Courier New', monospace;
      color: #fff;
      display: none;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;

    this.panel.innerHTML = `
      <div class="wolfram-header">
        <h3 style="margin: 0 0 15px 0; color: #4CAF50; font-size: 18px;">
          🧮 Wolfram Patterns
        </h3>
        <button class="close-btn" style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
        ">×</button>
      </div>
      
      <div class="pattern-type-selector">
        <label style="display: block; margin-bottom: 8px; color: #ccc;">Pattern Type:</label>
        <select id="wolfram-pattern-type" style="
          width: 100%;
          padding: 8px;
          background: #333;
          border: 1px solid #555;
          border-radius: 4px;
          color: #fff;
          font-size: 14px;
        ">
          <option value="fibonacci">Fibonacci Sequence</option>
          <option value="prime">Prime Numbers</option>
          <option value="goldenRatio">Golden Ratio</option>
          <option value="mandelbrot">Mandelbrot Set</option>
          <option value="julia">Julia Set</option>
          <option value="lorenz">Lorenz Attractor</option>
          <option value="logistic">Logistic Map</option>
          <option value="sine">Sine Wave</option>
          <option value="cosine">Cosine Wave</option>
          <option value="exponential">Exponential</option>
          <option value="logarithmic">Logarithmic</option>
          <option value="polynomial">Polynomial</option>
          <option value="fourier">Fourier Series</option>
          <option value="wavelet">Wavelet</option>
          <option value="chaos">Chaos Theory</option>
          <option value="cellular">Cellular Automaton</option>
        </select>
      </div>
      
      <div class="pattern-params" id="wolfram-pattern-params" style="margin-top: 15px;">
        <!-- Dynamic parameter controls will be inserted here -->
      </div>
      
      <div class="pattern-actions" style="margin-top: 20px;">
        <button id="generate-pattern" style="
          width: 100%;
          padding: 10px;
          background: #4CAF50;
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 10px;
        ">Generate Pattern</button>
        
        <button id="generate-variations" style="
          width: 100%;
          padding: 10px;
          background: #2196F3;
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 10px;
        ">Generate Variations</button>
        
        <button id="morph-patterns" style="
          width: 100%;
          padding: 10px;
          background: #FF9800;
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 10px;
        ">Morph Patterns</button>
      </div>
      
      <div class="pattern-library" style="margin-top: 20px;">
        <h4 style="margin: 0 0 10px 0; color: #ccc; font-size: 14px;">Pattern Library</h4>
        <div id="wolfram-pattern-list" style="
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 10px;
          background: #222;
        ">
          <!-- Pattern list will be populated here -->
        </div>
      </div>
      
      <div class="wolfram-info" style="margin-top: 15px; font-size: 12px; color: #888;">
        <div>Patterns generated using mathematical functions</div>
        <div>Click patterns to apply to automation</div>
      </div>
    `;

    document.body.appendChild(this.panel);
    this.updateParameterControls();
    this.updatePatternList();
  }

  bindEvents() {
    // Close button
    this.panel.querySelector('.close-btn').addEventListener('click', () => {
      this.hide();
    });

    // Pattern type selector
    this.panel.querySelector('#wolfram-pattern-type').addEventListener('change', (e) => {
      this.currentPatternType = e.target.value;
      this.updateParameterControls();
    });

    // Generate pattern button
    this.panel.querySelector('#generate-pattern').addEventListener('click', () => {
      this.generatePattern();
    });

    // Generate variations button
    this.panel.querySelector('#generate-variations').addEventListener('click', () => {
      this.generateVariations();
    });

    // Morph patterns button
    this.panel.querySelector('#morph-patterns').addEventListener('click', () => {
      this.showMorphDialog();
    });
  }

  updateParameterControls() {
    const paramsContainer = this.panel.querySelector('#wolfram-pattern-params');
    const metadata = this.wolframManager.getPatternMetadata(this.currentPatternType);
    
    if (!metadata) {
      paramsContainer.innerHTML = '<div style="color: #888;">No parameters available</div>';
      return;
    }

    let html = '<h4 style="margin: 0 0 10px 0; color: #ccc; font-size: 14px;">Parameters:</h4>';
    
    // Create parameter controls based on pattern type
    switch (this.currentPatternType) {
      case 'fibonacci':
        html += this.createRangeControl('scale', 'Scale', 0.1, 2, 1, 0.1);
        html += this.createRangeControl('offset', 'Offset', -0.5, 0.5, 0, 0.1);
        html += this.createRangeControl('start', 'Start', 0, 1, 0.2, 0.1);
        html += this.createRangeControl('end', 'End', 0, 1, 0.8, 0.1);
        break;
        
      case 'goldenRatio':
        html += this.createRangeControl('frequency', 'Frequency', 0.1, 5, 2, 0.1);
        html += this.createRangeControl('phase', 'Phase', 0, Math.PI * 2, 0, 0.1);
        html += this.createRangeControl('start', 'Start', 0, 1, 0.1, 0.1);
        html += this.createRangeControl('end', 'End', 0, 1, 0.9, 0.1);
        break;
        
      case 'lorenz':
        html += this.createRangeControl('sigma', 'Sigma', 5, 20, 10, 0.5);
        html += this.createRangeControl('rho', 'Rho', 15, 40, 28, 0.5);
        html += this.createRangeControl('beta', 'Beta', 1, 5, 8/3, 0.1);
        html += this.createRangeControl('start', 'Start', 0, 1, 0.3, 0.1);
        html += this.createRangeControl('end', 'End', 0, 1, 0.7, 0.1);
        break;
        
      case 'fourier':
        html += this.createTextControl('frequencies', 'Frequencies', '1,2,3,5,8');
        html += this.createTextControl('amplitudes', 'Amplitudes', '1,0.7,0.5,0.3,0.2');
        html += this.createTextControl('phases', 'Phases', '0,0.785,1.57,3.14,4.71');
        html += this.createRangeControl('start', 'Start', 0, 1, 0.2, 0.1);
        html += this.createRangeControl('end', 'End', 0, 1, 0.8, 0.1);
        break;
        
      case 'mandelbrot':
        html += this.createRangeControl('maxIterations', 'Max Iterations', 10, 100, 50, 5);
        html += this.createRangeControl('zoom', 'Zoom', 0.5, 3, 2, 0.1);
        html += this.createRangeControl('centerX', 'Center X', -1, 1, -0.5, 0.1);
        html += this.createRangeControl('centerY', 'Center Y', -1, 1, 0, 0.1);
        html += this.createRangeControl('start', 'Start', 0, 1, 0.1, 0.1);
        html += this.createRangeControl('end', 'End', 0, 1, 0.9, 0.1);
        break;
        
      case 'logistic':
        html += this.createRangeControl('r', 'R Parameter', 3, 4, 3.7, 0.01);
        html += this.createRangeControl('x0', 'Initial X', 0, 1, 0.5, 0.01);
        html += this.createRangeControl('start', 'Start', 0, 1, 0, 0.1);
        html += this.createRangeControl('end', 'End', 0, 1, 1, 0.1);
        break;
        
      case 'sine':
      case 'cosine':
        html += this.createRangeControl('frequency', 'Frequency', 0.1, 5, 1, 0.1);
        html += this.createRangeControl('amplitude', 'Amplitude', 0.1, 2, 1, 0.1);
        html += this.createRangeControl('phase', 'Phase', 0, Math.PI * 2, 0, 0.1);
        html += this.createRangeControl('harmonics', 'Harmonics', 1, 10, 1, 1);
        html += this.createRangeControl('start', 'Start', 0, 1, 0, 0.1);
        html += this.createRangeControl('end', 'End', 0, 1, 1, 0.1);
        break;
        
      case 'exponential':
        html += this.createRangeControl('base', 'Base', 1.1, 5, Math.E, 0.1);
        html += this.createRangeControl('scale', 'Scale', 0.1, 3, 1, 0.1);
        html += this.createRangeControl('offset', 'Offset', -2, 2, 0, 0.1);
        html += this.createRangeControl('start', 'Start', 0, 1, 0, 0.1);
        html += this.createRangeControl('end', 'End', 0, 1, 1, 0.1);
        break;
        
      case 'polynomial':
        html += this.createTextControl('coefficients', 'Coefficients', '0,0,1,-1');
        html += this.createRangeControl('scale', 'Scale', 0.1, 2, 1, 0.1);
        html += this.createRangeControl('start', 'Start', 0, 1, 0, 0.1);
        html += this.createRangeControl('end', 'End', 0, 1, 1, 0.1);
        break;
        
      case 'chaos':
        html += this.createSelectControl('chaosType', 'Chaos Type', [
          { value: 'tent', label: 'Tent Map' },
          { value: 'sine', label: 'Sine Map' },
          { value: 'quadratic', label: 'Quadratic Map' },
          { value: 'cubic', label: 'Cubic Map' }
        ]);
        html += this.createRangeControl('a', 'Parameter A', 0.1, 4, 1.5, 0.1);
        html += this.createRangeControl('b', 'Parameter B', 0.1, 2, 0.5, 0.1);
        html += this.createRangeControl('start', 'Start', 0, 1, 0, 0.1);
        html += this.createRangeControl('end', 'End', 0, 1, 1, 0.1);
        break;
        
      case 'cellular':
        html += this.createRangeControl('rule', 'Rule', 0, 255, 30, 1);
        html += this.createRangeControl('generations', 'Generations', 10, 100, 50, 5);
        html += this.createRangeControl('start', 'Start', 0, 1, 0, 0.1);
        html += this.createRangeControl('end', 'End', 0, 1, 1, 0.1);
        break;
        
      default:
        html += this.createRangeControl('start', 'Start', 0, 1, 0, 0.1);
        html += this.createRangeControl('end', 'End', 0, 1, 1, 0.1);
    }
    
    paramsContainer.innerHTML = html;
    this.bindParameterEvents();
  }

  createRangeControl(name, label, min, max, value, step) {
    return `
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 4px; color: #ccc; font-size: 12px;">
          ${label}: <span id="${name}-value">${value}</span>
        </label>
        <input type="range" 
               id="${name}" 
               min="${min}" 
               max="${max}" 
               value="${value}" 
               step="${step}"
               style="width: 100%;">
      </div>
    `;
  }

  createTextControl(name, label, value) {
    return `
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 4px; color: #ccc; font-size: 12px;">
          ${label}:
        </label>
        <input type="text" 
               id="${name}" 
               value="${value}"
               style="width: 100%; padding: 4px; background: #333; border: 1px solid #555; border-radius: 3px; color: #fff; font-size: 12px;">
      </div>
    `;
  }

  createSelectControl(name, label, options) {
    let html = `
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 4px; color: #ccc; font-size: 12px;">
          ${label}:
        </label>
        <select id="${name}" style="width: 100%; padding: 4px; background: #333; border: 1px solid #555; border-radius: 3px; color: #fff; font-size: 12px;">
    `;
    
    options.forEach(option => {
      html += `<option value="${option.value}">${option.label}</option>`;
    });
    
    html += '</select></div>';
    return html;
  }

  bindParameterEvents() {
    // Bind range controls
    this.panel.querySelectorAll('input[type="range"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const valueSpan = document.getElementById(`${e.target.id}-value`);
        if (valueSpan) {
          valueSpan.textContent = parseFloat(e.target.value).toFixed(2);
        }
      });
    });
  }

  async generatePattern() {
    const params = this.getCurrentParameters();
    const patternId = `wolfram_${this.currentPatternType}_${Date.now()}`;
    const patternName = `${this.currentPatternType.charAt(0).toUpperCase() + this.currentPatternType.slice(1)} Pattern`;
    
    const success = await this.wolframManager.createPattern(patternId, patternName, this.currentPatternType, params);
    
    if (success) {
      this.updatePatternList();
      this.showNotification('Pattern generated successfully!', 'success');
    } else {
      this.showNotification('Failed to generate pattern', 'error');
    }
  }

  async generateVariations() {
    const patterns = this.wolframManager.getAllPatterns();
    if (patterns.length === 0) {
      this.showNotification('No patterns available to create variations', 'warning');
      return;
    }
    
    // Use the most recent pattern
    const latestPattern = patterns[patterns.length - 1];
    const variations = await this.wolframManager.generatePatternVariations(latestPattern.id, 3);
    
    if (variations.length > 0) {
      this.updatePatternList();
      this.showNotification(`Generated ${variations.length} variations`, 'success');
    } else {
      this.showNotification('Failed to generate variations', 'error');
    }
  }

  showMorphDialog() {
    const patterns = this.wolframManager.getAllPatterns();
    if (patterns.length < 2) {
      this.showNotification('Need at least 2 patterns to morph', 'warning');
      return;
    }
    
    // Simple morph dialog - in a real implementation, this would be more sophisticated
    const pattern1 = patterns[patterns.length - 2];
    const pattern2 = patterns[patterns.length - 1];
    
    this.morphPatterns(pattern1.id, pattern2.id, 0.5);
  }

  async morphPatterns(pattern1Id, pattern2Id, progress) {
    const morphedPattern = await this.wolframManager.morphPatterns(pattern1Id, pattern2Id, progress);
    
    if (morphedPattern) {
      this.updatePatternList();
      this.showNotification('Patterns morphed successfully!', 'success');
    } else {
      this.showNotification('Failed to morph patterns', 'error');
    }
  }

  getCurrentParameters() {
    const params = {};
    
    // Get range parameters
    this.panel.querySelectorAll('input[type="range"]').forEach(input => {
      params[input.id] = parseFloat(input.value);
    });
    
    // Get text parameters
    this.panel.querySelectorAll('input[type="text"]').forEach(input => {
      const value = input.value.trim();
      if (value) {
        if (value.includes(',')) {
          // Parse comma-separated values
          params[input.id] = value.split(',').map(v => parseFloat(v.trim()));
        } else {
          params[input.id] = value;
        }
      }
    });
    
    // Get select parameters
    this.panel.querySelectorAll('select').forEach(select => {
      params[select.id] = select.value;
    });
    
    return params;
  }

  updatePatternList() {
    const listContainer = this.panel.querySelector('#wolfram-pattern-list');
    const patterns = this.wolframManager.getAllPatterns();
    
    if (patterns.length === 0) {
      listContainer.innerHTML = '<div style="color: #888; text-align: center;">No patterns generated yet</div>';
      return;
    }
    
    let html = '';
    patterns.forEach(pattern => {
      const analysis = this.wolframManager.analyzePattern(pattern.id);
      html += `
        <div class="pattern-item" data-pattern-id="${pattern.id}" style="
          padding: 8px;
          margin-bottom: 5px;
          background: #333;
          border-radius: 4px;
          cursor: pointer;
          border: 1px solid #444;
          transition: background-color 0.2s;
        " onmouseover="this.style.background='#444'" onmouseout="this.style.background='#333'">
          <div style="font-weight: bold; color: #4CAF50; font-size: 12px;">${pattern.name}</div>
          <div style="color: #ccc; font-size: 10px;">Type: ${pattern.patternType}</div>
          <div style="color: #888; font-size: 10px;">
            Complexity: ${analysis.complexity.toFixed(3)} | Energy: ${analysis.energy.toFixed(3)}
          </div>
        </div>
      `;
    });
    
    listContainer.innerHTML = html;
    
    // Bind click events
    listContainer.querySelectorAll('.pattern-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const patternId = e.currentTarget.dataset.patternId;
        this.applyPattern(patternId);
      });
    });
  }

  applyPattern(patternId) {
    const success = this.wolframManager.applyPatternToAutomation(patternId);
    
    if (success) {
      this.showNotification('Pattern applied to automation', 'success');
    } else {
      this.showNotification('Failed to apply pattern', 'error');
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      border-radius: 4px;
      color: white;
      font-size: 14px;
      z-index: 1001;
      animation: slideDown 0.3s ease-out;
    `;
    
    const colors = {
      success: '#4CAF50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196F3'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  show() {
    this.panel.style.display = 'block';
    this.isVisible = true;
    this.updatePatternList();
  }

  hide() {
    this.panel.style.display = 'none';
    this.isVisible = false;
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  // Add CSS animation
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
}