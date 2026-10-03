export const CommandBar = {
    init() {
        this.createDOM();
        this.bindEvents();
    },

    createDOM() {
        const overlay = document.createElement('div');
        overlay.id = 'commandBarOverlay';
        overlay.className = 'command-bar-overlay';
        overlay.style.display = 'none';

        overlay.innerHTML = `
            <div class="command-bar-container">
                <div class="command-bar-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="commandBarInput" placeholder="Search city or type command..." autocomplete="off">
                    <span class="command-shortcut">ESC</span>
                </div>
                <div class="command-bar-results" id="commandBarResults">
                    <div class="command-section">
                        <h4>Suggestions</h4>
                        <button class="command-btn" data-action="search" data-value="New York">Weather in New York</button>
                        <button class="command-btn" data-action="navigate" data-value="map">Open Weather Map</button>
                        <button class="command-btn" data-action="navigate" data-value="ai">Ask AI Copilot</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        this.overlay = overlay;
        this.input = document.getElementById('commandBarInput');
        this.results = document.getElementById('commandBarResults');
    },

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
            if (e.key === 'Escape' && this.overlay.style.display === 'flex') {
                this.close();
            }
        });

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        this.results.addEventListener('click', (e) => {
            const btn = e.target.closest('.command-btn');
            if (btn) {
                const action = btn.dataset.action;
                const val = btn.dataset.value;
                this.executeCommand(action, val);
            }
        });

        this.input.addEventListener('input', (e) => {
            // Very simple mock logic for debounced command suggestions
            const val = e.target.value.toLowerCase();
            if (val.startsWith('compare')) {
                this.results.innerHTML = `<button class="command-btn" data-action="navigate" data-value="compare">Go to Compare Studio</button>`;
            } else if (val.length > 2) {
                this.results.innerHTML = `<button class="command-btn" data-action="search" data-value="${val}">Search for ${val}</button>`;
            }
        });
    },

    toggle() {
        if (this.overlay.style.display === 'flex') {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        this.overlay.style.display = 'flex';
        this.input.value = '';
        this.input.focus();
    },

    close() {
        this.overlay.style.display = 'none';
        this.input.blur();
    },

    executeCommand(action, value) {
        this.close();
        if (action === 'navigate') {
            const btn = document.querySelector(`.nav-btn[data-target="${value}"]`);
            if (btn) btn.click();
        } else if (action === 'search') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = value;
                searchInput.dispatchEvent(new Event('keypress', { bubbles: true }));
                // In script.js it actually listens to keypress Enter, we might need a direct bridge
                window.dispatchEvent(new CustomEvent('weatherSearch', { detail: { city: value } }));
            }
        }
    }
};
