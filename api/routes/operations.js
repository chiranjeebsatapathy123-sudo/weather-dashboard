const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/response');

// Services
const resourcePlanningService = require('../services/optimization/resourcePlanningService');
const logisticsIntelligenceService = require('../services/optimization/logisticsIntelligenceService');
const schedulingAssistant = require('../services/optimization/schedulingAssistant');
const resourceOptimizationService = require('../services/optimization/resourceOptimizationService');
const climateResilienceService = require('../services/resilience/climateResilienceService');
const continuityPlanner = require('../services/resilience/continuityPlanner');
const dependencyGraphService = require('../services/resilience/dependencyGraphService');

const router = express.Router();

router.use(requireAuth);

// ---------------------------------------------------------
// OPERATIONS
// ---------------------------------------------------------
router.get('/overview', (req, res) => {
    return successResponse(res, {
        status: "Operations & Resilience Platform Active",
        modules: ["RESOURCES", "LOGISTICS", "SCHEDULING", "RESILIENCE"]
    });
});

router.get('/timeline', (req, res) => {
    return successResponse(res, {
        timeline: [
            { time: "06:00", event: "Rain probability increases" },
            { time: "08:00", event: "Field task begins" }
        ]
    });
});

// ---------------------------------------------------------
// RESOURCES
// ---------------------------------------------------------
router.post('/resources', async (req, res, next) => {
    try {
        const resource = await resourcePlanningService.registerResource(req.user.organization_id || req.user.id, req.body);
        return successResponse(res, resource);
    } catch (e) { next(e); }
});

router.get('/resources/:id/availability', async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const availability = await resourcePlanningService.getResourceAvailability(req.params.id, start, end);
        return successResponse(res, availability);
    } catch (e) { next(e); }
});

router.post('/resources/exposure', (req, res) => {
    const { resource, currentWeather, forecast } = req.body;
    const exposure = resourcePlanningService.calculateWeatherExposure(resource, currentWeather, forecast);
    return successResponse(res, exposure);
});

// ---------------------------------------------------------
// LOGISTICS
// ---------------------------------------------------------
router.post('/logistics/routes/analyze', (req, res) => {
    const { routeData, weatherDataAlongRoute } = req.body;
    const profile = logisticsIntelligenceService.evaluateRouteWeatherProfile(routeData, weatherDataAlongRoute);
    return successResponse(res, profile);
});

router.post('/logistics/routes/compare', (req, res) => {
    const { analyzedRoutes } = req.body;
    const comparison = logisticsIntelligenceService.compareRoutes(analyzedRoutes);
    return successResponse(res, comparison);
});

// ---------------------------------------------------------
// SCHEDULING & OPTIMIZATION
// ---------------------------------------------------------
router.post('/scheduling/analyze', (req, res) => {
    const { taskDurationHours, timeWindowRange, weatherConstraints, forecastList } = req.body;
    const candidates = schedulingAssistant.findCandidateWindows(taskDurationHours, timeWindowRange, weatherConstraints, forecastList);
    return successResponse(res, candidates);
});

router.post('/optimization/pareto', (req, res) => {
    const { task, availableResources, explicitWeights } = req.body;
    const options = resourceOptimizationService.generateParetoOptions(task, availableResources, explicitWeights);
    return successResponse(res, options);
});

// ---------------------------------------------------------
// RESILIENCE
// ---------------------------------------------------------
router.post('/resilience/exposure', (req, res) => {
    const { asset, historicalBaseline, recentObservations, forecast, scenario } = req.body;
    const profile = climateResilienceService.generateExposureProfile(asset, historicalBaseline, recentObservations, forecast, scenario);
    return successResponse(res, profile);
});

router.post('/resilience/playbooks', async (req, res, next) => {
    try {
        const playbook = await continuityPlanner.createPlaybook(req.user.organization_id || req.user.id, req.body);
        return successResponse(res, playbook);
    } catch (e) { next(e); }
});

router.post('/resilience/cascade-simulation', async (req, res, next) => {
    try {
        const { triggerNodeId, scenarioName } = req.body;
        const sim = await dependencyGraphService.runCascadeSimulation(req.user.organization_id || req.user.id, triggerNodeId, scenarioName);
        return successResponse(res, sim);
    } catch (e) { next(e); }
});

module.exports = router;
