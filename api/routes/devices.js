const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { errorResponse, successResponse } = require('../utils/response');
const telemetryService = require('../services/telemetryService');
const edgeGatewayService = require('../services/edgeGatewayService');

const router = express.Router();

router.use(requireAuth);

router.post('/:id/telemetry', async (req, res, next) => {
    try {
        const deviceId = req.params.id;
        const payload = req.body;
        
        // Ensure device belongs to user's org (abstracted here, in a real system we'd verify the device ownership)
        const result = await telemetryService.ingestTelemetry(deviceId, payload);
        
        return successResponse(res, result, { message: "Telemetry ingested." });
    } catch (error) {
        if (error.message.includes('Invalid payload')) {
            return errorResponse(res, 'BAD_REQUEST', error.message, 400);
        }
        next(error);
    }
});

router.post('/gateway/:id/telemetry/batch', async (req, res, next) => {
    try {
        const gatewayId = req.params.id;
        const batch = req.body.telemetryBatch; // Expecting an array
        
        if (!Array.isArray(batch)) {
            return errorResponse(res, 'BAD_REQUEST', 'telemetryBatch must be an array.', 400);
        }
        
        const result = await edgeGatewayService.processBatchUpload(gatewayId, batch);
        return successResponse(res, result, { message: "Batch processed." });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
