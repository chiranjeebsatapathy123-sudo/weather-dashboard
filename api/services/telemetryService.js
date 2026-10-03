/**
 * Telemetry Service
 * Ingests, calibrates, validates, and stores device telemetry.
 */
const { executeQuery } = require('../db/database');

class TelemetryService {
    
    validateMeasurements(measurements) {
        let qualityStatus = 'VALID';
        let issues = [];

        // Temperature bounds (-80C to 60C)
        if (measurements.temperature !== undefined) {
            if (measurements.temperature < -80 || measurements.temperature > 60) {
                qualityStatus = 'INVALID';
                issues.push('Impossible temperature value.');
            } else if (measurements.temperature > 45 || measurements.temperature < -40) {
                if (qualityStatus === 'VALID') qualityStatus = 'SUSPECT';
                issues.push('Extreme temperature value.');
            }
        }

        // Humidity bounds (0 to 100%)
        if (measurements.humidity !== undefined) {
            if (measurements.humidity < 0 || measurements.humidity > 100) {
                qualityStatus = 'INVALID';
                issues.push('Impossible humidity value.');
            }
        }
        
        // Wind bounds (0 to 300 km/h)
        if (measurements.wind_speed !== undefined) {
            if (measurements.wind_speed < 0 || measurements.wind_speed > 300) {
                qualityStatus = 'INVALID';
                issues.push('Impossible wind speed value.');
            }
        }

        return { qualityStatus, issues };
    }

    async applyCalibration(deviceId, rawMeasurements) {
        const calibrations = await executeQuery(async (db) => {
            return await db`SELECT * FROM sensor_calibrations WHERE device_id = ${deviceId}`;
        });

        const calibrated = { ...rawMeasurements };
        for (const cal of calibrations) {
            const key = cal.measurement_type;
            if (calibrated[key] !== undefined) {
                calibrated[key] = (calibrated[key] * parseFloat(cal.scale_val)) + parseFloat(cal.offset_val);
            }
        }
        return calibrated;
    }

    async ingestTelemetry(deviceId, payload) {
        const { timestamp, measurements } = payload;
        
        if (!timestamp || !measurements) {
            throw new Error("Invalid payload: Missing timestamp or measurements");
        }

        // 1. Data Quality Checks
        const { qualityStatus, issues } = this.validateMeasurements(measurements);
        
        // 2. Calibration
        const calibratedMeasurements = await this.applyCalibration(deviceId, measurements);

        // 3. Persistence
        await executeQuery(async (db) => {
            await db`
                INSERT INTO device_telemetry (
                    device_id, temperature, humidity, pressure, wind_speed, wind_dir, rain, aqi, raw_payload, quality_flag, measured_at
                ) VALUES (
                    ${deviceId}, ${calibratedMeasurements.temperature}, ${calibratedMeasurements.humidity}, 
                    ${calibratedMeasurements.pressure}, ${calibratedMeasurements.wind_speed}, 
                    ${calibratedMeasurements.wind_dir}, ${calibratedMeasurements.rainfall}, 
                    ${calibratedMeasurements.aqi}, ${JSON.stringify(payload)}, ${qualityStatus}, ${timestamp}
                )
            `;
        });

        // 4. Update Device Last Seen
        const deviceRegistryService = require('./deviceRegistryService');
        await deviceRegistryService.updateDeviceStatus(deviceId, 'ONLINE', new Date().toISOString());

        return {
            status: "SUCCESS",
            quality: qualityStatus,
            issues: issues
        };
    }
}

module.exports = new TelemetryService();
