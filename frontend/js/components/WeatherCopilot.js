export const WeatherCopilot = {
    init(api) {
        this.api = api;
        this.chatWindow = document.getElementById('chatWindow');
        this.aiInput = document.getElementById('aiInput');
        this.aiSendBtn = document.getElementById('aiSendBtn');
        this.prompts = document.querySelectorAll('.prompt-btn');

        if (!this.aiSendBtn) return;

        this.aiSendBtn.addEventListener('click', () => this.sendMessage());
        this.aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        this.prompts.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.aiInput.value = e.target.textContent;
                this.sendMessage();
            });
        });
    },

    appendMessage(text, sender, meta = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        msgDiv.textContent = text;
        
        if (meta && sender === 'ai') {
            const metaDiv = document.createElement('div');
            metaDiv.className = 'ai-meta';
            metaDiv.innerHTML = `
                <span>${meta.confidenceLevel === 'High confidence' ? '🟢' : meta.confidenceLevel === 'Moderate confidence' ? '🟡' : '🔴'} ${meta.confidenceLevel}</span>
                <span>ⓘ Sources: ${meta.sources.join(', ').replace(/_/g, ' ')}</span>
            `;
            msgDiv.appendChild(metaDiv);
        }

        this.chatWindow.appendChild(msgDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    },

    async sendMessage() {
        const message = this.aiInput.value.trim();
        if (!message) return;

        const city = document.getElementById('cityName').textContent;
        if (city === '--' || !city) {
            alert('Please search for a location first.');
            return;
        }

        this.appendMessage(message, 'user');
        this.aiInput.value = '';
        
        // Add loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message ai loading';
        loadingDiv.textContent = 'Thinking...';
        this.chatWindow.appendChild(loadingDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;

        try {
            const data = await this.api.post('/ai/chat', {
                locationId: city,
                message: message
            });
            
            loadingDiv.remove();
            this.appendMessage(data.answer, 'ai', data);

        } catch (error) {
            loadingDiv.remove();
            this.appendMessage("I couldn't verify that response against the current weather data. Please try again later.", 'ai');
        }
    }
};
