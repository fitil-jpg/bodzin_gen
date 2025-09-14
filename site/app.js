// Simple meter drawing utility.
// Assumes `lvl` and drawing context `ctx` are defined globally.
// `lvl` is expected in decibels where 0 is max and negative values
// represent quieter levels down to -60 dB.
function drawMeter() {
  if (!isFinite(lvl)) {
    lvl = -60;
  }
  const clamped = Math.max(lvl, -60);
  const norm = (clamped + 60) / 60;
  const width = ctx.canvas.width * norm;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 0, width, ctx.canvas.height);
}

if (typeof module !== 'undefined') {
  module.exports = { drawMeter };
}
