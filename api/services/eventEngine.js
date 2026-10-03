/**
 * Weather Event Engine
 * Evaluates raw snapshots and transitions stateful events (DETECTED, ACTIVE, RESOLVED).
 */

const crypto = require('crypto');
const { executeQuery } = require('../db/database');

function generateEventId(location, type) {
    return crypto.createHash('sha256').update(`${location}_${type}`).digest('hex');
}

// Automatically ensure table exists
executeQuery(async (db) => {
    await db`
        CREATE TABLE IF NOT EXISTS events_state (
            event_id VARCHAR(255) PRIMARY KEY,
            event_type VARCHAR(100),
            location VARCHAR(255),
            status VARCHAR(50),
            severity VARCHAR(50),
            payload JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
}).catch(() => {});

module.exports = {
    evaluateSnapshot: async (location, currentConditions, previousSnapshot = null) => {
        const generatedEvents = [];

        // 1. Detect Rain Events
        const eventId = generateEventId(location, 'heavy_rain_risk');
        
        const existingRecords = await executeQuery(async (db) => {
            return await db`SELECT * FROM events_state WHERE event_id = ${eventId}`;
        });
        const existingEvent = existingRecords.length > 0 ? existingRecords[0] : null;

        if (currentConditions.pop && currentConditions.pop > 0.6) {
            if (existingEvent && existingEvent.status !== 'RESOLVED') {
                // Deduplication logic: event already active
                await executeQuery(async (db) => {
                    await db`
                        UPDATE events_state 
                        SET status = 'UPDATED', updated_at = CURRENT_TIMESTAMP, payload = ${JSON.stringify({ current_pop: currentConditions.pop })}
                        WHERE event_id = ${eventId}
                    `;
                });
            } else {
                // New Event
                const newEvent = {
                    event_id: eventId,
                    event_type: 'heavy_rain_risk',
                    location: location,
                    status: 'DETECTED',
                    severity: 'HIGH',
                    payload: { current_pop: currentConditions.pop }
                };
                
                await executeQuery(async (db) => {
                    await db`
                        INSERT INTO events_state (event_id, event_type, location, status, severity, payload)
                        VALUES (${newEvent.event_id}, ${newEvent.event_type}, ${newEvent.location}, ${newEvent.status}, ${newEvent.severity}, ${JSON.stringify(newEvent.payload)})
                        ON CONFLICT (event_id) DO UPDATE SET status = 'DETECTED', updated_at = CURRENT_TIMESTAMP
                    `;
                });
                
                generatedEvents.push({ ...newEvent, explanation: `High probability of rain (${Math.round(currentConditions.pop * 100)}%) detected.` });
            }
        } else {
            // Resolution Logic
            if (existingEvent && existingEvent.status !== 'RESOLVED') {
                await executeQuery(async (db) => {
                    await db`UPDATE events_state SET status = 'RESOLVED', updated_at = CURRENT_TIMESTAMP WHERE event_id = ${eventId}`;
                });
                generatedEvents.push({ ...existingEvent, status: 'RESOLVED', explanation: "Rain probability decreased." });
            }
        }

        return generatedEvents;
    },

    getActiveEvents: async () => {
        return await executeQuery(async (db) => {
            return await db`SELECT * FROM events_state WHERE status != 'RESOLVED'`;
        });
    }
};
