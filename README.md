# bodzin_gen

Static site assets live in `site/`. They are maintained manually and should remain committed to version control.

### Wolfram integration

- A minimal proxy endpoint is provided at `POST /api/wolfram/compose` via `site/server.js`.
- If `WOLFRAM_API_URL` is unset, the server returns a deterministic local stub composition.
- To connect a real Wolfram endpoint:
  - Set `WOLFRAM_API_URL` to your Wolfram Cloud/Server function URL that returns JSON sequences.
  - Optionally set `WOLFRAM_BEARER` (or `WOLFRAM_API_KEY`) for Authorization header.
  - Start the server: `cd site && npm start`.
- The web UI exposes a "Wolfram Compose" button in the Integrations header. Clicking it calls the proxy and applies returned sequences to kick/snare/hats/bass/lead/fx. BPM is applied if provided.

## TODO / Future Work

- Investigate opportunities to incorporate Wolfram tooling to support procedural music generation workflows while ensuring it does not reintroduce low-level markup generation.
