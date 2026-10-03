const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/response');

// Services
const evidenceService = require('../services/intelligence/evidenceService');
const decisionIntelligenceService = require('../services/intelligence/decisionIntelligenceService');
const forecastAgreementService = require('../services/intelligence/forecastAgreementService');
const scenarioEngine = require('../services/intelligence/scenarioEngine');
const modelPerformanceService = require('../services/intelligence/modelPerformanceService');
const decisionFeedbackService = require('../services/intelligence/decisionFeedbackService');

const router = express.Router();

router.use(requireAuth);

router.get('/overview', (req, res) => {
    return successResponse(res, {
        status: "Decision Intelligence Engine Active",
        modules: ["EVIDENCE", "SCENARIOS", "MODELS", "DECISIONS"]
    });
});

router.get('/evidence/:contextId', async (req, res, next) => {
    try {
        const evidence = await evidenceService.getEvidenceForContext(req.params.contextId);
        return successResponse(res, evidence);
    } catch (e) { next(e); }
});

router.get('/options/:contextId', async (req, res, next) => {
    try {
        // Generating options dynamically based on context would typically take a situation payload.
        // Here we just use a mocked situation for the route abstraction.
        const options = await decisionIntelligenceService.generateOptions(req.params.contextId, "Default Situation");
        return successResponse(res, options);
    } catch (e) { next(e); }
});

router.post('/scenarios', async (req, res, next) => {
    try {
        const { name, type, parameters } = req.body;
        const scenario = await scenarioEngine.createScenario(
            req.user.organization_id || req.user.id, 
            req.user.id, 
            name, type, parameters
        );
        return successResponse(res, scenario);
    } catch (e) {
        if (e.message.includes("cannot exceed")) return errorResponse(res, "BAD_REQUEST", e.message, 400);
        next(e);
    }
});

router.get('/scenarios/:id/run', async (req, res, next) => {
    try {
        const sim = await scenarioEngine.runSimulation(req.params.id, req.user.organization_id || req.user.id);
        return successResponse(res, sim);
    } catch (e) { next(e); }
});

router.post('/forecast-agreement', (req, res) => {
    const { metric, predictions } = req.body;
    const agreement = forecastAgreementService.evaluateAgreement(metric, predictions);
    return successResponse(res, agreement);
});

router.get('/model-performance/:modelId', async (req, res, next) => {
    try {
        const model = await modelPerformanceService.getModelPerformance(req.params.modelId);
        if (!model) return errorResponse(res, "NOT_FOUND", "Model not found", 404);
        return successResponse(res, model);
    } catch (e) { next(e); }
});

router.post('/decisions', async (req, res, next) => {
    try {
        const { contextId, optionId, reason, notes } = req.body;
        const record = await decisionIntelligenceService.recordHumanDecision(
            contextId, 
            req.user.organization_id || req.user.id, 
            req.user.id, 
            optionId, reason, notes
        );
        return successResponse(res, record);
    } catch (e) { next(e); }
});

router.post('/outcomes', async (req, res, next) => {
    try {
        const { decisionRecordId, actualOutcome, evaluationText } = req.body;
        const outcome = await decisionFeedbackService.recordOutcome(
            decisionRecordId, req.user.id, actualOutcome, evaluationText
        );
        return successResponse(res, outcome);
    } catch (e) { next(e); }
});

module.exports = router;
