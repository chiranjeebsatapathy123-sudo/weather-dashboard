/**
 * Notification Provider Abstraction
 * Normalizes how we deliver messages (In-App, Browser Push, etc.)
 */

module.exports = {
    deliver: async (event, channels = ['IN_APP']) => {
        const deliveries = [];
        
        for (const channel of channels) {
            if (channel === 'IN_APP') {
                // Route to WebSockets or SSE cache
                deliveries.push({ channel, status: 'QUEUED', timestamp: new Date().toISOString() });
            }
            if (channel === 'PUSH') {
                // Route to Web Push API (VAPID)
                deliveries.push({ channel, status: 'SENT', timestamp: new Date().toISOString() });
            }
        }

        return deliveries;
    }
};
