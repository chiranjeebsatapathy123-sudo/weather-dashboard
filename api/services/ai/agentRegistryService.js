/**
 * Agent Registry Service
 * Manages the lifecycle, capabilities, and allowed tools of AI Agents.
 */
const { executeQuery } = require('../../db/database');

class AgentRegistryService {
    
    async registerAgent(data) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO ai_agents (
                    name, description, version, capabilities, allowed_tools, 
                    required_permissions, risk_class, approval_policy
                ) VALUES (
                    ${data.name}, ${data.description}, ${data.version}, 
                    ${JSON.stringify(data.capabilities)}, ${JSON.stringify(data.allowed_tools)}, 
                    ${JSON.stringify(data.required_permissions)}, ${data.risk_class || 'MODERATE'}, 
                    ${data.approval_policy || 'REQUIRED'}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async selectAgentForTask(taskStr) {
        // Mock routing logic. Returns a UUID or selects the first active agent.
        return await executeQuery(async (db) => {
            const res = await db`SELECT id FROM ai_agents WHERE status = 'ACTIVE' LIMIT 1`;
            return res[0] ? res[0].id : null; 
        });
    }

    async getAgentConfigs() {
        return await executeQuery(async (db) => {
            return await db`SELECT id, name, version, status, risk_class, approval_policy FROM ai_agents`;
        });
    }
}

module.exports = new AgentRegistryService();
