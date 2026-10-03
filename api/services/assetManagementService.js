/**
 * Asset Registry Service
 * Manages physical/logical assets within the WeatherOS ecosystem.
 */
const { executeQuery } = require('../db/database');

class AssetManagementService {
    
    async createAsset(assetData) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO assets (
                    organization_id, workspace_id, location_id, asset_type, name, 
                    status, manufacturer, model, serial_number, installation_date, 
                    maintenance_interval, metadata
                ) VALUES (
                    ${assetData.organization_id}, ${assetData.workspace_id}, ${assetData.location_id}, 
                    ${assetData.asset_type}, ${assetData.name}, ${assetData.status || 'ACTIVE'}, 
                    ${assetData.manufacturer}, ${assetData.model}, ${assetData.serial_number}, 
                    ${assetData.installation_date}, ${assetData.maintenance_interval}, 
                    ${JSON.stringify(assetData.metadata || {})}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async getAsset(assetId, organizationId) {
        const asset = await executeQuery(async (db) => {
            const res = await db`SELECT * FROM assets WHERE id = ${assetId} AND organization_id = ${organizationId}`;
            return res[0];
        });
        return asset;
    }

    async editAsset(assetId, organizationId, updates) {
        return await executeQuery(async (db) => {
            const res = await db`
                UPDATE assets 
                SET name = COALESCE(${updates.name}, name),
                    status = COALESCE(${updates.status}, status),
                    last_maintenance_at = COALESCE(${updates.last_maintenance_at}, last_maintenance_at),
                    updated_at = NOW()
                WHERE id = ${assetId} AND organization_id = ${organizationId}
                RETURNING *
            `;
            return res[0];
        });
    }

    async archiveAsset(assetId, organizationId) {
        return await this.editAsset(assetId, organizationId, { status: 'ARCHIVED' });
    }

    async restoreAsset(assetId, organizationId) {
        return await this.editAsset(assetId, organizationId, { status: 'ACTIVE' });
    }
}

module.exports = new AssetManagementService();
