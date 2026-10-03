/**
 * Device Registry Service
 * Manages IoT and operational devices.
 */
const { executeQuery } = require('../db/database');

class DeviceRegistryService {
    
    async registerDevice(deviceData) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO devices (
                    organization_id, workspace_id, name, device_type, mac_address, 
                    firmware_version, metadata
                ) VALUES (
                    ${deviceData.organization_id}, ${deviceData.workspace_id}, ${deviceData.name}, 
                    ${deviceData.device_type}, ${deviceData.mac_address}, 
                    ${deviceData.firmware_version}, ${JSON.stringify(deviceData.metadata || {})}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async getDevice(deviceId, organizationId) {
        return await executeQuery(async (db) => {
            const res = await db`SELECT * FROM devices WHERE id = ${deviceId} AND organization_id = ${organizationId}`;
            return res[0];
        });
    }

    async updateDeviceStatus(deviceId, status, lastSeen) {
        await executeQuery(async (db) => {
            await db`
                UPDATE devices 
                SET status = ${status}, last_seen = ${lastSeen}
                WHERE id = ${deviceId}
            `;
        });
    }
}

module.exports = new DeviceRegistryService();
