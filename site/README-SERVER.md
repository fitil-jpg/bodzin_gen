# Bodzin Generator Toolkit - Server Setup

This document explains how to run the Bodzin Generator Toolkit to avoid CORS and audio context issues.

## The Problem

When opening the HTML file directly in a browser (using `file://` protocol), you may encounter:

1. **CORS Policy Error**: `Access to script at 'file:///...' from origin 'null' has been blocked by CORS policy`
2. **AudioContext Error**: `The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture`

## The Solution

Run the application through a local HTTP server instead of opening the file directly.

## Quick Start

### Option 1: Python Server (Recommended)

1. Open a terminal/command prompt
2. Navigate to the `site` directory
3. Run the server:
   ```bash
   python3 server.py
   ```
   Or if you only have Python 2:
   ```bash
   python server.py
   ```

4. Open your browser and go to: `http://localhost:8000`

### Option 2: Node.js Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and go to: `http://localhost:8000`

### Option 3: Using the Shell Script

1. Make the script executable (if on Unix/Linux/Mac):
   ```bash
   chmod +x start-server.sh
   ```

2. Run the script:
   ```bash
   ./start-server.sh
   ```

## What This Fixes

- **CORS Issues**: ES6 modules can be loaded properly over HTTP
- **Audio Context**: User interaction properly initializes the audio context
- **File Access**: All resources load correctly from the same origin

## Troubleshooting

- If port 8000 is busy, the Python server will automatically try port 8001
- Make sure you have Python 3 or Node.js installed
- If you still have audio issues, try clicking the Start button after the page loads

## Development

For development, you can use any HTTP server that serves static files with CORS headers enabled. The provided servers are simple solutions that work out of the box.