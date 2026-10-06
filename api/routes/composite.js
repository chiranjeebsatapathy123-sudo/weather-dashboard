const express = require('express');
const { validateLocationQuery } = require('../middleware/validation');
const { optionalAuth } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/response');

// Import services directly to avoid internal HTTP calls
const { fetchCurrentWeather } = require('../services/weatherService');
// Assume we have other services, but for simplicity we will just make internal API calls or use the services
const forecastService = require('../services/forecastService');
const insightsService = require('../services/insightsService');
const alertsService = require('../services/alertsService');
const historyService = require('../services/historyService');
const riskService = require('../services/riskService');

const router = express.Router();

router.get('/dashboard', optionalAuth, validateLocationQuery, async (req, res, next) => {
    try {
        const location = req.validatedLocation.city || req.validatedLocation;
        
        // Execute all promises concurrently
        const [weather, forecast, insights, alerts, history, risk] = await Promise.allSettled([
            fetchCurrentWeather(location),
            forecastService?.fetchForecast ? forecastService.fetchForecast(location) : Promise.resolve(null),
            insightsService?.generateInsights ? insightsService.generateInsights(location) : Promise.resolve({ insights: [] }),
            alertsService?.fetchAlerts ? alertsService.fetchAlerts(location) : Promise.resolve([]),
            historyService?.fetchHistory ? historyService.fetchHistory(location) : Promise.resolve([]),
            riskService?.fetchRisk ? riskService.fetchRisk(location) : Promise.resolve(null)
        ]);
        
        if (weather.status === 'rejected') {
            throw weather.reason; // Weather is required
        }

        const data = {
            weather: weather.value,
            forecast: forecast.status === 'fulfilled' ? forecast.value : null,
            insights: insights.status === 'fulfilled' ? insights.value : { insights: [] },
            alerts: alerts.status === 'fulfilled' ? alerts.value : [],
            history: history.status === 'fulfilled' ? history.value : [],
            risk: risk.status === 'fulfilled' ? risk.value : null,
        };

        return successResponse(res, data, { source: "compositeService" });
    } catch (error) {
        if (error.status === 404) return errorResponse(res, "LOCATION_NOT_FOUND", "Location not found.", 404);
        next(error);
    }
});

module.exports = router;
