const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Handle root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Optional Wolfram Cloud stub (no external call). Replace with real integration if desired.
// POST /api/wolfram/evaluate { expression: string }
app.post('/api/wolfram/evaluate', async (req, res) => {
  try {
    const { expression } = req.body || {};
    if (!expression || typeof expression !== 'string') {
      return res.status(400).json({ error: 'Missing expression' });
    }
    // Echo-only stub. In production, call Wolfram Cloud API here.
    return res.json({ ok: true, expression, result: null, note: 'Stubbed endpoint. Add Wolfram Cloud call here.' });
  } catch (e) {
    return res.status(500).json({ error: 'Evaluation failed' });
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