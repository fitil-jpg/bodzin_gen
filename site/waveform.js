/**
 * Waveform Visualization Module
 * Handles real-time audio visualization, recording, and playback
 */

export class WaveformModule {
  constructor(app) {
    this.app = app;
    this.canvas = null;
    this.ctx = null;
    this.analyser = null;
    this.fftAnalyser = null;
    this.dataArray = null;
    this.fftDataArray = null;
    this.animationId = null;
    this.peaks = new Array(1024).fill(0);
    this.peakDecay = 0.95;
    this.peakHold = new Array(1024).fill(0);
    this.peakHoldTime = new Array(1024).fill(0);
    this.lastPeakHoldUpdate = 0;
    
    this.settings = {
      mode: 'bars',
      sensitivity: 1.0,
      smoothing: 0.8,
      colorMode: 'gradient',
      showGrid: true,
      showPeaks: true,
      showFrequency: false,
      showRMS: false,
      showPeakHold: true,
      peakDecay: 0.95,
      barWidth: 2,
      barSpacing: 1
    };
    
    this.recording = {
      isRecording: false,
      recordedData: [],
      maxRecordLength: 1000,
      playbackPosition: 0,
      isPlaying: false
    };
    
    this.presets = {
      default: {
        mode: 'bars',
        colorMode: 'gradient',
        sensitivity: 1.0,
        smoothing: 0.8,
        showGrid: true,
        showPeaks: true,
        showFrequency: false,
        showRMS: false,
        showPeakHold: true
      },
      minimal: {
        mode: 'line',
        colorMode: 'solid',
        sensitivity: 0.8,
        smoothing: 0.9,
        showGrid: false,
        showPeaks: false,
        showFrequency: false,
        showRMS: false,
        showPeakHold: false
      },
      spectrum: {
        mode: 'spectrum',
        colorMode: 'rainbow',
        sensitivity: 1.2,
        smoothing: 0.6,
        showGrid: true,
        showPeaks: false,
        showFrequency: true,
        showRMS: true,
        showPeakHold: false
      },
      oscilloscope: {
        mode: 'oscilloscope',
        colorMode: 'gradient',
        sensitivity: 1.5,
        smoothing: 0.3,
        showGrid: true,
        showPeaks: true,
        showFrequency: false,
        showRMS: false,
        showPeakHold: true
      },
      recording: {
        mode: 'bars',
        colorMode: 'gradient',
        sensitivity: 1.0,
        smoothing: 0.7,
        showGrid: true,
        showPeaks: true,
        showFrequency: true,
        showRMS: true,
        showPeakHold: true
      }
    };
  }

  init() {
    this.canvas = document.getElementById('waveform');
    if (!this.canvas) return;

    this.setupCanvas();
    this.setupAnalysers();
    this.setupControls();
    this.startAnimation();
  }

  setupCanvas() {
    const resizeObserver = new ResizeObserver(() => {
      this.syncCanvas();
    });
    this.syncCanvas();
    resizeObserver.observe(this.canvas);
  }

  syncCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  setupAnalysers() {
    this.analyser = new Tone.Analyser('waveform', 2048);
    this.fftAnalyser = new Tone.Analyser('fft', 1024);
    
    this.app.audio.master.connect(this.analyser);
    this.app.audio.master.connect(this.fftAnalyser);
    
    this.dataArray = new Uint8Array(this.analyser.size);
    this.fftDataArray = new Uint8Array(this.fftAnalyser.size);
  }

  setupControls() {
    const controlsContainer = document.querySelector('.waveform-controls');
    if (!controlsContainer) return;

    this.createModeControls(controlsContainer);
    this.createColorControls(controlsContainer);
    this.createToggleControls(controlsContainer);
    this.createSliderControls(controlsContainer);
    this.createRecordingControls(controlsContainer);
    this.createDisplayControls(controlsContainer);
    this.createPresetControls(controlsContainer);
  }

  createModeControls(container) {
    const modeControl = document.createElement('div');
    modeControl.className = 'waveform-control-group';
    modeControl.innerHTML = `
      <label for="waveformMode" class="waveform-label">Mode</label>
      <select id="waveformMode" class="waveform-control">
        <option value="bars">Bars</option>
        <option value="line">Line</option>
        <option value="oscilloscope">Oscilloscope</option>
        <option value="spectrum">Spectrum</option>
      </select>
    `;
    container.appendChild(modeControl);

    const modeSelect = document.getElementById('waveformMode');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        this.settings.mode = e.target.value;
      });
    }
  }

  createColorControls(container) {
    const colorControl = document.createElement('div');
    colorControl.className = 'waveform-control-group';
    colorControl.innerHTML = `
      <label for="waveformColor" class="waveform-label">Color</label>
      <select id="waveformColor" class="waveform-control">
        <option value="gradient">Gradient</option>
        <option value="solid">Solid</option>
        <option value="rainbow">Rainbow</option>
      </select>
    `;
    container.appendChild(colorControl);

    const colorSelect = document.getElementById('waveformColor');
    if (colorSelect) {
      colorSelect.addEventListener('change', (e) => {
        this.settings.colorMode = e.target.value;
      });
    }
  }

  createToggleControls(container) {
    const toggleControl = document.createElement('div');
    toggleControl.className = 'waveform-control-group';
    toggleControl.innerHTML = `
      <label class="waveform-toggle">
        <input type="checkbox" id="waveformGrid" checked>
        Grid
      </label>
      <label class="waveform-toggle">
        <input type="checkbox" id="waveformPeaks" checked>
        Peaks
      </label>
    `;
    container.appendChild(toggleControl);

    const gridToggle = document.getElementById('waveformGrid');
    const peaksToggle = document.getElementById('waveformPeaks');

    if (gridToggle) {
      gridToggle.addEventListener('change', (e) => {
        this.settings.showGrid = e.target.checked;
      });
    }

    if (peaksToggle) {
      peaksToggle.addEventListener('change', (e) => {
        this.settings.showPeaks = e.target.checked;
      });
    }
  }

  createSliderControls(container) {
    const sensitivityControl = document.createElement('div');
    sensitivityControl.className = 'waveform-control-group';
    sensitivityControl.innerHTML = `
      <label for="waveformSensitivity" class="waveform-label">Sensitivity</label>
      <input type="range" id="waveformSensitivity" class="waveform-slider" min="0.1" max="3" step="0.1" value="1">
      <span id="waveformSensitivityValue" class="waveform-value">1.0</span>
    `;
    container.appendChild(sensitivityControl);

    const smoothingControl = document.createElement('div');
    smoothingControl.className = 'waveform-control-group';
    smoothingControl.innerHTML = `
      <label for="waveformSmoothing" class="waveform-label">Smoothing</label>
      <input type="range" id="waveformSmoothing" class="waveform-slider" min="0" max="0.95" step="0.05" value="0.8">
      <span id="waveformSmoothingValue" class="waveform-value">0.80</span>
    `;
    container.appendChild(smoothingControl);

    const sensitivitySlider = document.getElementById('waveformSensitivity');
    const smoothingSlider = document.getElementById('waveformSmoothing');

    if (sensitivitySlider) {
      sensitivitySlider.addEventListener('input', (e) => {
        this.settings.sensitivity = parseFloat(e.target.value);
        const valueDisplay = document.getElementById('waveformSensitivityValue');
        if (valueDisplay) valueDisplay.textContent = this.settings.sensitivity.toFixed(1);
      });
    }

    if (smoothingSlider) {
      smoothingSlider.addEventListener('input', (e) => {
        this.settings.smoothing = parseFloat(e.target.value);
        const valueDisplay = document.getElementById('waveformSmoothingValue');
        if (valueDisplay) valueDisplay.textContent = this.settings.smoothing.toFixed(2);
      });
    }
  }

  createRecordingControls(container) {
    const recordingControl = document.createElement('div');
    recordingControl.className = 'waveform-control-group';
    recordingControl.innerHTML = `
      <button id="waveformRecord" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Record</button>
      <button id="waveformPlay" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Play</button>
      <button id="waveformClear" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Clear</button>
    `;
    container.appendChild(recordingControl);

    const recordBtn = document.getElementById('waveformRecord');
    const playBtn = document.getElementById('waveformPlay');
    const clearBtn = document.getElementById('waveformClear');

    if (recordBtn) {
      recordBtn.addEventListener('click', () => this.toggleRecording());
    }
    if (playBtn) {
      playBtn.addEventListener('click', () => this.togglePlayback());
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearRecording());
    }
  }

  createDisplayControls(container) {
    const displayControl = document.createElement('div');
    displayControl.className = 'waveform-control-group';
    displayControl.innerHTML = `
      <label class="waveform-toggle">
        <input type="checkbox" id="waveformFrequency">
        Freq
      </label>
      <label class="waveform-toggle">
        <input type="checkbox" id="waveformRMS">
        RMS
      </label>
      <label class="waveform-toggle">
        <input type="checkbox" id="waveformPeakHold" checked>
        Peak Hold
      </label>
    `;
    container.appendChild(displayControl);

    const freqToggle = document.getElementById('waveformFrequency');
    const rmsToggle = document.getElementById('waveformRMS');
    const peakHoldToggle = document.getElementById('waveformPeakHold');

    if (freqToggle) {
      freqToggle.addEventListener('change', (e) => {
        this.settings.showFrequency = e.target.checked;
      });
    }
    if (rmsToggle) {
      rmsToggle.addEventListener('change', (e) => {
        this.settings.showRMS = e.target.checked;
      });
    }
    if (peakHoldToggle) {
      peakHoldToggle.addEventListener('change', (e) => {
        this.settings.showPeakHold = e.target.checked;
      });
    }
  }

  createPresetControls(container) {
    const presetControl = document.createElement('div');
    presetControl.className = 'waveform-control-group';
    presetControl.innerHTML = `
      <label for="waveformPreset" class="waveform-label">Preset</label>
      <select id="waveformPreset" class="waveform-control">
        <option value="default">Default</option>
        <option value="minimal">Minimal</option>
        <option value="spectrum">Spectrum</option>
        <option value="oscilloscope">Oscilloscope</option>
        <option value="recording">Recording</option>
      </select>
    `;
    container.appendChild(presetControl);

    const presetSelect = document.getElementById('waveformPreset');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        this.applyPreset(e.target.value);
      });
    }
  }

  startAnimation() {
    const animate = () => {
      if (this.analyser && this.ctx) {
        this.handleRecording();
        this.handlePlayback();
        this.draw();
      }
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  handleRecording() {
    if (this.recording.isRecording) {
      const data = new Uint8Array(this.analyser.size);
      this.analyser.getValue(data);
      this.recording.recordedData.push(Array.from(data));
      
      if (this.recording.recordedData.length > this.recording.maxRecordLength) {
        this.recording.recordedData.shift();
      }
    }
  }

  handlePlayback() {
    if (this.recording.isPlaying && this.recording.recordedData.length > 0) {
      const playbackData = this.recording.recordedData[this.recording.playbackPosition];
      if (playbackData) {
        const tempData = new Uint8Array(playbackData);
        const originalData = this.dataArray;
        this.dataArray = tempData;
        this.draw();
        this.dataArray = originalData;
        
        this.recording.playbackPosition++;
        if (this.recording.playbackPosition >= this.recording.recordedData.length) {
          this.recording.playbackPosition = 0;
        }
      }
    } else {
      this.analyser.getValue(this.dataArray);
      this.fftAnalyser.getValue(this.fftDataArray);
      this.draw();
    }
  }

  draw() {
    if (!this.ctx) return;

    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    const smoothedData = this.applySmoothing(this.dataArray, this.settings.smoothing);
    this.updatePeaks(smoothedData);

    switch (this.settings.mode) {
      case 'bars':
        this.drawBars(smoothedData, width, height);
        break;
      case 'line':
        this.drawLine(smoothedData, width, height);
        break;
      case 'oscilloscope':
        this.drawOscilloscope(smoothedData, width, height);
        break;
      case 'spectrum':
        this.drawSpectrum(width, height);
        break;
    }

    if (this.settings.showGrid) this.drawGrid(width, height);
    if (this.settings.showPeaks) this.drawPeakIndicators(width, height);
    if (this.settings.showFrequency) this.drawFrequencyInfo(width, height);
    if (this.settings.showRMS) this.drawRMSLevel(width, height);
    if (this.settings.showPeakHold) this.drawPeakHold(width, height);
    if (this.recording.isRecording) this.drawRecordingIndicator(width, height);

    this.addGlow(width, height);
  }

  applySmoothing(data, factor) {
    const smoothed = new Uint8Array(data.length);
    smoothed[0] = data[0];
    
    for (let i = 1; i < data.length; i++) {
      smoothed[i] = smoothed[i - 1] * factor + data[i] * (1 - factor);
    }
    
    return smoothed;
  }

  updatePeaks(data) {
    const now = Date.now();
    const timeDelta = now - this.lastPeakHoldUpdate;
    
    for (let i = 0; i < data.length; i++) {
      const value = data[i] / 255;
      
      if (value > this.peaks[i]) {
        this.peaks[i] = value;
      } else {
        this.peaks[i] *= this.peakDecay;
      }
      
      if (value > this.peakHold[i]) {
        this.peakHold[i] = value;
        this.peakHoldTime[i] = now;
      } else if (timeDelta > 1000) {
        this.peakHold[i] *= 0.99;
      }
    }
    
    if (timeDelta > 1000) {
      this.lastPeakHoldUpdate = now;
    }
  }

  drawBars(data, width, height) {
    const barWidth = this.settings.barWidth;
    const barSpacing = this.settings.barSpacing;
    const totalBarWidth = barWidth + barSpacing;
    const numBars = Math.floor(width / totalBarWidth);
    const dataPerBar = Math.floor(data.length / numBars);
    
    for (let i = 0; i < numBars; i++) {
      const startIndex = i * dataPerBar;
      const endIndex = Math.min(startIndex + dataPerBar, data.length);
      let sum = 0;
      
      for (let j = startIndex; j < endIndex; j++) {
        sum += data[j];
      }
      
      const avgValue = sum / (endIndex - startIndex);
      const barHeight = (avgValue / 255) * height * this.settings.sensitivity;
      const x = i * totalBarWidth;
      const y = height - barHeight;
      
      this.ctx.fillStyle = this.createColor(i, numBars, avgValue);
      this.ctx.fillRect(x, y, barWidth, barHeight);
    }
  }

  drawLine(data, width, height) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, height);
    
    for (let i = 0; i < data.length; i++) {
      const x = (i / data.length) * width;
      const y = height - (data[i] / 255) * height * this.settings.sensitivity;
      this.ctx.lineTo(x, y);
    }
    
    this.ctx.lineTo(width, height);
    this.ctx.closePath();
    
    const gradient = this.createGradient(width, height);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    this.ctx.strokeStyle = this.createColor(0, 1, 128);
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  drawOscilloscope(data, width, height) {
    const centerY = height / 2;
    const scale = height * 0.4 * this.settings.sensitivity;
    
    for (let trace = 0; trace < 3; trace++) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.createColor(trace, 3, 128);
      this.ctx.lineWidth = 1;
      
      for (let i = 0; i < data.length; i++) {
        const x = (i / data.length) * width;
        const y = centerY + (data[i] - 128) / 128 * scale;
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      this.ctx.stroke();
    }
  }

  drawSpectrum(width, height) {
    const barWidth = width / this.fftDataArray.length;
    
    for (let i = 0; i < this.fftDataArray.length; i++) {
      const barHeight = (this.fftDataArray[i] / 255) * height * this.settings.sensitivity;
      const x = i * barWidth;
      const y = height - barHeight;
      
      this.ctx.fillStyle = this.createColor(i, this.fftDataArray.length, this.fftDataArray[i]);
      this.ctx.fillRect(x, y, barWidth, barHeight);
    }
  }

  createColor(index, total, value) {
    const hue = (index / total) * 360;
    const saturation = 80;
    const lightness = 50 + (value / 255) * 30;
    
    switch (this.settings.colorMode) {
      case 'gradient':
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      case 'solid':
        return `hsl(200, 80%, 60%)`;
      case 'rainbow':
        return `hsl(${hue}, 100%, 50%)`;
      default:
        return `hsl(200, 80%, 60%)`;
    }
  }

  createGradient(width, height) {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 150, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 150, 255, 0.1)');
    return gradient;
  }

  drawGrid(width, height) {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
    
    // Vertical lines
    for (let i = 0; i <= 8; i++) {
      const x = (width / 8) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
  }

  drawPeakIndicators(width, height) {
    this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i < this.peaks.length; i++) {
      const x = (i / this.peaks.length) * width;
      const y = height - (this.peaks[i] * height * this.settings.sensitivity);
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  drawFrequencyInfo(width, height) {
    const dominantFreq = this.getDominantFrequency();
    if (dominantFreq > 0) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.font = '12px monospace';
      this.ctx.fillText(`Freq: ${dominantFreq.toFixed(1)} Hz`, 10, 20);
    }
  }

  drawRMSLevel(width, height) {
    const rms = this.calculateRMS();
    const rmsHeight = rms * height * this.settings.sensitivity;
    
    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
    this.ctx.fillRect(width - 20, height - rmsHeight, 10, rmsHeight);
  }

  drawPeakHold(width, height) {
    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    this.ctx.lineWidth = 2;
    
    for (let i = 0; i < this.peakHold.length; i++) {
      const x = (i / this.peakHold.length) * width;
      const y = height - (this.peakHold[i] * height * this.settings.sensitivity);
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  drawRecordingIndicator(width, height) {
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    this.ctx.font = 'bold 14px monospace';
    this.ctx.fillText('REC', 10, height - 10);
    
    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(0, 0, width, height);
  }

  addGlow(width, height) {
    this.ctx.shadowColor = 'rgba(0, 150, 255, 0.5)';
    this.ctx.shadowBlur = 10;
    this.ctx.strokeRect(0, 0, width, height);
    this.ctx.shadowBlur = 0;
  }

  getDominantFrequency() {
    let maxValue = 0;
    let maxIndex = 0;
    
    for (let i = 0; i < this.fftDataArray.length; i++) {
      if (this.fftDataArray[i] > maxValue) {
        maxValue = this.fftDataArray[i];
        maxIndex = i;
      }
    }
    
    return (maxIndex / this.fftDataArray.length) * 22050;
  }

  calculateRMS() {
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const value = (this.dataArray[i] - 128) / 128;
      sum += value * value;
    }
    return Math.sqrt(sum / this.dataArray.length);
  }

  toggleRecording() {
    const recordBtn = document.getElementById('waveformRecord');
    
    if (this.recording.isRecording) {
      this.recording.isRecording = false;
      if (recordBtn) {
        recordBtn.textContent = 'Record';
        recordBtn.style.background = 'rgba(255, 255, 255, 0.04)';
      }
      this.app.setStatus('Waveform recording stopped');
    } else {
      this.recording.isRecording = true;
      this.recording.recordedData = [];
      if (recordBtn) {
        recordBtn.textContent = 'Stop';
        recordBtn.style.background = 'rgba(255, 0, 0, 0.2)';
      }
      this.app.setStatus('Waveform recording started');
    }
  }

  togglePlayback() {
    const playBtn = document.getElementById('waveformPlay');
    
    if (this.recording.isPlaying) {
      this.recording.isPlaying = false;
      if (playBtn) {
        playBtn.textContent = 'Play';
        playBtn.style.background = 'rgba(255, 255, 255, 0.04)';
      }
      this.app.setStatus('Waveform playback stopped');
    } else {
      if (this.recording.recordedData.length === 0) {
        this.app.setStatus('No recorded data to play');
        return;
      }
      this.recording.isPlaying = true;
      this.recording.playbackPosition = 0;
      if (playBtn) {
        playBtn.textContent = 'Stop';
        playBtn.style.background = 'rgba(0, 255, 0, 0.2)';
      }
      this.app.setStatus('Waveform playback started');
    }
  }

  clearRecording() {
    this.recording.recordedData = [];
    this.recording.isRecording = false;
    this.recording.isPlaying = false;
    this.recording.playbackPosition = 0;
    
    const recordBtn = document.getElementById('waveformRecord');
    const playBtn = document.getElementById('waveformPlay');
    
    if (recordBtn) {
      recordBtn.textContent = 'Record';
      recordBtn.style.background = 'rgba(255, 255, 255, 0.04)';
    }
    if (playBtn) {
      playBtn.textContent = 'Play';
      playBtn.style.background = 'rgba(255, 255, 255, 0.04)';
    }
    
    this.app.setStatus('Waveform recording cleared');
  }

  applyPreset(presetName) {
    const preset = this.presets[presetName] || this.presets.default;
    Object.assign(this.settings, preset);
    
    // Update UI controls
    this.updateUIControls(preset);
    this.app.setStatus(`Waveform preset: ${presetName}`);
  }

  updateUIControls(preset) {
    const modeSelect = document.getElementById('waveformMode');
    const colorSelect = document.getElementById('waveformColor');
    const sensitivitySlider = document.getElementById('waveformSensitivity');
    const smoothingSlider = document.getElementById('waveformSmoothing');
    const gridToggle = document.getElementById('waveformGrid');
    const peaksToggle = document.getElementById('waveformPeaks');
    const freqToggle = document.getElementById('waveformFrequency');
    const rmsToggle = document.getElementById('waveformRMS');
    const peakHoldToggle = document.getElementById('waveformPeakHold');
    
    if (modeSelect) modeSelect.value = preset.mode;
    if (colorSelect) colorSelect.value = preset.colorMode;
    if (sensitivitySlider) {
      sensitivitySlider.value = preset.sensitivity;
      const sensitivityValue = document.getElementById('waveformSensitivityValue');
      if (sensitivityValue) sensitivityValue.textContent = preset.sensitivity.toFixed(1);
    }
    if (smoothingSlider) {
      smoothingSlider.value = preset.smoothing;
      const smoothingValue = document.getElementById('waveformSmoothingValue');
      if (smoothingValue) smoothingValue.textContent = preset.smoothing.toFixed(2);
    }
    if (gridToggle) gridToggle.checked = preset.showGrid;
    if (peaksToggle) peaksToggle.checked = preset.showPeaks;
    if (freqToggle) freqToggle.checked = preset.showFrequency;
    if (rmsToggle) rmsToggle.checked = preset.showRMS;
    if (peakHoldToggle) peakHoldToggle.checked = preset.showPeakHold;
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.fftAnalyser) {
      this.fftAnalyser.disconnect();
    }
  }
}