const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/response');

const twinSnapshotEngine = require('../services/digital_twin/twinSnapshotEngine');
const counterfactualSim = require('../services/simulation/counterfactualSimulationService');
const predictionLedger = require('../services/learning/predictionLedgerService');
const aiCalibration = require('../services/learning/aiCalibrationService');
const pluginManager = require('../services/platform/pluginManagerService');

const router = express.Router();
router.use(requireAuth);

// ---------------------------------------------------------
// DIGITAL TWIN 3.0
// ---------------------------------------------------------
router.post('/twin/snapshot', async (req, res, next) => {
    try {
        const orgId = req.user.organization_id || req.user.id;
        const workspaceId = req.body.workspace_id || null;
        const snapshot = await twinSnapshotEngine.captureSnapshot(orgId, workspaceId, req.body.type);
        return successResponse(res, snapshot);
    } catch (e) { next(e); }
});

router.get('/twin/time-travel', async (req, res, next) => {
    try {
        const orgId = req.user.organization_id || req.user.id;
        const snapshot = await twinSnapshotEngine.timeTravel(orgId, req.query.timestamp);
        return successResponse(res, snapshot);
    } catch (e) { next(e); }
});

// ---------------------------------------------------------
// SIMULATION & WHAT-IF
// ---------------------------------------------------------
router.post('/simulation/counterfactual', async (req, res, next) => {
    try {
        const orgId = req.user.organization_id || req.user.id;
        const { baselineSnapshotId, scenarioName, variables } = req.body;
        const result = await counterfactualSim.runSimulation(orgId, baselineSnapshotId, scenarioName, variables);
        return successResponse(res, result);
    } catch (e) { next(e); }
});

// ---------------------------------------------------------
// AI LEARNING & PREDICTION LEDGER
// ---------------------------------------------------------
router.post('/learning/ledger', async (req, res, next) => {
    try {
        const orgId = req.user.organization_id || req.user.id;
        const record = await predictionLedger.recordPrediction(orgId, req.body.decisionId, req.body.predictionData);
        return successResponse(res, record);
    } catch (e) { next(e); }
});

router.post('/learning/resolve/:id', async (req, res, next) => {
    try {
        const resolution = await predictionLedger.resolvePrediction(req.params.id, req.body.outcome);
        return successResponse(res, resolution);
    } catch (e) { next(e); }
});

router.get('/learning/calibration', (req, res) => {
    // Mock passing empty data to trigger the 'insufficient data' safety gate
    const calib = aiCalibration.evaluateCalibration([]);
    return successResponse(res, calib);
});

// ---------------------------------------------------------
// PLATFORM ECOSYSTEM
// ---------------------------------------------------------
router.post('/plugins', async (req, res, next) => {
    try {
        const plugin = await pluginManager.installPlugin(req.body);
        return successResponse(res, plugin);
    } catch (e) { next(e); }
});

module.exports = router;
