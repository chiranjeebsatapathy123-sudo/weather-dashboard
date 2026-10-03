/**
 * Multi-Agent Orchestrator
 * Controls the flow of intent -> tool execution -> RAG grounding -> AI Response.
 */

const toolRegistry = require("./toolRegistry");
const groundingService = require("../groundingService");
const aiProvider = require("./aiProvider");
const logger = require("../../utils/logger");

module.exports = {
    /**
     * Orchestrates a multi-agent AI request.
     */
    executeAgentQuery: async (prompt, organizationContext, userContext) => {
        try {
            // 1. INTENT & TOOL SELECTION (LLM decides what it needs based on available tools)
            const availableTools = toolRegistry.getAvailableTools();
            const plan = await aiProvider.generateText(`
                You are the WeatherOS Agent Orchestrator. 
                Based on the user's prompt, select the EXACT tool names you need to fulfill this request.
                Available Tools: ${JSON.stringify(availableTools.map(t => t.name))}
                User Prompt: ${prompt}
                Respond ONLY with a JSON array of tool names.
            `);

            let selectedTools = [];
            try {
                selectedTools = JSON.parse(plan.content);
            } catch (e) {
                logger.warn("Agent Orchestrator failed to parse tool plan. Defaulting to READ ONLY.");
            }

            // 2. EVIDENCE GATHERING (Execute permitted tools)
            let gatheredEvidence = [];
            for (const toolName of selectedTools) {
                const tool = toolRegistry.getTool(toolName);
                if (tool) {
                    // Scope Memory & Permission Checks
                    if (tool.risk_level === 'HIGH-RISK WRITE' || tool.risk_level === 'DESTRUCTIVE') {
                        gatheredEvidence.push(`Action ${toolName} requires explicit Human-In-The-Loop confirmation.`);
                        continue; // Do not execute risky actions automatically!
                    }

                    try {
                        const result = await tool.execute(organizationContext, userContext);
                        gatheredEvidence.push(`Tool [${toolName}] Result: ${JSON.stringify(result)}`);
                    } catch (e) {
                        gatheredEvidence.push(`Tool [${toolName}] Failed: Permission Denied or Error.`);
                    }
                }
            }

            // 3. RAG / GROUNDING
            const contextPayload = {
                organization_id: organizationContext,
                gathered_evidence: gatheredEvidence
            };

            const systemPrompt = `
                You are a Weather Intelligence Expert. Use ONLY the provided evidence to answer.
                Evidence: ${JSON.stringify(contextPayload)}
                
                CRITICAL RULE: Do not invent facts, weather data, or integrations. If you lack data, say "Insufficient data".
            `;

            const rawResponse = await aiProvider.generateText(systemPrompt + "\nUser: " + prompt);

            // 4. OUTPUT VALIDATION (Hallucination check)
            const groundedResponse = await groundingService.validateResponse(
                JSON.stringify(contextPayload), 
                prompt, 
                rawResponse.content
            );

            return {
                plan_trace: selectedTools,
                response: groundedResponse.is_grounded ? groundedResponse.validated_response : "I'm sorry, I could not confidently answer that based on the verified evidence available to me.",
                evidence_count: gatheredEvidence.length,
                safety: groundedResponse.is_grounded ? "SAFE" : "REJECTED_HALLUCINATION"
            };

        } catch (error) {
            logger.error("Orchestrator failed", error);
            throw error;
        }
    }
};
