/**
 * Weather Operations Agent 2.0
 * Tool-restricted autonomous agent for resolving weather operations.
 */
const { executeQuery } = require('../../db/database');
const workOrderService = require('../workOrderService');
const approvalService = require('../approvalService');

class WeatherOperationsAgent {
    constructor() {
        this.registeredTools = [
            'get_weather', 'get_forecast', 'get_alerts', 'get_location',
            'get_device_status', 'get_asset_status', 'get_active_events',
            'get_work_orders', 'create_work_order', 'create_alert',
            'request_approval', 'summarize_incident'
        ];
    }

    async analyzeAndPlan(intent, context, orgId, userId) {
        // AI Logic simulation (LLM would output this JSON)
        const plan = {
            intent,
            tools_used: ['get_weather', 'get_asset_status'],
            evidence: { weather: "Heavy rain", asset_status: "Exposed to weather" },
            decision: "Need to secure the asset and create a work order.",
            confidence: "HIGH",
            approval_required: true,
            actions: [
                { type: 'CREATE_WORK_ORDER', payload: { title: "Secure exposed asset", priority: "HIGH" } }
            ]
        };

        // DRY-RUN MODE: Do not execute, just return the plan
        return plan;
    }

    async executePlan(plan, orgId, userId) {
        // 1. Emergency Stop Check
        const isKillSwitchActive = false; // Mock org check
        if (isKillSwitchActive) {
            throw new Error("AUTOMATION PAUSED: Kill switch is active. Agents may analyze but cannot execute actions.");
        }

        const results = [];
        
        // 2. Iterate actions
        for (const action of plan.actions) {
            if (plan.approval_required || action.requires_approval) {
                // Request Human Approval
                await approvalService.requestApproval(
                    orgId, userId, 
                    { agent_run: true, action }, 
                    plan.decision
                );
                results.push({ action: action.type, status: "APPROVAL_REQUESTED" });
            } else {
                // Execute immediately if safe
                if (action.type === 'CREATE_WORK_ORDER') {
                    await workOrderService.createWorkOrder({
                        organization_id: orgId,
                        title: action.payload.title,
                        description: action.payload.description,
                        priority: action.payload.priority
                    });
                    results.push({ action: action.type, status: "EXECUTED" });
                }
            }
        }

        // 3. Record Audit Trail (Agent Execution Policy)
        await executeQuery(async (db) => {
            await db`
                INSERT INTO agent_runs (
                    organization_id, user_id, intent, tools_used, input_context, 
                    evidence, decision, confidence, approval_required, actions, result
                ) VALUES (
                    ${orgId}, ${userId}, ${plan.intent}, ${JSON.stringify(plan.tools_used)}, 
                    ${JSON.stringify({})}, ${JSON.stringify(plan.evidence)}, ${plan.decision}, 
                    ${plan.confidence}, ${plan.approval_required}, ${JSON.stringify(plan.actions)}, 
                    ${JSON.stringify(results)}
                )
            `;
        });

        return results;
    }
}

module.exports = new WeatherOperationsAgent();
