import { CURVE_TYPES } from '../utils/constants.js';
import { clamp, createParticle } from '../utils/helpers.js';
import { CurveMath } from './curve-math.js';
import { CurvePresets } from './curve-presets.js';
import { CurveAnimation } from './curve-animation.js';

export class CurveEditor {
  constructor(app) {
    this.app = app;
    this.canvas = null;
    this.ctx = null;
    this.isVisible = false;
    this.currentTrack = null;
    this.currentTool = 'pen';
    this.isDrawing = false;
    this.lastPoint = null;
    this.breakpoints = [];
    this.selectedBreakpoint = null;
    this.deviceRatio = window.devicePixelRatio || 1;
    this.gridSize = 16;
    this.snapToGrid = true;
    this.showGrid = true;
    this.showCurve = true;
    this.showBreakpoints = true;
    this.curveSmoothing = 0.3;
    this.curveTension = 0.5;
    this.particles = [];
    this.lastParticleTime = 0;
    
    // Initialize curve math and presets
    this.curveMath = new CurveMath();
    this.curvePresets = new CurvePresets();
    this.curveAnimation = new CurveAnimation(this);
    
    // Tool states
    this.tools = {
      pen: { name: 'Pen', icon: '✏️', cursor: 'crosshair' },
      line: { name: 'Line', icon: '📏', cursor: 'crosshair' },
      bezier: { name: 'Bezier', icon: '〰️', cursor: 'crosshair' },
      freehand: { name: 'Freehand', icon: '✋', cursor: 'crosshair' },
      select: { name: 'Select', icon: '👆', cursor: 'default' },
      erase: { name: 'Erase', icon: '🧹', cursor: 'crosshair' }
    };
    
    // Get presets from CurvePresets
    this.presets = this.curvePresets.getAllPresets().reduce((acc, preset) => {
      acc[preset.key] = preset;
      return acc;
    }, {});
  }

  initialize() {
    this.createUI();
    this.setupEventListeners();
    this.setupCanvas();
    this.curveAnimation.initialize();
  }

  createUI() {
    // Create curve editor modal
    const modal = document.createElement('div');
    modal.id = 'curve-editor-modal';
    modal.className = 'curve-editor-modal';
    modal.innerHTML = `
      <div class="curve-editor-container">
        <div class="curve-editor-header">
          <h2>Automation Curve Editor</h2>
          <div class="curve-editor-controls">
            <select id="curve-track-select" class="curve-select">
              <option value="">Select Track</option>
            </select>
            <button id="curve-editor-close" class="btn btn-outline">Close</button>
          </div>
        </div>
        
        <div class="curve-editor-toolbar">
          <div class="tool-group">
            <label>Tools:</label>
            <div class="tool-buttons">
              ${Object.entries(this.tools).map(([key, tool]) => 
                `<button class="tool-btn ${key === this.currentTool ? 'active' : ''}" data-tool="${key}" title="${tool.name}">
                  ${tool.icon}
                </button>`
              ).join('')}
            </div>
          </div>
          
          <div class="tool-group">
            <label>Presets:</label>
            <select id="curve-preset-select" class="curve-select">
              <option value="">Load Preset</option>
              ${Object.entries(this.presets).map(([key, preset]) => 
                `<option value="${key}">${preset.name}</option>`
              ).join('')}
            </select>
            <button id="curve-preset-apply" class="btn">Apply</button>
          </div>
          
          <div class="tool-group">
            <label>Options:</label>
            <label class="checkbox-label">
              <input type="checkbox" id="curve-snap-grid" ${this.snapToGrid ? 'checked' : ''}>
              Snap to Grid
            </label>
            <label class="checkbox-label">
              <input type="checkbox" id="curve-show-grid" ${this.showGrid ? 'checked' : ''}>
              Show Grid
            </label>
            <label class="checkbox-label">
              <input type="checkbox" id="curve-show-breakpoints" ${this.showBreakpoints ? 'checked' : ''}>
              Show Breakpoints
            </label>
          </div>
        </div>
        
        <div class="curve-editor-main">
          <div class="curve-editor-sidebar">
            <div class="curve-properties">
              <h3>Curve Properties</h3>
              <div class="property-group">
                <label for="curve-smoothing">Smoothing:</label>
                <input type="range" id="curve-smoothing" min="0" max="1" step="0.01" value="${this.curveSmoothing}">
                <span class="property-value">${Math.round(this.curveSmoothing * 100)}%</span>
              </div>
              <div class="property-group">
                <label for="curve-smoothing-method">Smoothing Method:</label>
                <select id="curve-smoothing-method">
                  <option value="gaussian">Gaussian</option>
                  <option value="movingAverage">Moving Average</option>
                  <option value="savitzkyGolay">Savitzky-Golay</option>
                  <option value="exponential">Exponential</option>
                </select>
              </div>
              <div class="property-group">
                <label for="curve-tension">Tension:</label>
                <input type="range" id="curve-tension" min="0" max="1" step="0.01" value="${this.curveTension}">
                <span class="property-value">${Math.round(this.curveTension * 100)}%</span>
              </div>
              <div class="property-group">
                <label for="curve-quantize-levels">Quantize Levels:</label>
                <select id="curve-quantize-levels">
                  <option value="4">4 levels</option>
                  <option value="8">8 levels</option>
                  <option value="16" selected>16 levels</option>
                  <option value="32">32 levels</option>
                  <option value="64">64 levels</option>
                </select>
              </div>
              <div class="property-group">
                <label for="curve-type">Curve Type:</label>
                <select id="curve-type">
                  ${Object.entries(CURVE_TYPES).map(([key, value]) => 
                    `<option value="${value}">${key}</option>`
                  ).join('')}
                </select>
              </div>
            </div>
            
            <div class="curve-actions">
              <h3>Actions</h3>
              <button id="curve-reset" class="btn btn-outline">Reset</button>
              <button id="curve-smooth" class="btn btn-outline">Smooth</button>
              <button id="curve-quantize" class="btn btn-outline">Quantize</button>
              <button id="curve-reverse" class="btn btn-outline">Reverse</button>
              <button id="curve-normalize" class="btn btn-outline">Normalize</button>
              <button id="curve-invert" class="btn btn-outline">Invert</button>
              <button id="curve-scale" class="btn btn-outline">Scale</button>
              <button id="curve-offset" class="btn btn-outline">Offset</button>
              <button id="curve-analyze" class="btn btn-outline">Analyze</button>
              <button id="curve-copy" class="btn btn-outline">Copy</button>
              <button id="curve-paste" class="btn btn-outline">Paste</button>
              <button id="curve-export" class="btn btn-outline">Export</button>
              <button id="curve-import" class="btn btn-outline">Import</button>
            </div>
          </div>
          
          <div class="curve-editor-canvas-container">
            <canvas id="curve-editor-canvas" width="800" height="400"></canvas>
            <div class="curve-editor-info">
              <div class="info-item">
                <span class="info-label">Tool:</span>
                <span class="info-value">${this.tools[this.currentTool].name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Points:</span>
                <span class="info-value" id="curve-point-count">0</span>
              </div>
              <div class="info-item">
                <span class="info-label">Resolution:</span>
                <span class="info-value">${this.gridSize} steps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modal = modal;
    this.canvas = document.getElementById('curve-editor-canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  setupEventListeners() {
    // Close button
    document.getElementById('curve-editor-close').addEventListener('click', () => {
      this.hide();
    });

    // Tool selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setTool(e.target.dataset.tool);
      });
    });

    // Preset selection
    document.getElementById('curve-preset-apply').addEventListener('click', () => {
      const presetKey = document.getElementById('curve-preset-select').value;
      if (presetKey && this.presets[presetKey]) {
        this.loadPreset(presetKey);
      }
    });

    // Options
    document.getElementById('curve-snap-grid').addEventListener('change', (e) => {
      this.snapToGrid = e.target.checked;
      this.draw();
    });

    document.getElementById('curve-show-grid').addEventListener('change', (e) => {
      this.showGrid = e.target.checked;
      this.draw();
    });

    document.getElementById('curve-show-breakpoints').addEventListener('change', (e) => {
      this.showBreakpoints = e.target.checked;
      this.draw();
    });

    // Properties
    document.getElementById('curve-smoothing').addEventListener('input', (e) => {
      this.curveSmoothing = parseFloat(e.target.value);
      document.querySelector('.property-value').textContent = `${Math.round(this.curveSmoothing * 100)}%`;
      this.draw();
    });

    document.getElementById('curve-tension').addEventListener('input', (e) => {
      this.curveTension = parseFloat(e.target.value);
      document.querySelectorAll('.property-value')[1].textContent = `${Math.round(this.curveTension * 100)}%`;
      this.draw();
    });

    // Actions
    document.getElementById('curve-reset').addEventListener('click', () => this.resetCurve());
    document.getElementById('curve-smooth').addEventListener('click', () => this.smoothCurve());
    document.getElementById('curve-quantize').addEventListener('click', () => this.quantizeCurve());
    document.getElementById('curve-reverse').addEventListener('click', () => this.reverseCurve());
    document.getElementById('curve-normalize').addEventListener('click', () => this.normalizeCurve());
    document.getElementById('curve-invert').addEventListener('click', () => this.invertCurve());
    document.getElementById('curve-scale').addEventListener('click', () => this.scaleCurve());
    document.getElementById('curve-offset').addEventListener('click', () => this.offsetCurve());
    document.getElementById('curve-analyze').addEventListener('click', () => this.analyzeCurve());
    document.getElementById('curve-copy').addEventListener('click', () => this.copyCurve());
    document.getElementById('curve-paste').addEventListener('click', () => this.pasteCurve());
    document.getElementById('curve-export').addEventListener('click', () => this.exportCurve());
    document.getElementById('curve-import').addEventListener('click', () => this.importCurve());

    // Canvas events
    this.setupCanvasEvents();
  }

  setupCanvasEvents() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.handleMouseDown(mouseEvent);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.handleMouseMove(mouseEvent);
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const mouseEvent = new MouseEvent('mouseup', {});
      this.handleMouseUp(mouseEvent);
    });
  }

  setupCanvas() {
    if (!this.canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      this.syncCanvas();
      this.draw();
    });
    resizeObserver.observe(this.canvas);
    this.syncCanvas();
  }

  syncCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width * ratio;
    const height = rect.height * ratio;
    
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.deviceRatio = ratio;
  }

  show(trackId = null) {
    this.isVisible = true;
    this.modal.style.display = 'flex';
    
    if (trackId) {
      this.loadTrack(trackId);
    } else {
      this.populateTrackSelect();
    }
    
    this.draw();
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.isVisible = false;
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
    this.saveCurrentCurve();
  }

  loadTrack(trackId) {
    if (!this.app.automation?.tracks) return;
    
    const track = this.app.automation.tracks.find(t => t.id === trackId);
    if (!track) return;
    
    this.currentTrack = track;
    this.breakpoints = track.values.map((value, index) => ({
      step: index,
      value: value,
      x: 0, // Will be calculated in draw()
      y: 0
    }));
    
    this.populateTrackSelect();
    document.getElementById('curve-track-select').value = trackId;
    this.updatePointCount();
  }

  populateTrackSelect() {
    const select = document.getElementById('curve-track-select');
    select.innerHTML = '<option value="">Select Track</option>';
    
    if (this.app.automation?.tracks) {
      this.app.automation.tracks.forEach(track => {
        const option = document.createElement('option');
        option.value = track.id;
        option.textContent = track.label;
        select.appendChild(option);
      });
    }
    
    select.addEventListener('change', (e) => {
      if (e.target.value) {
        this.loadTrack(e.target.value);
      }
    });
  }

  setTool(toolName) {
    this.currentTool = toolName;
    
    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${toolName}"]`).classList.add('active');
    
    // Update cursor
    this.canvas.style.cursor = this.tools[toolName].cursor;
  }

  handleMouseDown(e) {
    if (!this.currentTrack) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * this.deviceRatio;
    const y = (e.clientY - rect.top) * this.deviceRatio;
    
    this.isDrawing = true;
    this.lastPoint = { x, y };
    
    this.handleToolAction(x, y);
  }

  handleMouseMove(e) {
    if (!this.isDrawing || !this.currentTrack) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * this.deviceRatio;
    const y = (e.clientY - rect.top) * this.deviceRatio;
    
    if (this.currentTool === 'freehand') {
      this.addPoint(x, y);
    }
    
    this.lastPoint = { x, y };
    this.draw();
  }

  handleMouseUp(e) {
    this.isDrawing = false;
    this.lastPoint = null;
    this.updatePointCount();
  }

  handleToolAction(x, y) {
    const step = this.screenToStep(x);
    const value = this.screenToValue(y);
    
    switch (this.currentTool) {
      case 'pen':
        this.addPoint(x, y);
        break;
      case 'line':
        if (this.lastPoint) {
          this.drawLine(this.lastPoint.x, this.lastPoint.y, x, y);
        }
        break;
      case 'bezier':
        this.addBezierPoint(x, y);
        break;
      case 'select':
        this.selectBreakpoint(x, y);
        break;
      case 'erase':
        this.removePoint(x, y);
        break;
    }
  }

  addPoint(x, y) {
    const step = this.screenToStep(x);
    const value = this.screenToValue(y);
    
    if (this.snapToGrid) {
      const snappedStep = Math.round(step);
      const snappedValue = Math.round(value * 100) / 100;
      
      // Update or add breakpoint
      const existingIndex = this.breakpoints.findIndex(bp => bp.step === snappedStep);
      if (existingIndex >= 0) {
        this.breakpoints[existingIndex].value = snappedValue;
      } else {
        this.breakpoints.push({
          step: snappedStep,
          value: snappedValue,
          x: 0,
          y: 0
        });
      }
    } else {
      this.breakpoints.push({
        step: step,
        value: value,
        x: 0,
        y: 0
      });
    }
    
    this.sortBreakpoints();
    this.updateTrackValues();
    this.draw();
  }

  addBezierPoint(x, y) {
    // Simplified bezier implementation
    this.addPoint(x, y);
  }

  drawLine(x1, y1, x2, y2) {
    const step1 = this.screenToStep(x1);
    const value1 = this.screenToValue(y1);
    const step2 = this.screenToStep(x2);
    const value2 = this.screenToValue(y2);
    
    const steps = Math.abs(step2 - step1);
    const stepSize = step2 > step1 ? 1 : -1;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const step = Math.round(step1 + (step2 - step1) * t);
      const value = value1 + (value2 - value1) * t;
      
      const existingIndex = this.breakpoints.findIndex(bp => bp.step === step);
      if (existingIndex >= 0) {
        this.breakpoints[existingIndex].value = value;
      } else {
        this.breakpoints.push({
          step: step,
          value: value,
          x: 0,
          y: 0
        });
      }
    }
    
    this.sortBreakpoints();
    this.updateTrackValues();
  }

  selectBreakpoint(x, y) {
    const tolerance = 10 * this.deviceRatio;
    let closest = null;
    let closestDistance = Infinity;
    
    this.breakpoints.forEach(bp => {
      const distance = Math.sqrt(
        Math.pow(bp.x - x, 2) + Math.pow(bp.y - y, 2)
      );
      if (distance < tolerance && distance < closestDistance) {
        closest = bp;
        closestDistance = distance;
      }
    });
    
    this.selectedBreakpoint = closest;
    this.draw();
  }

  removePoint(x, y) {
    const tolerance = 10 * this.deviceRatio;
    this.breakpoints = this.breakpoints.filter(bp => {
      const distance = Math.sqrt(
        Math.pow(bp.x - x, 2) + Math.pow(bp.y - y, 2)
      );
      return distance >= tolerance;
    });
    
    this.updateTrackValues();
    this.draw();
  }

  sortBreakpoints() {
    this.breakpoints.sort((a, b) => a.step - b.step);
  }

  updateTrackValues() {
    if (!this.currentTrack) return;
    
    // Generate smooth curve from breakpoints
    const values = new Array(this.gridSize).fill(0);
    
    if (this.breakpoints.length === 0) {
      this.currentTrack.values = values;
      return;
    }
    
    if (this.breakpoints.length === 1) {
      this.currentTrack.values = values.fill(this.breakpoints[0].value);
      return;
    }
    
    // Interpolate between breakpoints
    for (let i = 0; i < this.gridSize; i++) {
      const step = i;
      let value = 0;
      
      // Find surrounding breakpoints
      let before = null;
      let after = null;
      
      for (let j = 0; j < this.breakpoints.length; j++) {
        const bp = this.breakpoints[j];
        if (bp.step <= step) {
          before = bp;
        }
        if (bp.step >= step && !after) {
          after = bp;
          break;
        }
      }
      
      if (before && after) {
        if (before.step === after.step) {
          value = before.value;
        } else {
          const t = (step - before.step) / (after.step - before.step);
          value = this.interpolateValue(before.value, after.value, t);
        }
      } else if (before) {
        value = before.value;
      } else if (after) {
        value = after.value;
      }
      
      values[i] = clamp(value, 0, 1);
    }
    
    this.currentTrack.values = values;
  }

  interpolateValue(start, end, t) {
    const curveType = document.getElementById('curve-type').value;
    
    switch (curveType) {
      case CURVE_TYPES.EXPONENTIAL:
        return start + (end - start) * (t * t);
      case CURVE_TYPES.LOGARITHMIC:
        return start + (end - start) * Math.sqrt(t);
      case CURVE_TYPES.SINE:
        return start + (end - start) * (Math.sin(t * Math.PI - Math.PI / 2) * 0.5 + 0.5);
      case CURVE_TYPES.BEZIER:
        return this.bezierInterpolation(start, end, t);
      default:
        return start + (end - start) * t;
    }
  }

  bezierInterpolation(start, end, t) {
    const p0 = start;
    const p1 = start + (end - start) * 0.25;
    const p2 = start + (end - start) * 0.75;
    const p3 = end;
    
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
  }

  draw() {
    if (!this.ctx || !this.currentTrack) return;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw background
    this.ctx.fillStyle = 'rgba(8, 8, 11, 0.8)';
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    if (this.showGrid) {
      this.drawGrid(width, height);
    }
    
    // Draw curve
    if (this.showCurve) {
      this.drawCurve(width, height);
    }
    
    // Draw breakpoints
    if (this.showBreakpoints) {
      this.drawBreakpoints(width, height);
    }
    
    // Draw selection
    if (this.selectedBreakpoint) {
      this.drawSelection(width, height);
    }
    
    // Draw animation overlay
    this.curveAnimation.drawAnimationOverlay(this.ctx);
  }

  drawGrid(width, height) {
    const stepWidth = width / this.gridSize;
    const stepHeight = height / 10; // 10 horizontal lines
    
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1 * this.deviceRatio;
    
    // Vertical lines
    for (let i = 0; i <= this.gridSize; i++) {
      const x = i * stepWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      const y = i * stepHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
  }

  drawCurve(width, height) {
    if (!this.currentTrack?.values) return;
    
    const stepWidth = width / this.gridSize;
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.currentTrack.color || '#49a9ff';
    this.ctx.lineWidth = 3 * this.deviceRatio;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.currentTrack.values.forEach((value, index) => {
      const x = index * stepWidth + stepWidth / 2;
      const y = height - (value * height) - 20 * this.deviceRatio;
      
      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    
    this.ctx.stroke();
  }

  drawBreakpoints(width, height) {
    const stepWidth = width / this.gridSize;
    
    this.breakpoints.forEach(bp => {
      const x = bp.step * stepWidth + stepWidth / 2;
      const y = height - (bp.value * height) - 20 * this.deviceRatio;
      
      bp.x = x;
      bp.y = y;
      
      this.ctx.fillStyle = this.currentTrack.color || '#49a9ff';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 6 * this.deviceRatio, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Highlight selected breakpoint
      if (bp === this.selectedBreakpoint) {
        this.ctx.strokeStyle = '#ff49af';
        this.ctx.lineWidth = 3 * this.deviceRatio;
        this.ctx.stroke();
      }
    });
  }

  drawSelection(width, height) {
    if (!this.selectedBreakpoint) return;
    
    const x = this.selectedBreakpoint.x;
    const y = this.selectedBreakpoint.y;
    const radius = 12 * this.deviceRatio;
    
    this.ctx.strokeStyle = '#ff49af';
    this.ctx.lineWidth = 2 * this.deviceRatio;
    this.ctx.setLineDash([5 * this.deviceRatio, 5 * this.deviceRatio]);
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  screenToStep(x) {
    const stepWidth = this.canvas.width / this.gridSize;
    return (x / stepWidth) - 0.5;
  }

  screenToValue(y) {
    const height = this.canvas.height - 40 * this.deviceRatio;
    return 1 - ((y - 20 * this.deviceRatio) / height);
  }

  stepToScreen(step) {
    const stepWidth = this.canvas.width / this.gridSize;
    return (step + 0.5) * stepWidth;
  }

  valueToScreen(value) {
    const height = this.canvas.height - 40 * this.deviceRatio;
    return height - (value * height) + 20 * this.deviceRatio;
  }

  updatePointCount() {
    const countEl = document.getElementById('curve-point-count');
    if (countEl) {
      countEl.textContent = this.breakpoints.length;
    }
  }

  // Curve generation methods
  generateLinearCurve(start, end) {
    return Array.from({ length: this.gridSize }, (_, i) => {
      const t = i / (this.gridSize - 1);
      return start + (end - start) * t;
    });
  }

  generateExponentialCurve(start, end) {
    return Array.from({ length: this.gridSize }, (_, i) => {
      const t = i / (this.gridSize - 1);
      return start + (end - start) * (t * t);
    });
  }

  generateLogarithmicCurve(start, end) {
    return Array.from({ length: this.gridSize }, (_, i) => {
      const t = i / (this.gridSize - 1);
      return start + (end - start) * Math.sqrt(t);
    });
  }

  generateSineCurve(start, end) {
    return Array.from({ length: this.gridSize }, (_, i) => {
      const t = i / (this.gridSize - 1);
      const sine = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
      return start + (end - start) * sine;
    });
  }

  generateTriangleCurve(start, end) {
    return Array.from({ length: this.gridSize }, (_, i) => {
      const t = i / (this.gridSize - 1);
      const triangle = t < 0.5 ? t * 2 : 2 - t * 2;
      return start + (end - start) * triangle;
    });
  }

  generateSawtoothCurve(start, end) {
    return Array.from({ length: this.gridSize }, (_, i) => {
      const t = i / (this.gridSize - 1);
      return start + (end - start) * t;
    });
  }

  generateSquareCurve(start, end) {
    return Array.from({ length: this.gridSize }, (_, i) => {
      const t = i / (this.gridSize - 1);
      const square = t < 0.5 ? 0 : 1;
      return start + (end - start) * square;
    });
  }

  generateRandomCurve() {
    return Array.from({ length: this.gridSize }, () => Math.random());
  }

  generateSmoothCurve() {
    const values = [];
    let current = Math.random() * 0.5 + 0.25;
    
    for (let i = 0; i < this.gridSize; i++) {
      values.push(current);
      current += (Math.random() - 0.5) * 0.2;
      current = clamp(current, 0, 1);
    }
    
    return values;
  }

  // Action methods
  loadPreset(presetKey) {
    if (!this.presets[presetKey] || !this.currentTrack) return;
    
    const preset = this.presets[presetKey];
    this.currentTrack.values = [...preset.curve];
    this.updateBreakpointsFromValues();
    this.draw();
  }

  updateBreakpointsFromValues() {
    if (!this.currentTrack?.values) return;
    
    this.breakpoints = this.currentTrack.values.map((value, index) => ({
      step: index,
      value: value,
      x: 0,
      y: 0
    }));
    
    this.updatePointCount();
  }

  resetCurve() {
    if (!this.currentTrack) return;
    
    this.currentTrack.values = new Array(this.gridSize).fill(0.5);
    this.updateBreakpointsFromValues();
    this.draw();
  }

  smoothCurve() {
    if (!this.currentTrack?.values || this.currentTrack.values.length < 3) return;
    
    // Use advanced smoothing algorithms
    const smoothingMethod = document.getElementById('curve-smoothing-method')?.value || 'gaussian';
    const smoothed = this.curveMath.smoothingAlgorithms[smoothingMethod](
      this.currentTrack.values, 
      this.curveSmoothing
    );
    
    this.currentTrack.values = smoothed.map(v => clamp(v, 0, 1));
    this.updateBreakpointsFromValues();
    this.draw();
  }

  quantizeCurve() {
    if (!this.currentTrack?.values) return;
    
    const levels = parseInt(document.getElementById('curve-quantize-levels')?.value) || 16;
    const quantized = this.curveMath.quantizeCurve(this.currentTrack.values, levels);
    
    this.currentTrack.values = quantized;
    this.updateBreakpointsFromValues();
    this.draw();
  }

  reverseCurve() {
    if (!this.currentTrack?.values) return;
    
    this.currentTrack.values.reverse();
    this.updateBreakpointsFromValues();
    this.draw();
  }

  normalizeCurve() {
    if (!this.currentTrack?.values) return;
    
    const values = this.currentTrack.values;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    if (range === 0) return;
    
    const normalized = values.map(value => (value - min) / range);
    this.currentTrack.values = normalized;
    this.updateBreakpointsFromValues();
    this.draw();
  }

  copyCurve() {
    if (!this.currentTrack?.values) return;
    
    const curveData = {
      values: [...this.currentTrack.values],
      trackId: this.currentTrack.id,
      timestamp: Date.now()
    };
    
    navigator.clipboard.writeText(JSON.stringify(curveData)).then(() => {
      if (this.app.status) {
        this.app.status.set('Curve copied to clipboard');
      }
    });
  }

  pasteCurve() {
    navigator.clipboard.readText().then(text => {
      try {
        const curveData = JSON.parse(text);
        if (curveData.values && Array.isArray(curveData.values)) {
          this.currentTrack.values = [...curveData.values];
          this.updateBreakpointsFromValues();
          this.draw();
          
          if (this.app.status) {
            this.app.status.set('Curve pasted from clipboard');
          }
        }
      } catch (err) {
        console.error('Failed to paste curve:', err);
        if (this.app.status) {
          this.app.status.set('Failed to paste curve');
        }
      }
    });
  }

  invertCurve() {
    if (!this.currentTrack?.values) return;
    
    const inverted = this.curveMath.invertCurve(this.currentTrack.values);
    this.currentTrack.values = inverted;
    this.updateBreakpointsFromValues();
    this.draw();
  }

  scaleCurve() {
    if (!this.currentTrack?.values) return;
    
    const factor = parseFloat(prompt('Scale factor (0.1 - 2.0):', '1.0')) || 1.0;
    const scaled = this.curveMath.scaleCurve(this.currentTrack.values, factor);
    this.currentTrack.values = scaled;
    this.updateBreakpointsFromValues();
    this.draw();
  }

  offsetCurve() {
    if (!this.currentTrack?.values) return;
    
    const offset = parseFloat(prompt('Offset value (-1.0 to 1.0):', '0.0')) || 0.0;
    const offsetted = this.curveMath.offsetCurve(this.currentTrack.values, offset);
    this.currentTrack.values = offsetted;
    this.updateBreakpointsFromValues();
    this.draw();
  }

  analyzeCurve() {
    if (!this.currentTrack?.values) return;
    
    const analysis = this.curveMath.analyzeCurve(this.currentTrack.values);
    
    const analysisText = `
Curve Analysis:
Min: ${analysis.min.toFixed(3)}
Max: ${analysis.max.toFixed(3)}
Range: ${analysis.range.toFixed(3)}
Mean: ${analysis.mean.toFixed(3)}
Std Dev: ${analysis.standardDeviation.toFixed(3)}
Skewness: ${analysis.skewness.toFixed(3)}
Kurtosis: ${analysis.kurtosis.toFixed(3)}
Energy: ${analysis.energy.toFixed(3)}
Zero Crossings: ${analysis.zeroCrossings}
Peaks: ${analysis.peaks.length}
Valleys: ${analysis.valleys.length}
    `.trim();
    
    alert(analysisText);
    
    if (this.app.status) {
      this.app.status.set(`Curve analyzed: ${analysis.peaks.length} peaks, ${analysis.valleys.length} valleys`);
    }
  }

  saveCurrentCurve() {
    if (this.currentTrack && this.app.timeline) {
      this.app.timeline.draw();
    }
  }

  exportCurve() {
    if (!this.currentTrack?.values) return;
    
    const curveData = {
      name: this.currentTrack.label || 'Custom Curve',
      trackId: this.currentTrack.id,
      values: [...this.currentTrack.values],
      curveType: document.getElementById('curve-type').value,
      smoothing: this.curveSmoothing,
      tension: this.curveTension,
      animation: this.curveAnimation.exportAnimation(),
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0',
        gridSize: this.gridSize,
        breakpoints: this.breakpoints.map(bp => ({ step: bp.step, value: bp.value }))
      }
    };
    
    const blob = new Blob([JSON.stringify(curveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${this.currentTrack.id}-curve.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    
    if (this.app.status) {
      this.app.status.set('Curve exported successfully');
    }
  }

  importCurve() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.style.display = 'none';
    
    input.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const curveData = JSON.parse(reader.result);
          this.loadCurveData(curveData);
          
          if (this.app.status) {
            this.app.status.set(`Curve "${curveData.name}" imported successfully`);
          }
        } catch (err) {
          console.error('Failed to import curve:', err);
          if (this.app.status) {
            this.app.status.set('Failed to import curve');
          }
        }
      };
      reader.readAsText(file);
    });
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  loadCurveData(curveData) {
    if (!curveData.values || !Array.isArray(curveData.values)) {
      throw new Error('Invalid curve data');
    }
    
    // Load curve values
    this.currentTrack.values = [...curveData.values];
    this.updateBreakpointsFromValues();
    
    // Load curve properties
    if (curveData.curveType) {
      document.getElementById('curve-type').value = curveData.curveType;
    }
    
    if (curveData.smoothing !== undefined) {
      this.curveSmoothing = curveData.smoothing;
      document.getElementById('curve-smoothing').value = this.curveSmoothing;
      document.querySelector('.property-value').textContent = `${Math.round(this.curveSmoothing * 100)}%`;
    }
    
    if (curveData.tension !== undefined) {
      this.curveTension = curveData.tension;
      document.getElementById('curve-tension').value = this.curveTension;
      document.querySelectorAll('.property-value')[1].textContent = `${Math.round(this.curveTension * 100)}%`;
    }
    
    // Load animation settings
    if (curveData.animation) {
      this.curveAnimation.importAnimation(curveData.animation);
    }
    
    // Load breakpoints if available
    if (curveData.metadata?.breakpoints) {
      this.breakpoints = curveData.metadata.breakpoints.map(bp => ({
        step: bp.step,
        value: bp.value,
        x: 0,
        y: 0
      }));
    }
    
    this.updatePointCount();
    this.draw();
  }
}