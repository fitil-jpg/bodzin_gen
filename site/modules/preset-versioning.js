import { PRESET_VERSION, PRESET_SCHEMA_VERSION, PRESET_VERSIONS } from '../utils/constants.js';

export class PresetVersioning {
  constructor() {
    this.currentVersion = PRESET_VERSION;
    this.currentSchemaVersion = PRESET_SCHEMA_VERSION;
  }

  /**
   * Build a versioned preset payload
   * @param {Object} app - The app instance
   * @param {string} name - Preset name
   * @param {Object} options - Additional options
   * @returns {Object} Versioned preset payload
   */
  buildVersionedPreset(app, name, options = {}) {
    const basePayload = {
      name,
      version: this.currentVersion,
      schemaVersion: this.currentSchemaVersion,
      createdAt: new Date().toISOString(),
      controls: { ...app.controlState },
      automation: {
        tracks: app.automation.tracks.map(track => ({ 
          id: track.id, 
          values: [...track.values] 
        })),
        sections: app.automation.sections.map(section => ({ ...section }))
      },
      midiMappings: { ...app.midi.mappings }
    };

    // Add optional metadata
    if (options.description) {
      basePayload.description = options.description;
    }
    if (options.tags) {
      basePayload.tags = options.tags;
    }
    if (options.author) {
      basePayload.author = options.author;
    }

    return basePayload;
  }

  /**
   * Validate and migrate a preset to the current version
   * @param {Object} presetData - The preset data to validate/migrate
   * @returns {Object} Migrated preset data
   */
  validateAndMigratePreset(presetData) {
    if (!presetData || typeof presetData !== 'object') {
      throw new Error('Invalid preset data');
    }

    // If no version specified, assume it's an old preset
    if (!presetData.version) {
      console.warn('Preset has no version, assuming legacy format');
      return this.migrateLegacyPreset(presetData);
    }

    const presetVersion = presetData.version;
    const currentVersion = this.currentVersion;

    // If already current version, return as-is
    if (presetVersion === currentVersion) {
      return presetData;
    }

    // Check if we have migration path
    if (!PRESET_VERSIONS[presetVersion]) {
      throw new Error(`Unknown preset version: ${presetVersion}`);
    }

    // For now, we only have one version, so no migration needed
    // In the future, this is where version-specific migrations would happen
    console.log(`Preset version ${presetVersion} is compatible with current version ${currentVersion}`);
    return presetData;
  }

  /**
   * Migrate a legacy preset (no version field) to current format
   * @param {Object} legacyPreset - Legacy preset data
   * @returns {Object} Migrated preset data
   */
  migrateLegacyPreset(legacyPreset) {
    const migrated = {
      ...legacyPreset,
      version: this.currentVersion,
      schemaVersion: this.currentSchemaVersion,
      migratedAt: new Date().toISOString()
    };

    // Ensure required fields exist
    if (!migrated.controls) {
      migrated.controls = {};
    }
    if (!migrated.automation) {
      migrated.automation = { tracks: [], sections: [] };
    }
    if (!migrated.midiMappings) {
      migrated.midiMappings = {};
    }

    console.log('Legacy preset migrated to current version');
    return migrated;
  }

  /**
   * Check if a preset is compatible with the current version
   * @param {Object} presetData - The preset data to check
   * @returns {boolean} True if compatible
   */
  isCompatible(presetData) {
    try {
      this.validateAndMigratePreset(presetData);
      return true;
    } catch (error) {
      console.error('Preset compatibility check failed:', error);
      return false;
    }
  }

  /**
   * Get version information for a preset
   * @param {Object} presetData - The preset data
   * @returns {Object} Version information
   */
  getVersionInfo(presetData) {
    if (!presetData) {
      return { version: 'unknown', schemaVersion: 0, isLegacy: true };
    }

    return {
      version: presetData.version || 'legacy',
      schemaVersion: presetData.schemaVersion || 0,
      isLegacy: !presetData.version,
      migratedAt: presetData.migratedAt || null
    };
  }

  /**
   * Create a preset history entry
   * @param {Object} presetData - The preset data
   * @param {string} action - The action performed (save, load, etc.)
   * @returns {Object} History entry
   */
  createHistoryEntry(presetData, action = 'unknown') {
    return {
      id: this.generateHistoryId(),
      timestamp: new Date().toISOString(),
      action,
      presetName: presetData.name,
      version: presetData.version || 'legacy',
      schemaVersion: presetData.schemaVersion || 0
    };
  }

  /**
   * Generate a unique history ID
   * @returns {string} Unique ID
   */
  generateHistoryId() {
    return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the current preset version
   * @returns {string} Current version
   */
  getCurrentVersion() {
    return this.currentVersion;
  }

  /**
   * Get the current schema version
   * @returns {number} Current schema version
   */
  getCurrentSchemaVersion() {
    return this.currentSchemaVersion;
  }
}