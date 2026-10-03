const logger = require("../utils/logger");

/**
 * Basic statistical anomaly detection.
 * Compares current weather against the average of the 5-day forecast.
 * In a real application, this would compare against a 30-day historical baseline.
 */
const detectAnomalies = (currentWeather, forecastData) => {
    const anomalies = [];
    if (!currentWeather || !forecastData || !forecastData.list || forecastData.list.length < 5) return anomalies;

    // Extract temperatures
    const temps = forecastData.list.map(f => f.temp);
    
    // Calculate Mean
    const mean = temps.reduce((sum, val) => sum + val, 0) / temps.length;
    
    // Calculate Standard Deviation
    const variance = temps.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / temps.length;
    const stdDev = Math.sqrt(variance);
    
    // Z-Score for current temp
    const zScore = (currentWeather.temperature - mean) / (stdDev || 1); // prevent div by zero

    if (zScore > 2.0) {
        anomalies.push({
            metric: 'temperature',
            anomaly: 'high',
            title: 'Unusually Warm',
            description: `Today's temperature is significantly above the recent average.`,
            zScore: zScore.toFixed(2)
        });
    } else if (zScore < -2.0) {
        anomalies.push({
            metric: 'temperature',
            anomaly: 'low',
            title: 'Unusually Cold',
            description: `Today's temperature is significantly below the recent average.`,
            zScore: zScore.toFixed(2)
        });
    }

    return anomalies;
};

module.exports = {
    detectAnomalies
};
