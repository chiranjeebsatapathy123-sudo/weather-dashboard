/**
 * Detects the intent of the user's weather question.
 * Replaces hardcoded string matches with intent classification.
 */
const detectIntent = (message) => {
    if (!message) return 'UNKNOWN';
    
    const text = message.toLowerCase();
    
    if (text.includes("compare")) return "COMPARISON";
    if (text.includes("rain") || text.includes("umbrella") || text.includes("snow") || text.includes("precip")) return "RAIN_FORECAST";
    if (text.includes("hot") || text.includes("cold") || text.includes("temperature") || text.includes("warm")) return "TEMPERATURE_FORECAST";
    if (text.includes("wind") || text.includes("breeze") || text.includes("gale")) return "WIND";
    if (text.includes("air quality") || text.includes("aqi") || text.includes("pollution") || text.includes("smog")) return "AIR_QUALITY";
    if (text.includes("uv") || text.includes("sun") || text.includes("burn")) return "UV";
    if (text.includes("severe") || text.includes("alert") || text.includes("warning") || text.includes("danger")) return "SEVERE_WEATHER";
    if (text.includes("travel") || text.includes("drive") || text.includes("flight")) return "TRAVEL";
    if (text.includes("outside") || text.includes("run") || text.includes("walk") || text.includes("picnic") || text.includes("activity")) return "OUTDOOR_ACTIVITY";
    if (text.includes("wear") || text.includes("clothes") || text.includes("jacket")) return "CLOTHING";
    if (text.includes("change") || text.includes("yesterday") || text.includes("past") || text.includes("history")) return "HISTORICAL";
    if (text.includes("why") || text.includes("explain") || text.includes("mean")) return "WEATHER_EXPLANATION";
    if (text.includes("now") || text.includes("current") || text.includes("happening")) return "CURRENT_WEATHER";
    
    return "GENERAL_WEATHER";
};

module.exports = {
    detectIntent
};
