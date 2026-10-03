/**
 * Continuity Planner
 * Supports Business Continuity playbooks and gap analysis.
 */
const { executeQuery } = require('../../db/database');

class ContinuityPlanner {
    
    async createPlaybook(orgId, data) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO continuity_playbooks (
                    organization_id, name, trigger_event, tasks
                ) VALUES (
                    ${orgId}, ${data.name}, ${data.trigger_event}, ${JSON.stringify(data.tasks)}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    analyzeResilienceGap(scenarioRequirements, currentCapabilities) {
        // Compare required capabilities against actual available capabilities
        const gaps = [];

        for (const req of scenarioRequirements) {
            const available = currentCapabilities.find(c => c.type === req.type);
            const availableCount = available ? available.count : 0;

            if (availableCount < req.required_count) {
                gaps.push({
                    type: req.type,
                    required: req.required_count,
                    available: availableCount,
                    gap: req.required_count - availableCount,
                    message: `Configured capacity gap: ${req.required_count - availableCount} ${req.type}`
                });
            }
        }

        return {
            status: gaps.length > 0 ? "GAPS_DETECTED" : "ADEQUATE_COVERAGE",
            gaps
        };
    }
}

module.exports = new ContinuityPlanner();
