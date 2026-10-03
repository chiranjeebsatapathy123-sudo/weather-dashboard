const express = require("express");
const { successResponse, errorResponse } = require("../utils/response");
const { generateContext } = require("../services/groundingService");
const { detectIntent } = require("../services/ai/intentService");
const { generateResponse } = require("../services/ai/aiProvider");
const { fetchCurrentWeather, fetchForecast } = require("../services/weatherService");

const { determineConfidence } = require("../services/ai/confidenceService");

const router = express.Router();

router.post("/chat", async (req, res, next) => {
    try {
        const { locationId, message } = req.body;
        
        if (!locationId || !message || typeof message !== 'string') {
            return errorResponse(res, "INVALID_INPUT", "Location and message are required.", 400);
        }
        
        if (message.length > 500) {
            return errorResponse(res, "INVALID_INPUT", "Message too long.", 400);
        }

        // Fetch real weather data
        let currentWeather, forecast;
        try {
            currentWeather = await fetchCurrentWeather(locationId);
            forecast = await fetchForecast(locationId).catch(() => null);
        } catch (err) {
            return errorResponse(res, "DATA_UNAVAILABLE", "Insufficient verified weather data is available for this location.", 503);
        }

        // 1. Build Strict Grounding Context
        const contextData = generateContext(currentWeather, forecast);
        if (contextData.error) {
            return errorResponse(res, "DATA_UNAVAILABLE", contextData.error, 503);
        }

        // 2. Intent Detection
        const intent = detectIntent(message);

        // 3. Calculate Confidence (Rich)
        const confidenceMeta = determineConfidence(contextData, intent);

        // 4. Generate Grounded Response
        const answer = await generateResponse(contextData, message, intent);

        // 5. Structure Response
        const responseData = {
            answer,
            intent,
            confidenceLevel: confidenceMeta.confidence,
            confidenceReason: confidenceMeta.confidence_reason,
            sources: confidenceMeta.sources,
            dataFreshness: confidenceMeta.freshness,
            retrievedAt: confidenceMeta.retrieved_at,
            limitations: confidenceMeta.limitations
        };

        return successResponse(res, responseData, { ai: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
