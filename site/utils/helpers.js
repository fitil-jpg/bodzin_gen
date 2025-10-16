// Допоміжні функції
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'preset';
}

export function wait(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

export function formatDb(value) {
  return `${value.toFixed(1)} dB`;
}

export function formatHz(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} kHz`;
  }
  return `${Math.round(value)} Hz`;
}

export function setBusLevel(bus, db) {
  if (!bus) return;
  bus.gain.value = Tone.dbToGain(db);
}

export function createParticle(x, y, color) {
  return {
    x: x + (Math.random() - 0.5) * 20,
    y: y + (Math.random() - 0.5) * 20,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    life: 1.0,
    decay: 0.02 + Math.random() * 0.01,
    size: 2 + Math.random() * 3,
    color: color || `hsl(${200 + Math.random() * 60}, 70%, 60%)`
  };
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}