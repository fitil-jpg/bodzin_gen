// Helper Utilities Module
// Common utility functions used across the application

export class Helpers {
  constructor() {
    this.midiAccess = null;
    this.midiInputs = new Map();
  }

  // Math utilities
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  // String utilities
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatFrequency(hz) {
    if (hz >= 1000) {
      return `${(hz / 1000).toFixed(1)}kHz`;
    }
    return `${Math.round(hz)}Hz`;
  }

  // Array utilities
  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // DOM utilities
  createElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  }

  addClass(element, className) {
    if (element) element.classList.add(className);
  }

  removeClass(element, className) {
    if (element) element.classList.remove(className);
  }

  toggleClass(element, className) {
    if (element) element.classList.toggle(className);
  }

  // Animation utilities
  animateValue(element, start, end, duration, callback) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const value = this.lerp(start, end, this.easeInOutCubic(progress));
      callback(value);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // MIDI utilities
  async initializeMIDI() {
    if (!navigator.requestMIDIAccess) {
      console.warn('MIDI not supported');
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.midiAccess.onstatechange = () => this.updateMIDIInputs();
      this.updateMIDIInputs();
      return true;
    } catch (error) {
      console.error('Failed to initialize MIDI:', error);
      return false;
    }
  }

  updateMIDIInputs() {
    this.midiInputs.clear();
    this.midiAccess.inputs.forEach((input, key) => {
      this.midiInputs.set(key, input);
    });
  }

  onMIDIMessage(callback) {
    this.midiInputs.forEach(input => {
      input.onmidimessage = callback;
    });
  }

  // Storage utilities
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', error);
      return false;
    }
  }

  loadFromStorage(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return defaultValue;
    }
  }

  // Audio utilities
  noteToFrequency(note) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = parseInt(note.slice(-1));
    const noteName = note.slice(0, -1);
    const noteIndex = notes.indexOf(noteName);
    
    if (noteIndex === -1) return 440;
    
    return 440 * Math.pow(2, (noteIndex - 9 + (octave - 4) * 12) / 12);
  }

  frequencyToNote(frequency) {
    const A4 = 440;
    const semitones = 12 * Math.log2(frequency / A4);
    const octave = Math.floor(semitones / 12) + 4;
    const noteIndex = Math.round(semitones % 12);
    
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return notes[noteIndex] + octave;
  }

  // Color utilities
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Performance utilities
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Validation utilities
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Random utilities
  randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}
