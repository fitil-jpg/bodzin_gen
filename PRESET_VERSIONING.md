# Preset Versioning System

This document describes the preset versioning system implemented for the Bodzin Generator Toolkit.

## Overview

The preset versioning system provides:
- **Version tracking** for preset files
- **Backward compatibility** with legacy presets
- **Migration system** for upgrading old presets
- **Preset history** tracking
- **Version validation** and error handling

## Features

### 1. Versioned Preset Structure

All presets now include version information:

```json
{
  "name": "My Preset",
  "version": "1.0.0",
  "schemaVersion": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "description": "Optional description",
  "tags": ["tag1", "tag2"],
  "author": "Author Name",
  "controls": { ... },
  "automation": { ... },
  "midiMappings": { ... }
}
```

### 2. Legacy Preset Migration

Legacy presets (without version information) are automatically migrated:

- Added version and schema version fields
- Ensured all required fields exist
- Marked with `migratedAt` timestamp
- Maintained backward compatibility

### 3. Preset History

The system tracks preset operations:

- **Save operations** - When presets are saved
- **Load operations** - When presets are loaded
- **Version information** - Track which version was used
- **Timestamps** - When operations occurred

### 4. Version Validation

Before loading presets, the system:

- Validates preset structure
- Checks version compatibility
- Migrates if necessary
- Provides clear error messages

## Usage

### Saving a Versioned Preset

```javascript
// Basic save
app.presetVersioning.buildVersionedPreset(app, 'Preset Name');

// With additional metadata
app.presetVersioning.buildVersionedPreset(app, 'Preset Name', {
  description: 'A great preset',
  tags: ['ambient', 'drone'],
  author: 'Your Name'
});
```

### Loading and Migrating Presets

```javascript
// Automatic migration
const migratedPreset = app.presetVersioning.validateAndMigratePreset(presetData);

// Check compatibility
const isCompatible = app.presetVersioning.isCompatible(presetData);
```

### Preset History

```javascript
// Create history entry
const historyEntry = app.presetVersioning.createHistoryEntry(preset, 'save');

// Get version info
const versionInfo = app.presetVersioning.getVersionInfo(preset);
```

## API Reference

### PresetVersioning Class

#### Methods

- `buildVersionedPreset(app, name, options)` - Create a versioned preset
- `validateAndMigratePreset(presetData)` - Validate and migrate preset
- `isCompatible(presetData)` - Check if preset is compatible
- `getVersionInfo(presetData)` - Get version information
- `createHistoryEntry(presetData, action)` - Create history entry
- `getCurrentVersion()` - Get current version
- `getCurrentSchemaVersion()` - Get current schema version

### Storage Manager Extensions

#### New Methods

- `savePresetHistory(history)` - Save preset history
- `loadPresetHistory()` - Load preset history
- `clearPresetHistory()` - Clear preset history

## UI Features

### Preset History Modal

- View all preset operations
- See version information
- Clear history
- Responsive design

### Enhanced Status Messages

- Version information in status
- Migration notifications
- Error messages for incompatible presets

## Configuration

### Constants

```javascript
export const PRESET_VERSION = '1.0.0';
export const PRESET_SCHEMA_VERSION = 1;
export const PRESET_VERSIONS = {
  '1.0.0': {
    schemaVersion: 1,
    description: 'Initial preset format',
    migration: null
  }
};
```

## Migration Strategy

### Current Version (1.0.0)

- Initial implementation
- No migration needed
- Full backward compatibility

### Future Versions

When adding new versions:

1. Add version to `PRESET_VERSIONS`
2. Implement migration function
3. Update `PRESET_VERSION` constant
4. Test migration paths

## Testing

A test page is available at `/test-versioning.html` to verify:

- Preset creation
- Legacy migration
- Compatibility checking
- History functionality

## Error Handling

The system provides clear error messages for:

- Invalid preset data
- Incompatible versions
- Migration failures
- Storage errors

## Browser Compatibility

- Modern browsers with ES6 modules support
- LocalStorage for history persistence
- No external dependencies

## Performance Considerations

- History limited to 50 entries
- Efficient migration logic
- Minimal memory overhead
- Fast validation checks