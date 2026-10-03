/**
 * Digital Twin State Engine
 * Assembles a live snapshot of an environmental Twin using fused data sources.
 */

const { executeQuery } = require("../../db/database");
const sensorFusionService = require("./sensorFusionService");
const logger = require("../../utils/logger");

module.exports = {
    /**
     * Constructs the real-time CURRENT_STATE for a given Digital Twin entity.
     */
    getCurrentState: async (twinId, workspaceId, locationParam) => {
        try {
            // 1. Fetch Twin Metadata
            const twin = await executeQuery(async (db) => {
                const res = await db`SELECT * FROM digital_twins WHERE id = ${twinId}`;
                return res[0];
            });

            if (!twin) throw new Error("Twin not found");

            // 2. Fetch Fused Environment Data (API + IoT Telemetry)
            const fusionData = await sensorFusionService.getFusedWeather(workspaceId, locationParam);

            // 3. Assemble Active Alerts for this Twin's location
            const alerts = await executeQuery(async (db) => {
                return await db`
                    SELECT id, title, severity FROM weather_alerts 
                    WHERE location_id = ${locationParam} AND is_active = true
                `;
            });

            // 4. Determine Sensor Health in this Workspace
            const health = await executeQuery(async (db) => {
                const res = await db`
                    SELECT COUNT(*) as degraded_count FROM devices 
                    WHERE workspace_id = ${workspaceId} AND status IN ('DEGRADED', 'OFFLINE')
                `;
                return res[0].degraded_count > 0 ? "DEGRADED" : "GOOD";
            });

            // 5. Construct State Payload
            const currentState = {
                timestamp: new Date().toISOString(),
                temperature: fusionData.fusion.temperature,
                humidity: fusionData.fusion.humidity,
                windSpeed: fusionData.fusion.windSpeed || 0,
                aqi: fusionData.fusion.aqi || 50,
                rainRisk: fusionData.fusion.precipitation_probability || 0,
                activeAlerts: alerts.length,
                sensorHealth: health,
                provenance: {
                    source: fusionData.intelligence_source,
                    confidence: fusionData.confidence,
                    is_fused: fusionData.fusion.is_fused || false
                }
            };

            // 6. Asynchronously store the snapshot in twin_states for historical timelines/baselines
            module.exports.recordState(twinId, currentState).catch(err => {
                logger.error("Failed to record twin state asynchronously", err);
            });

            return currentState;

        } catch (error) {
            logger.error(`Error generating state for Twin ${twinId}`, error);
            throw error;
        }
    },

    /**
     * Asynchronously stores a snapshot in the database.
     */
    recordState: async (twinId, statePayload) => {
        await executeQuery(async (db) => {
            await db`
                INSERT INTO twin_states (twin_id, state_payload, recorded_at)
                VALUES (${twinId}, ${JSON.stringify(statePayload)}, NOW())
            `;
        });
    }
};
