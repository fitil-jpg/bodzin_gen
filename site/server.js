const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Handle root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Bodzin Generator Toolkit server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
  console.log('');
  console.log('This resolves CORS issues and enables proper audio playback.');
  console.log('Open your browser and navigate to the URL above.');
});