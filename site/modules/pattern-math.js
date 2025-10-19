// Mathematical pattern generators (Euclidean rhythms, Wolfram ECA)

// Rotate an array by a given amount (positive = right, negative = left)
export function rotateArray(values, amount = 0) {
  const len = Array.isArray(values) ? values.length : 0;
  if (!len) return [];
  const shift = ((amount % len) + len) % len;
  if (shift === 0) return [...values];
  return values.slice(len - shift).concat(values.slice(0, len - shift));
}

// Simple and fast Euclidean rhythm generator using the "bucket" method
// Returns an array of 0/1 hits distributed as evenly as possible
export function generateEuclideanPattern(steps, pulses, rotation = 0) {
  const totalSteps = Math.max(1, Math.floor(steps || 16));
  const totalPulses = Math.max(0, Math.min(totalSteps, Math.floor(pulses || 0)));
  const out = new Array(totalSteps).fill(0);
  if (totalPulses === 0) return out;

  let bucket = 0;
  for (let i = 0; i < totalSteps; i++) {
    bucket += totalPulses;
    if (bucket >= totalSteps) {
      bucket -= totalSteps;
      out[i] = 1;
    }
  }
  return rotation ? rotateArray(out, rotation) : out;
}

// Convert a boolean/0-1 pattern into velocity values (0..1)
export function mapPatternToVelocities(pattern, options = {}) {
  const {
    base = 0.9,
    spread = 0.1,
    ghostChance = 0,
    ghostMin = 0.15,
    ghostMax = 0.35,
  } = options;

  return (pattern || []).map(hit => {
    if (!hit) return 0;
    if (ghostChance > 0 && Math.random() < ghostChance) {
      // Soft ghost hit
      return ghostMin + Math.random() * (ghostMax - ghostMin);
    }
    const jitter = (Math.random() * 2 - 1) * spread; // +/- spread
    return Math.max(0, Math.min(1, base + jitter));
  });
}

// Convert a boolean/0-1 pattern into a note sequence using a note pool
// If cycle=true, successive hits walk through the pool. Otherwise choose randomly.
export function mapPatternToNotes(pattern, notePool, options = {}) {
  const { rest = null, cycle = true, startIndex = 0 } = options;
  const pool = Array.isArray(notePool) && notePool.length ? notePool : ['C2'];
  let poolIndex = ((startIndex % pool.length) + pool.length) % pool.length;

  return (pattern || []).map(hit => {
    if (!hit) return rest;
    if (cycle) {
      const note = pool[poolIndex % pool.length];
      poolIndex++;
      return note;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  });
}

// Build the 8-bit rule table for Wolfram ECA (rule 0..255)
// Index order: 111, 110, 105, 100, 011, 010, 001, 000 (standard)
function buildEcaRuleTable(ruleNumber) {
  const n = Math.max(0, Math.min(255, ruleNumber | 0));
  const bits = n.toString(2).padStart(8, '0');
  // Map 3-bit neighborhood to next state
  const keys = ['111', '110', '101', '100', '011', '010', '001', '000'];
  const table = new Map();
  keys.forEach((k, idx) => table.set(k, bits[idx] === '1' ? 1 : 0));
  return table;
}

// Generate an Elementary Cellular Automaton matrix (rows=time, columns=space)
export function generateECAMatrix({ rule = 30, steps = 16, width = 16, seed = 'center', boundary = 'wrap' } = {}) {
  const totalSteps = Math.max(1, Math.floor(steps));
  const totalWidth = Math.max(1, Math.floor(width));
  const ruleTable = buildEcaRuleTable(rule);

  // Seed row
  const row0 = new Array(totalWidth).fill(0);
  if (seed === 'center') {
    row0[Math.floor(totalWidth / 2)] = 1;
  } else if (Array.isArray(seed)) {
    seed.forEach(idx => {
      const i = ((idx % totalWidth) + totalWidth) % totalWidth;
      row0[i] = 1;
    });
  } else if (seed === 'random') {
    for (let i = 0; i < totalWidth; i++) row0[i] = Math.random() < 0.5 ? 1 : 0;
  } else {
    // Numeric single index
    const i = ((Number(seed) | 0) % totalWidth + totalWidth) % totalWidth;
    row0[i] = 1;
  }

  const rows = new Array(totalSteps);
  rows[0] = row0;

  const getCell = (row, idx) => {
    if (boundary === 'wrap') {
      const j = ((idx % totalWidth) + totalWidth) % totalWidth;
      return row[j];
    }
    // clamp
    if (idx < 0) return row[0];
    if (idx >= totalWidth) return row[totalWidth - 1];
    return row[idx];
  };

  for (let r = 1; r < totalSteps; r++) {
    const prev = rows[r - 1];
    const next = new Array(totalWidth).fill(0);
    for (let c = 0; c < totalWidth; c++) {
      const left = getCell(prev, c - 1);
      const center = getCell(prev, c);
      const right = getCell(prev, c + 1);
      const key = `${left}${center}${right}`;
      next[c] = ruleTable.get(key) ? 1 : 0;
    }
    rows[r] = next;
  }
  return rows;
}

// Reduce an ECA matrix to a 1D step pattern by sampling one or more columns over time
export function generateECAPattern({ rule = 30, steps = 16, width = 16, columns, seed = 'center', boundary = 'wrap' } = {}) {
  const cols = Array.isArray(columns) && columns.length
    ? columns
    : [Math.floor(width / 2)]; // default: center column

  const matrix = generateECAMatrix({ rule, steps, width, seed, boundary });
  const totalSteps = matrix.length;
  const totalWidth = matrix[0].length;

  // Normalize column indices
  const normCols = cols.map(c => ((c % totalWidth) + totalWidth) % totalWidth);

  const out = new Array(totalSteps).fill(0);
  for (let r = 0; r < totalSteps; r++) {
    let hit = 0;
    for (let k = 0; k < normCols.length; k++) {
      if (matrix[r][normCols[k]]) {
        hit = 1; break;
      }
    }
    out[r] = hit;
  }
  return out;
}
