// UI Manager Module
// Handles all UI interactions, animations, and visual feedback

export class UIManager {
  constructor() {
    this.statusEl = null;
    this.sectionLabelEl = null;
    this.statusTimer = null;
  }

  initialize() {
    this.statusEl = document.getElementById('status');
    this.sectionLabelEl = document.getElementById('sectionLabel');
  }

  setStatus(message) {
    if (!this.statusEl) return;
    
    this.statusEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    this.statusEl.style.transform = 'scale(1.05)';
    this.statusEl.style.color = '#49a9ff';
    this.statusEl.style.textShadow = '0 0 10px rgba(73, 169, 255, 0.3)';
    
    setTimeout(() => {
      this.statusEl.textContent = `Status: ${message}`;
    }, 100);
    
    setTimeout(() => {
      this.statusEl.style.transform = 'scale(1)';
      this.statusEl.style.textShadow = 'none';
    }, 300);
    
    setTimeout(() => {
      this.statusEl.style.color = '';
    }, 500);
    
    clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => {
      this.statusEl.style.transition = 'all 0.5s ease-out';
      this.statusEl.textContent = 'Status: Idle';
      this.statusEl.style.color = 'var(--muted)';
    }, 3500);
    
    // Mobile vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  updateSectionLabel(step, sections) {
    const section = this.getSectionForStep(step, sections);
    if (this.sectionLabelEl) {
      this.sectionLabelEl.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      this.sectionLabelEl.style.transform = 'scale(0.95)';
      this.sectionLabelEl.style.opacity = '0.7';
      
      setTimeout(() => {
        if (section) {
          this.sectionLabelEl.textContent = `Section: ${section.name}`;
          this.sectionLabelEl.style.color = section.color ? section.color.replace('0.04', '1') : 'var(--accent)';
        } else {
          this.sectionLabelEl.textContent = 'Section: Loop';
          this.sectionLabelEl.style.color = 'var(--accent)';
        }
        this.sectionLabelEl.style.transform = 'scale(1)';
        this.sectionLabelEl.style.opacity = '1';
      }, 200);
      
      setTimeout(() => {
        this.sectionLabelEl.style.color = '';
      }, 1000);
    }
  }

  getSectionForStep(step, sections) {
    return sections.find(section => step >= section.start && step < section.end);
  }

  animateButton(button, type = 'click') {
    if (!button) return;
    
    button.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    switch (type) {
      case 'click':
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 150);
        break;
      case 'hover':
        button.style.transform = 'scale(1.02)';
        break;
      case 'active':
        button.style.transform = 'scale(0.98)';
        break;
    }
  }

  showLoading(button) {
    if (!button) return;
    button.classList.add('loading');
    button.disabled = true;
  }

  hideLoading(button) {
    if (!button) return;
    button.classList.remove('loading');
    button.disabled = false;
  }

  createToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add styles
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent);
      color: var(--bg);
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}
