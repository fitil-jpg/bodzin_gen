import { CurveMath } from './curve-math.js';

export class CurveAnimation {
  constructor(curveEditor) {
    this.curveEditor = curveEditor;
    this.isAnimating = false;
    this.animationId = null;
    this.currentTime = 0;
    this.duration = 4; // seconds
    this.loop = true;
    this.playbackSpeed = 1.0;
    this.curveMath = new CurveMath();
    
    // Animation presets
    this.animationPresets = {
      slow: { duration: 8, speed: 0.5, loop: true },
      normal: { duration: 4, speed: 1.0, loop: true },
      fast: { duration: 2, speed: 2.0, loop: true },
      pingpong: { duration: 4, speed: 1.0, loop: false, pingpong: true }
    };
    
    // Visual effects
    this.showTrail = true;
    this.trailLength = 20;
    this.trailPoints = [];
    this.showParticles = true;
    this.particles = [];
    this.maxParticles = 50;
    
    // Audio visualization
    this.audioContext = null;
    this.analyser = null;
    this.audioData = null;
    this.audioVisualization = false;
  }

  initialize() {
    this.setupAudioContext();
    this.createAnimationUI();
    this.setupEventListeners();
  }

  setupAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (err) {
      console.warn('Audio context not available:', err);
    }
  }

  createAnimationUI() {
    const container = document.querySelector('.curve-editor-sidebar');
    if (!container) return;

    const animationSection = document.createElement('div');
    animationSection.className = 'curve-animation-section';
    animationSection.innerHTML = `
      <h3>Animation</h3>
      
      <div class="animation-controls">
        <div class="control-group">
          <button id="curve-play" class="btn btn-primary">Play</button>
          <button id="curve-pause" class="btn btn-outline">Pause</button>
          <button id="curve-stop" class="btn btn-outline">Stop</button>
        </div>
        
        <div class="control-group">
          <label for="curve-duration">Duration (s):</label>
          <input type="range" id="curve-duration" min="1" max="10" step="0.5" value="${this.duration}">
          <span class="control-value">${this.duration}s</span>
        </div>
        
        <div class="control-group">
          <label for="curve-speed">Speed:</label>
          <input type="range" id="curve-speed" min="0.1" max="3" step="0.1" value="${this.playbackSpeed}">
          <span class="control-value">${this.playbackSpeed}x</span>
        </div>
        
        <div class="control-group">
          <label for="curve-preset">Preset:</label>
          <select id="curve-preset">
            <option value="normal">Normal</option>
            <option value="slow">Slow</option>
            <option value="fast">Fast</option>
            <option value="pingpong">Ping Pong</option>
          </select>
        </div>
        
        <div class="control-group">
          <label class="checkbox-label">
            <input type="checkbox" id="curve-loop" ${this.loop ? 'checked' : ''}>
            Loop
          </label>
        </div>
        
        <div class="control-group">
          <label class="checkbox-label">
            <input type="checkbox" id="curve-trail" ${this.showTrail ? 'checked' : ''}>
            Show Trail
          </label>
        </div>
        
        <div class="control-group">
          <label class="checkbox-label">
            <input type="checkbox" id="curve-particles" ${this.showParticles ? 'checked' : ''}>
            Show Particles
          </label>
        </div>
        
        <div class="control-group">
          <label class="checkbox-label">
            <input type="checkbox" id="curve-audio-viz" ${this.audioVisualization ? 'checked' : ''}>
            Audio Visualization
          </label>
        </div>
      </div>
      
      <div class="animation-info">
        <div class="info-item">
          <span class="info-label">Time:</span>
          <span class="info-value" id="curve-time">0.0s</span>
        </div>
        <div class="info-item">
          <span class="info-label">Progress:</span>
          <span class="info-value" id="curve-progress">0%</span>
        </div>
        <div class="info-item">
          <span class="info-label">FPS:</span>
          <span class="info-value" id="curve-fps">0</span>
        </div>
      </div>
    `;
    
    container.appendChild(animationSection);
  }

  setupEventListeners() {
    // Playback controls
    document.getElementById('curve-play')?.addEventListener('click', () => this.play());
    document.getElementById('curve-pause')?.addEventListener('click', () => this.pause());
    document.getElementById('curve-stop')?.addEventListener('click', () => this.stop());
    
    // Animation parameters
    document.getElementById('curve-duration')?.addEventListener('input', (e) => {
      this.duration = parseFloat(e.target.value);
      document.querySelector('.control-value').textContent = `${this.duration}s`;
    });
    
    document.getElementById('curve-speed')?.addEventListener('input', (e) => {
      this.playbackSpeed = parseFloat(e.target.value);
      document.querySelectorAll('.control-value')[1].textContent = `${this.playbackSpeed}x`;
    });
    
    document.getElementById('curve-preset')?.addEventListener('change', (e) => {
      this.applyPreset(e.target.value);
    });
    
    // Options
    document.getElementById('curve-loop')?.addEventListener('change', (e) => {
      this.loop = e.target.checked;
    });
    
    document.getElementById('curve-trail')?.addEventListener('change', (e) => {
      this.showTrail = e.target.checked;
    });
    
    document.getElementById('curve-particles')?.addEventListener('change', (e) => {
      this.showParticles = e.target.checked;
    });
    
    document.getElementById('curve-audio-viz')?.addEventListener('change', (e) => {
      this.audioVisualization = e.target.checked;
      if (this.audioVisualization) {
        this.setupAudioVisualization();
      }
    });
  }

  applyPreset(presetName) {
    const preset = this.animationPresets[presetName];
    if (!preset) return;
    
    this.duration = preset.duration;
    this.playbackSpeed = preset.speed;
    this.loop = preset.loop;
    
    // Update UI
    document.getElementById('curve-duration').value = this.duration;
    document.getElementById('curve-speed').value = this.playbackSpeed;
    document.getElementById('curve-loop').checked = this.loop;
    
    document.querySelector('.control-value').textContent = `${this.duration}s`;
    document.querySelectorAll('.control-value')[1].textContent = `${this.playbackSpeed}x`;
  }

  play() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.startTime = performance.now() - (this.currentTime * 1000);
    this.animate();
    
    document.getElementById('curve-play').disabled = true;
    document.getElementById('curve-pause').disabled = false;
  }

  pause() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    document.getElementById('curve-play').disabled = false;
    document.getElementById('curve-pause').disabled = true;
  }

  stop() {
    this.isAnimating = false;
    this.currentTime = 0;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.trailPoints = [];
    this.particles = [];
    
    document.getElementById('curve-play').disabled = false;
    document.getElementById('curve-pause').disabled = true;
    
    this.updateDisplay();
    this.curveEditor.draw();
  }

  animate() {
    if (!this.isAnimating) return;
    
    const now = performance.now();
    const elapsed = (now - this.startTime) / 1000;
    this.currentTime = elapsed * this.playbackSpeed;
    
    // Handle looping
    if (this.currentTime >= this.duration) {
      if (this.loop) {
        this.currentTime = this.currentTime % this.duration;
        this.startTime = now - (this.currentTime * 1000 / this.playbackSpeed);
      } else {
        this.stop();
        return;
      }
    }
    
    this.updateAnimation();
    this.updateDisplay();
    this.curveEditor.draw();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  updateAnimation() {
    if (!this.curveEditor.currentTrack?.values) return;
    
    const progress = this.currentTime / this.duration;
    const value = this.getCurrentValue(progress);
    
    // Update trail
    if (this.showTrail) {
      this.updateTrail(progress, value);
    }
    
    // Update particles
    if (this.showParticles) {
      this.updateParticles(progress, value);
    }
    
    // Audio visualization
    if (this.audioVisualization && this.analyser) {
      this.updateAudioVisualization();
    }
  }

  getCurrentValue(progress) {
    if (!this.curveEditor.currentTrack?.values) return 0;
    
    const values = this.curveEditor.currentTrack.values;
    const scaledProgress = progress * (values.length - 1);
    const index = Math.floor(scaledProgress);
    const fraction = scaledProgress - index;
    
    if (index >= values.length - 1) return values[values.length - 1];
    if (index < 0) return values[0];
    
    return values[index] + (values[index + 1] - values[index]) * fraction;
  }

  updateTrail(progress, value) {
    const canvas = this.curveEditor.canvas;
    if (!canvas) return;
    
    const x = progress * canvas.width;
    const y = canvas.height - (value * canvas.height) - 20 * this.curveEditor.deviceRatio;
    
    this.trailPoints.push({ x, y, time: this.currentTime });
    
    // Limit trail length
    if (this.trailPoints.length > this.trailLength) {
      this.trailPoints.shift();
    }
  }

  updateParticles(progress, value) {
    if (Math.random() < 0.3) { // 30% chance per frame
      const canvas = this.curveEditor.canvas;
      if (!canvas) return;
      
      const x = progress * canvas.width;
      const y = canvas.height - (value * canvas.height) - 20 * this.curveEditor.deviceRatio;
      
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1.0,
        decay: 0.02,
        size: Math.random() * 3 + 1,
        color: this.curveEditor.currentTrack?.color || '#49a9ff'
      });
    }
    
    // Update existing particles
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      particle.vy += 0.1; // Gravity
      return particle.life > 0;
    });
    
    // Limit particle count
    if (this.particles.length > this.maxParticles) {
      this.particles = this.particles.slice(-this.maxParticles);
    }
  }

  updateAudioVisualization() {
    if (!this.analyser || !this.audioData) return;
    
    this.analyser.getByteFrequencyData(this.audioData);
    
    // Use audio data to influence particle generation
    const average = this.audioData.reduce((sum, val) => sum + val, 0) / this.audioData.length;
    const intensity = average / 255;
    
    if (intensity > 0.1 && Math.random() < intensity * 0.5) {
      const canvas = this.curveEditor.canvas;
      if (!canvas) return;
      
      const progress = this.currentTime / this.duration;
      const x = progress * canvas.width;
      const y = canvas.height * 0.5;
      
      this.particles.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        decay: 0.03,
        size: Math.random() * 5 + 2,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      });
    }
  }

  setupAudioVisualization() {
    if (!this.audioContext || !this.curveEditor.app?.audio?.master) return;
    
    try {
      this.curveEditor.app.audio.master.connect(this.analyser);
    } catch (err) {
      console.warn('Failed to connect audio for visualization:', err);
    }
  }

  updateDisplay() {
    const timeEl = document.getElementById('curve-time');
    const progressEl = document.getElementById('curve-progress');
    const fpsEl = document.getElementById('curve-fps');
    
    if (timeEl) {
      timeEl.textContent = `${this.currentTime.toFixed(1)}s`;
    }
    
    if (progressEl) {
      const progress = (this.currentTime / this.duration) * 100;
      progressEl.textContent = `${Math.round(progress)}%`;
    }
    
    if (fpsEl) {
      // Simple FPS calculation
      const now = performance.now();
      if (!this.lastFrameTime) this.lastFrameTime = now;
      const fps = 1000 / (now - this.lastFrameTime);
      this.lastFrameTime = now;
      fpsEl.textContent = Math.round(fps);
    }
  }

  drawAnimationOverlay(ctx) {
    if (!this.isAnimating) return;
    
    const canvas = this.curveEditor.canvas;
    if (!canvas) return;
    
    // Draw trail
    if (this.showTrail && this.trailPoints.length > 1) {
      ctx.strokeStyle = this.curveEditor.currentTrack?.color || '#49a9ff';
      ctx.lineWidth = 2 * this.curveEditor.deviceRatio;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      this.trailPoints.forEach((point, index) => {
        const alpha = index / this.trailPoints.length;
        ctx.globalAlpha = alpha * 0.8;
        
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    
    // Draw particles
    if (this.showParticles) {
      this.particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10 * this.curveEditor.deviceRatio;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * this.curveEditor.deviceRatio, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
    }
    
    // Draw current position indicator
    const progress = this.currentTime / this.duration;
    const x = progress * canvas.width;
    const value = this.getCurrentValue(progress);
    const y = canvas.height - (value * canvas.height) - 20 * this.curveEditor.deviceRatio;
    
    ctx.fillStyle = '#ff49af';
    ctx.shadowColor = '#ff49af';
    ctx.shadowBlur = 15 * this.curveEditor.deviceRatio;
    ctx.beginPath();
    ctx.arc(x, y, 8 * this.curveEditor.deviceRatio, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Export animation data
  exportAnimation() {
    return {
      duration: this.duration,
      speed: this.playbackSpeed,
      loop: this.loop,
      showTrail: this.showTrail,
      showParticles: this.showParticles,
      audioVisualization: this.audioVisualization,
      trailLength: this.trailLength,
      maxParticles: this.maxParticles
    };
  }

  // Import animation data
  importAnimation(data) {
    if (data.duration) this.duration = data.duration;
    if (data.speed) this.playbackSpeed = data.speed;
    if (data.loop !== undefined) this.loop = data.loop;
    if (data.showTrail !== undefined) this.showTrail = data.showTrail;
    if (data.showParticles !== undefined) this.showParticles = data.showParticles;
    if (data.audioVisualization !== undefined) this.audioVisualization = data.audioVisualization;
    if (data.trailLength) this.trailLength = data.trailLength;
    if (data.maxParticles) this.maxParticles = data.maxParticles;
    
    // Update UI
    this.updateUI();
  }

  updateUI() {
    document.getElementById('curve-duration').value = this.duration;
    document.getElementById('curve-speed').value = this.playbackSpeed;
    document.getElementById('curve-loop').checked = this.loop;
    document.getElementById('curve-trail').checked = this.showTrail;
    document.getElementById('curve-particles').checked = this.showParticles;
    document.getElementById('curve-audio-viz').checked = this.audioVisualization;
    
    document.querySelector('.control-value').textContent = `${this.duration}s`;
    document.querySelectorAll('.control-value')[1].textContent = `${this.playbackSpeed}x`;
  }
}