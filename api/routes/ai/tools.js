const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { successResponse, errorResponse } = require('../../utils/response');
const toolRegistry = require('../../services/ai/aiToolRegistry');

const router = express.Router();
router.use(requireAuth);

router.post('/', async (req, res, next) => {
    try {
        const tool = await toolRegistry.registerTool(req.body);
        return successResponse(res, tool);
    } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
    try {
        const tools = await toolRegistry.listAvailableTools();
        return successResponse(res, tools);
    } catch (e) { next(e); }
});

module.exports = router;
