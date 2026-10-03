/**
 * Agent Conflict Service
 * Detects discrepancies between specialized agents to flag to human operators.
 */
const { executeQuery } = require('../../db/database');

class AgentConflictService {
    
    async detectConflicts(decisionId, agentOutputs) {
        // We simulate conflict detection. E.g., Agent A says High Risk, Agent B says Low Risk.
        const conflicts = [];
        
        // If we had multiple outputs, we'd compare. 
        // We'll mock returning an empty array if only one output, or detecting a difference.
        
        if (agentOutputs.length > 1) {
            const riskLevels = agentOutputs.map(o => o.risk_level);
            if (riskLevels.includes('HIGH') && riskLevels.includes('LOW')) {
                conflicts.push({
                    type: 'RECOMMENDATION_CONFLICT',
                    agents: ['Agent A', 'Agent B'],
                    description: "Disagreement detected. Agent A flags High Risk, Agent B flags Low Risk."
                });
            }
        }

        if (conflicts.length > 0) {
            await executeQuery(async (db) => {
                for (const conflict of conflicts) {
                    await db`
                        INSERT INTO ai_conflicts (decision_id, conflict_type, agents_involved)
                        VALUES (${decisionId}, ${conflict.type}, ${JSON.stringify(conflict.agents)})
                    `;
                }
            });
        }

        return conflicts;
    }
}

module.exports = new AgentConflictService();
