/**
 * Device Health Service
 * Calculates health scores and tracks missing/degraded sensor readings.
 */
const { executeQuery } = require('../db/database');

class DeviceHealthService {
    async evaluateHealth(device) {
        const now = new Date();
        const lastSeen = device.last_seen ? new Date(device.last_seen) : null;
        let healthScore = 100;
        let issues = [];
        let status = 'ONLINE';

        if (!lastSeen) {
            status = 'UNKNOWN';
            healthScore = 0;
            issues.push("Device has never communicated.");
        } else {
            const hoursSinceLastSeen = (now - lastSeen) / (1000 * 60 * 60);
            
            if (hoursSinceLastSeen > 24) {
                status = 'OFFLINE';
                healthScore -= 50;
                issues.push(`Device offline for ${Math.round(hoursSinceLastSeen)} hours.`);
            } else if (hoursSinceLastSeen > 2) {
                status = 'DEGRADED';
                healthScore -= 20;
                issues.push(`Delayed communication. Last seen ${Math.round(hoursSinceLastSeen)} hours ago.`);
            }

            // Mocking battery/error rate evaluation
            if (device.metadata && device.metadata.battery_level && device.metadata.battery_level < 20) {
                healthScore -= 30;
                issues.push("Low battery warning.");
                if (status === 'ONLINE') status = 'WARNING';
            }
        }

        if (healthScore < 0) healthScore = 0;

        // Record health event if status changed
        if (device.status !== status) {
            await executeQuery(async (db) => {
                await db`
                    INSERT INTO device_health_events (device_id, health_status, health_score, issues)
                    VALUES (${device.id}, ${status}, ${healthScore}, ${JSON.stringify(issues)})
                `;
            });
            
            const deviceRegistryService = require('./deviceRegistryService');
            await deviceRegistryService.updateDeviceStatus(device.id, status, lastSeen);
        }

        return {
            health_status: status,
            health_score: healthScore,
            last_seen: lastSeen,
            data_freshness: lastSeen ? now - lastSeen : null,
            issues,
            label: "WeatherOS device health score"
        };
    }
}

module.exports = new DeviceHealthService();
