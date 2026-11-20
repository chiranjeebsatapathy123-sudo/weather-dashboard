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
                SELECT city, MAX(searched_at) AS "searchedAt" 
                FROM search_history 
                WHERE user_id = ${userId}
                GROUP BY city
                ORDER BY "searchedAt" DESC 
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

const CITY_COORDS_FALLBACK = {
    'new york': { lat: 40.7128, lon: -74.0060 },
    'london': { lat: 51.5074, lon: -0.1278 },
    'tokyo': { lat: 35.6762, lon: 139.6503 },
    'paris': { lat: 48.8566, lon: 2.3522 },
    'sydney': { lat: -33.8688, lon: 151.2093 }
};

router.get("/weather", validateLocationQuery, async (req, res, next) => {
    try {
        const location = req.validatedLocation.city || req.validatedLocation;
        
        // Resolve coords if we only have a city name
        let lat, lon;
        if (typeof location === 'string') {
            try {
                const current = await fetchCurrentWeather(location);
                if (current && current.coordinates) {
                    lat = current.coordinates.lat;
                    lon = current.coordinates.lon;
                }
            } catch (err) {
                const fallback = CITY_COORDS_FALLBACK[location.trim().toLowerCase()];
                if (fallback) {
                    lat = fallback.lat;
                    lon = fallback.lon;
                }
            }
        } else {
            lat = location.lat;
            lon = location.lon;
        }

        if (lat && lon) {
            const days = Math.min(30, Math.max(1, parseInt(req.query.days) || 7));
            const history = await fetchHistoricalWeather(lat, lon, days);
            return successResponse(res, history, { source: "open-meteo", days });
        }
        
        return successResponse(res, [], { source: "none", days: 0 });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
