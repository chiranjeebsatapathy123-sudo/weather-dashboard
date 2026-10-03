/**
 * AI Usage Service
 * Tracks token utilization, cost, and latency.
 */
const { executeQuery } = require('../../db/database');

class AIUsageService {
    
    async recordUsage(orgId, workspaceId, agentId, task, metrics) {
        // metrics: { tokens, latency_ms, model, provider, estimated_cost }
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO ai_usage (
                    organization_id, workspace_id, agent_id, task,
                    tokens, latency_ms, model, provider, estimated_cost
                ) VALUES (
                    ${orgId}, ${workspaceId}, ${agentId}, ${task},
                    ${metrics.tokens || 0}, ${metrics.latency_ms || 0}, 
                    ${metrics.model}, ${metrics.provider}, ${metrics.estimated_cost || 0}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async getUsageReport(orgId) {
        return await executeQuery(async (db) => {
            return await db`
                SELECT model, provider, SUM(tokens) as total_tokens, 
                       SUM(estimated_cost) as total_cost, AVG(latency_ms) as avg_latency
                FROM ai_usage
                WHERE organization_id = ${orgId}
                GROUP BY model, provider
            `;
        });
    }
}

module.exports = new AIUsageService();
