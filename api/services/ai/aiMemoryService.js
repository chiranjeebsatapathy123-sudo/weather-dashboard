/**
 * AI Memory Service
 * Provides tenant-isolated, scoped persistent memory for AI contextualization.
 */
const { executeQuery } = require('../../db/database');

class AIMemoryService {
    
    async storeMemory(orgId, workspaceId, userId, memoryType, content) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO ai_memories (
                    organization_id, workspace_id, user_id, memory_type, content
                ) VALUES (
                    ${orgId}, ${workspaceId}, ${userId}, ${memoryType}, ${JSON.stringify(content)}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async getMemoryContext(orgId, workspaceId) {
        return await executeQuery(async (db) => {
            // Retrieve relevant scoped memory
            return await db`
                SELECT memory_type, content FROM ai_memories 
                WHERE organization_id = ${orgId} 
                AND workspace_id = ${workspaceId}
                ORDER BY created_at DESC LIMIT 50
            `;
        });
    }
}

module.exports = new AIMemoryService();
