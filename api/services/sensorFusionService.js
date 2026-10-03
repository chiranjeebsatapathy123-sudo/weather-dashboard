/**
 * Sensor Fusion Service
 * Fuses data from external Weather Providers (e.g. OpenWeatherMap) with internal IoT Telemetry
 * to create highly localized, confidence-scored intelligence.
 */

const weatherService = require("./weatherService");
const { executeQuery } = require("../db/database");
const logger = require("../utils/logger");

module.exports = {
    /**
     * Merges provider weather with local workspace sensors.
     * @param {String} workspaceId The workspace scope to pull sensors from.
     * @param {Object} locationParam The general location to request from the weather provider.
     */
    getFusedWeather: async (workspaceId, locationParam) => {
        try {
            // 1. Get baseline weather from external provider
            const baseline = await weatherService.fetchCurrentWeather(locationParam);
            
            // 2. Get local IoT telemetry for this workspace
            const localSensors = await executeQuery(async (db) => {
                return await db`
                    SELECT d.name as device_name, t.temperature, t.humidity, t.wind_speed, t.measured_at
                    FROM devices d
                    JOIN device_telemetry t ON d.id = t.device_id
                    WHERE d.workspace_id = ${workspaceId} AND d.status = 'ONLINE'
                    ORDER BY t.measured_at DESC LIMIT 5
                `;
            });

            if (!localSensors || localSensors.length === 0) {
                // Fallback to baseline if no sensors
                return {
                    intelligence_source: "PROVIDER_ONLY",
                    confidence: "MEDIUM",
                    provider: baseline,
                    fusion: baseline
                };
            }

            // 3. Sensor Fusion Algorithm (Simple Average of valid sensors vs provider)
            let sumTemp = 0, validSensors = 0;
            localSensors.forEach(sensor => {
                if (sensor.temperature !== null) {
                    sumTemp += Number(sensor.temperature);
                    validSensors++;
                }
            });

            const localAvgTemp = validSensors > 0 ? (sumTemp / validSensors) : null;
            
            // Fused Object
            const fusedData = { ...baseline };
            if (localAvgTemp !== null) {
                fusedData.temperature = (baseline.temperature + localAvgTemp) / 2; // Fusion blend
                fusedData.is_fused = true;
                fusedData.fusion_variance = Math.abs(baseline.temperature - localAvgTemp).toFixed(2);
            }

            return {
                intelligence_source: "FUSED_TELEMETRY",
                confidence: "HIGH",
                provider: baseline,
                local_sensors: localSensors,
                fusion: fusedData
            };

        } catch (error) {
            logger.error("Sensor Fusion failed.", error);
            throw error;
        }
    }
};
