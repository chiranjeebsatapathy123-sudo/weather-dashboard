/**
 * WeatherOS Baseline Models
 * Used to evaluate whether ML provides actual measurable lift.
 */

module.exports = {
    /**
     * Persistence Model: Tomorrow's weather equals today's weather.
     */
    persistenceForecast: (currentConditions, targetHorizonHours = 24) => {
        return {
            model: "persistence_baseline_v1",
            predicted_temp: currentConditions.temp,
            uncertainty_range: [currentConditions.temp - 2, currentConditions.temp + 2],
            confidence: "MODERATE",
            explanation: "Based on the persistence baseline (assuming conditions remain identical)."
        };
    },

    /**
     * Provider Baseline: Just passes through the external forecast.
     */
    providerBaseline: (providerForecast) => {
        return {
            model: "provider_baseline_v1",
            predicted_temp: providerForecast.temp,
            uncertainty_range: [providerForecast.temp_min, providerForecast.temp_max],
            confidence: "HIGH",
            explanation: "Sourced directly from the official weather provider."
        };
    }
};
