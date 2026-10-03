/**
 * IoT Telemetry Ingestion Service
 * Handles normalizing, validating, and scoring IoT telemetry payloads.
 */

const { executeQuery } = require("../../db/database");
const logger = require("../../utils/logger");

const VALIDATION_RULES = {
    temperature: { min: -100, max: 100 },
    humidity: { min: 0, max: 100 },
    pressure: { min: 800, max: 1200 },
    wind_speed: { min: 0, max: 400 },
    rain: { min: 0, max: 1000 }
};

module.exports = {
    /**
     * Ingest raw payload from an IoT gateway or device.
     */
    ingest: async (deviceId, rawPayload) => {
        const normalized = module.exports.normalize(rawPayload);
        const qualityFlag = module.exports.evaluateQuality(normalized);

        try {
            await executeQuery(async (db) => {
                await db`
                    INSERT INTO device_telemetry (
                        device_id, temperature, humidity, pressure, 
                        wind_speed, wind_dir, rain, aqi, raw_payload, quality_flag, measured_at
                    ) VALUES (
                        ${deviceId}, ${normalized.temperature}, ${normalized.humidity}, 
                        ${normalized.pressure}, ${normalized.wind_speed}, ${normalized.wind_dir}, 
                        ${normalized.rain}, ${normalized.aqi}, ${rawPayload}, ${qualityFlag}, NOW()
                    )
                `;
            });
            return { success: true, quality: qualityFlag };
        } catch (error) {
            logger.error(`Failed to ingest telemetry for device ${deviceId}`, error);
            throw error;
        }
    },

    /**
     * Normalizes an arbitrary JSON payload into a strict format.
     */
    normalize: (payload) => {
        return {
            temperature: payload.temp ?? payload.temperature ?? null,
            humidity: payload.hum ?? payload.humidity ?? null,
            pressure: payload.pres ?? payload.pressure ?? null,
            wind_speed: payload.windSpeed ?? payload.ws ?? null,
            wind_dir: payload.windDir ?? payload.wd ?? null,
            rain: payload.rain ?? payload.precip ?? null,
            aqi: payload.aqi ?? payload.airQualityIndex ?? null
        };
    },

    /**
     * Evaluates data quality. Suspicious data is marked as SUSPECT but not discarded.
     */
    evaluateQuality: (normalized) => {
        for (const [key, rules] of Object.entries(VALIDATION_RULES)) {
            const val = normalized[key];
            if (val !== null && val !== undefined) {
                if (val < rules.min || val > rules.max) {
                    return 'SUSPECT';
                }
            }
        }
        return 'VALID';
    }
};
