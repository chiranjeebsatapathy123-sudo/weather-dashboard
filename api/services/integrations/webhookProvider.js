/**
 * Webhook Provider Implementation
 * Supports HMAC signing, exponential backoff/retries.
 */
const crypto = require('crypto');
const IntegrationProvider = require('./integrationProvider');
const { executeQuery } = require('../../db/database');

class WebhookProvider extends IntegrationProvider {
    
    validateConfig(config) {
        if (!config.url || !config.secret) {
            throw new Error("Webhook integration requires 'url' and 'secret'.");
        }
        return true;
    }

    async testConnection() {
        // Simple HEAD request or ping to verify
        const response = await fetch(this.config.url, { method: 'HEAD' });
        if (!response.ok) throw new Error("Webhook endpoint unreachable.");
    }

    async send(payload, retryCount = 0) {
        const signature = crypto.createHmac('sha256', this.config.secret)
                                .update(JSON.stringify(payload))
                                .digest('hex');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(this.config.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WeatherOS-Signature': signature,
                    'X-Idempotency-Key': payload.eventId || crypto.randomUUID()
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return { status: 'DELIVERED' };

        } catch (error) {
            if (retryCount < 3) {
                // Exponential backoff
                const backoffMs = Math.pow(2, retryCount) * 1000;
                await new Promise(r => setTimeout(r, backoffMs));
                return this.send(payload, retryCount + 1);
            }
            return { status: 'FAILED', error: error.message };
        }
    }
}

module.exports = WebhookProvider;
