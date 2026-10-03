/**
 * Twin Snapshot Service
 * Creates read-only point-in-time copies of operational state for simulations.
 */
const { executeQuery } = require('../../db/database');

class TwinSnapshotService {
    async createSnapshot(organizationId, scenarioId, targetEntities = {}) {
        // In a real system, this pulls deep queries of assets, locations, devices.
        // We simulate the snapshot assembly.
        const snapshotData = {
            timestamp: new Date().toISOString(),
            assets: targetEntities.assets || [],
            devices: targetEntities.devices || [],
            weatherState: targetEntities.weather || {}
        };

        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO twin_snapshots (organization_id, scenario_id, snapshot_data)
                VALUES (${organizationId}, ${scenarioId}, ${JSON.stringify(snapshotData)})
                RETURNING *
            `;
            return res[0];
        });
    }

    async getSnapshot(snapshotId, organizationId) {
        return await executeQuery(async (db) => {
            const res = await db`SELECT * FROM twin_snapshots WHERE id = ${snapshotId} AND organization_id = ${organizationId}`;
            return res[0];
        });
    }
}

module.exports = new TwinSnapshotService();
