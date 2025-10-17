export class CommunityPresetManager {
  constructor(app) {
    this.app = app;
    this.presets = [];
    this.filteredPresets = [];
    this.currentFilter = '';
    this.currentCategory = '';
    this.currentSort = 'newest';
    
    // Mock data for demonstration
    this.mockPresets = [
      {
        id: '1',
        title: 'Deep Techno Journey',
        author: 'TechnoMaster',
        description: 'A deep, hypnotic techno preset with evolving filters and atmospheric textures. Perfect for building tension in your sets.',
        category: 'techno',
        rating: 4.8,
        downloads: 1247,
        createdAt: '2024-01-15T10:30:00Z',
        controls: {
          leadFilter: 0.3,
          fxSend: 0.6,
          bassFilter: 0.4,
          reverbDecay: 0.7,
          delayFeedback: 0.5,
          bassDrive: 0.8,
          leadResonance: 0.6,
          masterVolume: 0.9
        },
        automation: {
          tracks: [
            { id: 'leadFilter', values: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4] },
            { id: 'fxSend', values: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3] }
          ],
          sections: [
            { name: 'Intro', start: 0, end: 4, color: 'rgba(73, 169, 255, 0.05)' },
            { name: 'Lift', start: 4, end: 8, color: 'rgba(255, 73, 175, 0.04)' },
            { name: 'Peak', start: 8, end: 12, color: 'rgba(148, 255, 73, 0.04)' },
            { name: 'Break', start: 12, end: 16, color: 'rgba(255, 180, 73, 0.05)' }
          ]
        }
      },
      {
        id: '2',
        title: 'Minimal House Vibes',
        author: 'HouseHead',
        description: 'Clean minimal house preset with subtle groove and warm analog character. Great for deep house sessions.',
        category: 'house',
        rating: 4.6,
        downloads: 892,
        createdAt: '2024-01-12T14:20:00Z',
        controls: {
          leadFilter: 0.5,
          fxSend: 0.3,
          bassFilter: 0.6,
          reverbDecay: 0.4,
          delayFeedback: 0.3,
          bassDrive: 0.4,
          leadResonance: 0.3,
          masterVolume: 0.8
        },
        automation: {
          tracks: [
            { id: 'bassFilter', values: [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1] },
            { id: 'masterVolume', values: [0.6, 0.7, 0.8, 0.9, 1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45] }
          ],
          sections: [
            { name: 'Intro', start: 0, end: 4, color: 'rgba(73, 169, 255, 0.05)' },
            { name: 'Lift', start: 4, end: 8, color: 'rgba(255, 73, 175, 0.04)' },
            { name: 'Peak', start: 8, end: 12, color: 'rgba(148, 255, 73, 0.04)' },
            { name: 'Break', start: 12, end: 16, color: 'rgba(255, 180, 73, 0.05)' }
          ]
        }
      },
      {
        id: '3',
        title: 'Ambient Soundscape',
        author: 'AmbientExplorer',
        description: 'Ethereal ambient preset with lush reverb and evolving textures. Perfect for creating atmospheric soundscapes.',
        category: 'ambient',
        rating: 4.9,
        downloads: 1563,
        createdAt: '2024-01-10T09:15:00Z',
        controls: {
          leadFilter: 0.8,
          fxSend: 0.9,
          bassFilter: 0.2,
          reverbDecay: 0.95,
          delayFeedback: 0.8,
          bassDrive: 0.1,
          leadResonance: 0.7,
          masterVolume: 0.7
        },
        automation: {
          tracks: [
            { id: 'reverbDecay', values: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6] },
            { id: 'fxSend', values: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7] }
          ],
          sections: [
            { name: 'Intro', start: 0, end: 4, color: 'rgba(73, 169, 255, 0.05)' },
            { name: 'Lift', start: 4, end: 8, color: 'rgba(255, 73, 175, 0.04)' },
            { name: 'Peak', start: 8, end: 12, color: 'rgba(148, 255, 73, 0.04)' },
            { name: 'Break', start: 12, end: 16, color: 'rgba(255, 180, 73, 0.05)' }
          ]
        }
      },
      {
        id: '4',
        title: 'Experimental Glitch',
        author: 'GlitchWizard',
        description: 'Experimental preset with glitchy textures and unconventional automation patterns. For the adventurous producer.',
        category: 'experimental',
        rating: 4.3,
        downloads: 456,
        createdAt: '2024-01-08T16:45:00Z',
        controls: {
          leadFilter: 0.7,
          fxSend: 0.8,
          bassFilter: 0.9,
          reverbDecay: 0.6,
          delayFeedback: 0.9,
          bassDrive: 0.9,
          leadResonance: 0.8,
          masterVolume: 0.8
        },
        automation: {
          tracks: [
            { id: 'leadFilter', values: [0.1, 0.9, 0.2, 0.8, 0.3, 0.7, 0.4, 0.6, 0.5, 0.5, 0.6, 0.4, 0.7, 0.3, 0.8, 0.2] },
            { id: 'delayFeedback', values: [0.2, 0.8, 0.1, 0.9, 0.3, 0.7, 0.4, 0.6, 0.5, 0.5, 0.6, 0.4, 0.7, 0.3, 0.8, 0.2] }
          ],
          sections: [
            { name: 'Intro', start: 0, end: 4, color: 'rgba(73, 169, 255, 0.05)' },
            { name: 'Lift', start: 4, end: 8, color: 'rgba(255, 73, 175, 0.04)' },
            { name: 'Peak', start: 8, end: 12, color: 'rgba(148, 255, 73, 0.04)' },
            { name: 'Break', start: 12, end: 16, color: 'rgba(255, 180, 73, 0.05)' }
          ]
        }
      }
    ];
    
    this.presets = [...this.mockPresets];
    this.filteredPresets = [...this.presets];
  }

  initialize() {
    this.setupEventListeners();
    this.loadPresets();
  }

  setupEventListeners() {
    // Community modal
    const communityBtn = document.getElementById('communityPresetsButton');
    const communityModal = document.getElementById('communityPresetsModal');
    const closeCommunityModal = document.getElementById('closeCommunityModal');

    communityBtn?.addEventListener('click', () => {
      communityModal.style.display = 'flex';
      this.loadPresets();
    });

    closeCommunityModal?.addEventListener('click', () => {
      communityModal.style.display = 'none';
    });

    // Share modal
    const shareBtn = document.getElementById('sharePresetButton');
    const shareModal = document.getElementById('sharePresetModal');
    const closeShareModal = document.getElementById('closeShareModal');

    shareBtn?.addEventListener('click', () => {
      shareModal.style.display = 'flex';
    });

    closeShareModal?.addEventListener('click', () => {
      shareModal.style.display = 'none';
    });

    // Search and filter
    const searchInput = document.getElementById('presetSearch');
    const categorySelect = document.getElementById('presetCategory');
    const sortSelect = document.getElementById('presetSort');

    searchInput?.addEventListener('input', (e) => {
      this.currentFilter = e.target.value.toLowerCase();
      this.filterPresets();
    });

    categorySelect?.addEventListener('change', (e) => {
      this.currentCategory = e.target.value;
      this.filterPresets();
    });

    sortSelect?.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.sortPresets();
    });

    // Upload functionality
    const selectFileBtn = document.getElementById('selectPresetFile');
    const fileInput = document.getElementById('presetFileInput');
    const uploadBtn = document.getElementById('uploadPreset');

    selectFileBtn?.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput?.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileSelect(e.target.files[0]);
      }
    });

    uploadBtn?.addEventListener('click', () => {
      this.uploadPreset();
    });

    // Share functionality
    const downloadBtn = document.getElementById('downloadCurrentPreset');
    const generateLinkBtn = document.getElementById('generateShareLink');
    const copyLinkBtn = document.getElementById('copyShareLink');
    const uploadToCommunityBtn = document.getElementById('uploadToCommunity');

    downloadBtn?.addEventListener('click', () => {
      this.downloadCurrentPreset();
    });

    generateLinkBtn?.addEventListener('click', () => {
      this.generateShareLink();
    });

    copyLinkBtn?.addEventListener('click', () => {
      this.copyShareLink();
    });

    uploadToCommunityBtn?.addEventListener('click', () => {
      document.getElementById('sharePresetModal').style.display = 'none';
      document.getElementById('communityPresetsModal').style.display = 'flex';
    });

    // Close modals when clicking outside
    [communityModal, shareModal].forEach(modal => {
      modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });
  }

  loadPresets() {
    this.renderPresetGallery();
  }

  filterPresets() {
    this.filteredPresets = this.presets.filter(preset => {
      const matchesSearch = preset.title.toLowerCase().includes(this.currentFilter) ||
                           preset.author.toLowerCase().includes(this.currentFilter) ||
                           preset.description.toLowerCase().includes(this.currentFilter);
      const matchesCategory = !this.currentCategory || preset.category === this.currentCategory;
      return matchesSearch && matchesCategory;
    });
    this.sortPresets();
  }

  sortPresets() {
    this.filteredPresets.sort((a, b) => {
      switch (this.currentSort) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'popular':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    this.renderPresetGallery();
  }

  renderPresetGallery() {
    const gallery = document.getElementById('presetGallery');
    if (!gallery) return;

    if (this.filteredPresets.length === 0) {
      gallery.innerHTML = '<div class="no-presets">No presets found matching your criteria.</div>';
      return;
    }

    gallery.innerHTML = this.filteredPresets.map(preset => `
      <div class="preset-card" data-preset-id="${preset.id}">
        <h3 class="preset-title">${preset.title}</h3>
        <p class="preset-author">by ${preset.author}</p>
        <p class="preset-description">${preset.description}</p>
        <div class="preset-meta">
          <div class="preset-rating">
            ${this.renderStars(preset.rating)}
            <span>${preset.rating}</span>
          </div>
          <span class="preset-category">${preset.category}</span>
        </div>
        <div class="preset-actions">
          <button class="btn btn-primary" onclick="communityPresetManager.loadPreset('${preset.id}')">
            Load
          </button>
          <button class="btn" onclick="communityPresetManager.previewPreset('${preset.id}')">
            Preview
          </button>
        </div>
      </div>
    `).join('');
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
      stars += '<span class="star">★</span>';
    }
    
    if (hasHalfStar) {
      stars += '<span class="star">☆</span>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars += '<span class="star" style="color: #666;">☆</span>';
    }
    
    return stars;
  }

  loadPreset(presetId) {
    const preset = this.presets.find(p => p.id === presetId);
    if (!preset) return;

    // Apply preset to current app state
    if (preset.controls) {
      Object.assign(this.app.controlState, preset.controls);
    }

    if (preset.automation) {
      this.applyAutomationPreset(preset.automation);
    }

    // Update UI
    this.app.uiControls.updateAllControls();
    this.app.timeline.render();

    // Show success message
    this.showNotification('Preset loaded successfully!', 'success');

    // Close modal
    document.getElementById('communityPresetsModal').style.display = 'none';
  }

  previewPreset(presetId) {
    const preset = this.presets.find(p => p.id === presetId);
    if (!preset) return;

    // Create a preview modal or show preset details
    this.showPresetPreview(preset);
  }

  showPresetPreview(preset) {
    // This could be expanded to show a detailed preview
    alert(`Preview: ${preset.title}\n\n${preset.description}\n\nRating: ${preset.rating}/5\nDownloads: ${preset.downloads}`);
  }

  applyAutomationPreset(automation) {
    if (automation.tracks) {
      automation.tracks.forEach(track => {
        const existingTrack = this.app.automation.tracks.find(t => t.id === track.id);
        if (existingTrack) {
          existingTrack.values = [...track.values];
        }
      });
    }

    if (automation.sections) {
      this.app.automation.sections = automation.sections.map(section => ({ ...section }));
    }
  }

  handleFileSelect(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const preset = JSON.parse(e.target.result);
        this.validatePreset(preset);
        this.preparePresetForUpload(preset);
      } catch (error) {
        this.showNotification('Invalid preset file format', 'error');
      }
    };
    reader.readAsText(file);
  }

  validatePreset(preset) {
    const requiredFields = ['name', 'controls'];
    const missingFields = requiredFields.filter(field => !preset[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  preparePresetForUpload(preset) {
    // Pre-fill the upload form
    const titleInput = document.getElementById('presetTitle');
    const descriptionInput = document.getElementById('presetDescription');
    const categorySelect = document.getElementById('presetCategorySelect');

    if (titleInput) titleInput.value = preset.name || '';
    if (descriptionInput) descriptionInput.value = preset.description || '';
    if (categorySelect) categorySelect.value = preset.category || 'techno';
  }

  uploadPreset() {
    const title = document.getElementById('presetTitle').value.trim();
    const description = document.getElementById('presetDescription').value.trim();
    const category = document.getElementById('presetCategorySelect').value;

    if (!title) {
      this.showNotification('Please enter a preset title', 'error');
      return;
    }

    // Create preset from current app state
    const preset = this.buildPresetPayload(title, description, category);
    
    // Add to community presets (in a real app, this would upload to a server)
    const newPreset = {
      id: Date.now().toString(),
      title: preset.name,
      author: 'You', // In a real app, this would be the logged-in user
      description: preset.description,
      category: preset.category,
      rating: 0,
      downloads: 0,
      createdAt: new Date().toISOString(),
      controls: preset.controls,
      automation: preset.automation
    };

    this.presets.unshift(newPreset);
    this.filterPresets();

    this.showNotification('Preset uploaded successfully!', 'success');

    // Clear form
    document.getElementById('presetTitle').value = '';
    document.getElementById('presetDescription').value = '';
    document.getElementById('presetCategorySelect').value = 'techno';
  }

  buildPresetPayload(name, description, category) {
    return {
      name,
      description,
      category,
      createdAt: new Date().toISOString(),
      controls: { ...this.app.controlState },
      automation: {
        tracks: this.app.automation.tracks.map(track => ({ 
          id: track.id, 
          values: [...track.values] 
        })),
        sections: this.app.automation.sections.map(section => ({ ...section }))
      },
      midiMappings: { ...this.app.midi.mappings }
    };
  }

  downloadCurrentPreset() {
    const preset = this.buildPresetPayload(
      this.app.presetName || 'My Preset',
      'Exported from Bodzin Generator',
      'custom'
    );
    
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = this.slugify(preset.name) + '.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    this.showNotification('Preset downloaded!', 'success');
  }

  generateShareLink() {
    const preset = this.buildPresetPayload(
      this.app.presetName || 'My Preset',
      'Shared from Bodzin Generator',
      'custom'
    );
    
    // In a real app, this would generate a shareable URL
    const shareData = btoa(JSON.stringify(preset));
    const shareLink = `${window.location.origin}${window.location.pathname}?preset=${shareData}`;
    
    const shareLinkInput = document.getElementById('shareLink');
    const shareLinkContainer = document.getElementById('shareLinkContainer');
    
    if (shareLinkInput) {
      shareLinkInput.value = shareLink;
      shareLinkContainer.style.display = 'flex';
    }
  }

  copyShareLink() {
    const shareLinkInput = document.getElementById('shareLink');
    if (shareLinkInput) {
      shareLinkInput.select();
      document.execCommand('copy');
      this.showNotification('Share link copied to clipboard!', 'success');
    }
  }

  showNotification(message, type = 'info') {
    // Create a simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}