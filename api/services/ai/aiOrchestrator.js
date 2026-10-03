/**
 * AI Orchestrator
 * Coordinates specialized AI agents, handles conflicts, and issues Uncertainty Passports.
 */
const { executeQuery } = require('../../db/database');
const agentRegistry = require('./agentRegistryService');
const verificationService = require('./aiVerificationService');
const conflictService = require('./agentConflictService');

class AIOrchestrator {
    
    async processRequest(orgId, workspaceId, userId, taskStr, context) {
        // 1. Task Classification & Agent Selection (Mocked router)
        const agentId = await agentRegistry.selectAgentForTask(taskStr);
        
        // 2. Register Decision Intent
        const decisionRecord = await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO ai_decisions (organization_id, workspace_id, task, agent_id, input_context)
                VALUES (${orgId}, ${workspaceId}, ${taskStr}, ${agentId}, ${JSON.stringify(context)})
                RETURNING *
            `;
            return res[0];
        });

        // 3. Agent Execution (Simulated output for control plane logic)
        const agentOutput = {
            recommendation: "Delay outdoor maintenance by 2 hours.",
            alternatives: ["Cancel maintenance entirely.", "Proceed with extreme caution (Not recommended)."],
            risk_level: "HIGH",
            evidence: ["Rain probability 85%", "Wind gust 45mph"],
            confidence: "MODERATE"
        };

        // 4. Verification Gate
        const verification = await verificationService.runVerification(decisionRecord.id, agentOutput);
        
        // 5. Conflict Detection
        const conflicts = await conflictService.detectConflicts(decisionRecord.id, [agentOutput]);

        // 6. Generate Uncertainty Passport
        const passport = await this.generateUncertaintyPassport(decisionRecord.id, agentOutput, verification, conflicts);

        // 7. Route to Human Approval if High Risk
        let approvalReq = null;
        if (agentOutput.risk_level === 'HIGH') {
            approvalReq = await this.createApprovalRequest(orgId, workspaceId, userId, agentId, decisionRecord.id, agentOutput);
        }

        return {
            decision_id: decisionRecord.id,
            recommendation: agentOutput.recommendation,
            alternatives: agentOutput.alternatives,
            uncertainty_passport: passport,
            approval_status: approvalReq ? "PENDING_HUMAN_APPROVAL" : "AUTO_APPROVED",
            verification_status: verification.status
        };
    }

    async generateUncertaintyPassport(decisionId, agentOutput, verification, conflicts) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO ai_uncertainty_passports (
                    decision_id, confidence, uncertainty_level, evidence_quality, 
                    verification_sources, model_agreement, recommended_next_action
                ) VALUES (
                    ${decisionId}, ${agentOutput.confidence}, 'MODERATE', 'HIGH', 
                    ${JSON.stringify([verification.method])}, 
                    ${conflicts.length > 0 ? 'DISAGREEMENT_DETECTED' : 'AGREEMENT'},
                    'Human Review Required'
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async createApprovalRequest(orgId, workspaceId, userId, agentId, decisionId, output) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO ai_approvals (
                    organization_id, workspace_id, requested_by, agent_id, 
                    decision_id, recommendation, risk_level
                ) VALUES (
                    ${orgId}, ${workspaceId}, ${userId}, ${agentId}, 
                    ${decisionId}, ${JSON.stringify(output.recommendation)}, ${output.risk_level}
                ) RETURNING *
            `;
            return res[0];
        });
    }
}

module.exports = new AIOrchestrator();
