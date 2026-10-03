const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { successResponse, errorResponse } = require('../../utils/response');
const aiOrchestrator = require('../../services/ai/aiOrchestrator');
const memoryService = require('../../services/ai/aiMemoryService');

const router = express.Router();
router.use(requireAuth);

router.post('/query', async (req, res, next) => {
    try {
        const orgId = req.user.organization_id || req.user.id;
        const workspaceId = req.body.workspace_id || null;
        const taskStr = req.body.query;

        // Fetch context
        const context = await memoryService.getMemoryContext(orgId, workspaceId);

        // Run Orchestrator
        const result = await aiOrchestrator.processRequest(orgId, workspaceId, req.user.id, taskStr, context);
        
        return successResponse(res, result);
    } catch (e) { next(e); }
});

module.exports = router;
