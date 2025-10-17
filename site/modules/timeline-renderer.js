import { 
  STEP_COUNT, 
  STEP_DURATION, 
  SECTION_DEFINITIONS,
  LFO_DEFINITIONS,
  CURVE_TYPES 
} from '../utils/constants.js';
import { createParticle, clamp } from '../utils/helpers.js';

export class TimelineRenderer {
  constructor(app) {
    this.app = app;
    this.canvas = document.getElementById('timeline');
    this.ctx = null;
    this.currentStep = 0;
    this.deviceRatio = window.devicePixelRatio || 1;
    this.particles = [];
    this.lastParticleTime = 0;
  }

  initialize() {
    if (!this.canvas) {
      console.warn('Timeline canvas missing.');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    
    // Add roundRect polyfill if not available
    if (!this.ctx.roundRect) {
      this.ctx.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
      };
    }
    
    this.setupResizeObserver();
    this.setupCanvasEvents();
    this.syncCanvas();
  }

  setupResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
      this.syncCanvas();
      this.draw();
    });
    resizeObserver.observe(this.canvas);
  }

  syncCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const width = this.canvas.clientWidth * ratio;
    const height = this.canvas.clientHeight * ratio;
    
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.deviceRatio = ratio;
  }

  draw() {
    if (!this.ctx) return;
    
    const ratio = this.deviceRatio;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    this.ctx.clearRect(0, 0, width, height);

    const padding = 20 * ratio;
    const areaHeight = height - padding * 2;
    const stepWidth = width / STEP_COUNT;

    // Draw sections
    this.drawSections(padding, areaHeight, stepWidth);
    
    // Draw morphing overlay if active
    this.drawMorphingOverlay(padding, areaHeight, stepWidth, ratio);
    
    // Draw grid
    this.drawGrid(padding, areaHeight, stepWidth, ratio);
    
    // Draw automation tracks
    this.drawAutomationTracks(padding, areaHeight, stepWidth, ratio);
    
    // Draw playback cursor
    this.drawPlaybackCursor(padding, areaHeight, stepWidth, ratio);
  }

  drawSections(padding, areaHeight, stepWidth) {
    const sections = this.app.automation?.sections && this.app.automation.sections.length
      ? this.app.automation.sections
      : this.createDefaultSectionLayout();
      
    sections.forEach(section => {
      const startX = section.start * stepWidth;
      const sectionWidth = (section.end - section.start + 1) * stepWidth;
      this.ctx.fillStyle = section.color || 'rgba(255, 255, 255, 0.04)';
      this.ctx.fillRect(startX, padding, sectionWidth, areaHeight);
    });
  }

  drawMorphingOverlay(padding, areaHeight, stepWidth, ratio) {
    if (!this.app.patternMorphing?.morphingState?.isActive) return;

    const morphingState = this.app.patternMorphing.morphingState;
    const progress = morphingState.morphProgress;
    const easedProgress = this.app.patternMorphing.getEasedProgress();

    // Draw morphing progress bar
    const morphBarHeight = 6 * ratio;
    const morphBarY = padding - morphBarHeight - 12 * ratio;
    
    // Background with rounded corners
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.roundRect(0, morphBarY, this.canvas.width, morphBarHeight, 3 * ratio);
    this.ctx.fill();
    
    // Progress fill with gradient
    const progressWidth = this.canvas.width * easedProgress;
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    gradient.addColorStop(0, '#49a9ff');
    gradient.addColorStop(0.5, '#ff49af');
    gradient.addColorStop(1, '#94ff49');
    
    this.ctx.fillStyle = gradient;
    this.ctx.roundRect(0, morphBarY, progressWidth, morphBarHeight, 3 * ratio);
    this.ctx.fill();
    
    // Animated background gradient
    const time = Date.now() * 0.003;
    const animatedGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    animatedGradient.addColorStop(0, `rgba(73, 169, 255, ${0.1 + 0.1 * Math.sin(time)})`);
    animatedGradient.addColorStop(0.5, `rgba(255, 73, 175, ${0.1 + 0.1 * Math.sin(time + 1)})`);
    animatedGradient.addColorStop(1, `rgba(148, 255, 73, ${0.1 + 0.1 * Math.sin(time + 2)})`);
    
    this.ctx.fillStyle = animatedGradient;
    this.ctx.roundRect(0, morphBarY, this.canvas.width, morphBarHeight, 3 * ratio);
    this.ctx.fill();
    
    // Morphing labels with glow effect
    this.ctx.shadowColor = '#49a9ff';
    this.ctx.shadowBlur = 8 * ratio;
    this.ctx.fillStyle = '#49a9ff';
    this.ctx.font = `${11 * ratio}px Inter, sans-serif`;
    this.ctx.textAlign = 'left';
    this.ctx.fillText(morphingState.sourceSection, 8 * ratio, morphBarY - 6 * ratio);
    
    this.ctx.shadowColor = '#ff49af';
    this.ctx.shadowBlur = 8 * ratio;
    this.ctx.fillStyle = '#ff49af';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(morphingState.targetSection, this.canvas.width - 8 * ratio, morphBarY - 6 * ratio);
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
    
    // Morphing indicator with pulsing effect
    const indicatorX = progressWidth;
    const pulse = 0.7 + 0.3 * Math.sin(time * 2);
    
    // Outer glow
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    this.ctx.shadowBlur = 15 * ratio;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.beginPath();
    this.ctx.arc(indicatorX, morphBarY + morphBarHeight / 2, 8 * ratio * pulse, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Inner core
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    this.ctx.beginPath();
    this.ctx.arc(indicatorX, morphBarY + morphBarHeight / 2, 4 * ratio, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Progress percentage
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = `${9 * ratio}px Inter, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${Math.round(easedProgress * 100)}%`, indicatorX, morphBarY + morphBarHeight + 16 * ratio);
    
    // Draw morphing particles
    this.drawMorphingParticles(progressWidth, morphBarY + morphBarHeight / 2, ratio, time);
  }

  drawMorphingParticles(x, y, ratio, time) {
    const particleCount = 8;
    const colors = ['#49a9ff', '#ff49af', '#94ff49', '#ffb449'];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time;
      const radius = 20 * ratio + 10 * ratio * Math.sin(time * 2 + i);
      const particleX = x + Math.cos(angle) * radius;
      const particleY = y + Math.sin(angle) * radius;
      const alpha = 0.3 + 0.4 * Math.sin(time * 3 + i);
      const color = colors[i % colors.length];
      
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = color;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 6 * ratio;
      
      this.ctx.beginPath();
      this.ctx.arc(particleX, particleY, 2 * ratio, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    }
  }

  drawGrid(padding, areaHeight, stepWidth, ratio) {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 1 * ratio;
    
    for (let i = 0; i <= STEP_COUNT; i += 1) {
      const x = i * stepWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, padding);
      this.ctx.lineTo(x, padding + areaHeight);
      this.ctx.stroke();
    }
  }

  drawAutomationTracks(padding, areaHeight, stepWidth, ratio) {
    if (!this.app.automation?.tracks) return;
    
    const trackHeight = areaHeight / Math.max(this.app.automation.tracks.length, 1);
    
    this.app.automation.tracks.forEach((track, trackIndex) => {
      const trackY = padding + trackIndex * trackHeight;
      const trackAreaHeight = trackHeight - 4 * ratio;
      
      // Draw track background
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      this.ctx.fillRect(0, trackY, this.canvas.width, trackAreaHeight);
      
      // Draw pattern variation indicator if available
      this.drawPatternVariationIndicator(track, trackY, ratio);
      
      // Draw track label
      this.ctx.fillStyle = track.color;
      this.ctx.font = `${10 * ratio}px Inter, sans-serif`;
      this.ctx.textAlign = 'left';
      this.ctx.fillText(track.label, 4 * ratio, trackY + 12 * ratio);
      
      // Draw automation curve
      this.drawAutomationCurve(track, trackY, trackAreaHeight, stepWidth, ratio);
      
      // Draw LFO indicator
      this.drawLFOIndicator(track, trackY, ratio);
      
      // Draw breakpoints
      this.drawBreakpoints(track, trackY, trackAreaHeight, stepWidth, ratio);
    });
  }

  drawAutomationCurve(track, trackY, trackAreaHeight, stepWidth, ratio) {
    this.ctx.beginPath();
    track.values.forEach((value, index) => {
      const x = index * stepWidth + stepWidth / 2;
      const y = trackY + (1 - value) * trackAreaHeight;
      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    this.ctx.strokeStyle = track.color;
    this.ctx.lineWidth = 2 * ratio;
    this.ctx.stroke();
  }

  drawLFOIndicator(track, trackY, ratio) {
    const lfo = LFO_DEFINITIONS.find(l => l.target === track.id && l.enabled);
    if (lfo) {
      this.ctx.fillStyle = lfo.color;
      this.ctx.font = `${8 * ratio}px Inter, sans-serif`;
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`LFO: ${lfo.waveform}`, this.canvas.width - 4 * ratio, trackY + 12 * ratio);
    }
  }

  drawBreakpoints(track, trackY, trackAreaHeight, stepWidth, ratio) {
    if (track.breakpoints && track.breakpoints.length > 0) {
      track.breakpoints.forEach(bp => {
        const x = bp.step * stepWidth + stepWidth / 2;
        const y = trackY + (1 - bp.value) * trackAreaHeight;
        this.ctx.fillStyle = track.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3 * ratio, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }
    
    // Draw curve editor button
    this.drawCurveEditorButton(track, trackY, trackAreaHeight, stepWidth, ratio);
  }

  drawCurveEditorButton(track, trackY, trackAreaHeight, stepWidth, ratio) {
    const buttonX = this.canvas.width - 30 * ratio;
    const buttonY = trackY + trackAreaHeight / 2;
    const buttonSize = 20 * ratio;
    
    // Button background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(buttonX - buttonSize/2, buttonY - buttonSize/2, buttonSize, buttonSize);
    
    // Button border
    this.ctx.strokeStyle = track.color;
    this.ctx.lineWidth = 1 * ratio;
    this.ctx.strokeRect(buttonX - buttonSize/2, buttonY - buttonSize/2, buttonSize, buttonSize);
    
    // Button icon (curve symbol)
    this.ctx.strokeStyle = track.color;
    this.ctx.lineWidth = 2 * ratio;
    this.ctx.beginPath();
    this.ctx.moveTo(buttonX - buttonSize/3, buttonY + buttonSize/4);
    this.ctx.quadraticCurveTo(buttonX, buttonY - buttonSize/4, buttonX + buttonSize/3, buttonY + buttonSize/4);
    this.ctx.stroke();
  }

  drawPatternVariationIndicator(track, trackY, ratio) {
    if (!this.app.patternVariation) return;
    
    const currentPattern = this.app.patternVariation.getCurrentPattern();
    if (!currentPattern) return;
    
    // Draw pattern indicator in top-right corner of track
    const indicatorX = this.canvas.width - 60 * ratio;
    const indicatorY = trackY + 2 * ratio;
    
    // Pattern background
    this.ctx.fillStyle = `rgba(73, 169, 255, 0.2)`;
    this.ctx.fillRect(indicatorX, indicatorY, 50 * ratio, 16 * ratio);
    
    // Pattern text
    this.ctx.fillStyle = '#49a9ff';
    this.ctx.font = `${8 * ratio}px Inter, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`P${currentPattern.id}`, indicatorX + 25 * ratio, indicatorY + 12 * ratio);
    
    // Variation intensity indicator
    if (this.app.patternVariation.variationIntensity > 0) {
      const intensity = this.app.patternVariation.variationIntensity;
      const barWidth = 40 * ratio * intensity;
      this.ctx.fillStyle = `rgba(255, 73, 175, ${0.3 + intensity * 0.7})`;
      this.ctx.fillRect(indicatorX + 5 * ratio, indicatorY + 18 * ratio, barWidth, 2 * ratio);
    }
  }

  drawPlaybackCursor(padding, areaHeight, stepWidth, ratio) {
    const activeX = this.currentStep * stepWidth;
    const time = Date.now() * 0.003;
    const pulseIntensity = 0.3 + 0.2 * Math.sin(time);
    
    // Get pattern-specific colors
    const patternColors = this.getPatternColors();
    
    // Main cursor
    this.ctx.fillStyle = `rgba(${patternColors.r}, ${patternColors.g}, ${patternColors.b}, ${0.18 + pulseIntensity * 0.1})`;
    this.ctx.fillRect(activeX, padding, stepWidth, areaHeight);
    
    // Animated border
    this.ctx.strokeStyle = `rgba(${patternColors.r}, ${patternColors.g}, ${patternColors.b}, ${0.6 + pulseIntensity * 0.4})`;
    this.ctx.lineWidth = 2 * ratio;
    this.ctx.setLineDash([5 * ratio, 3 * ratio]);
    this.ctx.strokeRect(activeX, padding, stepWidth, areaHeight);
    this.ctx.setLineDash([]);
    
    // Glow effect
    const glowGradient = this.ctx.createLinearGradient(activeX, 0, activeX + stepWidth, 0);
    glowGradient.addColorStop(0, `rgba(${patternColors.r}, ${patternColors.g}, ${patternColors.b}, ${0.1 + pulseIntensity * 0.05})`);
    glowGradient.addColorStop(0.5, `rgba(${patternColors.r}, ${patternColors.g}, ${patternColors.b}, ${0.2 + pulseIntensity * 0.1})`);
    glowGradient.addColorStop(1, `rgba(${patternColors.r}, ${patternColors.g}, ${patternColors.b}, ${0.1 + pulseIntensity * 0.05})`);
    
    this.ctx.fillStyle = glowGradient;
    this.ctx.fillRect(activeX - 10 * ratio, padding, stepWidth + 20 * ratio, areaHeight);
    
    // Draw particles
    this.drawParticles(activeX + stepWidth / 2, padding + areaHeight / 2, ratio);
  }

  getPatternColors() {
    if (!this.app.patternVariation) {
      return { r: 73, g: 169, b: 255 }; // Default blue
    }
    
    const currentPattern = this.app.patternVariation.getCurrentPattern();
    if (!currentPattern) {
      return { r: 73, g: 169, b: 255 };
    }
    
    // Pattern-specific colors
    const patternColors = {
      'A': { r: 73, g: 169, b: 255 },   // Blue
      'B': { r: 255, g: 73, b: 175 },   // Pink
      'C': { r: 148, g: 255, b: 73 },   // Green
      'A→B': { r: 164, g: 121, b: 214 }, // Purple (morph)
      'A→C': { r: 110, g: 212, b: 164 }, // Teal (morph)
      'B→C': { r: 201, g: 164, b: 124 }  // Orange (morph)
    };
    
    return patternColors[currentPattern.id] || patternColors['A'];
  }

  drawParticles(x, y, ratio) {
    this.updateParticles();
    
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = 10 * ratio;
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x * ratio, particle.y * ratio, particle.size * ratio, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  updateParticles() {
    const now = Date.now();
    if (now - this.lastParticleTime > 100) {
      const colors = ['#49a9ff', '#ff49af', '#94ff49', '#ffb449'];
      this.particles.push(createParticle(
        Math.random() * window.innerWidth,
        Math.random() * 200,
        colors[Math.floor(Math.random() * colors.length)]
      ));
      this.lastParticleTime = now;
    }
    
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      particle.vy += 0.1; // Gravity
      return particle.life > 0;
    });
  }

  createDefaultSectionLayout() {
    const totalSteps = Math.max(Math.floor(STEP_COUNT), 0);
    if (totalSteps <= 0) {
      return [];
    }

    const definitions = SECTION_DEFINITIONS.slice(0, Math.min(SECTION_DEFINITIONS.length, totalSteps));
    if (!definitions.length) {
      return [
        { name: 'Loop', start: 0, end: totalSteps - 1, color: 'rgba(255, 255, 255, 0.04)' }
      ];
    }

    const sectionCount = definitions.length;
    const baseLength = Math.floor(totalSteps / sectionCount);
    const remainder = totalSteps % sectionCount;

    let cursor = 0;
    return definitions.map((definition, index) => {
      const extra = index < remainder ? 1 : 0;
      const length = Math.max(baseLength + extra, 1);
      const start = cursor;
      let end = start + length - 1;
      if (index === sectionCount - 1 || end >= totalSteps - 1) {
        end = totalSteps - 1;
      }
      cursor = end + 1;
      return {
        name: definition.name,
        color: definition.color,
        start,
        end
      };
    });
  }

  updateCurrentStep(step) {
    this.currentStep = step;
    this.draw();
  }

  setupCanvasEvents() {
    if (!this.canvas) return;
    
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * this.deviceRatio;
      const y = (e.clientY - rect.top) * this.deviceRatio;
      
      this.handleCanvasClick(x, y);
    });
  }

  handleCanvasClick(x, y) {
    if (!this.app.automation?.tracks) return;
    
    const stepWidth = this.canvas.width / 16; // STEP_COUNT
    const trackHeight = this.canvas.height / Math.max(this.app.automation.tracks.length, 1);
    
    this.app.automation.tracks.forEach((track, trackIndex) => {
      const trackY = trackIndex * trackHeight;
      const trackAreaHeight = trackHeight - 4 * this.deviceRatio;
      
      // Check if click is in curve editor button area
      const buttonX = this.canvas.width - 30 * this.deviceRatio;
      const buttonY = trackY + trackAreaHeight / 2;
      const buttonSize = 20 * this.deviceRatio;
      
      if (x >= buttonX - buttonSize/2 && x <= buttonX + buttonSize/2 &&
          y >= buttonY - buttonSize/2 && y <= buttonY + buttonSize/2) {
        // Open curve editor for this track
        if (this.app.curveEditor) {
          this.app.curveEditor.show(track.id);
        }
      }
    });
  }
}