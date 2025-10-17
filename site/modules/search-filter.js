export class SearchFilter {
  constructor(app) {
    this.app = app;
    this.searchTerm = '';
    this.groupFilter = '';
    this.typeFilter = '';
    this.originalControlState = new Map();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchButton = document.getElementById('clearSearchButton');
    const groupFilter = document.getElementById('groupFilter');
    const typeFilter = document.getElementById('typeFilter');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.applyFilters();
      });

      // Add keyboard shortcuts
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.clearFilters();
          searchInput.blur();
        }
      });
    }

    if (clearSearchButton) {
      clearSearchButton.addEventListener('click', () => {
        this.clearFilters();
      });
    }

    if (groupFilter) {
      groupFilter.addEventListener('change', (e) => {
        this.groupFilter = e.target.value;
        this.applyFilters();
      });
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        this.typeFilter = e.target.value;
        this.applyFilters();
      });
    }

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });
  }

  applyFilters() {
    if (!this.app.uiControls) return;

    const controlsContainer = document.getElementById('controls');
    if (!controlsContainer) return;

    // Store original state if not already stored
    if (this.originalControlState.size === 0) {
      this.storeOriginalState();
    }

    const sections = controlsContainer.querySelectorAll('.control-section');
    let hasVisibleControls = false;
    let visibleCount = 0;
    let totalCount = 0;

    sections.forEach(section => {
      const sectionTitle = section.querySelector('h3');
      const groupName = sectionTitle ? sectionTitle.textContent : '';
      
      // Check if section matches group filter
      const groupMatches = !this.groupFilter || groupName === this.groupFilter;
      
      if (!groupMatches) {
        section.classList.add('hidden');
        return;
      }

      const controls = section.querySelectorAll('.control-row');
      let sectionHasVisibleControls = false;

      controls.forEach(controlRow => {
        totalCount++;
        const label = controlRow.querySelector('.label');
        const input = controlRow.querySelector('input, select');
        
        if (!label || !input) {
          controlRow.classList.add('hidden');
          return;
        }

        const controlLabel = label.textContent.toLowerCase();
        const controlType = input.type || input.tagName.toLowerCase();
        
        // Check search term match
        const searchMatches = !this.searchTerm || 
          controlLabel.includes(this.searchTerm) ||
          groupName.toLowerCase().includes(this.searchTerm);

        // Check type filter match
        const typeMatches = !this.typeFilter || 
          (this.typeFilter === 'range' && controlType === 'range') ||
          (this.typeFilter === 'select' && controlType === 'select');

        if (searchMatches && typeMatches) {
          controlRow.classList.remove('hidden');
          sectionHasVisibleControls = true;
          hasVisibleControls = true;
          visibleCount++;
          
          // Highlight search term in label
          this.highlightSearchTerm(label, this.searchTerm);
        } else {
          controlRow.classList.add('hidden');
        }
      });

      // Show/hide section based on whether it has visible controls
      if (sectionHasVisibleControls) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });

    // Update search results counter
    this.updateSearchResults(visibleCount, totalCount);

    // Show no results message if no controls are visible
    this.showNoResultsMessage(!hasVisibleControls);
  }

  storeOriginalState() {
    const controlsContainer = document.getElementById('controls');
    if (!controlsContainer) return;

    const sections = controlsContainer.querySelectorAll('.control-section');
    sections.forEach(section => {
      const sectionTitle = section.querySelector('h3');
      const groupName = sectionTitle ? sectionTitle.textContent : '';
      
      const controls = section.querySelectorAll('.control-row');
      controls.forEach(controlRow => {
        const label = controlRow.querySelector('.label');
        const input = controlRow.querySelector('input, select');
        
        if (label && input) {
          const controlId = controlRow.dataset.controlId;
          if (controlId) {
            this.originalControlState.set(controlId, {
              group: groupName,
              label: label.textContent,
              type: input.type || input.tagName.toLowerCase(),
              element: controlRow
            });
          }
        }
      });
    });
  }

  updateSearchResults(visibleCount, totalCount) {
    const searchResultsEl = document.getElementById('searchResults');
    if (!searchResultsEl) return;

    const hasActiveFilters = this.searchTerm || this.groupFilter || this.typeFilter;
    
    if (hasActiveFilters) {
      searchResultsEl.classList.remove('hidden');
      searchResultsEl.innerHTML = `
        <div class="result-count">${visibleCount} of ${totalCount} controls</div>
        <div class="shortcuts">Press Ctrl+F to focus search, Esc to clear</div>
      `;
    } else {
      searchResultsEl.classList.add('hidden');
    }
  }

  showNoResultsMessage(show) {
    let noResultsEl = document.getElementById('noResultsMessage');
    
    if (show && !noResultsEl) {
      noResultsEl = document.createElement('div');
      noResultsEl.id = 'noResultsMessage';
      noResultsEl.className = 'no-results';
      noResultsEl.textContent = 'No controls match your search criteria';
      
      const controlsContainer = document.getElementById('controls');
      if (controlsContainer) {
        controlsContainer.appendChild(noResultsEl);
      }
    } else if (!show && noResultsEl) {
      noResultsEl.remove();
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.groupFilter = '';
    this.typeFilter = '';

    // Reset form elements
    const searchInput = document.getElementById('searchInput');
    const groupFilter = document.getElementById('groupFilter');
    const typeFilter = document.getElementById('typeFilter');

    if (searchInput) searchInput.value = '';
    if (groupFilter) groupFilter.value = '';
    if (typeFilter) typeFilter.value = '';

    // Clear highlights
    this.clearHighlights();

    // Show all controls
    this.showAllControls();
  }

  showAllControls() {
    const controlsContainer = document.getElementById('controls');
    if (!controlsContainer) return;

    const sections = controlsContainer.querySelectorAll('.control-section');
    sections.forEach(section => {
      section.classList.remove('hidden');
      const controls = section.querySelectorAll('.control-row');
      controls.forEach(control => {
        control.classList.remove('hidden');
      });
    });

    this.showNoResultsMessage(false);
  }

  getFilteredControls() {
    const controlsContainer = document.getElementById('controls');
    if (!controlsContainer) return [];

    const visibleControls = [];
    const sections = controlsContainer.querySelectorAll('.control-section:not(.hidden)');
    
    sections.forEach(section => {
      const controls = section.querySelectorAll('.control-row:not(.hidden)');
      controls.forEach(control => {
        const controlId = control.dataset.controlId;
        if (controlId) {
          const controlDef = this.app.uiControls.getControlDefinition(controlId);
          if (controlDef) {
            visibleControls.push({
              id: controlId,
              definition: controlDef,
              element: control
            });
          }
        }
      });
    });

    return visibleControls;
  }

  highlightSearchTerm(labelElement, searchTerm) {
    if (!searchTerm || !labelElement) return;
    
    const originalText = labelElement.textContent;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const highlightedText = originalText.replace(regex, '<mark>$1</mark>');
    
    if (highlightedText !== originalText) {
      labelElement.innerHTML = highlightedText;
    }
  }

  clearHighlights() {
    const marks = document.querySelectorAll('mark');
    marks.forEach(mark => {
      mark.outerHTML = mark.innerHTML;
    });
  }

  getFilterStats() {
    const totalControls = this.originalControlState.size;
    const visibleControls = this.getFilteredControls().length;
    
    return {
      total: totalControls,
      visible: visibleControls,
      hidden: totalControls - visibleControls
    };
  }
}