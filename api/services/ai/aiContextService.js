const { fetchCurrentWeather, fetchForecast } = require("../weatherService");
const { fetchHistoricalWeather } = require("../historyService");
const { fetchProviderAlerts } = require("../alertService");

/**
 * Gathers complete context for the AI Copilot.
 * Ensures the AI has strictly real, observed or forecasted data.
 */
const buildWeatherContext = async (locationStr) => {
    try {
        const current = await fetchCurrentWeather(locationStr);
        let forecast = null;
        let history = null;
        let alerts = [];

        if (current && current.coordinates) {
            forecast = await fetchForecast(locationStr).catch(() => null);
            history = await fetchHistoricalWeather(current.coordinates.lat, current.coordinates.lon).catch(() => null);
            alerts = await fetchProviderAlerts(current.coordinates.lat, current.coordinates.lon).catch(() => []);
        }

        const sources = [];
        if (current) sources.push("current_weather");
        if (forecast) sources.push("hourly_forecast", "daily_forecast");
        if (history && history.length > 0) sources.push("historical_summary");
        if (alerts && alerts.length > 0) sources.push("alerts");

        return {
            context: {
                location: current ? current.location : { name: locationStr },
                currentWeather: current || null,
                forecast: forecast || null,
                alerts: alerts || [],
                history: history || []
            },
            sources,
            dataFreshness: {
                updatedAt: new Date().toISOString()
            }
        };
    } catch (e) {
        return null;
    }
};

module.exports = {
    buildWeatherContext
};
