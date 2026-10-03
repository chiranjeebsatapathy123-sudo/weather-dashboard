/**
 * Decision Intelligence Service
 * Orchestrates the DAG of Observation -> Forecast -> Inference -> Recommendation -> Decision.
 */
const { executeQuery } = require('../../db/database');
const evidenceService = require('./evidenceService');

class DecisionIntelligenceService {
    
    async openDecisionContext(organizationId, workspaceId, title) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO decision_contexts (organization_id, workspace_id, title)
                VALUES (${organizationId}, ${workspaceId}, ${title})
                RETURNING *
            `;
            return res[0];
        });
    }

    async generateOptions(contextId, situation) {
        // In reality, this relies on Playbooks and Risk Matrices.
        // E.g., Situation: "Rain expected."
        
        const options = [
            {
                description: "Continue operation",
                expected_impact: "Moderate risk of equipment damage.",
                risk_level: "HIGH",
                trade_offs: { cost: "Low", safety: "Low", time: "Optimal" },
                requires_approval: true
            },
            {
                description: "Delay operation by 4 hours",
                expected_impact: "Safe execution outside rain window.",
                risk_level: "LOW",
                trade_offs: { cost: "Moderate", safety: "High", time: "Delayed" },
                requires_approval: false
            }
        ];

        const insertedOptions = [];
        for (const opt of options) {
            const res = await executeQuery(async (db) => {
                const r = await db`
                    INSERT INTO decision_options (
                        context_id, description, expected_impact, risk_level, trade_offs, requires_approval
                    ) VALUES (
                        ${contextId}, ${opt.description}, ${opt.expected_impact}, 
                        ${opt.risk_level}, ${JSON.stringify(opt.trade_offs)}, ${opt.requires_approval}
                    ) RETURNING *
                `;
                return r[0];
            });
            if (res) insertedOptions.push(res);
        }

        return insertedOptions;
    }

    async recordHumanDecision(contextId, orgId, userId, optionId, reason, notes) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO decision_records (
                    context_id, organization_id, selected_option_id, decision_maker, reason, notes
                ) VALUES (
                    ${contextId}, ${orgId}, ${optionId}, ${userId}, ${reason}, ${notes}
                ) RETURNING *
            `;
            
            // Close context
            await db`UPDATE decision_contexts SET status = 'CLOSED' WHERE id = ${contextId}`;
            return res[0];
        });
    }
}

module.exports = new DecisionIntelligenceService();
