/**
 * Human Approval Service
 * Manages approval gates for automation actions.
 */
const { executeQuery } = require('../db/database');

class ApprovalService {
    async requestApproval(organizationId, requesterId, context, reason) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO approval_requests (
                    organization_id, requested_by, context, decision, reason
                ) VALUES (
                    ${organizationId}, ${requesterId}, ${JSON.stringify(context)}, 'PENDING', ${reason}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async resolveApproval(approvalId, organizationId, approverId, decision, reason) {
        if (!['APPROVED', 'REJECTED', 'CANCELLED'].includes(decision)) {
            throw new Error("Invalid decision.");
        }
        
        const request = await executeQuery(async (db) => {
            const res = await db`
                UPDATE approval_requests
                SET decision = ${decision}, approved_by = ${approverId}, reason = COALESCE(${reason}, reason), decided_at = NOW()
                WHERE id = ${approvalId} AND organization_id = ${organizationId} AND decision = 'PENDING'
                RETURNING *
            `;
            return res[0];
        });

        if (request && decision === 'APPROVED') {
            // Trigger the original workflow action asynchronously
            const workflowEngine = require('./workflowEngine');
            workflowEngine.executeAction(request.context.action, request.context).catch(console.error);
        }

        return request;
    }
}

module.exports = new ApprovalService();
