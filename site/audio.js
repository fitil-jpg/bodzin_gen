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
      // Don't start Tone.js here - wait for user interaction
      // This will be done in setupUserInteractionHandler after permission is granted
      
      this.isInitialized = true;
      console.log('Audio module initialized (waiting for user permission)');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw error;
    }
  }

  async startAudioContext() {
    try {
      // Start Tone.js audio context
      await Tone.start();
      
      // Create master gain node after audio context is running
      this.master = new Tone.Gain(0.8);
      this.master.toDestination();
      
      console.log('Audio context started and master gain created');
    } catch (error) {
      console.error('Failed to start audio context:', error);
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
    return this.isInitialized && Tone.context.state === 'running' && this.master !== null;
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