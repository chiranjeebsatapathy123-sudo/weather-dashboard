/**
 * Forecast Agreement Service
 * Detects model disagreement/agreement from multiple forecast sources to prevent false probabilities.
 */
const { executeQuery } = require('../../db/database');

class ForecastAgreementService {
    /**
     * Evaluates multiple forecast predictions for the same temporal window.
     * @param {Array} predictions - e.g. [{ model: 'A', temp: 72 }, { model: 'B', temp: 73 }]
     */
    evaluateAgreement(metric, predictions, threshold = 2) {
        if (!predictions || predictions.length < 2) {
            return { level: 'INSUFFICIENT_DATA', score: 0 };
        }

        // Simple variance calculation for numerical values
        const values = predictions.map(p => p.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const spread = max - min;

        let level = 'LOW';
        let score = 0; // 0-100 where 100 is perfect agreement

        if (spread <= threshold) {
            level = 'HIGH_AGREEMENT';
            score = 90;
        } else if (spread <= threshold * 2.5) {
            level = 'MODERATE_AGREEMENT';
            score = 60;
        } else {
            level = 'LOW_AGREEMENT';
            score = 30;
        }

        return { level, score, spread, min, max, samples: predictions.length };
    }

    async recordAgreement(orgId, locationId, metric, evaluation) {
        return await executeQuery(async (db) => {
            await db`
                INSERT INTO forecast_agreements (
                    organization_id, location_id, metric, agreement_level, 
                    uncertainty_score, model_data
                ) VALUES (
                    ${orgId}, ${locationId}, ${metric}, ${evaluation.level}, 
                    ${100 - evaluation.score}, ${JSON.stringify(evaluation)}
                )
            `;
        });
    }
}

module.exports = new ForecastAgreementService();
