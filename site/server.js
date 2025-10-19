const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors());
// Enable JSON body parsing for API routes
app.use(express.json({ limit: '1mb' }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Handle root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Minimal fetch fallback for Node versions without global fetch
function nodeFetch(url, options = {}) {
  if (typeof fetch === 'function') {
    return fetch(url, options);
  }
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const req = https.request(
        {
          method: options.method || 'GET',
          protocol: urlObj.protocol,
          hostname: urlObj.hostname,
          port: urlObj.port,
          path: `${urlObj.pathname}${urlObj.search}`,
          headers: options.headers || {}
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              headers: { get: (name) => res.headers[String(name).toLowerCase()] },
              json: async () => {
                try { return JSON.parse(data || '{}'); } catch { return {}; }
              },
              text: async () => data
            });
          });
        }
      );
      req.on('error', reject);
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Normalize various Wolfram responses to a common shape our client expects
function normalizeCompositionResponse(payload) {
  const base = payload || {};
  const seq = base.sequences || base;
  return {
    bpm: typeof base.bpm === 'number' ? base.bpm : undefined,
    sequences: {
      kick: Array.isArray(seq.kick) ? seq.kick : [],
      snare: Array.isArray(seq.snare) ? seq.snare : [],
      hats: Array.isArray(seq.hats) ? seq.hats : [],
      bass: Array.isArray(seq.bass) ? seq.bass : [],
      lead: Array.isArray(seq.lead) ? seq.lead : [],
      fx: Array.isArray(seq.fx) ? seq.fx : []
    }
  };
}

// Deterministic stub generator for offline/local development
function generateStubComposition(body = {}) {
  const stepCount = 16;
  const seed = Math.abs(Number(body.seed)) || Date.now();
  const rand = createRng(seed);
  const bpm = Number(body.bpm) || 124;

  const kick = new Array(stepCount).fill(0).map((_, i) => {
    if (i === 0) return 1;
    if (i === 8 && rand() < 0.85) return 1;
    return rand() < 0.28 ? Number((rand() * 0.8 + 0.2).toFixed(2)) : 0;
  });

  const snare = new Array(stepCount).fill(0).map((_, i) => {
    if (i === 3 || i === 11) return rand() < 0.95 ? 1 : 0;
    return rand() < 0.18 ? Number((rand() * 0.4 + 0.1).toFixed(2)) : 0;
  });

  const hats = new Array(stepCount).fill(0).map(() => {
    return rand() < 0.72 ? Number((rand() * 0.8 + 0.2).toFixed(2)) : 0;
  });

  const scaleNotes = ['C2', 'D2', 'E2', 'G1', 'A1'];
  const bass = new Array(stepCount).fill(null).map((_, i) => {
    if ([0, 4, 8, 12].includes(i) && rand() < 0.85) {
      return pick(scaleNotes, rand);
    }
    return rand() < 0.25 ? pick(scaleNotes, rand) : null;
  });

  const chords = [
    ['E4', 'G4', 'B4'],
    ['A4', 'C5'],
    ['B4', 'D5'],
    ['E5', 'G5']
  ];
  const lead = new Array(stepCount).fill(null).map((_, i) => {
    if (i % 4 === 0 && rand() < 0.8) {
      return chords[(i / 4) % chords.length];
    }
    if (i % 4 === 2 && rand() < 0.35) {
      const single = chords[(i / 4) % chords.length][0];
      return [single];
    }
    return null;
  });

  const fx = new Array(stepCount).fill(0).map((_, i) => ( [3, 7, 11, 15].includes(i) && rand() < 0.6 ? 1 : 0 ));

  return normalizeCompositionResponse({ bpm, sequences: { kick, snare, hats, bass, lead, fx } });
}

function createRng(seed) {
  // Mulberry32 PRNG
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(arr, rand) {
  return arr[Math.floor(rand() * arr.length)];
}

// Proxy endpoint to Wolfram (or local stub if not configured)
app.post('/api/wolfram/compose', async (req, res) => {
  const wolframUrl = process.env.WOLFRAM_API_URL;
  const bearer = process.env.WOLFRAM_BEARER || process.env.WOLFRAM_API_KEY;

  // If no Wolfram endpoint configured, return a deterministic stub composition
  if (!wolframUrl) {
    const stub = generateStubComposition(req.body);
    return res.json(stub);
  }

  try {
    const response = await nodeFetch(wolframUrl, {
      method: 'POST',
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        bearer ? { Authorization: `Bearer ${bearer}` } : {}
      ),
      body: JSON.stringify(req.body || {})
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'Wolfram API error', details: errText });
    }

    const contentType = String(response.headers.get('content-type') || '');
    const data = contentType.includes('application/json') ? await response.json() : { raw: await response.text() };
    return res.json(normalizeCompositionResponse(data));
  } catch (error) {
    return res.status(500).json({ error: 'Wolfram proxy failed', details: error?.message || String(error) });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Bodzin Generator Toolkit server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
  console.log('');
  console.log('This resolves CORS issues and enables proper audio playback.');
  console.log('Open your browser and navigate to the URL above.');
});