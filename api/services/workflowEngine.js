/**
 * Workflow Engine
 * Evaluates triggers, executes conditional actions, and handles approvals.
 */
const { executeQuery } = require('../db/database');
const approvalService = require('./approvalService');

class WorkflowEngine {
    
    /**
     * Triggered by the EventEngine when a state changes
     */
    async evaluateEvent(event) {
        // Find active workflows matching this event trigger
        const workflows = await executeQuery(async (db) => {
            return await db`
                SELECT * FROM workflow_definitions 
                WHERE status = 'ACTIVE' 
                  AND trigger_conditions->>'event_type' = ${event.type}
            `;
        });

        for (const wf of workflows) {
            // Check kill switch (mocked here, should check org settings)
            const isKillSwitchActive = false;
            if (isKillSwitchActive) {
                console.log(`[KILL SWITCH] Skipping workflow ${wf.id}`);
                continue;
            }

            // Simple condition evaluation
            if (this.checkConditions(wf.trigger_conditions, event)) {
                await this.executeWorkflow(wf, event);
            }
        }
    }

    checkConditions(conditions, event) {
        // Simulation of expression evaluation
        return true; 
    }

    async executeWorkflow(workflow, event) {
        const actions = workflow.actions || [];
        
        for (const action of actions) {
            if (action.requires_approval) {
                await approvalService.requestApproval(
                    workflow.organization_id, 
                    null, // System generated
                    { workflow_id: workflow.id, action, event }, 
                    `Workflow ${workflow.name} requested execution of ${action.type}.`
                );
            } else {
                await this.executeAction(action, { workflow_id: workflow.id, event });
            }
        }
    }

    async executeAction(action, context) {
        switch (action.type) {
            case 'CREATE_WORK_ORDER':
                const workOrderService = require('./workOrderService');
                await workOrderService.createWorkOrder({
                    organization_id: context.event.organization_id,
                    title: action.payload.title,
                    description: action.payload.description,
                    priority: action.payload.priority
                });
                break;
            case 'NOTIFY':
                // Send notification
                break;
            default:
                console.warn(`Unknown action type: ${action.type}`);
        }
    }

    async simulateWorkflow(workflow, inputEvent) {
        // DRY RUN: return what would happen without executing
        const wouldTrigger = this.checkConditions(workflow.trigger_conditions, inputEvent);
        const actionsToExecute = workflow.actions || [];
        
        return {
            triggered: wouldTrigger,
            actions: actionsToExecute,
            approvalRequirements: actionsToExecute.filter(a => a.requires_approval),
            message: "Simulation only. No actions executed."
        };
    }
}

module.exports = new WorkflowEngine();
