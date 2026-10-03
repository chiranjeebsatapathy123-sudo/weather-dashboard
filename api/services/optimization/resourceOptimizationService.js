/**
 * Resource Optimization Service
 * Multi-objective optimization generating Pareto trade-off options.
 * Never executes decisions automatically.
 */
class ResourceOptimizationService {
    
    generateParetoOptions(task, availableResources, explicitWeights) {
        // explicitWeights: { risk_weight: 0.4, time_weight: 0.4, cost_weight: 0.2 }
        
        // This is decision-support, not automatic dispatch.
        // We generate discrete alternative options based on available resources.
        
        const options = [];

        // Option A: Prioritize Time (Fastest, potentially higher exposure)
        const fastestResource = availableResources.sort((a, b) => a.eta - b.eta)[0];
        if (fastestResource) {
            options.push({
                type: "TIME_PRIORITY",
                assigned_resource: fastestResource.id,
                trade_offs: {
                    delay: "Minimal",
                    weather_exposure: fastestResource.exposure_level,
                    cost: fastestResource.cost_rating
                },
                explanation: `Prioritizes fastest completion time (Weight: ${explicitWeights.time_weight}).`
            });
        }

        // Option B: Prioritize Risk (Lowest exposure, potentially slower)
        const safestResource = availableResources.sort((a, b) => a.calculated_risk - b.calculated_risk)[0];
        if (safestResource && safestResource.id !== fastestResource?.id) {
            options.push({
                type: "RISK_PRIORITY",
                assigned_resource: safestResource.id,
                trade_offs: {
                    delay: "Moderate",
                    weather_exposure: safestResource.exposure_level,
                    cost: safestResource.cost_rating
                },
                explanation: `Prioritizes minimal weather exposure (Weight: ${explicitWeights.risk_weight}).`
            });
        }

        return {
            objective_configuration: explicitWeights,
            disclaimer: "These are recommendations. Review trade-offs carefully before assigning resources.",
            options: options
        };
    }
}

module.exports = new ResourceOptimizationService();
