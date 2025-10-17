#!/usr/bin/env python3
"""
Simple HTTP server for serving the Bodzin Generator Toolkit
This resolves CORS issues when loading ES6 modules
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Change to the site directory
site_dir = Path(__file__).parent
os.chdir(site_dir)

PORT = 8000

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    try:
        with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
            print(f"Server running at http://localhost:{PORT}")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"Port {PORT} is already in use. Trying port {PORT + 1}...")
            PORT += 1
            with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
                print(f"Server running at http://localhost:{PORT}")
                print("Press Ctrl+C to stop the server")
                httpd.serve_forever()
        else:
            print(f"Error starting server: {e}")
            sys.exit(1)