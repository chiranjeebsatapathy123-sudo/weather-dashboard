const express = require("express");
const { fetchCurrentWeather, recordSearch } = require("../services/weatherService");
const { validateLocationQuery } = require("../middleware/validation");
const { successResponse, errorResponse } = require("../utils/response");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/current", optionalAuth, validateLocationQuery, async (req, res, next) => {
    try {
        const location = req.validatedLocation.city || req.validatedLocation;
        const data = await fetchCurrentWeather(location);
        
        // Save to search history asynchronously
        if (typeof location === 'string') recordSearch(data.location.name, req.user?.id);

        return successResponse(res, data, { source: "weatherService" });
    } catch (error) {
        if (error.status === 404) {
            return errorResponse(res, "LOCATION_NOT_FOUND", "We couldn't find that location.", 404);
        }
        if (error.status === 504 || error.status === 503) {
            return errorResponse(res, "DATA_UNAVAILABLE", "Weather provider is not responding or data is currently unavailable.", 503);
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
