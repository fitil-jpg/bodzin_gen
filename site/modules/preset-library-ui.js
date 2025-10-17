'use strict';

export class PresetLibraryUI {
  constructor(app) {
    this.app = app;
    this.presetManager = app.presetManager;
    this.isOpen = false;
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.selectedPreset = null;
    this.selectedTags = new Set();
    
    this.createModal();
    this.bindEvents();
  }

  createModal() {
    // Create modal backdrop
    this.modal = document.createElement('div');
    this.modal.className = 'preset-modal';
    this.modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Create modal content
    this.modalContent = document.createElement('div');
    this.modalContent.className = 'preset-modal-content';
    this.modalContent.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 1200px;
      max-height: 90vh;
      background: var(--panel-bg);
      border: 1px solid var(--border);
      border-radius: 1.5rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    this.createHeader();
    this.createSidebar();
    this.createMainContent();
    this.createFooter();

    this.modal.appendChild(this.modalContent);
    document.body.appendChild(this.modal);
  }

  createHeader() {
    this.header = document.createElement('div');
    this.header.className = 'preset-header';
    this.header.style.cssText = `
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.02);
    `;

    const title = document.createElement('h2');
    title.textContent = 'Preset Library';
    title.style.cssText = `
      margin: 0;
      color: var(--accent);
      font-size: 1.5rem;
      font-weight: 600;
    `;

    const headerActions = document.createElement('div');
    headerActions.style.cssText = `
      display: flex;
      gap: 0.75rem;
      align-items: center;
    `;

    const importBtn = document.createElement('button');
    importBtn.textContent = 'Import';
    importBtn.className = 'btn btn-outline';
    importBtn.addEventListener('click', () => this.importPresets());

    const exportAllBtn = document.createElement('button');
    exportAllBtn.textContent = 'Export All';
    exportAllBtn.className = 'btn btn-outline';
    exportAllBtn.addEventListener('click', () => this.exportAllPresets());

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.className = 'btn btn-outline';
    closeBtn.style.cssText = `
      width: 40px;
      height: 40px;
      padding: 0;
      border-radius: 50%;
      font-size: 1.2rem;
    `;
    closeBtn.addEventListener('click', () => this.close());

    headerActions.appendChild(importBtn);
    headerActions.appendChild(exportAllBtn);
    headerActions.appendChild(closeBtn);

    this.header.appendChild(title);
    this.header.appendChild(headerActions);
    this.modalContent.appendChild(this.header);
  }

  createSidebar() {
    this.sidebar = document.createElement('div');
    this.sidebar.className = 'preset-sidebar';
    this.sidebar.style.cssText = `
      width: 280px;
      background: rgba(255, 255, 255, 0.02);
      border-right: 1px solid var(--border);
      padding: 1rem;
      overflow-y: auto;
    `;

    // Search input
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
      margin-bottom: 1.5rem;
    `;

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search presets...';
    searchInput.className = 'preset-search';
    searchInput.style.cssText = `
      width: 100%;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      color: var(--text);
      font-size: 0.9rem;
      transition: all 0.3s ease;
    `;
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderPresets();
    });

    searchContainer.appendChild(searchInput);
    this.sidebar.appendChild(searchContainer);

    // Tag filter
    const tagFilterContainer = document.createElement('div');
    tagFilterContainer.style.cssText = `
      margin-bottom: 1.5rem;
    `;

    const tagFilterTitle = document.createElement('h4');
    tagFilterTitle.textContent = 'Filter by Tags';
    tagFilterTitle.style.cssText = `
      margin: 0 0 0.75rem 0;
      color: var(--text);
      font-size: 0.9rem;
      font-weight: 600;
    `;

    this.tagFilter = document.createElement('div');
    this.tagFilter.className = 'tag-filter';
    this.tagFilter.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    `;

    tagFilterContainer.appendChild(tagFilterTitle);
    tagFilterContainer.appendChild(this.tagFilter);
    this.sidebar.appendChild(tagFilterContainer);

    // Categories
    const categoriesTitle = document.createElement('h3');
    categoriesTitle.textContent = 'Categories';
    categoriesTitle.style.cssText = `
      margin: 0 0 1rem 0;
      color: var(--text);
      font-size: 1rem;
      font-weight: 600;
    `;
    this.sidebar.appendChild(categoriesTitle);

    this.categoriesList = document.createElement('div');
    this.categoriesList.className = 'categories-list';
    this.sidebar.appendChild(this.categoriesList);

    this.modalContent.appendChild(this.sidebar);
  }

  createMainContent() {
    this.mainContent = document.createElement('div');
    this.mainContent.className = 'preset-main-content';
    this.mainContent.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `;

    // Preset grid
    this.presetGrid = document.createElement('div');
    this.presetGrid.className = 'preset-grid';
    this.presetGrid.style.cssText = `
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
      align-content: start;
    `;

    this.mainContent.appendChild(this.presetGrid);
    this.modalContent.appendChild(this.mainContent);
  }

  createFooter() {
    this.footer = document.createElement('div');
    this.footer.className = 'preset-footer';
    this.footer.style.cssText = `
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.02);
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const presetInfo = document.createElement('div');
    presetInfo.className = 'preset-info';
    presetInfo.style.cssText = `
      color: var(--muted);
      font-size: 0.9rem;
    `;

    const actionButtons = document.createElement('div');
    actionButtons.className = 'preset-actions';
    actionButtons.style.cssText = `
      display: flex;
      gap: 0.75rem;
    `;

    this.previewButton = document.createElement('button');
    this.previewButton.textContent = 'Preview';
    this.previewButton.className = 'btn btn-outline';
    this.previewButton.disabled = true;
    this.previewButton.addEventListener('click', () => this.previewSelectedPreset());

    this.loadButton = document.createElement('button');
    this.loadButton.textContent = 'Load Preset';
    this.loadButton.className = 'btn btn-primary';
    this.loadButton.disabled = true;
    this.loadButton.addEventListener('click', () => this.loadSelectedPreset());

    this.duplicateButton = document.createElement('button');
    this.duplicateButton.textContent = 'Duplicate';
    this.duplicateButton.className = 'btn btn-outline';
    this.duplicateButton.disabled = true;
    this.duplicateButton.addEventListener('click', () => this.duplicateSelectedPreset());

    this.exportButton = document.createElement('button');
    this.exportButton.textContent = 'Export';
    this.exportButton.className = 'btn btn-outline';
    this.exportButton.disabled = true;
    this.exportButton.addEventListener('click', () => this.exportSelectedPreset());

    this.deleteButton = document.createElement('button');
    this.deleteButton.textContent = 'Delete';
    this.deleteButton.className = 'btn btn-outline';
    this.deleteButton.style.color = '#ff6b6b';
    this.deleteButton.disabled = true;
    this.deleteButton.addEventListener('click', () => this.deleteSelectedPreset());

    actionButtons.appendChild(this.previewButton);
    actionButtons.appendChild(this.loadButton);
    actionButtons.appendChild(this.duplicateButton);
    actionButtons.appendChild(this.exportButton);
    actionButtons.appendChild(this.deleteButton);

    this.footer.appendChild(presetInfo);
    this.footer.appendChild(actionButtons);
    this.modalContent.appendChild(this.footer);

    this.presetInfo = presetInfo;
  }

  bindEvents() {
    // Close modal on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open() {
    this.isOpen = true;
    this.modal.style.display = 'block';
    requestAnimationFrame(() => {
      this.modal.style.opacity = '1';
    });
    
    this.renderCategories();
    this.renderTagFilter();
    this.renderPresets();
  }

  close() {
    // Restore original state if we're in preview mode
    if (this.originalState) {
      this.restoreOriginalState();
    }
    
    this.modal.style.opacity = '0';
    setTimeout(() => {
      this.modal.style.display = 'none';
      this.isOpen = false;
    }, 300);
  }

  renderCategories() {
    this.categoriesList.innerHTML = '';

    // All presets category
    const allCategory = document.createElement('div');
    allCategory.className = 'category-item';
    allCategory.style.cssText = `
      padding: 0.75rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    `;
    
    if (this.currentCategory === 'all') {
      allCategory.style.background = 'rgba(73, 169, 255, 0.1)';
      allCategory.style.borderColor = 'var(--accent)';
    }

    allCategory.innerHTML = `
      <span style="font-size: 1.2rem;">🎵</span>
      <div>
        <div style="font-weight: 600; color: var(--text);">All Presets</div>
        <div style="font-size: 0.8rem; color: var(--muted);">${this.presetManager.getPresetCount()} presets</div>
      </div>
    `;

    allCategory.addEventListener('click', () => {
      this.currentCategory = 'all';
      this.renderCategories();
      this.renderPresets();
    });

    this.categoriesList.appendChild(allCategory);

    // Category items
    this.presetManager.getCategories().forEach(category => {
      const categoryItem = document.createElement('div');
      categoryItem.className = 'category-item';
      categoryItem.style.cssText = `
        padding: 0.75rem;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        border: 1px solid transparent;
      `;
      
      if (this.currentCategory === category.id) {
        categoryItem.style.background = 'rgba(73, 169, 255, 0.1)';
        categoryItem.style.borderColor = 'var(--accent)';
      }

      const count = this.presetManager.getPresetCountByCategory(category.id);
      
      categoryItem.innerHTML = `
        <span style="font-size: 1.2rem;">${category.icon}</span>
        <div>
          <div style="font-weight: 600; color: var(--text);">${category.name}</div>
          <div style="font-size: 0.8rem; color: var(--muted);">${count} presets</div>
        </div>
      `;

      categoryItem.addEventListener('click', () => {
        this.currentCategory = category.id;
        this.renderCategories();
        this.renderPresets();
      });

      this.categoriesList.appendChild(categoryItem);
    });
  }

  renderTagFilter() {
    this.tagFilter.innerHTML = '';

    // Get all unique tags from presets
    const allPresets = this.presetManager.getAllPresets();
    const allTags = new Set();
    allPresets.forEach(preset => {
      preset.tags.forEach(tag => allTags.add(tag));
    });

    // Create tag buttons
    Array.from(allTags).sort().forEach(tag => {
      const tagButton = document.createElement('button');
      tagButton.textContent = tag;
      tagButton.className = 'tag-filter-btn';
      tagButton.style.cssText = `
        padding: 0.4rem 0.8rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        color: var(--text);
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
      `;

      if (this.selectedTags.has(tag)) {
        tagButton.style.background = 'rgba(73, 169, 255, 0.2)';
        tagButton.style.borderColor = 'var(--accent)';
        tagButton.style.color = 'var(--accent)';
      }

      tagButton.addEventListener('click', () => {
        if (this.selectedTags.has(tag)) {
          this.selectedTags.delete(tag);
        } else {
          this.selectedTags.add(tag);
        }
        this.renderTagFilter();
        this.renderPresets();
      });

      this.tagFilter.appendChild(tagButton);
    });

    // Clear filters button
    if (this.selectedTags.size > 0) {
      const clearButton = document.createElement('button');
      clearButton.textContent = 'Clear Filters';
      clearButton.className = 'tag-filter-btn';
      clearButton.style.cssText = `
        padding: 0.4rem 0.8rem;
        background: rgba(255, 107, 107, 0.1);
        border: 1px solid #ff6b6b;
        border-radius: 0.5rem;
        color: #ff6b6b;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 0.5rem;
      `;

      clearButton.addEventListener('click', () => {
        this.selectedTags.clear();
        this.renderTagFilter();
        this.renderPresets();
      });

      this.tagFilter.appendChild(clearButton);
    }
  }

  renderPresets() {
    this.presetGrid.innerHTML = '';

    let presets;
    if (this.currentCategory === 'all') {
      presets = this.presetManager.getAllPresets();
    } else {
      presets = this.presetManager.getPresetsByCategory(this.currentCategory);
    }

    if (this.searchQuery) {
      presets = this.presetManager.searchPresets(this.searchQuery, this.currentCategory === 'all' ? null : this.currentCategory);
    }

    // Filter by selected tags
    if (this.selectedTags.size > 0) {
      presets = presets.filter(preset => {
        return Array.from(this.selectedTags).every(tag => preset.tags.includes(tag));
      });
    }

    if (presets.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.style.cssText = `
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: var(--muted);
      `;
      emptyState.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎵</div>
        <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">No presets found</div>
        <div>Try adjusting your search or selecting a different category</div>
      `;
      this.presetGrid.appendChild(emptyState);
      return;
    }

    presets.forEach(preset => {
      const presetCard = this.createPresetCard(preset);
      this.presetGrid.appendChild(presetCard);
    });
  }

  createPresetCard(preset) {
    const card = document.createElement('div');
    card.className = 'preset-card';
    card.style.cssText = `
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.25rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    `;

    if (this.selectedPreset && this.selectedPreset.id === preset.id) {
      card.style.background = 'rgba(73, 169, 255, 0.1)';
      card.style.borderColor = 'var(--accent)';
    }

    const category = this.presetManager.getCategory(preset.category);
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.2rem;">${category ? category.icon : '🎵'}</span>
          <span style="font-size: 0.8rem; color: var(--muted); background: rgba(255, 255, 255, 0.1); padding: 0.25rem 0.5rem; border-radius: 0.5rem;">${category ? category.name : 'Unknown'}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--muted);">${preset.version}</div>
      </div>
      
      <h3 style="margin: 0 0 0.5rem 0; color: var(--text); font-size: 1.1rem; font-weight: 600;">${preset.name}</h3>
      
      <p style="margin: 0 0 1rem 0; color: var(--muted); font-size: 0.9rem; line-height: 1.4;">${preset.description}</p>
      
      <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 1rem;">
        ${preset.tags.map(tag => `
          <span style="font-size: 0.75rem; color: var(--accent); background: rgba(73, 169, 255, 0.1); padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${tag}</span>
        `).join('')}
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--muted);">
        <span>by ${preset.author}</span>
        <span>${new Date(preset.modifiedAt).toLocaleDateString()}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      this.selectPreset(preset);
    });

    card.addEventListener('mouseenter', () => {
      if (!this.selectedPreset || this.selectedPreset.id !== preset.id) {
        card.style.background = 'rgba(255, 255, 255, 0.06)';
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      }
    });

    card.addEventListener('mouseleave', () => {
      if (!this.selectedPreset || this.selectedPreset.id !== preset.id) {
        card.style.background = 'rgba(255, 255, 255, 0.03)';
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
      }
    });

    return card;
  }

  selectPreset(preset) {
    // Remove previous selection
    if (this.selectedPreset) {
      const prevCard = this.presetGrid.querySelector(`[data-preset-id="${this.selectedPreset.id}"]`);
      if (prevCard) {
        prevCard.style.background = 'rgba(255, 255, 255, 0.03)';
        prevCard.style.borderColor = 'var(--border)';
      }
    }

    this.selectedPreset = preset;
    
    // Update card appearance
    const card = this.presetGrid.querySelector(`[data-preset-id="${preset.id}"]`);
    if (card) {
      card.style.background = 'rgba(73, 169, 255, 0.1)';
      card.style.borderColor = 'var(--accent)';
    }

    // Update footer
    this.updateFooter();
  }

  updateFooter() {
    if (this.selectedPreset) {
      this.presetInfo.textContent = `Selected: ${this.selectedPreset.name}`;
      this.previewButton.disabled = false;
      this.loadButton.disabled = false;
      this.duplicateButton.disabled = false;
      this.exportButton.disabled = false;
      this.deleteButton.disabled = this.selectedPreset.category === 'user' ? false : true;
    } else {
      this.presetInfo.textContent = 'No preset selected';
      this.previewButton.disabled = true;
      this.loadButton.disabled = true;
      this.duplicateButton.disabled = true;
      this.exportButton.disabled = true;
      this.deleteButton.disabled = true;
    }
  }

  previewSelectedPreset() {
    if (!this.selectedPreset) return;

    // Store current state for restoration
    this.originalState = {
      controls: { ...this.app.controlState },
      automation: { ...this.app.automation }
    };

    // Apply preset for preview
    const success = this.presetManager.loadPreset(this.selectedPreset.id);
    if (success) {
      this.app.status.updateStatus(`Previewing: ${this.selectedPreset.name} (Click Load to keep, or click Restore to cancel)`);
      
      // Update preview button to show restore option
      this.previewButton.textContent = 'Restore';
      this.previewButton.className = 'btn btn-outline';
      this.previewButton.style.color = '#ff6b6b';
      this.previewButton.onclick = () => this.restoreOriginalState();
    } else {
      this.app.status.updateStatus('Failed to preview preset', 'error');
    }
  }

  restoreOriginalState() {
    if (!this.originalState) return;

    // Restore original state
    Object.assign(this.app.controlState, this.originalState.controls);
    this.app.automation = this.originalState.automation;
    
    // Update UI
    this.app.uiControls.updateAllControls();
    this.app.timeline.render();
    
    // Reset preview button
    this.previewButton.textContent = 'Preview';
    this.previewButton.className = 'btn btn-outline';
    this.previewButton.style.color = '';
    this.previewButton.onclick = () => this.previewSelectedPreset();
    
    this.app.status.updateStatus('Restored original state');
    this.originalState = null;
  }

  loadSelectedPreset() {
    if (!this.selectedPreset) return;

    const success = this.presetManager.loadPreset(this.selectedPreset.id);
    if (success) {
      this.app.status.updateStatus(`Loaded preset: ${this.selectedPreset.name}`);
      this.originalState = null; // Clear any preview state
      this.close();
    } else {
      this.app.status.updateStatus('Failed to load preset', 'error');
    }
  }

  duplicateSelectedPreset() {
    if (!this.selectedPreset) return;

    const newName = prompt('Enter name for duplicated preset:', `${this.selectedPreset.name} (Copy)`);
    if (newName) {
      const duplicate = this.presetManager.duplicatePreset(this.selectedPreset.id, newName);
      if (duplicate) {
        this.app.status.updateStatus(`Duplicated preset: ${duplicate.name}`);
        this.renderPresets();
      }
    }
  }

  deleteSelectedPreset() {
    if (!this.selectedPreset || this.selectedPreset.category !== 'user') return;

    if (confirm(`Are you sure you want to delete "${this.selectedPreset.name}"?`)) {
      const deleted = this.presetManager.deletePreset(this.selectedPreset.id);
      if (deleted) {
        this.app.status.updateStatus(`Deleted preset: ${this.selectedPreset.name}`);
        this.selectedPreset = null;
        this.updateFooter();
        this.renderPresets();
      }
    }
  }

  showSavePresetDialog() {
    const name = prompt('Enter preset name:');
    if (!name) return;

    const category = prompt('Enter category (bass, lead, pad, arp, percussion, fx, ambient, user):', 'user');
    if (!category) return;

    const description = prompt('Enter description (optional):', '');
    const tags = prompt('Enter tags (comma-separated, optional):', '');

    const preset = this.presetManager.saveCurrentStateAsPreset(
      name,
      category,
      description,
      tags ? tags.split(',').map(tag => tag.trim()) : []
    );

    if (preset) {
      this.app.status.updateStatus(`Saved preset: ${preset.name}`);
      this.renderPresets();
    }
  }

  exportSelectedPreset() {
    if (!this.selectedPreset) return;

    const presetData = this.presetManager.exportPreset(this.selectedPreset.id);
    this.downloadPresetData(presetData, `${this.selectedPreset.name}.json`);
    this.app.status.updateStatus(`Exported preset: ${this.selectedPreset.name}`);
  }

  exportAllPresets() {
    const allPresets = this.presetManager.exportAllPresets();
    this.downloadPresetData(allPresets, 'bodzin-presets-library.json');
    this.app.status.updateStatus('Exported all presets');
  }

  downloadPresetData(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  importPresets() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.multiple = true;
    
    input.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      let importedCount = 0;
      let errorCount = 0;

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            
            if (data.presets && Array.isArray(data.presets)) {
              // Multiple presets
              const result = this.presetManager.importPresets(data.presets);
              importedCount += result.imported.length;
              errorCount += result.errors.length;
            } else if (data.id && data.name) {
              // Single preset
              this.presetManager.importPreset(data);
              importedCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            console.error('Error importing preset:', error);
            errorCount++;
          }

          // Update UI after all files are processed
          if (importedCount + errorCount === files.length) {
            this.app.status.updateStatus(`Imported ${importedCount} presets${errorCount > 0 ? `, ${errorCount} errors` : ''}`);
            this.renderPresets();
          }
        };
        reader.readAsText(file);
      });
    });

    input.click();
  }
}