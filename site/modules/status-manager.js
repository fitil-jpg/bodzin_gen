export class StatusManager {
  constructor() {
    this.statusEl = document.getElementById('status');
    this.timer = null;
  }

  set(message) {
    if (!this.statusEl) return;
    
    // Add visual feedback animation
    this.statusEl.style.transform = 'scale(1.05)';
    this.statusEl.style.color = '#49a9ff';
    
    setTimeout(() => {
      this.statusEl.style.transform = '';
      this.statusEl.style.color = '';
    }, 150);
    
    this.statusEl.textContent = `Status: ${message}`;
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.statusEl.textContent = 'Status: Idle';
      this.statusEl.style.color = 'var(--muted)';
    }, 3500);
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}