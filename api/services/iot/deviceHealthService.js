/**
 * Device Health Service
 * Monitors devices for stale connections and generates Device Health Events.
 */

const { executeQuery } = require("../../db/database");
const logger = require("../../utils/logger");

const OFFLINE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

module.exports = {
    /**
     * Evaluates the health of a specific device.
     */
    evaluateDeviceHealth: async (deviceId) => {
        try {
            const telemetry = await executeQuery(async (db) => {
                return await db`
                    SELECT measured_at, quality_flag FROM device_telemetry 
                    WHERE device_id = ${deviceId} 
                    ORDER BY measured_at DESC LIMIT 1
                `;
            });

            if (!telemetry || telemetry.length === 0) {
                return { status: 'UNKNOWN', message: 'No telemetry received yet.' };
            }

            const lastSeen = new Date(telemetry[0].measured_at).getTime();
            const now = Date.now();
            const age = now - lastSeen;

            if (age > OFFLINE_THRESHOLD_MS) {
                // Device has stopped reporting
                await module.exports.markDeviceOffline(deviceId);
                return { status: 'OFFLINE', message: `Device offline. Last seen ${Math.floor(age / 60000)} minutes ago.` };
            }

            if (telemetry[0].quality_flag === 'SUSPECT') {
                return { status: 'DEGRADED', message: 'Device is reporting suspect data values.' };
            }

            // Keep device alive
            await executeQuery(async (db) => {
                await db`UPDATE devices SET status = 'ONLINE', last_seen = NOW() WHERE id = ${deviceId}`;
            });

            return { status: 'ONLINE', message: 'Device healthy.' };

        } catch (error) {
            logger.error(`Error evaluating health for device ${deviceId}`, error);
            throw error;
        }
    },

    markDeviceOffline: async (deviceId) => {
        await executeQuery(async (db) => {
            await db`UPDATE devices SET status = 'OFFLINE' WHERE id = ${deviceId}`;
        });
    }
};
