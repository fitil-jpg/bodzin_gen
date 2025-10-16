// Main Application - Modular Architecture
// ES6 Module-based music production application

import { AudioEngine } from './modules/audio/audioEngine.js';
import { ControlManager } from './modules/controls/controlManager.js';
import { AutomationEngine } from './modules/automation/automationEngine.js';
import { UIManager } from './modules/ui/uiManager.js';
import { PresetManager } from './modules/presets/presetManager.js';
import { Helpers } from './modules/utils/helpers.js';

class MusicProductionApp {
  constructor() {
    this.audioEngine = new AudioEngine();
    this.controlManager = new ControlManager();
    this.automationEngine = new AutomationEngine();
    this.uiManager = new UIManager();
    this.presetManager = new PresetManager();
    this.helpers = new Helpers();
    
    this.isInitialized = false;
    this.timeline = {
      currentStep: 0,
      totalSteps: 16,
      canvas: null,
      ctx: null,
      ratio: 1
    };
    this.waveform = {
      canvas: null,
      ctx: null,
      ratio: 1,
      analyser: null,
      dataArray: new Uint8Array(1024),
      previousData: new Array(1024).fill(0)
    };
    this.sections = [
      { name: 'Intro', start: 0, end: 4, color: 'rgba(73, 169, 255, 0.04)' },
      { name: 'Verse', start: 4, end: 8, color: 'rgba(255, 73, 175, 0.04)' },
      { name: 'Chorus', start: 8, end: 12, color: 'rgba(148, 255, 73, 0.04)' },
      { name: 'Outro', start: 12, end: 16, color: 'rgba(255, 193, 7, 0.04)' }
    ];
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize audio engine
      await this.audioEngine.initialize();
      
      // Initialize UI
      this.uiManager.initialize();
      
      // Initialize controls
      this.controlManager.renderControls(document.getElementById('controls'));
      this.controlManager.loadControlState();
      
      // Set up parameter change callback
      this.controlManager.setOnParameterChange((id, value) => {
        this.audioEngine.updateParameter(id, value);
      });
      
      // Initialize automation
      this.automationEngine.initialize();
      
      // Initialize preset manager
      this.presetManager.initialize();
      
      // Initialize timeline
      this.initializeTimeline();
      
      // Initialize waveform
      this.initializeWaveform();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize MIDI
      await this.helpers.initializeMIDI();
      
      this.isInitialized = true;
      console.log('Music Production App initialized');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  }

  initializeTimeline() {
    const canvas = document.getElementById('timeline');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      ctx.scale(ratio, ratio);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    this.timeline.canvas = canvas;
    this.timeline.ctx = ctx;
    this.timeline.ratio = ratio;

    this.drawTimeline();
  }

  initializeWaveform() {
    const canvas = document.getElementById('waveform');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      ctx.scale(ratio, ratio);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    this.waveform.canvas = canvas;
    this.waveform.ctx = ctx;
    this.waveform.ratio = ratio;
    this.waveform.analyser = this.audioEngine.analyser;

    this.startWaveformAnimation();
  }

  setupEventListeners() {
    // Playback controls
    document.getElementById('startButton')?.addEventListener('click', () => this.startPlayback());
    document.getElementById('stopButton')?.addEventListener('click', () => this.stopPlayback());
    
    // Preset controls
    document.getElementById('savePresetButton')?.addEventListener('click', () => this.savePreset());
    document.getElementById('loadPresetButton')?.addEventListener('click', () => this.loadPreset());
    
    // Timeline interaction
    this.timeline.canvas?.addEventListener('click', (e) => this.handleTimelineClick(e));
    this.timeline.canvas?.addEventListener('mousemove', (e) => this.handleTimelineHover(e));
    
    // MIDI support
    this.helpers.onMIDIMessage((message) => this.handleMIDIMessage(message));
  }

  async startPlayback() {
    const startBtn = document.getElementById('startButton');
    const stopBtn = document.getElementById('stopButton');
    
    // Enhanced visual feedback
    if (startBtn) {
      this.uiManager.showLoading(startBtn);
      this.uiManager.animateButton(startBtn, 'click');
    }
    
    await this.audioEngine.startTransport();
    
    if (startBtn) {
      this.uiManager.hideLoading(startBtn);
      startBtn.style.background = 'rgba(73, 169, 255, 0.1)';
      startBtn.style.borderColor = 'rgba(73, 169, 255, 0.3)';
    }
    
    if (stopBtn) {
      this.uiManager.animateButton(stopBtn, 'hover');
      stopBtn.style.background = 'rgba(255, 73, 175, 0.1)';
      stopBtn.style.borderColor = '#ff49af';
    }
    
    this.uiManager.setStatus('Playing');
    this.startTimelineAnimation();
  }

  stopPlayback() {
    const startBtn = document.getElementById('startButton');
    const stopBtn = document.getElementById('stopButton');
    
    // Enhanced visual feedback
    if (stopBtn) {
      this.uiManager.animateButton(stopBtn, 'click');
      stopBtn.style.background = 'rgba(255, 255, 255, 0.04)';
      stopBtn.style.borderColor = 'var(--border)';
    }
    
    if (startBtn) {
      this.uiManager.animateButton(startBtn, 'hover');
      startBtn.style.background = 'linear-gradient(135deg, var(--accent), #3d8bff)';
      startBtn.style.borderColor = 'rgba(73, 169, 255, 0.45)';
    }
    
    this.audioEngine.stopTransport();
    this.timeline.currentStep = 0;
    this.automationEngine.currentStep = 0;
    this.drawTimeline();
    this.uiManager.setStatus('Stopped');
    this.stopTimelineAnimation();
  }

  handleTimelineClick(e) {
    const rect = this.timeline.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const step = Math.max(0, Math.min(this.timeline.totalSteps - 1, Math.floor(x / (rect.width / this.timeline.totalSteps))));
    
    if (step !== this.timeline.currentStep) {
      this.timeline.canvas.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
      this.timeline.currentStep = step;
      this.automationEngine.currentStep = step;
      this.automationEngine.applyAutomationForStep(this.controlManager);
      this.drawTimeline();
      this.uiManager.setStatus(`Step ${step + 1}/${this.timeline.totalSteps}`);
      this.uiManager.updateSectionLabel(step, this.sections);
      
      this.timeline.canvas.style.transform = 'scale(1.01)';
      setTimeout(() => {
        this.timeline.canvas.style.transform = 'scale(1)';
        this.timeline.canvas.style.transition = '';
      }, 200);
    }
  }

  handleTimelineHover(e) {
    // Add hover effects if needed
  }

  drawTimeline() {
    if (!this.timeline.canvas || !this.timeline.ctx) return;
    
    const { canvas, ctx, ratio } = this.timeline;
    const width = canvas.width / ratio;
    const height = canvas.height / ratio;
    
    // Clear canvas
    ctx.fillStyle = 'var(--bg)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw sections
    this.sections.forEach(section => {
      const sectionWidth = (width / this.timeline.totalSteps) * (section.end - section.start);
      const sectionX = (width / this.timeline.totalSteps) * section.start;
      
      ctx.fillStyle = section.color;
      ctx.fillRect(sectionX, 0, sectionWidth, height);
      
      // Section label
      ctx.fillStyle = 'var(--text)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(section.name, sectionX + sectionWidth / 2, 20);
    });
    
    // Draw automation tracks
    const trackHeight = height / Math.max(this.automationEngine.tracks.length, 1);
    this.automationEngine.tracks.forEach((track, trackIndex) => {
      if (!track.enabled) return;
      
      const trackY = trackIndex * trackHeight;
      const trackAreaHeight = trackHeight - 20;
      
      // Track background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(0, trackY, width, trackAreaHeight);
      
      // Track label
      ctx.fillStyle = 'var(--muted)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(track.name, 5, trackY + 15);
      
      // Draw automation curve
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2;
      
      const stepWidth = width / this.timeline.totalSteps;
      track.values.forEach((value, index) => {
        const x = index * stepWidth + stepWidth / 2;
        const y = trackY + (1 - value) * trackAreaHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = (index - 1) * stepWidth + stepWidth / 2;
          const prevY = trackY + (1 - track.values[index - 1]) * trackAreaHeight;
          const controlX = (prevX + x) / 2;
          const controlY = (prevY + y) / 2;
          ctx.quadraticCurveTo(controlX, controlY, x, y);
        }
      });
      
      // Gradient stroke
      const gradient = ctx.createLinearGradient(0, trackY, width, trackY + trackAreaHeight);
      gradient.addColorStop(0, track.color);
      gradient.addColorStop(1, track.color.replace('0.8', '0.3'));
      ctx.strokeStyle = gradient;
      ctx.stroke();
    });
    
    // Draw steps
    const stepWidth = width / this.timeline.totalSteps;
    for (let i = 0; i < this.timeline.totalSteps; i++) {
      const x = i * stepWidth;
      const isActive = i === this.timeline.currentStep;
      
      ctx.fillStyle = isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(x, height - 4, stepWidth - 1, 4);
    }
    
    // Draw playback cursor
    const activeX = this.timeline.currentStep * stepWidth;
    const time = Date.now() * 0.003;
    const pulseIntensity = 0.3 + 0.2 * Math.sin(time);
    
    const cursorGradient = ctx.createLinearGradient(activeX, 0, activeX + stepWidth, 0);
    cursorGradient.addColorStop(0, `rgba(73, 169, 255, ${pulseIntensity})`);
    cursorGradient.addColorStop(1, `rgba(73, 169, 255, ${pulseIntensity * 0.5})`);
    
    ctx.fillStyle = cursorGradient;
    ctx.fillRect(activeX, 0, stepWidth, height);
    
    // Add glow effect
    const glowGradient = ctx.createRadialGradient(
      activeX + stepWidth / 2, height / 2, 0,
      activeX + stepWidth / 2, height / 2, stepWidth
    );
    glowGradient.addColorStop(0, `rgba(73, 169, 255, ${pulseIntensity * 0.3})`);
    glowGradient.addColorStop(1, 'rgba(73, 169, 255, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.fillRect(activeX - stepWidth / 2, 0, stepWidth * 2, height);
  }

  startTimelineAnimation() {
    const animate = () => {
      if (Tone.Transport.state === 'started') {
        this.drawTimeline();
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  stopTimelineAnimation() {
    // Animation stops when transport stops
  }

  startWaveformAnimation() {
    const animate = () => {
      this.drawWaveform();
      requestAnimationFrame(animate);
    };
    animate();
  }

  drawWaveform() {
    if (!this.waveform.ctx || !this.waveform.analyser) return;
    
    const { canvas, ctx, analyser, dataArray, ratio } = this.waveform;
    const width = canvas.width / ratio;
    const height = canvas.height / ratio;
    
    // Smooth background fade
    ctx.fillStyle = 'rgba(8, 8, 11, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    analyser.getValue(dataArray);
    const barWidth = (width / dataArray.length) * 2.5;
    let x = 0;
    
    // Create animated gradient
    const time = Date.now() * 0.002;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `rgba(73, 169, 255, ${0.8 + 0.2 * Math.sin(time)})`);
    gradient.addColorStop(0.5, `rgba(255, 73, 175, ${0.6 + 0.2 * Math.sin(time + 1)})`);
    gradient.addColorStop(1, `rgba(148, 255, 73, ${0.4 + 0.2 * Math.sin(time + 2)})`);
    
    ctx.fillStyle = gradient;
    
    // Smooth interpolation
    for (let i = 0; i < dataArray.length; i++) {
      const currentValue = dataArray[i] / 255;
      const previousValue = this.waveform.previousData[i];
      const smoothedValue = previousValue + (currentValue - previousValue) * 0.3;
      this.waveform.previousData[i] = smoothedValue;
      
      const barHeight = smoothedValue * height;
      const y = (height - barHeight) / 2;
      
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
      
      x += barWidth + 1;
    }
  }

  savePreset() {
    const name = prompt('Preset name', this.presetManager.currentPresetName || 'Deep Preset');
    if (!name) return;
    
    const preset = this.presetManager.buildPresetPayload(this.controlManager, name);
    this.presetManager.savePreset(preset);
    this.uiManager.setStatus(`Preset "${name}" saved`);
  }

  loadPreset() {
    this.presetManager.loadPreset((preset) => {
      if (preset) {
        this.presetManager.loadPresetFromData(preset, this.controlManager);
        this.uiManager.setStatus(`Preset "${preset.name}" loaded`);
      } else {
        this.uiManager.setStatus('Preset load failed');
      }
    });
  }

  handleMIDIMessage(message) {
    const [command, note, velocity] = message.data;
    if (command === 144 && velocity > 0) { // Note on
      const frequency = this.helpers.noteToFrequency(this.helpers.frequencyToNote(440 * Math.pow(2, (note - 69) / 12)));
      this.audioEngine.triggerNote(frequency, velocity / 127);
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const app = new MusicProductionApp();
  await app.initialize();
  
  // Make app globally available for debugging
  window.app = app;
});
