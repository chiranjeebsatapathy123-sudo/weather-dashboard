/**
 * AI Grounding Service
 * Ensures LLM prompts are grounded in strict deterministic data contexts.
 */

function determineConfidence(data) {
    const ageMinutes = (new Date() - new Date(data.retrieved_at)) / 60000;
    if (ageMinutes < 30) return "HIGH";
    if (ageMinutes < 120) return "MODERATE";
    return "LIMITED";
}

module.exports = {
    generateContext: (weatherData, forecastData = null) => {
        if (!weatherData || !weatherData.location) {
            return { error: "Insufficient data to ground AI response." };
        }

        const context = {
            location: weatherData.location.name,
            timestamp: new Date().toISOString(),
            retrieved_at: weatherData.timestamp || new Date().toISOString(),
            source: weatherData.provider || "OpenWeatherMap",
            current: {
                temperature: weatherData.temperature,
                condition: weatherData.condition.description,
                wind_speed: weatherData.wind?.speed || 0,
                humidity: weatherData.humidity || 0
            }
        };

        if (forecastData) {
            context.forecast = {
                next_24h_rain_prob: forecastData.list?.[0]?.pop ? Math.round(forecastData.list[0].pop * 100) : 0,
                horizon: "5 days"
            };
        }

        context.confidence_status = determineConfidence(context);
        return context;
    }
};
