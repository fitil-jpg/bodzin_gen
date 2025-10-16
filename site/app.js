/**
 * Main Application Module
 * Orchestrates all other modules and handles application lifecycle
 */

import { AudioModule } from './audio.js';
import { UIModule } from './ui.js';
import { WaveformModule } from './waveform.js';

export class App {
  constructor() {
    this.audio = new AudioModule();
    this.ui = new UIModule(this);
    this.waveform = new WaveformModule(this);
    this.isInitialized = false;
  }

  async init() {
    try {
      this.ui.setStatus('Initializing application...');
      
      // Initialize audio first
      await this.audio.init();
      
      // Initialize waveform
      this.waveform.init();
      
      this.isInitialized = true;
      this.ui.setStatus('Application ready');
      
      // Set up global error handling
      window.addEventListener('error', (event) => {
        this.ui.showError(event.error.message);
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        this.ui.showError(event.reason);
      });
      
    } catch (error) {
      this.ui.showError(`Failed to initialize: ${error.message}`);
      throw error;
    }
  }

  setStatus(message) {
    this.ui.setStatus(message);
  }

  showError(message) {
    this.ui.showError(message);
  }

  showSuccess(message) {
    this.ui.showSuccess(message);
  }

  destroy() {
    if (this.waveform) {
      this.waveform.destroy();
    }
    if (this.audio) {
      this.audio.destroy();
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  window.app = new App();
  try {
    await window.app.init();
  } catch (error) {
    console.error('Failed to start application:', error);
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.app) {
    window.app.destroy();
  }
});