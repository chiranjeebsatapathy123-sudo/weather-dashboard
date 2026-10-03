/**
 * Deterministic Engine for calculating the best times for outdoor activities.
 * Prevents AI hallucinations by providing a solid mathematical score matrix.
 */
const evaluateConditions = (forecastList) => {
    // 0 = terrible, 1 = excellent
    return forecastList.map(f => {
        let score = 1.0;
        
        // Temperature penalty
        if (f.temp > 32) score -= 0.5; // too hot
        else if (f.temp > 28) score -= 0.2; 
        else if (f.temp < 5) score -= 0.5; // too cold
        
        // Rain penalty (severe)
        if (f.pop > 0.5) score -= 0.8;
        else if (f.pop > 0.2) score -= 0.3;
        
        // Wind penalty
        if (f.wind && f.wind.speed > 10) score -= 0.4;
        
        return {
            date: f.dt_txt,
            temp: f.temp,
            score: Math.max(0, score)
        };
    });
};

const getBestTimeWindow = (forecastList) => {
    if (!forecastList || forecastList.length === 0) return null;
    
    // Look at the next 12 hours (4 segments of 3 hours)
    const evaluated = evaluateConditions(forecastList.slice(0, 4));
    
    // Sort by best score
    evaluated.sort((a, b) => b.score - a.score);
    const best = evaluated[0];
    
    if (best.score < 0.3) {
        return "Conditions are generally poor for outdoor activities in the near future.";
    }
    
    const timeStr = new Date(best.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return `The optimal window for outdoor activity is around ${timeStr}, when temperatures are ${Math.round(best.temp)}°C with minimal disruption.`;
};

module.exports = {
    getBestTimeWindow
};
