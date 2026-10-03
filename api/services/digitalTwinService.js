/**
 * Digital Twin Service 2.0
 * Represents an operational entity hierarchy (Organization -> Workspace -> Region -> Location -> Facility -> Asset -> Device -> Sensor)
 */
const { executeQuery } = require('../db/database');
const twinStateEngine = require('./twinStateEngine');

class DigitalTwinService {
    /**
     * Create a new Digital Twin Entity
     */
    async createEntity(orgId, workspaceId, name, type, metadata = {}, parentId = null) {
        const entity = await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO digital_twins (organization_id, workspace_id, name, entity_type, metadata)
                VALUES (${orgId}, ${workspaceId}, ${name}, ${type}, ${JSON.stringify(metadata)})
                RETURNING *
            `;
            return res[0];
        });

        if (parentId && entity) {
            await this.resolveHierarchy(parentId, entity.id, 'CONTAINS');
        }

        return entity;
    }

    /**
     * Update an existing entity
     */
    async updateEntity(entityId, updates) {
        // Build dynamic update (simulated for serverless db structure)
        const metadata = updates.metadata ? JSON.stringify(updates.metadata) : null;
        await executeQuery(async (db) => {
            if (metadata) {
                await db`UPDATE digital_twins SET name = COALESCE(${updates.name}, name), status = COALESCE(${updates.status}, status), metadata = ${metadata}, updated_at = NOW() WHERE id = ${entityId}`;
            } else {
                await db`UPDATE digital_twins SET name = COALESCE(${updates.name}, name), status = COALESCE(${updates.status}, status), updated_at = NOW() WHERE id = ${entityId}`;
            }
        });
        return this.getEntity(entityId);
    }

    /**
     * Resolve/Establish Hierarchy Relationship
     */
    async resolveHierarchy(parentId, childId, relationshipType = 'CONTAINS') {
        await executeQuery(async (db) => {
            await db`
                INSERT INTO twin_relationships (parent_id, child_id, relationship_type)
                VALUES (${parentId}, ${childId}, ${relationshipType})
                ON CONFLICT DO NOTHING
            `;
        });
    }

    /**
     * Retrieve Entity Data
     */
    async getEntity(entityId) {
        const entity = await executeQuery(async (db) => {
            const res = await db`SELECT * FROM digital_twins WHERE id = ${entityId}`;
            return res[0];
        });
        return entity;
    }

    /**
     * Retrieve State (Returns operational status mapped to weather, risks, events)
     */
    async retrieveState(entityId, workspaceId, locationParam) {
        // Leverages existing TwinStateEngine, but enriches it
        const baseState = await twinStateEngine.getCurrentState(entityId, workspaceId, locationParam).catch(() => ({}));
        
        // Enrich with Operational Status (HEALTHY, WARNING, DEGRADED, CRITICAL, OFFLINE, UNKNOWN)
        let operationalStatus = 'UNKNOWN';
        if (baseState.sensorHealth === 'GOOD') operationalStatus = 'HEALTHY';
        if (baseState.activeAlerts > 0) operationalStatus = 'WARNING';
        if (baseState.sensorHealth === 'DEGRADED') operationalStatus = 'DEGRADED';
        if (baseState.rainRisk > 80) operationalStatus = 'CRITICAL';
        
        return {
            entityId,
            weather: { temperature: baseState.temperature, rainRisk: baseState.rainRisk },
            risk: baseState.rainRisk > 50 ? 'HIGH' : 'LOW',
            alerts: baseState.activeAlerts || 0,
            deviceHealth: baseState.sensorHealth || 'UNKNOWN',
            activeEvents: [], // Would map to events_state table
            operationalStatus,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Retrieve History (Twin States)
     */
    async retrieveHistory(entityId, limit = 50) {
        return await executeQuery(async (db) => {
            return await db`SELECT * FROM twin_states WHERE twin_id = ${entityId} ORDER BY recorded_at DESC LIMIT ${limit}`;
        });
    }

    /**
     * Attach Device to Entity
     */
    async attachDevice(entityId, deviceId) {
        // Handled via updating device's workspace/location or metadata links
        await executeQuery(async (db) => {
            await db`UPDATE devices SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{twin_id}', ${JSON.stringify(entityId)}) WHERE id = ${deviceId}`;
        });
    }

    async attachWeatherLocation(entityId, locationId) {
        await this.updateEntity(entityId, { metadata: { location_id: locationId } });
    }

    async attachAlerts(entityId, alertId) {
        // Implementation simulation
    }

    async attachEvents(entityId, eventId) {
        // Implementation simulation
    }

    async attachWorkflows(entityId, workflowId) {
        // Implementation simulation
    }
}

module.exports = new DigitalTwinService();
