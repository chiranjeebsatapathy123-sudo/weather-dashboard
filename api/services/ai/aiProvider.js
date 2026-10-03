/**
 * Abstraction for AI Provider (OpenAI, Anthropic, Gemini, etc.)
 * Currently implements a robust determinisic fallback that satisfies the Copilot structure
 * without requiring real API keys, adhering strictly to grounding rules.
 */
const generateResponse = async (context, prompt, intent) => {
    // In a real application, we would call an LLM here with the structured context and prompt.
    // e.g. return await openai.chat.completions.create({ messages: [...] });
    
    // Fallback generator mimicking an LLM's response strictly grounded in context:
    if (!context || !context.currentWeather) {
        return "I don't have enough weather data to answer that reliably.";
    }

    const { currentWeather, forecast, history } = context;
    const temp = Math.round(currentWeather.temperature);
    const desc = currentWeather.condition.description;
    const feelsLike = Math.round(currentWeather.feelsLike);

    if (intent === "RAIN_FORECAST") {
        if (!forecast) return "I cannot forecast rain right now as forecast data is unavailable.";
        const nextFewHours = forecast.list.slice(0, 4);
        const maxPop = Math.max(...nextFewHours.map(f => f.pop));
        if (maxPop > 0.5) return `🌧 Rain is likely. The forecast currently shows a ${Math.round(maxPop * 100)}% chance of precipitation in the coming hours.`;
        return `No significant rain is expected soon. Precipitation probability remains low (${Math.round(maxPop * 100)}%).`;
    }
    
    if (intent === "TEMPERATURE_FORECAST") {
        if (!forecast) return "I don't have forecast data to predict temperatures.";
        const temps = forecast.list.slice(0, 8).map(f => f.temp);
        const high = Math.round(Math.max(...temps));
        return `Temperatures will peak around ${high}°C today. It's currently ${temp}°C and feeling like ${feelsLike}°C.`;
    }

    if (intent === "OUTDOOR_ACTIVITY") {
        if (!forecast) return "I can't provide activity recommendations without a forecast.";
        return `Conditions are currently ${desc} at ${temp}°C. If you're planning outdoor activity, ensure you stay hydrated and check for upcoming precipitation.`;
    }

    if (intent === "HISTORICAL") {
        if (!history || history.length < 2) return "I don't have enough historical records for that comparison.";
        const yesterday = history[history.length - 1]; // closest to today
        return `Yesterday saw a high of ${Math.round(yesterday.tempHigh)}°C and a low of ${Math.round(yesterday.tempLow)}°C. Today's current temperature is ${temp}°C.`;
    }
    
    if (intent === "WEATHER_EXPLANATION") {
        return `(General Explanation) Humidity measures the amount of water vapor in the air. When humidity is high, sweat evaporates more slowly, making it feel hotter than the actual temperature of ${temp}°C.`;
    }

    if (intent === "SEVERE_WEATHER") {
        if (context.alerts && context.alerts.length > 0) {
            return `Yes, there are active alerts. ${context.alerts[0].title}: ${context.alerts[0].description}`;
        }
        return "There are currently no active severe weather alerts for this location.";
    }

    return `It is currently ${temp}°C and ${desc}.`;
};

module.exports = {
    generateResponse
};
