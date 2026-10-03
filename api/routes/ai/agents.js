const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { successResponse, errorResponse } = require('../../utils/response');
const agentRegistry = require('../../services/ai/agentRegistryService');

const router = express.Router();
router.use(requireAuth);

router.post('/', async (req, res, next) => {
    try {
        const agent = await agentRegistry.registerAgent(req.body);
        return successResponse(res, agent);
    } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
    try {
        const agents = await agentRegistry.getAgentConfigs();
        return successResponse(res, agents);
    } catch (e) { next(e); }
});

module.exports = router;
