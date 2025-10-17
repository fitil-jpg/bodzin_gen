export class MobileGestures {
  constructor(app) {
    this.app = app;
    this.gestureOverlay = null;
    this.gestureIndicator = null;
    this.isGestureActive = false;
    this.lastTouchTime = 0;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchCurrentX = 0;
    this.touchCurrentY = 0;
    this.pinchStartDistance = 0;
    this.pinchCurrentDistance = 0;
    this.isPinching = false;
    this.timelineCanvas = null;
    this.timelineCtx = null;
    this.gestureStartStep = 0;
    this.gestureCurrentStep = 0;
  }

  initialize() {
    this.createGestureOverlay();
    this.setupTimelineGestures();
    this.setupMobileControls();
    this.setupTouchEvents();
  }

  createGestureOverlay() {
    this.gestureOverlay = document.createElement('div');
    this.gestureOverlay.className = 'gesture-overlay';
    
    this.gestureIndicator = document.createElement('div');
    this.gestureIndicator.className = 'gesture-indicator';
    this.gestureIndicator.innerHTML = '✋';
    
    this.gestureOverlay.appendChild(this.gestureIndicator);
    document.body.appendChild(this.gestureOverlay);
  }

  setupTimelineGestures() {
    this.timelineCanvas = document.getElementById('timeline');
    if (!this.timelineCanvas) return;

    this.timelineCtx = this.timelineCanvas.getContext('2d');
    
    // Add touch event listeners
    this.timelineCanvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.timelineCanvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.timelineCanvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.timelineCanvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
  }

  setupMobileControls() {
    // Create mobile control panel
    const mobilePanel = document.createElement('div');
    mobilePanel.className = 'mobile-control-panel';
    mobilePanel.innerHTML = `
      <div class="mobile-control-tabs">
        <button class="mobile-tab active" data-tab="controls">Controls</button>
        <button class="mobile-tab" data-tab="timeline">Timeline</button>
        <button class="mobile-tab" data-tab="presets">Presets</button>
      </div>
      <div class="mobile-control-content" id="mobile-control-content">
        <!-- Content will be populated dynamically -->
      </div>
    `;
    document.body.appendChild(mobilePanel);

    // Create floating action button
    const fab = document.createElement('button');
    fab.className = 'mobile-fab';
    fab.innerHTML = '🎛️';
    fab.title = 'Open Controls';
    document.body.appendChild(fab);

    // Setup tab switching
    mobilePanel.querySelectorAll('.mobile-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchMobileTab(tab.dataset.tab));
    });

    // Setup FAB toggle
    fab.addEventListener('click', () => this.toggleMobilePanel());
  }

  setupTouchEvents() {
    // Add global touch event listeners for gesture recognition
    document.addEventListener('touchstart', this.handleGlobalTouchStart.bind(this), { passive: true });
    document.addEventListener('touchmove', this.handleGlobalTouchMove.bind(this), { passive: true });
    document.addEventListener('touchend', this.handleGlobalTouchEnd.bind(this), { passive: true });
  }

  handleTouchStart(event) {
    if (event.touches.length === 0) return;
    
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchCurrentX = touch.clientX;
    this.touchCurrentY = touch.clientY;
    this.lastTouchTime = Date.now();
    
    // Calculate initial step position
    const rect = this.timelineCanvas.getBoundingClientRect();
    const relativeX = touch.clientX - rect.left;
    const stepWidth = rect.width / (this.app.automation?.tracks?.[0]?.values?.length || 64);
    this.gestureStartStep = Math.floor(relativeX / stepWidth);
    this.gestureCurrentStep = this.gestureStartStep;
    
    this.showGestureIndicator(touch.clientX, touch.clientY);
    
    if (event.touches.length === 2) {
      this.startPinchGesture(event);
    }
  }

  handleTouchMove(event) {
    if (event.touches.length === 0) return;
    
    event.preventDefault();
    
    const touch = event.touches[0];
    this.touchCurrentX = touch.clientX;
    this.touchCurrentY = touch.clientY;
    
    // Update gesture indicator position
    this.updateGestureIndicator(touch.clientX, touch.clientY);
    
    // Handle timeline scrubbing
    if (this.isGestureActive) {
      this.handleTimelineScrub(touch);
    }
    
    if (event.touches.length === 2) {
      this.handlePinchGesture(event);
    }
  }

  handleTouchEnd(event) {
    this.hideGestureIndicator();
    this.isGestureActive = false;
    this.isPinching = false;
    
    // Apply final automation step if changed
    if (this.gestureCurrentStep !== this.gestureStartStep) {
      this.applyAutomationStep(this.gestureCurrentStep);
    }
  }

  handleGlobalTouchStart(event) {
    // Handle global touch events for mobile-specific interactions
  }

  handleGlobalTouchMove(event) {
    // Handle global touch move events
  }

  handleGlobalTouchEnd(event) {
    // Handle global touch end events
  }

  startPinchGesture(event) {
    if (event.touches.length !== 2) return;
    
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    this.pinchStartDistance = this.getDistance(touch1, touch2);
    this.isPinching = true;
  }

  handlePinchGesture(event) {
    if (event.touches.length !== 2 || !this.isPinching) return;
    
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    this.pinchCurrentDistance = this.getDistance(touch1, touch2);
    const scale = this.pinchCurrentDistance / this.pinchStartDistance;
    
    // Handle zoom/scale gestures
    this.handleTimelineZoom(scale);
  }

  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  handleTimelineScrub(touch) {
    const rect = this.timelineCanvas.getBoundingClientRect();
    const relativeX = touch.clientX - rect.left;
    const stepWidth = rect.width / (this.app.automation?.tracks?.[0]?.values?.length || 64);
    const newStep = Math.floor(relativeX / stepWidth);
    
    if (newStep !== this.gestureCurrentStep && newStep >= 0) {
      this.gestureCurrentStep = newStep;
      this.updateTimelineCursor(newStep);
    }
  }

  handleTimelineZoom(scale) {
    // Implement timeline zoom functionality
    console.log('Timeline zoom:', scale);
  }

  showGestureIndicator(x, y) {
    if (!this.gestureIndicator) return;
    
    this.gestureIndicator.style.left = x + 'px';
    this.gestureIndicator.style.top = y + 'px';
    this.gestureIndicator.classList.add('active');
    this.isGestureActive = true;
  }

  updateGestureIndicator(x, y) {
    if (!this.gestureIndicator || !this.isGestureActive) return;
    
    this.gestureIndicator.style.left = x + 'px';
    this.gestureIndicator.style.top = y + 'px';
  }

  hideGestureIndicator() {
    if (!this.gestureIndicator) return;
    
    this.gestureIndicator.classList.remove('active');
  }

  updateTimelineCursor(step) {
    // Update timeline cursor position
    if (this.app.timeline) {
      this.app.timeline.currentStep = step;
      this.app.timeline.draw();
    }
  }

  applyAutomationStep(step) {
    // Apply automation for the selected step
    if (this.app && typeof this.app.applyAutomationForStep === 'function') {
      this.app.applyAutomationForStep(step);
    }
  }

  switchMobileTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.mobile-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Add active class to selected tab
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
    }
    
    // Update content based on tab
    this.updateMobileContent(tabName);
  }

  updateMobileContent(tabName) {
    const content = document.getElementById('mobile-control-content');
    if (!content) return;
    
    switch (tabName) {
      case 'controls':
        this.renderMobileControls(content);
        break;
      case 'timeline':
        this.renderMobileTimeline(content);
        break;
      case 'presets':
        this.renderMobilePresets(content);
        break;
    }
  }

  renderMobileControls(container) {
    container.innerHTML = `
      <div class="mobile-control-grid">
        ${this.app.uiControls ? this.generateMobileControlHTML() : '<p>Loading controls...</p>'}
      </div>
    `;
  }

  renderMobileTimeline(container) {
    container.innerHTML = `
      <div class="mobile-timeline-controls">
        <div class="timeline-info">
          <h3>Timeline</h3>
          <p>Use gestures to scrub through the timeline</p>
        </div>
        <div class="timeline-actions">
          <button class="btn btn-primary" onclick="window.bodzinApp?.startPlayback()">Play</button>
          <button class="btn btn-outline" onclick="window.bodzinApp?.stopPlayback()">Stop</button>
        </div>
      </div>
    `;
  }

  renderMobilePresets(container) {
    container.innerHTML = `
      <div class="mobile-preset-controls">
        <h3>Presets</h3>
        <div class="preset-actions">
          <button class="btn btn-primary" onclick="window.bodzinApp?.savePreset()">Save</button>
          <button class="btn btn-outline" onclick="window.bodzinApp?.triggerPresetLoad()">Load</button>
        </div>
      </div>
    `;
  }

  generateMobileControlHTML() {
    if (!this.app.uiControls || !this.app.uiControls.controls) return '';
    
    let html = '';
    this.app.uiControls.controls.forEach((entry, controlId) => {
      const control = entry.control;
      html += `
        <div class="mobile-control-item" data-control-id="${controlId}">
          <div class="mobile-control-label">${control.label}</div>
          <div class="mobile-control-value">${entry.valueEl?.textContent || '0'}</div>
          <input type="range" 
                 class="mobile-control-slider" 
                 min="${control.min}" 
                 max="${control.max}" 
                 step="${control.step}" 
                 value="${this.app.controlState[controlId] || control.min}">
        </div>
      `;
    });
    return html;
  }

  toggleMobilePanel() {
    const panel = document.querySelector('.mobile-control-panel');
    const fab = document.querySelector('.mobile-fab');
    
    if (panel && fab) {
      panel.classList.toggle('active');
      fab.innerHTML = panel.classList.contains('active') ? '✕' : '🎛️';
    }
  }

  // Mobile-specific parameter editor
  openParameterEditor(controlId) {
    const control = this.app.uiControls?.getControlDefinition(controlId);
    if (!control) return;
    
    const editor = document.createElement('div');
    editor.className = 'mobile-parameter-editor active';
    editor.innerHTML = `
      <div class="parameter-editor-header">
        <div class="parameter-editor-title">${control.label}</div>
        <button class="parameter-editor-close" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
      <div class="parameter-editor-content">
        <div class="parameter-value-display" id="parameter-value">${this.app.controlState[controlId] || control.min}</div>
        <div class="parameter-slider-container">
          <input type="range" 
                 class="parameter-slider" 
                 min="${control.min}" 
                 max="${control.max}" 
                 step="${control.step}" 
                 value="${this.app.controlState[controlId] || control.min}"
                 oninput="this.parentElement.parentElement.querySelector('#parameter-value').textContent = this.value">
        </div>
      </div>
    `;
    
    document.body.appendChild(editor);
    
    // Setup slider event
    const slider = editor.querySelector('.parameter-slider');
    slider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      this.app.uiControls?.setControlValue(control, value);
    });
  }

  // Detect mobile device
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
  }

  // Show mobile-specific UI elements
  showMobileUI() {
    if (this.isMobileDevice()) {
      document.querySelector('.mobile-fab')?.style.setProperty('display', 'flex');
      document.querySelector('.mobile-control-panel')?.style.setProperty('display', 'block');
    }
  }

  // Hide mobile-specific UI elements
  hideMobileUI() {
    document.querySelector('.mobile-fab')?.style.setProperty('display', 'none');
    document.querySelector('.mobile-control-panel')?.style.setProperty('display', 'none');
  }
}
