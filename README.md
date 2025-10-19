# bodzin_gen

Static site assets live in `site/`. They are maintained manually and should remain committed to version control.

## Wolfram Integration (optional)

- A lightweight module `site/modules/wolfram-integration.js` provides Wolfram-inspired generators without external dependencies:
  - Cellular automata rhythms (Rule 30/90/110) → apply to instruments
  - Logistic-map probability curves → apply to probability triggers
  - Simple scale-degree melodies/chords
- In the UI, quick actions are added in the header:
  - "CA Rule30 → Hats" applies a Rule 30 CA rhythm to hats
  - "Logistic → Kick Prob" applies a logistic probability curve to kick and enables probability triggers
- Keyboard shortcuts:
  - Ctrl/Cmd+W: Apply CA Rule 30 rhythm to hats
  - Ctrl/Cmd+Shift+W: Apply logistic curve to kick probability (enables probability triggers)
- An optional stub endpoint exists at `POST /api/wolfram/evaluate` (see `site/server.js`). It currently echoes the input; replace with a Wolfram Cloud call if needed.

No Wolfram tooling is required for the default experience.
