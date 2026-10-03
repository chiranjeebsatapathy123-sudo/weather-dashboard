const express = require("express");
const { executeQuery } = require("../db/database");
const { successResponse, errorResponse } = require("../utils/response");
const { validateLocationQuery } = require("../middleware/validation");

const router = express.Router();

// Get all saved locations for mock user
router.get("/", async (req, res, next) => {
    try {
        const locations = await executeQuery(async (db) => {
            return await db`SELECT * FROM favorites ORDER BY added_at DESC LIMIT 50`;
        });
        
        // Adapt schema for frontend component LocationList
        const normalized = locations.map(l => ({
            id: l.id,
            city: l.city,
            is_favorite: true
        }));
        
        return successResponse(res, normalized, { source: "database" });
    } catch (error) {
        next(error);
    }
});

// Compare multiple locations
router.post("/compare", async (req, res, next) => {
    try {
        const { cities } = req.body;
        if (!cities || !Array.isArray(cities) || cities.length < 2 || cities.length > 4) {
            return errorResponse(res, "INVALID_INPUT", "Please provide an array of 2 to 4 city names.", 400);
        }
        
        const { fetchCurrentWeather } = require("../services/weatherService");
        const results = [];
        
        for (const city of cities) {
            try {
                const data = await fetchCurrentWeather(city);
                results.push(data);
            } catch(e) {
                // Ignore missing cities during compare loop
            }
        }
        
        return successResponse(res, results, { source: "weatherService" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
