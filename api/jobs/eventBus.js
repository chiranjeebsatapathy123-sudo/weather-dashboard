/**
 * Event Bus Abstraction
 * Decouples business logic from event processing. Supports publishing to queues and webhooks.
 */

const logger = require("../utils/logger");
const webhookService = require("../services/integrations/webhookService");

class EventBus {
    constructor() {
        this.subscribers = new Map();
    }

    /**
     * Subscribe to a specific topic.
     * @param {String} topic e.g. 'weather.alert.created'
     * @param {Function} handler Callback function
     */
    subscribe(topic, handler) {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, []);
        }
        this.subscribers.get(topic).push(handler);
        logger.info(`Subscribed handler to topic: ${topic}`);
    }

    /**
     * Publish an event to the bus.
     * @param {String} topic e.g. 'device.telemetry.suspect'
     * @param {Object} payload The event data
     */
    async publish(topic, payload) {
        logger.info(`Event Published: ${topic}`, { payloadId: payload.id || 'N/A' });
        
        // 1. Internal Handlers (Background Jobs, etc)
        const handlers = this.subscribers.get(topic) || [];
        for (const handler of handlers) {
            try {
                // Fire and forget (or await if strict)
                handler(payload).catch(err => logger.error(`Error in event handler for ${topic}`, err));
            } catch (err) {
                logger.error(`Synchronous error in handler for ${topic}`, err);
            }
        }

        // 2. External Webhook Delivery
        if (payload.organization_id) {
            // Decoupled delivery to external systems
            webhookService.dispatchToWebhooks(topic, payload).catch(err => {
                logger.error(`Webhook dispatch failed for ${topic}`, err);
            });
        }
    }
}

// Singleton export
module.exports = new EventBus();
