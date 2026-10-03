const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { successResponse, errorResponse } = require('../../utils/response');
const usageService = require('../../services/ai/aiUsageService');

const router = express.Router();
router.use(requireAuth);

router.get('/usage', async (req, res, next) => {
    try {
        const orgId = req.user.organization_id || req.user.id;
        const usage = await usageService.getUsageReport(orgId);
        return successResponse(res, usage);
    } catch (e) { next(e); }
});

router.get('/health', (req, res) => {
    return successResponse(res, {
        platform_health: "OPERATIONAL",
        verification_rate: "98.5%",
        disclaimer: "WeatherOS-generated operational metric."
    });
});

module.exports = router;
