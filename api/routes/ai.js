const express = require("express");
const { successResponse, errorResponse } = require("../utils/response");
const { generateContext } = require("../services/groundingService");
const { detectIntent } = require("../services/ai/intentService");
const { generateResponse } = require("../services/ai/aiProvider");

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

        // Fake fetching raw weather data since we are in route layer
        // Normally this would call weatherService.js
        const mockRawWeather = {
            location: { name: locationId },
            temperature: 22,
            condition: { description: "clear sky" },
            timestamp: new Date().toISOString()
        };

        // 1. Build Strict Grounding Context
        const contextData = generateContext(mockRawWeather);
        if (contextData.error) {
            return errorResponse(res, "DATA_UNAVAILABLE", contextData.error, 503);
        }

        // 2. Intent Detection
        const intent = detectIntent(message);

        // 3. Generate Grounded Response
        const answer = await generateResponse(contextData, message, intent);

        // 4. Calculate Confidence (directly from grounding)
        const confidenceLevel = contextData.confidence_status;

        // 5. Structure Response
        const responseData = {
            answer,
            intent,
            confidenceLevel,
            sources: contextData.sources,
            dataFreshness: contextData.dataFreshness
        };

        // Artificial delay for Copilot feel
        setTimeout(() => {
            return successResponse(res, responseData, { ai: true });
        }, 500);

    } catch (error) {
        next(error);
    }
});

module.exports = router;
