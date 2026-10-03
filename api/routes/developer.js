/**
 * Developer Platform Routes
 * /api/v1/developer
 */

const express = require('express');
const router = express.Router();
const apiKeyService = require('../services/developer/apiKeyService');
const { requireOrganizationAccess } = require('../middleware/tenantIsolation');
const { successResponse, errorResponse } = require('../utils/response');

// Base tenant isolation for developer configuration
router.use(requireOrganizationAccess('MANAGE_API_KEYS'));

// Generate a new API Key
router.post('/keys', async (req, res, next) => {
    try {
        const orgId = req.tenantId; // attached by middleware
        const { name, scopes } = req.body;

        if (!name) return errorResponse(res, "VALIDATION", "API Key name is required.");

        const keyData = await apiKeyService.createKey(orgId, name, scopes || ['*']);
        
        return successResponse(res, keyData, "API Key generated successfully.");
    } catch (error) {
        next(error);
    }
});

// Create a Sandbox request to verify API keys works
router.post('/sandbox/test', async (req, res) => {
    return successResponse(res, {
        message: "Sandbox Request Successful",
        organization_context: req.tenantId,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
