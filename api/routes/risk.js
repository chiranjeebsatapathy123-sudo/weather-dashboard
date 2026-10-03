const express = require("express");
const { validateLocationQuery } = require("../middleware/validation");
const { successResponse } = require("../utils/response");
const { fetchCurrentWeather, fetchForecast } = require("../services/weatherService");
const { evaluateActivityRisk } = require("../services/risk/riskEngine");
const { findOptimalWindows } = require("../services/recommendation/weatherWindowService");
const { detectForecastChanges } = require("../services/prediction/predictionService");

const router = express.Router();

router.get("/dashboard", validateLocationQuery, async (req, res, next) => {
    try {
        const location = req.validatedLocation.city || req.validatedLocation;
        const current = await fetchCurrentWeather(location);
        const forecast = await fetchForecast(location);

        // Evaluate user's preferred activities
        const activities = ['Walking', 'Cycling', 'Photography'];
        const activityRisks = activities.map(act => evaluateActivityRisk(act, current));

        // Find optimal window for the primary activity (e.g. Walking)
        const optimalWindows = findOptimalWindows('Walking', forecast ? forecast.list : []);

        // Detect Forecast Changes
        const forecastChange = detectForecastChanges(location, forecast);

        const payload = {
            activityRisks,
            optimalWindows,
            forecastChange
        };

        return successResponse(res, payload, { source: 'riskEngine' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
