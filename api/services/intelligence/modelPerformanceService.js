/**
 * Model Performance Service
 * Tracks model metrics, drift, and manages the model registry.
 */
const { executeQuery } = require('../../db/database');

class ModelPerformanceService {
    async registerModel(modelData, userId) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO model_versions (
                    name, version, type, dataset_version, training_period, 
                    evaluation_period, features, metrics, approved_by
                ) VALUES (
                    ${modelData.name}, ${modelData.version}, ${modelData.type}, 
                    ${modelData.dataset_version}, ${JSON.stringify(modelData.training_period)}, 
                    ${JSON.stringify(modelData.evaluation_period)}, ${JSON.stringify(modelData.features)}, 
                    ${JSON.stringify(modelData.metrics)}, ${userId}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async recordDriftDetection(modelId, status, featureName, baseline, current) {
        // status: DRIFT, NO_DRIFT, INSUFFICIENT_DATA
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO data_drift_events (
                    model_id, status, feature_name, baseline_distribution, current_distribution
                ) VALUES (
                    ${modelId}, ${status}, ${featureName}, 
                    ${JSON.stringify(baseline)}, ${JSON.stringify(current)}
                ) RETURNING *
            `;
            
            if (status === 'DRIFT') {
                // Optionally mark model as degraded
                await db`UPDATE model_versions SET status = 'DEGRADED' WHERE id = ${modelId}`;
            }

            return res[0];
        });
    }

    async getModelPerformance(modelId) {
        const model = await executeQuery(async (db) => {
            const res = await db`SELECT * FROM model_versions WHERE id = ${modelId}`;
            return res[0];
        });
        
        if (!model) return null;

        // Ensure we don't calculate or show fake metrics
        if (!model.metrics || Object.keys(model.metrics).length === 0) {
            model.metrics_status = "Insufficient data for metric calculation.";
        }
        
        return model;
    }
}

module.exports = new ModelPerformanceService();
