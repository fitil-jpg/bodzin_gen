#!/bin/bash
# Start HTTP server for Bodzin Generator Toolkit

echo "Starting Bodzin Generator Toolkit server..."
echo "This will resolve CORS issues and allow proper audio playback"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 server.py
elif command -v python &> /dev/null; then
    python server.py
else
    echo "Error: Python is not installed or not in PATH"
    echo "Please install Python 3 to run the server"
    exit 1
fi