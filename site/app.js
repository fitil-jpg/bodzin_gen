// Utility to map key strings to note scales
// Provides validation to ensure keys are well-formed

// Order of valid root notes used for validation
const order = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];

/**
 * Convert a key string like "C_major" into an array of note names.
 * @param {string} keyStr - Key in the format <Note>_<mode> (e.g. "C_major")
 * @returns {string[]} Array of notes comprising the scale.  Falls back to a
 * default triad when validation fails.
 */
function keyToScale(keyStr) {
  const defaultScale = ['D4', 'F4', 'A4'];
  // Ensure the key string is a string and matches the expected pattern.
  // The pattern enforces a root note followed by an underscore and mode.
  const match =
    typeof keyStr === 'string' && keyStr.match(/^([A-G][b#]?)(?:_(\w+))$/);
  if (!match) {
    // If the format is invalid, provide a safe default for downstream code.
    return defaultScale;
  }

  const root = match[1];
  const mode = match[2];
  // Verify that the root note exists in our order list.
  if (!order.includes(root)) {
    // Invalid root note - return default to avoid runtime errors.
    return defaultScale;
  }

  // TODO: existing scale generation logic would go here.
  // For now, return the default scale to keep behaviour predictable.
  return defaultScale;
}

module.exports = { keyToScale };

// --- Limiter routing setup -------------------------------------------------
// This section configures limiters on each instrument bus and ensures it runs
// before the final connection to the mix bus.  These buses are expected to be
// created elsewhere in the application prior to this code executing.
if (typeof Tone !== 'undefined' &&
    typeof mixBus !== 'undefined' &&
    typeof drumsBus !== 'undefined' &&
    typeof duckGainBass !== 'undefined' &&
    typeof duckGainLead !== 'undefined' &&
    typeof duckGainFx !== 'undefined') {

  const limDrums = new Tone.Limiter(-1);
  const limBass  = new Tone.Limiter(-1);
  const limLead  = new Tone.Limiter(-1);
  const limFx    = new Tone.Limiter(-1);

  drumsBus.disconnect(); drumsBus.connect(limDrums); limDrums.connect(mixBus);
  duckGainBass.disconnect(); duckGainBass.connect(limBass); limBass.connect(mixBus);
  duckGainLead.disconnect(); duckGainLead.connect(limLead); limLead.connect(mixBus);
  duckGainFx.disconnect();   duckGainFx.connect(limFx);     limFx.connect(mixBus);

  let limOn = {drums:false, bass:false, lead:false, fx:false};
  function updateLimiterGraph(){
    limDrums.threshold.rampTo(limOn.drums ? limThresh : 0, 0.02);
    limBass.threshold.rampTo( limOn.bass  ? limThresh : 0, 0.02);
    limLead.threshold.rampTo( limOn.lead  ? limThresh : 0, 0.02);
    limFx.threshold.rampTo(   limOn.fx    ? limThresh : 0, 0.02);
  }
  let limThresh = -1;
}

