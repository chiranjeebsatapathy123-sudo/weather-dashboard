const express = require("express");
const { executeQuery } = require("../db/database");
const { successResponse } = require("../utils/response");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const history = await executeQuery(async (db) => {
            return await db`
                SELECT city, searched_at AS "searchedAt" 
                FROM search_history 
                WHERE user_id = ${userId}
                ORDER BY searched_at DESC 
                LIMIT 10
            `;
        });
        
        return successResponse(res, history, { count: history.length });
    } catch (error) {
        next(error);
    }
});

const { validateLocationQuery } = require("../middleware/validation");
const { fetchCurrentWeather } = require("../services/weatherService");
const { fetchHistoricalWeather } = require("../services/historyService");

router.get("/weather", validateLocationQuery, async (req, res, next) => {
    try {
        const location = req.validatedLocation.city || req.validatedLocation;
        
        // Resolve coords if we only have a city name
        let lat, lon;
        if (typeof location === 'string') {
            const current = await fetchCurrentWeather(location);
            if (current.coordinates) {
                lat = current.coordinates.lat;
                lon = current.coordinates.lon;
            }
        } else {
            lat = location.lat;
            lon = location.lon;
        }

        if (lat && lon) {
            const history = await fetchHistoricalWeather(lat, lon, 7);
            return successResponse(res, history, { source: "open-meteo" });
        }
        
        return successResponse(res, [], { source: "none" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
