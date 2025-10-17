/**
 * UI Module
 * Handles user interface elements and interactions
 */

export class UIModule {
  constructor(app) {
    this.app = app;
    this.statusElement = null;
    this.initializeElements();
  }

  initializeElements() {
    this.statusElement = document.getElementById('status');
  }

  setStatus(message) {
    if (this.statusElement) {
      this.statusElement.textContent = message;
    }
    console.log('Status:', message);
  }

  showError(message) {
    console.error('Error:', message);
    this.setStatus(`Error: ${message}`);
  }

  showSuccess(message) {
    console.log('Success:', message);
    this.setStatus(`Success: ${message}`);
  }

  updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = content;
    }
  }

  addEventListener(elementId, event, handler) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  createElement(tag, className, content) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (content) {
      element.innerHTML = content;
    }
    return element;
  }

  appendToContainer(containerId, element) {
    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(element);
    }
  }
}