const express = require("express");
const { fetchCurrentWeather, recordSearch } = require("../services/weatherService");
const { validateLocationQuery } = require("../middleware/validation");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

router.get("/current", validateLocationQuery, async (req, res, next) => {
    try {
        const location = req.validatedLocation.city || req.validatedLocation;
        const data = await fetchCurrentWeather(location);
        
        // Save to search history asynchronously
        if (typeof location === 'string') recordSearch(data.location.name);

        return successResponse(res, data, { source: "weatherService" });
    } catch (error) {
        if (error.status === 404) {
            return errorResponse(res, "LOCATION_NOT_FOUND", "We couldn't find that location.", 404);
        }
        if (error.status === 504) {
            return errorResponse(res, "PROVIDER_TIMEOUT", "Weather provider is not responding.", 504);
        }
        // Pass to centralized error handler
        next(error);
    }
});

// Alias for old frontend compatibility during migration
router.get("/", validateLocationQuery, async (req, res, next) => {
    req.url = '/current';
    next('route'); 
});

module.exports = router;
