/**
 * Work Order Service
 * Manages field operations, tasks, and weather-aware flags.
 */
const { executeQuery } = require('../db/database');
const twinStateEngine = require('./twinStateEngine');

class WorkOrderService {
    async createWorkOrder(data) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO work_orders (
                    organization_id, workspace_id, location_id, asset_id, 
                    title, description, priority, status, assigned_to, due_at
                ) VALUES (
                    ${data.organization_id}, ${data.workspace_id}, ${data.location_id}, 
                    ${data.asset_id}, ${data.title}, ${data.description}, 
                    ${data.priority || 'MEDIUM'}, ${data.status || 'OPEN'}, 
                    ${data.assigned_to}, ${data.due_at}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async getWorkOrder(orderId, organizationId) {
        return await executeQuery(async (db) => {
            const res = await db`SELECT * FROM work_orders WHERE id = ${orderId} AND organization_id = ${organizationId}`;
            return res[0];
        });
    }

    async updateStatus(orderId, organizationId, status) {
        return await executeQuery(async (db) => {
            const res = await db`
                UPDATE work_orders 
                SET status = ${status}, updated_at = NOW()
                WHERE id = ${orderId} AND organization_id = ${organizationId}
                RETURNING *
            `;
            return res[0];
        });
    }

    async evaluateWeatherRisk(order) {
        if (!order.location_id) return { hasRisk: false };

        try {
            // Simulated retrieval of location details based on location_id
            const location = await executeQuery(async (db) => {
                const res = await db`SELECT name FROM locations WHERE id = ${order.location_id}`;
                return res[0];
            });

            if (!location) return { hasRisk: false };

            const state = await twinStateEngine.getCurrentState(null, order.workspace_id, location.name);
            
            // Example logic for weather-aware risk flagging
            if (state.rainRisk > 60) {
                return {
                    hasRisk: true,
                    recommendation: "WeatherOS recommends review.",
                    reason: `Rain probability is ${state.rainRisk}%.`,
                    action: "Do not automatically cancel. Human remains responsible for the final decision."
                };
            }
        } catch (e) {
            // Fallback gracefully
        }
        
        return { hasRisk: false };
    }
}

module.exports = new WorkOrderService();
