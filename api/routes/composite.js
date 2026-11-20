const express = require('express');
const { validateLocationQuery } = require('../middleware/validation');
const { optionalAuth } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/response');

const { fetchCurrentWeather, fetchForecast } = require('../services/weatherService');
const { generateInsights } = require('../services/insightsService');
const { generateSmartNotices, fetchProviderAlerts } = require('../services/alertService');
const { fetchHistoricalWeather } = require('../services/historyService');
const { evaluateActivityRisk } = require('../services/risk/riskEngine');
const { findOptimalWindows } = require('../services/recommendation/weatherWindowService');
const { detectForecastChanges } = require('../services/prediction/predictionService');

const router = express.Router();

router.get('/dashboard', optionalAuth, validateLocationQuery, async (req, res, next) => {
    try {
        const location = req.validatedLocation.city || req.validatedLocation;
        
        // 1. Fetch base weather & forecast concurrently
        const [weatherResult, forecastResult] = await Promise.allSettled([
            fetchCurrentWeather(location),
            fetchForecast(location)
        ]);

        if (weatherResult.status === 'rejected') {
            throw weatherResult.reason;
        }

        const weather = weatherResult.value;
        const forecast = forecastResult.status === 'fulfilled' ? forecastResult.value : null;

        // 2. Fetch/compute derived data: alerts, history concurrently
        const lat = weather.coordinates?.lat || (typeof location === 'object' ? location.lat : null);
        const lon = weather.coordinates?.lon || (typeof location === 'object' ? location.lon : null);

        const [alertsResult, historyResult] = await Promise.allSettled([
            (async () => {
                let providerAlerts = [];
                if (lat && lon) {
                    providerAlerts = await fetchProviderAlerts(lat, lon).catch(() => []);
                }
                const smartNotices = generateSmartNotices(weather, forecast);
                return [...providerAlerts, ...smartNotices];
            })(),
            (async () => {
                if (lat && lon) {
                    return await fetchHistoricalWeather(lat, lon, 7);
                }
                return [];
            })()
        ]);

        const insights = generateInsights(weather);

        // Risk computation
        const activities = ['Walking', 'Cycling', 'Photography'];
        const activityRisks = activities.map(act => evaluateActivityRisk(act, weather));
        const optimalWindows = findOptimalWindows('Walking', forecast ? forecast.list : []);
        const forecastChange = detectForecastChanges(location, forecast);

        const risk = {
            activityRisks,
            optimalWindows,
            forecastChange
        };

        const data = {
            weather,
            forecast,
            insights: insights.insights,
            alerts: alertsResult.status === 'fulfilled' ? alertsResult.value : [],
            history: historyResult.status === 'fulfilled' ? historyResult.value : [],
            risk
        };

        // Save to search history asynchronously
        if (weather?.location?.name) {
            const { recordSearch } = require('../services/weatherService');
            recordSearch(weather.location.name, req.user?.id);
        }

        return successResponse(res, data, { source: "compositeService" });
    } catch (error) {
        if (error.status === 404) return errorResponse(res, "LOCATION_NOT_FOUND", "Location not found.", 404);
        next(error);
    }
});

module.exports = router;
