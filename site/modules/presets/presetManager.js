// Preset Manager Module
// Handles preset saving, loading, and management

export class PresetManager {
  constructor() {
    this.currentPresetName = 'Deep Preset';
    this.presetFileInput = null;
  }

  initialize() {
    this.createFileInput();
  }

  createFileInput() {
    this.presetFileInput = document.createElement('input');
    this.presetFileInput.type = 'file';
    this.presetFileInput.accept = '.json';
    this.presetFileInput.style.display = 'none';
    document.body.appendChild(this.presetFileInput);
  }

  buildPresetPayload(controlManager, name) {
    return {
      name,
      version: '1.0.0',
      timestamp: Date.now(),
      controls: { ...controlManager.controlState },
      automation: controlManager.automationEngine?.exportAutomation() || null
    };
  }

  savePreset(preset) {
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = this.slugify(preset.name) + '.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    
    this.currentPresetName = preset.name;
    this.savePresetState(preset);
  }

  loadPreset(callback) {
    this.presetFileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const preset = JSON.parse(e.target.result);
          callback(preset);
        } catch (error) {
          console.error('Failed to parse preset file:', error);
          callback(null);
        }
      };
      reader.readAsText(file);
    };
    this.presetFileInput.click();
  }

  loadPresetFromData(preset, controlManager) {
    if (!preset) return false;
    
    try {
      // Load control values
      if (preset.controls) {
        Object.entries(preset.controls).forEach(([id, value]) => {
          const control = controlManager.controlDefinitions.find(c => c.id === id);
          if (control) {
            controlManager.setControlValue(control, value, { silent: true });
          }
        });
      }
      
      // Load automation data
      if (preset.automation && controlManager.automationEngine) {
        controlManager.automationEngine.importAutomation(preset.automation);
      }
      
      this.currentPresetName = preset.name || 'Loaded Preset';
      return true;
    } catch (error) {
      console.error('Failed to load preset:', error);
      return false;
    }
  }

  savePresetState(preset) {
    localStorage.setItem('lastPreset', JSON.stringify(preset));
  }

  loadPresetState() {
    const saved = localStorage.getItem('lastPreset');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load preset state:', error);
      }
    }
    return null;
  }

  getPresetList() {
    const presets = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('preset_')) {
        try {
          const preset = JSON.parse(localStorage.getItem(key));
          presets.push({
            name: preset.name,
            timestamp: preset.timestamp,
            key: key
          });
        } catch (error) {
          console.error('Failed to parse preset:', key, error);
        }
      }
    }
    return presets.sort((a, b) => b.timestamp - a.timestamp);
  }

  deletePreset(presetKey) {
    localStorage.removeItem(presetKey);
  }

  exportAllPresets() {
    const presets = this.getPresetList();
    const exportData = {
      presets: presets.map(p => JSON.parse(localStorage.getItem(p.key))),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'deep-presets-export.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  importPresets(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.presets && Array.isArray(data.presets)) {
            data.presets.forEach(preset => {
              const key = `preset_${preset.name}_${preset.timestamp}`;
              localStorage.setItem(key, JSON.stringify(preset));
            });
            callback(data.presets.length);
          } else {
            callback(0);
          }
        } catch (error) {
          console.error('Failed to import presets:', error);
          callback(0);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  validatePreset(preset) {
    if (!preset || typeof preset !== 'object') return false;
    if (!preset.name || typeof preset.name !== 'string') return false;
    if (!preset.controls || typeof preset.controls !== 'object') return false;
    return true;
  }
}
