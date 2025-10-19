const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors());
// Enable JSON parsing for API endpoints
app.use(express.json({ limit: '1mb' }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Handle root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// -----------------------------
// Wolfram/Data-driven Curves API
// -----------------------------

// Helper: clamp value to [min, max]
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Helper: normalize array to [0,1]
function normalize01(values) {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (range === 0) return values.map(() => 0.5);
  return values.map(v => (v - min) / range);
}

// Helper: generate evenly spaced numbers between a and b (inclusive)
function linspace(a, b, n) {
  if (n <= 1) return [a];
  const step = (b - a) / (n - 1);
  return Array.from({ length: n }, (_, i) => a + i * step);
}

// Polynomial fit using normal equations and basic Gaussian elimination
function fitPolynomial(x, y, degree) {
  const m = x.length;
  const n = degree + 1;
  // Build Vandermonde matrix A (m x n)
  const A = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    let v = 1;
    for (let j = 0; j < n; j++) {
      A[i][j] = v;
      v *= x[i];
    }
  }
  // Compute normal equations: (A^T A) c = A^T y
  const ATA = Array.from({ length: n }, () => new Array(n).fill(0));
  const ATy = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < m; k++) sum += A[k][i] * A[k][j];
      ATA[i][j] = sum;
    }
    let sumY = 0;
    for (let k = 0; k < m; k++) sumY += A[k][i] * y[k];
    ATy[i] = sumY;
  }
  const coeffs = solveLinearSystem(ATA, ATy);
  return (t) => {
    let acc = 0;
    let v = 1;
    for (let i = 0; i < coeffs.length; i++) {
      acc += coeffs[i] * v;
      v *= t;
    }
    return acc;
  };
}

// Gaussian elimination with partial pivoting
function solveLinearSystem(A, b) {
  const n = A.length;
  // Build augmented matrix
  const M = A.map((row, i) => [...row, b[i]]);
  for (let k = 0; k < n; k++) {
    // Pivot
    let maxRow = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) > Math.abs(M[maxRow][k])) maxRow = i;
    }
    if (Math.abs(M[maxRow][k]) < 1e-12) {
      // Singular; fallback to small regularization
      M[maxRow][k] = 1e-12;
    }
    if (maxRow !== k) {
      const tmp = M[k];
      M[k] = M[maxRow];
      M[maxRow] = tmp;
    }
    // Normalize row
    const pivot = M[k][k];
    for (let j = k; j <= n; j++) M[k][j] /= pivot;
    // Eliminate
    for (let i = 0; i < n; i++) {
      if (i === k) continue;
      const factor = M[i][k];
      for (let j = k; j <= n; j++) M[i][j] -= factor * M[k][j];
    }
  }
  // Extract solution
  return M.map(row => row[n]);
}

// Simple moving average smoothing
function movingAverage(values, windowSize = 3) {
  const n = values.length;
  if (n === 0) return [];
  const half = Math.max(1, Math.floor(windowSize / 2));
  const out = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(n - 1, i + half); j++) {
      sum += values[j];
      count++;
    }
    out[i] = sum / count;
  }
  return out;
}

// Gaussian smoothing (discrete kernel)
function gaussianSmooth(values, sigma = 1.0) {
  const n = values.length;
  if (n === 0) return [];
  const size = Math.max(3, Math.ceil(sigma * 3) * 2 + 1);
  const kernel = new Array(size);
  const center = Math.floor(size / 2);
  for (let i = 0; i < size; i++) {
    const x = i - center;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
  }
  const out = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    let wsum = 0;
    for (let j = 0; j < size; j++) {
      const idx = i - center + j;
      if (idx >= 0 && idx < n) {
        sum += values[idx] * kernel[j];
        wsum += kernel[j];
      }
    }
    out[i] = wsum ? sum / wsum : values[i];
  }
  return out;
}

// Linear resample an array to a new length
function resampleLinear(values, length) {
  if (length <= 0) return [];
  if (values.length === 0) return new Array(length).fill(0);
  if (values.length === 1) return new Array(length).fill(values[0]);
  const out = new Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / (length - 1);
    const pos = t * (values.length - 1);
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const v0 = values[idx];
    const v1 = values[Math.min(idx + 1, values.length - 1)];
    out[i] = v0 + (v1 - v0) * frac;
  }
  return out;
}

function detectWolfram() {
  // Integration is optional; presence of URL indicates availability
  return Boolean(process.env.WOLFRAM_CLOUD_FUNCTION_URL);
}

async function callWolframFit(payload) {
  const url = process.env.WOLFRAM_CLOUD_FUNCTION_URL;
  if (!url || typeof fetch !== 'function') {
    throw new Error('Wolfram Cloud unavailable');
  }
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Wolfram error: ${resp.status} ${text}`);
  }
  return resp.json();
}

app.get('/api/wolfram/status', (req, res) => {
  res.json({
    available: detectWolfram(),
    host: os.hostname(),
  });
});

app.post('/api/curves/fit', async (req, res) => {
  try {
    const {
      x: xIn,
      y: yIn,
      data, // optional: array of numbers (y) or [x,y] pairs
      length = 16,
      method = 'polynomial',
      degree = 3,
      smoothing = 0,
      useWolfram = false
    } = req.body || {};

    // Parse inputs
    let x = Array.isArray(xIn) ? xIn.map(Number) : null;
    let y = Array.isArray(yIn) ? yIn.map(Number) : null;
    if ((!x || !y) && Array.isArray(data)) {
      if (Array.isArray(data[0])) {
        x = data.map(p => Number(p[0]));
        y = data.map(p => Number(p[1]));
      } else {
        y = data.map(Number);
        x = y.map((_, i) => i);
      }
    }
    if (!y || !x || x.length !== y.length || x.length === 0) {
      return res.status(400).json({ error: 'Invalid input: provide arrays x and y of equal length' });
    }

    // Normalize x to [0,1] for numerical stability
    const xmin = Math.min(...x);
    const xmax = Math.max(...x);
    const xr = xmax - xmin || 1;
    const xn = x.map(v => (v - xmin) / xr);

    // Try Wolfram if requested and available
    if (useWolfram && detectWolfram()) {
      try {
        const wolframPayload = { x: xn, y, length, method, degree, smoothing };
        const wolframResult = await callWolframFit(wolframPayload);
        if (Array.isArray(wolframResult.values)) {
          const values = wolframResult.values.map(v => clamp(v, 0, 1));
          return res.json({ source: 'wolfram', method, values });
        }
      } catch (err) {
        // Fall through to local
        console.warn('Wolfram call failed, using local fallback:', err.message);
      }
    }

    // Local fitting/resampling
    let resampled;
    if (method === 'polynomial') {
      const deg = Math.max(1, Math.min(8, Number(degree) || 3));
      const poly = fitPolynomial(xn, y, deg);
      const t = linspace(0, 1, Number(length) || 16);
      resampled = t.map(poly);
    } else if (method === 'movingAverage') {
      const base = resampleLinear(y, Number(length) || 16);
      resampled = movingAverage(base, Math.max(3, Math.round((smoothing || 0.3) * 10) | 1));
    } else if (method === 'gaussian') {
      const base = resampleLinear(y, Number(length) || 16);
      resampled = gaussianSmooth(base, Math.max(0.5, Number(smoothing) || 1.0));
    } else if (method === 'linear') {
      resampled = resampleLinear(y, Number(length) || 16);
    } else {
      // Default to polynomial
      const poly = fitPolynomial(xn, y, Math.max(1, Math.min(8, Number(degree) || 3)));
      const t = linspace(0, 1, Number(length) || 16);
      resampled = t.map(poly);
    }

    // Normalize and clamp
    const normalized = normalize01(resampled).map(v => clamp(v, 0, 1));
    res.json({ source: 'local', method, values: normalized });
  } catch (err) {
    console.error('Curve fit error:', err);
    res.status(500).json({ error: 'Curve fitting failed', details: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Bodzin Generator Toolkit server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
  console.log('');
  console.log('This resolves CORS issues and enables proper audio playback.');
  console.log('Open your browser and navigate to the URL above.');
  if (detectWolfram()) {
    console.log('Wolfram Cloud integration: ENABLED');
  } else {
    console.log('Wolfram Cloud integration: disabled (set WOLFRAM_CLOUD_FUNCTION_URL to enable)');
  }
});