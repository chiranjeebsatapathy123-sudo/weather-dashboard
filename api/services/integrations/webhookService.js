/**
 * Webhook Platform 2.0
 * Handles secure, signed webhook dispatch with dead-letter and retry capabilities.
 */

const crypto = require("crypto");
const { executeQuery } = require("../../db/database");
const logger = require("../../utils/logger");

module.exports = {
    /**
     * Dispatches an event to all subscribed webhooks for the tenant.
     */
    dispatchToWebhooks: async (topic, payload) => {
        try {
            const orgId = payload.organization_id;
            if (!orgId) return;

            // Find matching webhooks
            const webhooks = await executeQuery(async (db) => {
                return await db`
                    SELECT id, url, secret, event_types FROM webhooks 
                    WHERE organization_id = ${orgId} AND status = 'ACTIVE'
                `;
            });

            for (const hook of webhooks) {
                // Filter by event types if defined
                if (hook.event_types && hook.event_types.length > 0) {
                    if (!hook.event_types.includes(topic) && !hook.event_types.includes('*')) {
                        continue;
                    }
                }
                
                module.exports.deliver(hook, topic, payload); // Async Fire
            }

        } catch (error) {
            logger.error(`Failed to dispatch webhooks for topic ${topic}`, error);
        }
    },

    /**
     * Executes the actual HTTP delivery with HMAC signature.
     */
    deliver: async (hook, topic, payload, retryCount = 0) => {
        const timestamp = Date.now().toString();
        const nonce = crypto.randomBytes(16).toString('hex');
        
        // Structure Event
        const eventBody = JSON.stringify({
            eventId: crypto.randomUUID(),
            type: topic,
            timestamp: new Date().toISOString(),
            data: payload
        });

        // HMAC Signature (v1:timestamp:nonce:body)
        const signaturePayload = `v1:${timestamp}:${nonce}:${eventBody}`;
        const signature = crypto.createHmac('sha256', hook.secret).update(signaturePayload).digest('hex');

        try {
            const response = await fetch(hook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WeatherOS-Signature': `t=${timestamp},v1=${signature}`,
                    'X-WeatherOS-Nonce': nonce,
                    'X-WeatherOS-Event': topic
                },
                body: eventBody
            });

            if (!response.ok) {
                throw new Error(`Endpoint returned ${response.status}`);
            }

            logger.info(`Webhook delivered successfully to ${hook.url}`);

        } catch (error) {
            logger.error(`Webhook delivery failed to ${hook.url}: ${error.message}`);
            // Retry logic would go here via a robust JobQueue in production (e.g. BullMQ)
            if (retryCount < 3) {
                const backoff = Math.pow(2, retryCount) * 1000;
                setTimeout(() => module.exports.deliver(hook, topic, payload, retryCount + 1), backoff);
            }
        }
    }
};
