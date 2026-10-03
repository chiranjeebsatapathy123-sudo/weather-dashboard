const express = require("express");
const { getDb } = require("../db/database");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

router.get("/", async (req, res, next) => {
    return successResponse(res, {
        status: "ok",
        service: "weather-intelligence-api",
        version: "2.0.0"
    });
});

router.get("/live", (req, res) => {
    res.json({ status: "ok" });
});

router.get("/ready", async (req, res) => {
    let dbStatus = "ok";
    try {
        const sql = getDb();
        await sql`SELECT 1`;
    } catch (err) {
        dbStatus = "error";
    }

    res.json({
        status: dbStatus === "ok" ? "ok" : "error",
        services: {
            database: dbStatus,
            cache: "ok", // in-memory cache is always ok when process is up
            weatherProvider: "ok" // assume ok unless explicitly checking
        }
    });
});

module.exports = router;
