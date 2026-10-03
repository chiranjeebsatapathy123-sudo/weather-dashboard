const express = require("express");
const { fetchCurrentWeather } = require("../services/weatherService");
const { validateCityQuery } = require("../middleware/validation");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

router.get("/", validateCityQuery, async (req, res, next) => {
    try {
        const city = req.validatedCity;
        const weather = await fetchCurrentWeather(city);
        
        const insights = [];

        if (weather.temperature > 30) {
            insights.push({ type: 'warning', text: 'High temperature alert. Stay hydrated.' });
        } else if (weather.temperature < 5) {
            insights.push({ type: 'info', text: 'Freezing temperatures. Dress warmly.' });
        }

        if (weather.humidity > 85) {
            insights.push({ type: 'warning', text: 'High humidity expected.' });
        }

        if (weather.wind.speed > 10) {
            insights.push({ type: 'warning', text: 'Strong winds detected.' });
        }
        
        if (weather.precipitation > 0 || [2,3,5].includes(Math.floor(weather.condition.code / 100))) {
            insights.push({ type: 'warning', text: 'Precipitation is active. Carry an umbrella.' });
        }

        if (insights.length === 0) {
            insights.push({ type: 'success', text: 'Conditions are generally stable today.' });
        }

        return successResponse(res, { insights }, { count: insights.length });
    } catch (error) {
        if (error.status === 404) {
            return errorResponse(res, "LOCATION_NOT_FOUND", "Could not generate insights for unknown location.", 404);
        }
        next(error);
    }
});

module.exports = router;
