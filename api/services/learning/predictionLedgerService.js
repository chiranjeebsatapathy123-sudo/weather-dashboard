/**
 * Prediction Ledger Service
 * Irrevocably stores AI predictions BEFORE outcomes are known to prevent hindsight bias.
 */
const { executeQuery } = require('../../db/database');

class PredictionLedgerService {
    
    async recordPrediction(orgId, decisionId, predictionData) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO prediction_ledger (
                    organization_id, decision_id, prediction, forecast_version,
                    agent_version, confidence, evidence
                ) VALUES (
                    ${orgId}, ${decisionId}, ${JSON.stringify(predictionData.recommendation)},
                    ${predictionData.forecast_version || 'v1'}, ${predictionData.agent_version || 'v1'},
                    ${predictionData.confidence}, ${JSON.stringify(predictionData.evidence)}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async resolvePrediction(predictionId, actualOutcome) {
        // Once the event occurs, record the real outcome against the prediction.
        return await executeQuery(async (db) => {
            const res = await db`
                UPDATE prediction_ledger 
                SET outcome = ${JSON.stringify(actualOutcome)}, resolved_at = NOW()
                WHERE id = ${predictionId}
                RETURNING *
            `;
            return res[0];
        });
    }
}

module.exports = new PredictionLedgerService();
