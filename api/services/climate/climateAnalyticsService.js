/**
 * Climate Analytics Service
 * Generates historical baselines, long-term trend lines, and analyzes extreme deviations.
 */

const { executeQuery } = require("../../db/database");
const logger = require("../../utils/logger");

module.exports = {
    /**
     * Calculates the statistical baseline for a specific location across a time range.
     */
    generateBaseline: async (locationId, metric, startDate, endDate) => {
        try {
            // Evaluates historical datasets (assuming imported via Federated sources)
            // Example metric: "temperature"
            const queryResult = await executeQuery(async (db) => {
                return await db`
                    SELECT 
                        AVG((state_payload->>${metric})::numeric) as mean_value,
                        MIN((state_payload->>${metric})::numeric) as min_value,
                        MAX((state_payload->>${metric})::numeric) as max_value,
                        COUNT(*) as sample_size
                    FROM twin_states ts
                    JOIN digital_twins dt ON ts.twin_id = dt.id
                    WHERE dt.id = ${locationId}
                    AND ts.recorded_at BETWEEN ${startDate} AND ${endDate}
                `;
            });

            const data = queryResult[0];

            if (!data || data.sample_size < 30) {
                return {
                    status: "INSUFFICIENT_DATA",
                    message: "Not enough historical data to generate a statistically meaningful baseline."
                };
            }

            return {
                status: "SUCCESS",
                metric: metric,
                baseline_mean: parseFloat(data.mean_value).toFixed(2),
                absolute_min: data.min_value,
                absolute_max: data.max_value,
                sample_size: data.sample_size,
                period: { start: startDate, end: endDate }
            };

        } catch (error) {
            logger.error("Failed to generate climate baseline", error);
            throw error;
        }
    }
};
