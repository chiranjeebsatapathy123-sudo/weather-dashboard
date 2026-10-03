/**
 * Determines the confidence level based on available data and freshness.
 */
const determineConfidence = (context, intent) => {
    if (!context || !context.currentWeather) return "Limited data";
    
    let score = 1; // base
    
    if (context.forecast) score += 1;
    if (context.history && context.history.length > 0) score += 1;
    
    // Evaluate based on intent
    if (intent === 'RAIN_FORECAST' || intent === 'TEMPERATURE_FORECAST') {
        if (!context.forecast) return "Limited data";
    }
    if (intent === 'HISTORICAL' || intent === 'COMPARISON') {
        if (!context.history || context.history.length === 0) return "Limited data";
    }

    if (score >= 3) return "High confidence";
    if (score === 2) return "Moderate confidence";
    return "Limited data";
};

module.exports = {
    determineConfidence
};
