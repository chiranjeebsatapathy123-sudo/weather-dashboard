/**
 * Scenario Engine
 * Runs 'What-If' simulations without modifying production databases.
 */
const { executeQuery } = require('../../db/database');
const twinSnapshotService = require('./twinSnapshotService');

class ScenarioEngine {
    
    async createScenario(organizationId, userId, name, type, parameters) {
        // Prevent nonsensical input
        this.validateParameters(parameters);

        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO scenarios (organization_id, name, type, parameters, created_by)
                VALUES (${organizationId}, ${name}, ${type}, ${JSON.stringify(parameters)}, ${userId})
                RETURNING *
            `;
            return res[0];
        });
    }

    validateParameters(parameters) {
        if (parameters.humidity_delta && parameters.humidity_delta < -100) {
            throw new Error("Humidity delta cannot exceed -100%");
        }
        if (parameters.visibility_delta && parameters.visibility_delta < -100) {
            throw new Error("Visibility cannot drop below 0%");
        }
        // ... Safe boundaries implementation
    }

    async runSimulation(scenarioId, organizationId) {
        const scenario = await executeQuery(async (db) => {
            const res = await db`SELECT * FROM scenarios WHERE id = ${scenarioId} AND organization_id = ${organizationId}`;
            return res[0];
        });

        if (!scenario) throw new Error("Scenario not found");

        // 1. Create a baseline snapshot
        const snapshot = await twinSnapshotService.createSnapshot(organizationId, scenario.id, {
            assets: [{ id: 'mock-1', sensitivity: 'RAIN' }],
            weather: { rainProbability: 20 }
        });

        // 2. Apply deltas (Hypothetical processing)
        const simState = { ...snapshot.snapshot_data };
        if (scenario.parameters.rainfall_delta) {
            simState.weather.rainProbability += scenario.parameters.rainfall_delta;
        }

        // 3. Mark as SIMULATION
        simState._meta = { is_simulation: true, scenario_id: scenario.id };

        return {
            scenario_name: scenario.name,
            original_state: snapshot.snapshot_data,
            simulated_state: simState,
            impact: "POTENTIAL EFFECT: Increased rain probability triggers work delay."
        };
    }
}

module.exports = new ScenarioEngine();
