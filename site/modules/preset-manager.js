'use strict';

export class PresetManager {
  constructor(app) {
    this.app = app;
    this.presets = new Map();
    this.categories = new Map();
    this.currentPreset = null;
    this.initializeDefaultCategories();
    this.initializeDefaultPresets();
  }

  initializeDefaultCategories() {
    const categories = [
      {
        id: 'bass',
        name: 'Bass',
        description: 'Deep, powerful bass sounds',
        color: '#ff6b6b',
        icon: '🎵'
      },
      {
        id: 'lead',
        name: 'Lead',
        description: 'Melodic lead synthesizer sounds',
        color: '#4ecdc4',
        icon: '🎹'
      },
      {
        id: 'pad',
        name: 'Pad',
        description: 'Atmospheric pad sounds',
        color: '#45b7d1',
        icon: '☁️'
      },
      {
        id: 'arp',
        name: 'Arpeggio',
        description: 'Rhythmic arpeggiated patterns',
        color: '#96ceb4',
        icon: '🎼'
      },
      {
        id: 'percussion',
        name: 'Percussion',
        description: 'Drum and percussion sounds',
        color: '#feca57',
        icon: '🥁'
      },
      {
        id: 'fx',
        name: 'Effects',
        description: 'Special effects and textures',
        color: '#ff9ff3',
        icon: '✨'
      },
      {
        id: 'ambient',
        name: 'Ambient',
        description: 'Ethereal and ambient textures',
        color: '#a8e6cf',
        icon: '🌊'
      },
      {
        id: 'user',
        name: 'User Presets',
        description: 'Your custom presets',
        color: '#dda0dd',
        icon: '👤'
      }
    ];

    categories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  initializeDefaultPresets() {
    // Bass presets
    this.addPreset({
      id: 'deep-bass-1',
      name: 'Deep Bass',
      category: 'bass',
      description: 'A powerful sub-bass with subtle harmonics',
      author: 'Bodzin Generator',
      tags: ['deep', 'sub', 'powerful'],
      controls: {
        oscillatorType: 'sawtooth',
        filterCutoff: 0.3,
        filterResonance: 0.2,
        envelopeAttack: 0.1,
        envelopeDecay: 0.5,
        envelopeSustain: 0.7,
        envelopeRelease: 1.2,
        lfoRate: 0.1,
        lfoAmount: 0.3,
        reverbAmount: 0.2,
        delayAmount: 0.1
      },
      automation: this.createDefaultAutomation()
    });

    this.addPreset({
      id: 'acid-bass-1',
      name: 'Acid Bass',
      category: 'bass',
      description: 'Classic acid bass with filter modulation',
      author: 'Bodzin Generator',
      tags: ['acid', 'filter', 'classic'],
      controls: {
        oscillatorType: 'square',
        filterCutoff: 0.4,
        filterResonance: 0.8,
        envelopeAttack: 0.05,
        envelopeDecay: 0.3,
        envelopeSustain: 0.6,
        envelopeRelease: 0.8,
        lfoRate: 0.5,
        lfoAmount: 0.6,
        reverbAmount: 0.1,
        delayAmount: 0.05
      },
      automation: this.createDefaultAutomation()
    });

    // Lead presets
    this.addPreset({
      id: 'melodic-lead-1',
      name: 'Melodic Lead',
      category: 'lead',
      description: 'Bright, expressive lead sound',
      author: 'Bodzin Generator',
      tags: ['melodic', 'bright', 'expressive'],
      controls: {
        oscillatorType: 'sawtooth',
        filterCutoff: 0.7,
        filterResonance: 0.4,
        envelopeAttack: 0.2,
        envelopeDecay: 0.4,
        envelopeSustain: 0.8,
        envelopeRelease: 0.6,
        lfoRate: 0.3,
        lfoAmount: 0.2,
        reverbAmount: 0.4,
        delayAmount: 0.3
      },
      automation: this.createDefaultAutomation()
    });

    // Pad presets
    this.addPreset({
      id: 'atmospheric-pad-1',
      name: 'Atmospheric Pad',
      category: 'pad',
      description: 'Wide, lush pad sound',
      author: 'Bodzin Generator',
      tags: ['atmospheric', 'lush', 'wide'],
      controls: {
        oscillatorType: 'sawtooth',
        filterCutoff: 0.5,
        filterResonance: 0.1,
        envelopeAttack: 2.0,
        envelopeDecay: 1.5,
        envelopeSustain: 0.9,
        envelopeRelease: 3.0,
        lfoRate: 0.1,
        lfoAmount: 0.4,
        reverbAmount: 0.8,
        delayAmount: 0.6
      },
      automation: this.createDefaultAutomation()
    });

    // Arpeggio presets
    this.addPreset({
      id: 'arpeggio-1',
      name: 'Classic Arp',
      category: 'arp',
      description: 'Traditional arpeggiated pattern',
      author: 'Bodzin Generator',
      tags: ['classic', 'pattern', 'rhythmic'],
      controls: {
        oscillatorType: 'square',
        filterCutoff: 0.6,
        filterResonance: 0.3,
        envelopeAttack: 0.01,
        envelopeDecay: 0.2,
        envelopeSustain: 0.5,
        envelopeRelease: 0.3,
        lfoRate: 0.8,
        lfoAmount: 0.5,
        reverbAmount: 0.3,
        delayAmount: 0.2
      },
      automation: this.createDefaultAutomation()
    });

    // Ambient presets
    this.addPreset({
      id: 'ethereal-ambient-1',
      name: 'Ethereal Ambient',
      category: 'ambient',
      description: 'Dreamy, ethereal ambient texture',
      author: 'Bodzin Generator',
      tags: ['ethereal', 'dreamy', 'texture'],
      controls: {
        oscillatorType: 'sine',
        filterCutoff: 0.3,
        filterResonance: 0.05,
        envelopeAttack: 4.0,
        envelopeDecay: 2.0,
        envelopeSustain: 0.8,
        envelopeRelease: 5.0,
        lfoRate: 0.05,
        lfoAmount: 0.3,
        reverbAmount: 0.9,
        delayAmount: 0.7
      },
      automation: this.createDefaultAutomation()
    });

    // Additional Bass presets
    this.addPreset({
      id: 'sub-bass-1',
      name: 'Sub Bass',
      category: 'bass',
      description: 'Deep sub-bass with minimal harmonics',
      author: 'Bodzin Generator',
      tags: ['sub', 'deep', 'minimal'],
      controls: {
        oscillatorType: 'sine',
        filterCutoff: 0.2,
        filterResonance: 0.1,
        envelopeAttack: 0.05,
        envelopeDecay: 0.8,
        envelopeSustain: 0.9,
        envelopeRelease: 1.5,
        lfoRate: 0.05,
        lfoAmount: 0.1,
        reverbAmount: 0.1,
        delayAmount: 0.0
      },
      automation: this.createDefaultAutomation()
    });

    // Additional Lead presets
    this.addPreset({
      id: 'bright-lead-1',
      name: 'Bright Lead',
      category: 'lead',
      description: 'Bright, cutting lead sound',
      author: 'Bodzin Generator',
      tags: ['bright', 'cutting', 'lead'],
      controls: {
        oscillatorType: 'sawtooth',
        filterCutoff: 0.8,
        filterResonance: 0.6,
        envelopeAttack: 0.01,
        envelopeDecay: 0.3,
        envelopeSustain: 0.7,
        envelopeRelease: 0.4,
        lfoRate: 0.4,
        lfoAmount: 0.3,
        reverbAmount: 0.2,
        delayAmount: 0.1
      },
      automation: this.createDefaultAutomation()
    });

    // Additional Pad presets
    this.addPreset({
      id: 'warm-pad-1',
      name: 'Warm Pad',
      category: 'pad',
      description: 'Warm, enveloping pad sound',
      author: 'Bodzin Generator',
      tags: ['warm', 'enveloping', 'pad'],
      controls: {
        oscillatorType: 'sawtooth',
        filterCutoff: 0.4,
        filterResonance: 0.2,
        envelopeAttack: 1.5,
        envelopeDecay: 1.0,
        envelopeSustain: 0.8,
        envelopeRelease: 2.5,
        lfoRate: 0.2,
        lfoAmount: 0.3,
        reverbAmount: 0.6,
        delayAmount: 0.4
      },
      automation: this.createDefaultAutomation()
    });

    // Additional Arpeggio presets
    this.addPreset({
      id: 'fast-arp-1',
      name: 'Fast Arp',
      category: 'arp',
      description: 'Fast, rhythmic arpeggio pattern',
      author: 'Bodzin Generator',
      tags: ['fast', 'rhythmic', 'pattern'],
      controls: {
        oscillatorType: 'square',
        filterCutoff: 0.7,
        filterResonance: 0.4,
        envelopeAttack: 0.01,
        envelopeDecay: 0.1,
        envelopeSustain: 0.6,
        envelopeRelease: 0.2,
        lfoRate: 1.2,
        lfoAmount: 0.6,
        reverbAmount: 0.2,
        delayAmount: 0.1
      },
      automation: this.createDefaultAutomation()
    });

    // Effects presets
    this.addPreset({
      id: 'riser-fx-1',
      name: 'Riser FX',
      category: 'fx',
      description: 'Dramatic riser effect',
      author: 'Bodzin Generator',
      tags: ['riser', 'dramatic', 'effect'],
      controls: {
        oscillatorType: 'sawtooth',
        filterCutoff: 0.1,
        filterResonance: 0.8,
        envelopeAttack: 0.01,
        envelopeDecay: 4.0,
        envelopeSustain: 0.0,
        envelopeRelease: 0.5,
        lfoRate: 0.1,
        lfoAmount: 0.8,
        reverbAmount: 0.9,
        delayAmount: 0.8
      },
      automation: this.createDefaultAutomation()
    });

    // Percussion presets
    this.addPreset({
      id: 'kick-drum-1',
      name: 'Kick Drum',
      category: 'percussion',
      description: 'Punchy kick drum sound',
      author: 'Bodzin Generator',
      tags: ['kick', 'drum', 'punchy'],
      controls: {
        oscillatorType: 'sine',
        filterCutoff: 0.3,
        filterResonance: 0.1,
        envelopeAttack: 0.01,
        envelopeDecay: 0.2,
        envelopeSustain: 0.0,
        envelopeRelease: 0.1,
        lfoRate: 0.0,
        lfoAmount: 0.0,
        reverbAmount: 0.1,
        delayAmount: 0.0
      },
      automation: this.createDefaultAutomation()
    });
  }

  addPreset(presetData) {
    const preset = {
      id: presetData.id,
      name: presetData.name,
      category: presetData.category,
      description: presetData.description || '',
      author: presetData.author || 'Unknown',
      tags: presetData.tags || [],
      controls: presetData.controls || {},
      automation: presetData.automation || this.createDefaultAutomation(),
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    this.presets.set(preset.id, preset);
    return preset;
  }

  getPreset(id) {
    return this.presets.get(id);
  }

  getAllPresets() {
    return Array.from(this.presets.values());
  }

  getPresetsByCategory(categoryId) {
    return this.getAllPresets().filter(preset => preset.category === categoryId);
  }

  getCategories() {
    return Array.from(this.categories.values());
  }

  getCategory(id) {
    return this.categories.get(id);
  }

  searchPresets(query, categoryId = null) {
    const searchTerm = query.toLowerCase();
    return this.getAllPresets().filter(preset => {
      const matchesCategory = !categoryId || preset.category === categoryId;
      const matchesSearch = preset.name.toLowerCase().includes(searchTerm) ||
                           preset.description.toLowerCase().includes(searchTerm) ||
                           preset.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      return matchesCategory && matchesSearch;
    });
  }

  savePreset(presetData) {
    const preset = this.addPreset(presetData);
    this.saveToStorage();
    return preset;
  }

  updatePreset(id, updates) {
    const preset = this.presets.get(id);
    if (!preset) return null;

    Object.assign(preset, updates, {
      modifiedAt: new Date().toISOString()
    });

    this.saveToStorage();
    return preset;
  }

  deletePreset(id) {
    const deleted = this.presets.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  loadPreset(id) {
    const preset = this.getPreset(id);
    if (!preset) return false;

    // Apply controls
    if (preset.controls) {
      Object.assign(this.app.controlState, preset.controls);
      this.app.uiControls.updateAllControls();
    }

    // Apply automation
    if (preset.automation) {
      this.app.automation = preset.automation;
      this.app.timeline.render();
    }

    // Apply scale and key management settings
    if (preset.scaleSettings && this.app.scaleManager) {
      this.app.scaleManager.importScale(preset.scaleSettings);
    }
    
    if (preset.keySettings && this.app.keyManager) {
      this.app.keyManager.importKey(preset.keySettings);
    }
    
    if (preset.chordProgressionSettings && this.app.chordProgressionManager) {
      this.app.chordProgressionManager.importProgression(preset.chordProgressionSettings);
    }

    this.currentPreset = preset;
    this.app.presetName = preset.name;
    this.app.status.updateStatus(`Loaded preset: ${preset.name}`);
    
    return true;
  }

  saveCurrentStateAsPreset(name, category = 'user', description = '', tags = []) {
    const presetData = {
      id: `user-${Date.now()}`,
      name,
      category,
      description,
      author: 'User',
      tags,
      controls: { ...this.app.controlState },
      automation: { ...this.app.automation },
      scaleSettings: this.app.scaleManager ? this.app.scaleManager.exportScale() : null,
      keySettings: this.app.keyManager ? this.app.keyManager.exportKey() : null,
      chordProgressionSettings: this.app.chordProgressionManager ? this.app.chordProgressionManager.exportProgression() : null
    };

    return this.savePreset(presetData);
  }

  exportPreset(id) {
    const preset = this.getPreset(id);
    if (!preset) return null;

    return {
      ...preset,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  exportPresetsByCategory(categoryId) {
    const presets = this.getPresetsByCategory(categoryId);
    return {
      category: this.getCategory(categoryId),
      presets: presets.map(preset => this.exportPreset(preset.id)),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  exportAllPresets() {
    return {
      categories: this.getCategories(),
      presets: this.getAllPresets().map(preset => this.exportPreset(preset.id)),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  importPreset(presetData) {
    // Validate preset data
    if (!presetData.id || !presetData.name || !presetData.category) {
      throw new Error('Invalid preset data');
    }

    // Ensure unique ID
    let uniqueId = presetData.id;
    let counter = 1;
    while (this.presets.has(uniqueId)) {
      uniqueId = `${presetData.id}-${counter}`;
      counter++;
    }

    const importedPreset = {
      ...presetData,
      id: uniqueId,
      importedAt: new Date().toISOString()
    };

    return this.addPreset(importedPreset);
  }

  importPresets(presetsData) {
    const imported = [];
    const errors = [];

    presetsData.forEach((presetData, index) => {
      try {
        const preset = this.importPreset(presetData);
        imported.push(preset);
      } catch (error) {
        errors.push({ index, error: error.message });
      }
    });

    return { imported, errors };
  }

  createDefaultAutomation() {
    return {
      tracks: [
        {
          id: 'filter-cutoff',
          name: 'Filter Cutoff',
          enabled: false,
          steps: new Array(16).fill(0.5)
        },
        {
          id: 'filter-resonance',
          name: 'Filter Resonance',
          enabled: false,
          steps: new Array(16).fill(0.2)
        },
        {
          id: 'lfo-rate',
          name: 'LFO Rate',
          enabled: false,
          steps: new Array(16).fill(0.3)
        }
      ]
    };
  }

  saveToStorage() {
    const presetData = {
      presets: Array.from(this.presets.entries()),
      categories: Array.from(this.categories.entries())
    };
    
    localStorage.setItem('bodzin-presets', JSON.stringify(presetData));
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('bodzin-presets');
      if (!stored) return;

      const data = JSON.parse(stored);
      
      if (data.presets) {
        this.presets = new Map(data.presets);
      }
      
      if (data.categories) {
        // Merge with default categories
        data.categories.forEach(([id, category]) => {
          if (!this.categories.has(id)) {
            this.categories.set(id, category);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load presets from storage:', error);
    }
  }

  initialize() {
    this.loadFromStorage();
  }

  getPresetCount() {
    return this.presets.size;
  }

  getPresetCountByCategory(categoryId) {
    return this.getPresetsByCategory(categoryId).length;
  }

  getRecentPresets(limit = 10) {
    return this.getAllPresets()
      .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt))
      .slice(0, limit);
  }

  getFavoritePresets() {
    // This would require adding a favorite system
    return this.getAllPresets().filter(preset => preset.favorite);
  }

  getAllTags() {
    const allTags = new Set();
    this.getAllPresets().forEach(preset => {
      preset.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }

  getPresetsByTags(tags) {
    return this.getAllPresets().filter(preset => {
      return tags.every(tag => preset.tags.includes(tag));
    });
  }

  duplicatePreset(id, newName) {
    const original = this.getPreset(id);
    if (!original) return null;

    const duplicate = {
      ...original,
      id: `${original.id}-copy-${Date.now()}`,
      name: newName || `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };

    return this.addPreset(duplicate);
  }

  getPresetStatistics() {
    const stats = {
      total: this.presets.size,
      byCategory: {},
      byAuthor: {},
      byTag: {},
      recentlyAdded: 0,
      recentlyModified: 0
    };

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    this.getAllPresets().forEach(preset => {
      // By category
      stats.byCategory[preset.category] = (stats.byCategory[preset.category] || 0) + 1;
      
      // By author
      stats.byAuthor[preset.author] = (stats.byAuthor[preset.author] || 0) + 1;
      
      // By tag
      preset.tags.forEach(tag => {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      });
      
      // Recently added/modified
      const createdAt = new Date(preset.createdAt);
      const modifiedAt = new Date(preset.modifiedAt);
      
      if (createdAt > oneWeekAgo) stats.recentlyAdded++;
      if (modifiedAt > oneWeekAgo) stats.recentlyModified++;
    });

    return stats;
  }
}