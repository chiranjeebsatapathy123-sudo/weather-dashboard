const express = require("express");
const { executeQuery } = require("../db/database");
const { successResponse, errorResponse } = require("../utils/response");
const { validateCityQuery } = require("../middleware/validation");

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const favorites = await executeQuery(async (db) => {
            return await db`
                SELECT city, added_at AS "addedAt" 
                FROM favorites 
                ORDER BY added_at DESC
            `;
        });
        return successResponse(res, favorites, { count: favorites.length });
    } catch (error) {
        next(error);
    }
});

router.post("/", validateCityQuery, async (req, res, next) => {
    try {
        const city = req.validatedCity;
        
        const existing = await executeQuery(async (db) => {
            return await db`SELECT city FROM favorites WHERE LOWER(city) = LOWER(${city})`;
        });
        
        if (existing.length > 0) {
            return errorResponse(res, "ALREADY_EXISTS", "City is already in favorites.", 400);
        }

        const favorite = await executeQuery(async (db) => {
            return await db`
                INSERT INTO favorites (city) 
                VALUES (${city}) 
                RETURNING city, added_at AS "addedAt"
            `;
        });
        
        return successResponse(res, favorite[0], {}, 201);
    } catch (error) {
        next(error);
    }
});

router.delete("/:city", async (req, res, next) => {
    try {
        const city = req.params.city;
        await executeQuery(async (db) => {
            await db`DELETE FROM favorites WHERE LOWER(city) = LOWER(${city})`;
        });
        return successResponse(res, { message: "Favorite removed" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
