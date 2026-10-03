/**
 * Weather ML Model Registry
 * Tracks versions and metadata for prediction algorithms.
 */

const registry = [
    {
        model_name: "persistence-baseline",
        version: "1.0.0",
        task: "baseline_forecast",
        dataset_version: "none",
        training_date: "2024-01-01",
        features: ["current_temp"],
        metrics: { MAE: "N/A - Deterministic" },
        status: "production",
        artifact_location: "api/ml/models/baseline.js"
    },
    {
        model_name: "provider-baseline",
        version: "1.0.0",
        task: "baseline_forecast",
        dataset_version: "none",
        training_date: "2024-01-01",
        features: ["provider_forecast_temp"],
        metrics: { MAE: "N/A - External" },
        status: "production",
        artifact_location: "api/ml/models/baseline.js"
    },
    {
        model_name: "anomaly-detector",
        version: "1.1.0",
        task: "anomaly_detection",
        dataset_version: "v1_history",
        training_date: "2024-01-05",
        features: ["temperature", "rolling_avg"],
        metrics: { Precision: 0.85, Recall: 0.90 },
        status: "production",
        artifact_location: "api/services/anomalyService.js"
    }
];

module.exports = {
    getAllModels: () => registry,
    getActiveModel: (task) => registry.find(m => m.task === task && m.status === "production")
};
