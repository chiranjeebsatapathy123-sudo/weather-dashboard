const { evaluateActivityRisk } = require('../risk/riskEngine');

/**
 * Finds optimal windows for a given activity across the forecast list.
 */
const findOptimalWindows = (activityType, forecastList) => {
    if (!forecastList || forecastList.length === 0) return [];

    const windows = [];
    // Analyze next 12 hours
    const upcoming = forecastList.slice(0, 4); 

    for (const f of upcoming) {
        const simWeather = {
            temperature: f.temp,
            precipitationProbability: f.pop,
            wind: { speed: f.wind ? f.wind.speed : 0 }
        };
        
        const risk = evaluateActivityRisk(activityType, simWeather);
        windows.push({
            time: f.dt_txt,
            riskLevel: risk.level,
            reasons: risk.reasons
        });
    }

    return windows;
};

module.exports = {
    findOptimalWindows
};
