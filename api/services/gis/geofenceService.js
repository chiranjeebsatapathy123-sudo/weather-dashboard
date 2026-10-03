/**
 * GIS Geofence Service
 * Manages spatial boundaries (Geofences) and evaluates intersection events.
 * Note: Abstracted to support raw PostgreSQL JSONB logic currently, easily upgradable to PostGIS ST_Intersects.
 */

const { executeQuery } = require("../../db/database");
const logger = require("../../utils/logger");

module.exports = {
    /**
     * Create a new geofence for a workspace.
     */
    createGeofence: async (organizationId, workspaceId, name, type, coordinates) => {
        try {
            return await executeQuery(async (db) => {
                const result = await db`
                    INSERT INTO geofences (organization_id, workspace_id, name, type, coordinates, status)
                    VALUES (${organizationId}, ${workspaceId}, ${name}, ${type}, ${coordinates}, 'ACTIVE')
                    RETURNING *
                `;
                return result[0];
            });
        } catch (error) {
            logger.error("Failed to create geofence.", error);
            throw error;
        }
    },

    /**
     * Evaluates if a given coordinate (lat, lon) intersects with any active geofences in the workspace.
     * Simple bounding box intersection logic as fallback.
     */
    checkIntersection: async (workspaceId, lat, lon) => {
        try {
            const fences = await executeQuery(async (db) => {
                return await db`SELECT id, name, coordinates FROM geofences WHERE workspace_id = ${workspaceId} AND status = 'ACTIVE'`;
            });

            const intersected = [];

            for (const fence of fences) {
                // Assuming coordinates is an array of [lat, lon] forming a simple bounding polygon
                // For a true production PostGIS implementation this is replaced with:
                // SELECT id FROM geofences WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(lon, lat), 4326))
                
                const points = fence.coordinates; // [[lat, lon], [lat, lon], ...]
                if (points && points.length > 2) {
                    if (module.exports.pointInPolygon([lat, lon], points)) {
                        intersected.push(fence);
                    }
                }
            }

            return intersected;
        } catch (error) {
            logger.error("Failed to check geofence intersection.", error);
            return [];
        }
    },

    /**
     * Ray-casting algorithm to determine if a point is inside a polygon.
     */
    pointInPolygon: (point, vs) => {
        const x = point[0], y = point[1];
        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i][0], yi = vs[i][1];
            const xj = vs[j][0], yj = vs[j][1];
            
            const intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
};
