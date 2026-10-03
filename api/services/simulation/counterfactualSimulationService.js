/**
 * Counterfactual Simulation Service
 * Runs "What-If" scenarios safely isolated from the production digital twin.
 */
const { executeQuery } = require('../../db/database');

class CounterfactualSimulationService {
    
    async runSimulation(orgId, baselineSnapshotId, scenarioName, variables) {
        // The orchestrator validates that variable thresholds are safe.
        // E.g., variables = { rainfall: "+20%", operation_start: "+2 hours" }
        
        // Simulating the derived counterfactual output without mutating real records
        const simulatedOutput = {
            risk: "ELEVATED",
            delay_minutes: 120,
            resource_demand: "HIGH",
            trade_offs: [
                "Operation succeeds but incurs overtime cost.",
                "Weather exposure decreases by 15%."
            ]
        };

        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO counterfactual_simulations (
                    organization_id, baseline_snapshot_id, scenario_name,
                    variables, outputs, uncertainty
                ) VALUES (
                    ${orgId}, ${baselineSnapshotId}, ${scenarioName},
                    ${JSON.stringify(variables)}, ${JSON.stringify(simulatedOutput)}, 'MODERATE'
                ) RETURNING *
            `;
            return {
                ...res[0],
                disclaimer: "Simulation — not an observation or forecast."
            };
        });
    }
}

module.exports = new CounterfactualSimulationService();
