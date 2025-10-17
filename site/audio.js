/**
 * Audio Module
 * Handles audio context, routing, and basic audio functionality
 */

export class AudioModule {
  constructor() {
    this.context = null;
    this.master = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      // Initialize Tone.js
      await Tone.start();
      
      // Create master gain node
      this.master = new Tone.Gain(0.8);
      this.master.toDestination();
      
      this.isInitialized = true;
      console.log('Audio module initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw error;
    }
  }

  getContext() {
    return Tone.context;
  }

  getMaster() {
    return this.master;
  }

  isReady() {
    return this.isInitialized && Tone.context.state === 'running';
  }

  destroy() {
    if (this.master) {
      this.master.disconnect();
    }
    if (this.context) {
      this.context.close();
    }
  }
}