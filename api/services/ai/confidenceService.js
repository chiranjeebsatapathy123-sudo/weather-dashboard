const determineConfidence = (context, intent) => {
    let score = 0;
    let reason = "Data is sufficient for a reliable answer.";
    let limitations = [];

    if (!context || !context.currentWeather) {
        return { 
            confidence: "LIMITED", 
            confidence_reason: "Missing current weather context.", 
            sources: [], 
            retrieved_at: null, 
            freshness: "unknown", 
            limitations: ["No real-time data"] 
        };
    }

    const ageMinutes = (new Date() - new Date(context.retrieved_at)) / 60000;
    let freshness = "live";
    if (ageMinutes > 30) freshness = "stale";
    
    if (ageMinutes < 60) score += 2;
    else if (ageMinutes < 120) score += 1;
    else limitations.push(`Data is ${Math.round(ageMinutes)} minutes old.`);

    if (context.forecast) score += 2;
    else limitations.push("Forecast data is unavailable.");

    if (context.alerts) score += 1;

    if (intent === 'RAIN_FORECAST' || intent === 'TEMPERATURE_FORECAST') {
        if (!context.forecast) {
            score -= 3;
            reason = "Forecast is required to answer this question but is missing.";
        }
    }
    
    let confidence = "LIMITED";
    if (score >= 4) confidence = "HIGH";
    else if (score >= 2) confidence = "MODERATE";

    if (limitations.length > 0 && reason === "Data is sufficient for a reliable answer.") {
        reason = limitations.join(" ");
    }

    return {
        confidence,
        confidence_reason: reason,
        sources: [context.source || "OpenWeatherMap"],
        retrieved_at: context.retrieved_at,
        freshness,
        limitations
    };
};

module.exports = {
    determineConfidence
};
