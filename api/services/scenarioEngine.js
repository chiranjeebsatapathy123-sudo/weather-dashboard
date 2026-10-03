/**
 * Scenario Engine (What-If Simulator)
 * Allows operations teams to adjust variables against a base state to calculate projected impacts.
 */

const { executeQuery } = require("../../db/database");
const logger = require("../../utils/logger");

module.exports = {
    /**
     * Runs a What-If simulation.
     * @param {Object} baseState The Twin's current or historical baseline state.
     * @param {Object} offsets The variable offsets (e.g., { temperature: 3, rainRisk: 20 })
     */
    runSimulation: async (organizationId, workspaceId, name, baseState, offsets, userId = null) => {
        try {
            // 1. Calculate the Projected Scenario State
            const scenarioState = {
                ...baseState,
                temperature: (baseState.temperature || 0) + (offsets.temperature || 0),
                windSpeed: (baseState.windSpeed || 0) + (offsets.windSpeed || 0),
                rainRisk: Math.min(100, Math.max(0, (baseState.rainRisk || 0) + (offsets.rainRisk || 0))),
                aqi: (baseState.aqi || 50) + (offsets.aqi || 0)
            };

            // 2. WeatherOS Derived Impact Model Calculation
            const projectedImpact = module.exports.calculateImpact(scenarioState);

            // 3. Store the Simulation Result
            const result = await executeQuery(async (db) => {
                const res = await db`
                    INSERT INTO scenarios (
                        organization_id, workspace_id, name, base_state, offsets, projected_impact, created_by
                    ) VALUES (
                        ${organizationId}, ${workspaceId}, ${name}, 
                        ${JSON.stringify(baseState)}, ${JSON.stringify(offsets)}, 
                        ${JSON.stringify(projectedImpact)}, ${userId}
                    ) RETURNING *
                `;
                return res[0];
            });

            return {
                simulation_id: result.id,
                baseline: baseState,
                scenario: scenarioState,
                difference: offsets,
                impact: projectedImpact,
                confidence: "MODERATE CONFIDENCE (SIMULATION ONLY)"
            };

        } catch (error) {
            logger.error("Scenario simulation failed", error);
            throw error;
        }
    },

    /**
     * Internal Domain-Specific Impact Model
     */
    calculateImpact: (state) => {
        let operationalRisk = "LOW";
        let outdoorActivity = "SAFE";
        let score = 0;

        if (state.temperature > 35 || state.temperature < -5) score += 3;
        if (state.windSpeed > 40) score += 3;
        if (state.rainRisk > 80) score += 2;
        if (state.aqi > 150) score += 4;

        if (score >= 6) {
            operationalRisk = "CRITICAL";
            outdoorActivity = "DANGEROUS";
        } else if (score >= 3) {
            operationalRisk = "MODERATE";
            outdoorActivity = "CAUTION";
        }

        return {
            operational_risk: operationalRisk,
            outdoor_activity_impact: outdoorActivity,
            impact_score: score,
            methodology: "WeatherOS Scenario Impact Model v1.0"
        };
    }
};
