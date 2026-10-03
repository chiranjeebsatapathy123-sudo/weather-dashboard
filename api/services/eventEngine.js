/**
 * Weather Event Engine
 * Evaluates raw snapshots and transitions stateful events (DETECTED, ACTIVE, RESOLVED).
 */

const crypto = require('crypto');

// In-memory mock for stateful tracking since we don't have the active Postgres schema yet
const activeEvents = new Map();

function generateEventId(location, type) {
    return crypto.createHash('sha256').update(`${location}_${type}`).digest('hex');
}

module.exports = {
    evaluateSnapshot: (location, currentConditions, previousSnapshot = null) => {
        const generatedEvents = [];

        // 1. Detect Rain Events
        if (currentConditions.pop && currentConditions.pop > 0.6) {
            const eventId = generateEventId(location, 'heavy_rain_risk');
            
            if (activeEvents.has(eventId)) {
                // Deduplication logic: event already active
                const existingEvent = activeEvents.get(eventId);
                existingEvent.status = 'UPDATED';
                existingEvent.last_seen = new Date().toISOString();
                existingEvent.data.current_pop = currentConditions.pop;
            } else {
                // New Event
                const newEvent = {
                    event_id: eventId,
                    event_type: 'heavy_rain_risk',
                    location: location,
                    detected_at: new Date().toISOString(),
                    status: 'DETECTED',
                    severity: 'HIGH',
                    source: 'WeatherOS_Event_Engine',
                    data: { current_pop: currentConditions.pop },
                    explanation: `High probability of rain (${Math.round(currentConditions.pop * 100)}%) detected.`
                };
                activeEvents.set(eventId, newEvent);
                generatedEvents.push(newEvent);
            }
        } else {
            // Resolution Logic
            const eventId = generateEventId(location, 'heavy_rain_risk');
            if (activeEvents.has(eventId)) {
                const event = activeEvents.get(eventId);
                event.status = 'RESOLVED';
                event.resolved_at = new Date().toISOString();
                activeEvents.delete(eventId);
                generatedEvents.push(event); // Emit resolution event
            }
        }

        return generatedEvents;
    },

    getActiveEvents: () => Array.from(activeEvents.values())
};
