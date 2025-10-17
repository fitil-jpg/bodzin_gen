export class EQVisualizer {
  constructor(canvas, audioEngine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audioEngine = audioEngine;
    this.animationId = null;
    this.isAnimating = false;
    this.time = 0; // For animation timing
    
    // EQ visualization settings
    this.freqMin = 20; // 20Hz
    this.freqMax = 20000; // 20kHz
    this.dbMin = -24; // -24dB
    this.dbMax = 12; // +12dB
    
    // Visual settings
    this.gridColor = 'rgba(73, 169, 255, 0.1)';
    this.curveColor = '#49a9ff';
    this.curveGlow = 'rgba(73, 169, 255, 0.3)';
    this.zeroLineColor = 'rgba(255, 255, 255, 0.3)';
    this.bandColor = 'rgba(73, 169, 255, 0.6)';
    
    this.setupCanvas();
    this.startAnimation();
  }

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Set canvas size to match display
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  startAnimation() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.animate();
  }

  stopAnimation() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  animate() {
    if (!this.isAnimating) return;
    
    this.time += 0.016; // ~60fps
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  // Method to trigger immediate update when EQ settings change
  update() {
    if (this.isAnimating) {
      this.draw();
    }
  }

  draw() {
    const { width, height } = this.canvas;
    const displayWidth = width / window.devicePixelRatio;
    const displayHeight = height / window.devicePixelRatio;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    // Draw background
    this.drawBackground(displayWidth, displayHeight);
    
    // Draw grid
    this.drawGrid(displayWidth, displayHeight);
    
    // Draw zero line
    this.drawZeroLine(displayWidth, displayHeight);
    
    // Draw frequency response curve
    this.drawFrequencyResponse(displayWidth, displayHeight);
    
    // Draw EQ band indicators
    this.drawBandIndicators(displayWidth, displayHeight);
  }

  drawBackground(width, height) {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(8, 8, 11, 0.8)');
    gradient.addColorStop(1, 'rgba(8, 8, 11, 0.4)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  drawGrid(width, height) {
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 1;
    
    // Horizontal grid lines (dB)
    const dbRange = this.dbMax - this.dbMin;
    const dbStep = 6; // 6dB steps
    for (let db = this.dbMin; db <= this.dbMax; db += dbStep) {
      const y = height - ((db - this.dbMin) / dbRange) * height;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
      
      // Add dB labels
      if (db !== 0) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '10px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${db > 0 ? '+' : ''}${db}dB`, 5, y - 2);
      }
    }
    
    // Vertical grid lines (frequency)
    const freqLabels = [100, 200, 500, 1000, 2000, 5000, 10000];
    freqLabels.forEach(freq => {
      const x = this.freqToX(freq, width);
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
      
      // Add frequency labels
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.font = '10px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      const label = freq >= 1000 ? `${freq/1000}k` : freq.toString();
      this.ctx.fillText(label, x, height - 5);
    });
  }

  drawZeroLine(width, height) {
    const zeroY = height - ((0 - this.dbMin) / (this.dbMax - this.dbMin)) * height;
    
    this.ctx.strokeStyle = this.zeroLineColor;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, zeroY);
    this.ctx.lineTo(width, zeroY);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
  }

  drawFrequencyResponse(width, height) {
    if (!this.audioEngine || !this.audioEngine.nodes || !this.audioEngine.nodes.eq) {
      return;
    }

    const response = this.audioEngine.nodes.eq.getFrequencyResponse();
    if (!response || !response.frequencies || !response.magnitudes) {
      return;
    }

    const { frequencies, magnitudes } = response;
    
    // Create gradient for the curve
    const gradient = this.ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, this.curveGlow);
    gradient.addColorStop(0.3, this.curveColor);
    gradient.addColorStop(0.7, this.curveColor);
    gradient.addColorStop(1, this.curveGlow);
    
    // Draw filled area under the curve
    this.ctx.fillStyle = gradient;
    this.ctx.globalAlpha = 0.2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, height);
    
    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      const magnitude = magnitudes[i];
      const x = this.freqToX(freq, width);
      const y = this.dbToY(magnitude, height);
      this.ctx.lineTo(x, y);
    }
    
    this.ctx.lineTo(width, height);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
    
    // Draw the curve with subtle pulsing effect
    const pulseIntensity = 0.1 + 0.05 * Math.sin(this.time * 2);
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 3 + pulseIntensity;
    this.ctx.shadowColor = this.curveGlow;
    this.ctx.shadowBlur = 15 + pulseIntensity * 5;
    
    this.ctx.beginPath();
    
    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      const magnitude = magnitudes[i];
      
      const x = this.freqToX(freq, width);
      const y = this.dbToY(magnitude, height);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }

  drawBandIndicators(width, height) {
    if (!this.audioEngine || !this.audioEngine.nodes || !this.audioEngine.nodes.eq) {
      return;
    }

    const bands = this.audioEngine.nodes.eq.bands;
    const bandFrequencies = {
      lowShelf: 120,
      lowMid: 400,
      mid: 1000,
      highMid: 3000,
      highShelf: 8000
    };

    Object.entries(bandFrequencies).forEach(([bandName, freq]) => {
      const band = bands[bandName];
      if (!band) return;

      const x = this.freqToX(freq, width);
      const gain = band.gain.value;
      const y = this.dbToY(gain, height);
      
      // Draw band indicator with glow effect
      this.ctx.shadowColor = this.bandColor;
      this.ctx.shadowBlur = 8;
      this.ctx.fillStyle = this.bandColor;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 6, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw inner highlight
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw gain value with background
      const text = `${gain > 0 ? '+' : ''}${gain.toFixed(1)}`;
      this.ctx.font = '10px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      
      // Background for text
      const textWidth = this.ctx.measureText(text).width;
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.fillRect(x - textWidth/2 - 2, y - 20, textWidth + 4, 12);
      
      // Text
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(text, x, y - 10);
    });
  }

  freqToX(freq, width) {
    const logMin = Math.log10(this.freqMin);
    const logMax = Math.log10(this.freqMax);
    const logFreq = Math.log10(freq);
    return ((logFreq - logMin) / (logMax - logMin)) * width;
  }

  dbToY(db, height) {
    const dbRange = this.dbMax - this.dbMin;
    return height - ((db - this.dbMin) / dbRange) * height;
  }

  resize() {
    this.setupCanvas();
  }

  destroy() {
    this.stopAnimation();
  }
}