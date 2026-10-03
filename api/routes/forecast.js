const express = require("express");
const { fetchForecast } = require("../services/weatherService");
const { validateLocationQuery } = require("../middleware/validation");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

router.get("/", validateLocationQuery, async (req, res, next) => {
    try {
        const location = req.validatedLocation.city || req.validatedLocation;
        const data = await fetchForecast(location);
        return successResponse(res, data, { source: "weatherService" });
    } catch (error) {
        if (error.status === 404) {
            return errorResponse(res, "LOCATION_NOT_FOUND", "We couldn't find a forecast for that location.", 404);
        }
        if (error.status === 504) {
            return errorResponse(res, "PROVIDER_TIMEOUT", "Weather provider is not responding.", 504);
        }
        next(error);
    }
});

module.exports = router;
