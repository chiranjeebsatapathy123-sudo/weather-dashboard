/**
 * AI Tool Registry
 * Exposes securely registered tools to agents.
 */
const { executeQuery } = require('../../db/database');

class AIToolRegistry {
    
    async registerTool(data) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO ai_tools (
                    name, description, input_schema, output_schema, risk_level, 
                    required_permissions, read_only, requires_approval
                ) VALUES (
                    ${data.name}, ${data.description}, ${JSON.stringify(data.input_schema)}, 
                    ${JSON.stringify(data.output_schema)}, ${data.risk_level}, 
                    ${JSON.stringify(data.required_permissions)}, ${data.read_only}, 
                    ${data.requires_approval}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async listAvailableTools() {
        return await executeQuery(async (db) => {
            return await db`SELECT name, description, risk_level, read_only FROM ai_tools`;
        });
    }
}

module.exports = new AIToolRegistry();
