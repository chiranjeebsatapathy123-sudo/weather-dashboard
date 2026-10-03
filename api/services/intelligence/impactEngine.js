/**
 * Impact Engine
 * Propagates direct and inferred effects through the evidence graph.
 */
class ImpactEngine {
    
    evaluateImpact(weatherEvent, targetAsset, sensitivityConfig) {
        // Distinguish Direct vs Inferred
        
        let directEffect = null;
        let inferredEffect = null;
        let riskScore = 0;

        if (weatherEvent.type === 'RAIN') {
            if (sensitivityConfig.includes('RAIN')) {
                directEffect = "Asset is directly exposed to precipitation.";
                riskScore += 50;
                
                // Inferred logic
                if (targetAsset.type === 'ROAD_SEGMENT') {
                    inferredEffect = "Visibility likely decreases; logistics risk increases.";
                    riskScore += 20;
                }
            }
        }

        return {
            asset: targetAsset.id,
            directEffect: directEffect || "None identified.",
            inferredEffect: inferredEffect || "None identified.",
            riskScore,
            disclaimer: "Inferred effects are potential consequences, not guaranteed outcomes."
        };
    }

    decomposeRisk(impacts) {
        // Breaking down risk into explainable contributors instead of just "HIGH RISK"
        return {
            overall_risk_level: impacts.riskScore > 60 ? "HIGH" : "MODERATE",
            contributors: {
                weather_exposure: impacts.directEffect ? "high" : "low",
                asset_sensitivity: impacts.riskScore > 0 ? "high" : "none"
            },
            evidence: [impacts.directEffect, impacts.inferredEffect].filter(Boolean)
        };
    }
}

module.exports = new ImpactEngine();
