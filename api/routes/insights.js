const express = require("express");
const { fetchCurrentWeather } = require("../services/weatherService");
const { generateInsights } = require("../services/insightsService");
const { validateCityQuery } = require("../middleware/validation");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

router.get("/", validateCityQuery, async (req, res, next) => {
    try {
        const city = req.validatedCity;
        const weather = await fetchCurrentWeather(city);
        const { insights } = generateInsights(weather);
        return successResponse(res, { insights }, { count: insights.length });
    } catch (error) {
        if (error.status === 404) {
            return errorResponse(res, "LOCATION_NOT_FOUND", "Could not generate insights for unknown location.", 404);
        }
        next(error);
    }
});

module.exports = router;
