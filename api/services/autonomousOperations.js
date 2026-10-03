/**
 * Autonomous Operations Engine
 * Monitors event streams and creates predictive incidents or early warnings.
 */

const { executeQuery } = require("../../db/database");
const eventBus = require("../jobs/eventBus");
const logger = require("../../utils/logger");

module.exports = {
    /**
     * Initializes the Autonomous rules engine.
     */
    init: () => {
        // Subscribe to heavy weather events
        eventBus.subscribe('weather.alert.severe', async (payload) => {
            await module.exports.evaluatePredictiveIncident(payload);
        });
    },

    /**
     * Evaluates a sudden severe alert against Twin locations.
     */
    evaluatePredictiveIncident: async (payload) => {
        try {
            const orgId = payload.organization_id;
            if (!orgId) return;

            // Simple rules engine: if severity is HIGH, create a POTENTIAL incident.
            if (payload.severity === 'HIGH' || payload.severity === 'EXTREME') {
                
                const incidentId = await executeQuery(async (db) => {
                    const res = await db`
                        INSERT INTO incidents (organization_id, title, severity, status, evidence)
                        VALUES (${orgId}, ${"Predictive Incident: " + payload.title}, 'HIGH', 'POTENTIAL', ${JSON.stringify(payload)})
                        RETURNING id
                    `;
                    return res[0].id;
                });

                logger.info(`Predictive Incident ${incidentId} created automatically.`);

                // Write to Incident Timeline (Event Replay foundation)
                await executeQuery(async (db) => {
                    await db`
                        INSERT INTO incident_timelines (incident_id, event_type, message, actor)
                        VALUES (${incidentId}, 'INCIDENT_DETECTED', 'Autonomous engine detected severe condition.', 'SYSTEM')
                    `;
                });
            }
        } catch (error) {
            logger.error("Failed to evaluate predictive incident.", error);
        }
    }
};
