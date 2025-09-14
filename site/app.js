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

// --- Project import/export -------------------------------------------------
/**
 * Package current project state into a .zip file and trigger a download.
 * The zip contains the preset, profiles, and MIDI map JSON files.  Files are
 * stored without compression via `makeZipStoreOnly`.
 */
function exportProjectZip(){
  const enc = new TextEncoder();
  const files = {
    'preset.json':   enc.encode(JSON.stringify(preset   ?? {})),
    'profiles.json': enc.encode(JSON.stringify(profiles ?? {})),
    'midi-map.json': enc.encode(JSON.stringify(midiMap  ?? {})),
  };

  const zip = makeZipStoreOnly(files);
  const blob = new Blob([zip], {type:'application/zip'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'project.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Import project data from an object of Uint8Arrays keyed by filename.
 * The object is typically produced by `unzipStoreOnly`.
 * @param {Object.<string, Uint8Array>} files
 */
async function importProject(files){
  const dec = new TextDecoder();
  if(files['preset.json']){
    try { Object.assign(preset, JSON.parse(dec.decode(files['preset.json']))); }
    catch(err){ console.error(err); }
  }
  if(files['profiles.json']){
    try { Object.assign(profiles, JSON.parse(dec.decode(files['profiles.json']))); }
    catch(err){ console.error(err); }
  }
  if(files['midi-map.json']){
    try { Object.assign(midiMap, JSON.parse(dec.decode(files['midi-map.json']))); }
    catch(err){ console.error(err); }
  }
}

module.exports = { keyToScale, exportProjectZip, importProject };

// --- Transport & header -----------------------------------------------------
$('#projSaveBtn').addEventListener('click', ()=> exportProjectZip());
$('#projLoadBtn').addEventListener('click', ()=> $('#projFile').click());
$('#projFile').addEventListener('change', async e => {
  const f = e.target.files?.[0]; if(!f) return;
  const buf = await f.arrayBuffer();
  try {
    const files = unzipStoreOnly(new Uint8Array(buf));
    await importProject(files);
    status('Project loaded.');
  } catch(err){ console.error(err); status('Bad project .zip'); }
});

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

  if (typeof HANDLERS !== 'undefined') {
    Object.assign(HANDLERS, {
      lim_thresh: v => { limThresh = +v; updateLimiterGraph(); },
      lim_drums_on: val => { limOn.drums = (val === 'On'); updateLimiterGraph(); },
      lim_bass_on:  val => { limOn.bass  = (val === 'On'); updateLimiterGraph(); },
      lim_lead_on:  val => { limOn.lead  = (val === 'On'); updateLimiterGraph(); },
      lim_fx_on:    val => { limOn.fx    = (val === 'On'); updateLimiterGraph(); },
    });
  }
}

