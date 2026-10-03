const express = require("express");
const { validateLocationQuery } = require("../middleware/validation");
const { successResponse, errorResponse } = require("../utils/response");
const { fetchCurrentWeather, fetchForecast } = require("../services/weatherService");
const { generateSmartNotices, fetchProviderAlerts } = require("../services/alertService");

const router = express.Router();

router.get("/", validateLocationQuery, async (req, res, next) => {
    try {
        const location = req.validatedLocation.city || req.validatedLocation;
        
        // Fetch base data
        const current = await fetchCurrentWeather(location);
        const forecast = await fetchForecast(location);
        
        // Fetch Provider alerts (if any)
        let providerAlerts = [];
        if (current.coordinates && current.coordinates.lat) {
            providerAlerts = await fetchProviderAlerts(current.coordinates.lat, current.coordinates.lon);
        }

        // Generate Smart OS Notices
        const smartNotices = generateSmartNotices(current, forecast);
        
        // Combine
        const allAlerts = [...providerAlerts, ...smartNotices];

        return successResponse(res, allAlerts, { source: "alertService" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
