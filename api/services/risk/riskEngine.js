const { getThresholdsForActivity } = require("./thresholdService");

/**
 * Deterministic weather risk engine.
 * Calculates explicit, explainable risk levels for user activities.
 */
const evaluateActivityRisk = (activityType, weatherData) => {
    const thresholds = getThresholdsForActivity(activityType);
    const temp = weatherData.temperature;
    const rainPop = (weatherData.precipitationProbability || 0) * 100;
    const wind = weatherData.wind ? (weatherData.wind.speed * 3.6) : 0; // m/s to km/h

    let riskLevel = 'LOW';
    let reasons = [];
    let mainConcern = null;

    // Check Temperature
    if (temp < thresholds.temp_min) {
        reasons.push(`Temperature (${temp}°C) is below your preferred minimum.`);
        riskLevel = 'MODERATE';
        mainConcern = 'Cold';
    } else if (temp > thresholds.temp_max) {
        reasons.push(`Temperature (${temp}°C) is above your preferred maximum.`);
        riskLevel = temp > thresholds.temp_max + 5 ? 'HIGH' : 'MODERATE';
        mainConcern = 'Heat';
    }

    // Check Rain
    if (rainPop > thresholds.rain_max) {
        reasons.push(`Rain probability (${rainPop}%) exceeds your threshold.`);
        riskLevel = rainPop > 70 ? 'HIGH' : (riskLevel === 'LOW' ? 'MODERATE' : riskLevel);
        mainConcern = 'Rain';
    }

    // Check Wind
    if (wind > thresholds.wind_max) {
        reasons.push(`Wind speed (${Math.round(wind)} km/h) is high.`);
        if (riskLevel === 'LOW') riskLevel = 'MODERATE';
        if (!mainConcern) mainConcern = 'Wind';
    }

    if (reasons.length === 0) {
        reasons.push('All conditions are within your selected preferences.');
        mainConcern = 'None';
    }

    return {
        activity: activityType,
        level: riskLevel,
        reasons,
        mainConcern
    };
};

module.exports = {
    evaluateActivityRisk
};
