const express = require('express');
const setupSecurity = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');

const weatherRoutes = require('./routes/weather');
const historyRoutes = require('./routes/history');
const favoritesRoutes = require('./routes/favorites');
const healthRoutes = require('./routes/health');
const forecastRoutes = require('./routes/forecast');
const insightsRoutes = require('./routes/insights');
const aiRoutes = require('./routes/ai');
const locationsRoutes = require('./routes/locations');
const alertsRoutes = require('./routes/alerts');
const riskRoutes = require('./routes/risk');
const developerRoutes = require('./routes/developer');
const devicesRoutes = require('./routes/devices');
const intelligenceRoutes = require('./routes/intelligence');
const operationsRoutes = require('./routes/operations');
const aiControlPlaneRoutes = require('./routes/ai/index');
const platformRoutes = require('./routes/platform');

const app = express();

// Middleware
setupSecurity(app);
app.use(express.json({ limit: '10kb' })); // Limit body size for security

// Apply rate limiter to all API routes
app.use('/api', apiLimiter);

// V1 Routes
const v1Router = express.Router();
v1Router.use('/weather', weatherRoutes);
v1Router.use('/forecast', forecastRoutes);
v1Router.use('/insights', insightsRoutes);
v1Router.use('/ai', aiRoutes);
v1Router.use('/history', historyRoutes);
v1Router.use('/favorites', favoritesRoutes);
v1Router.use('/locations', locationsRoutes);
v1Router.use('/alerts', alertsRoutes);
v1Router.use('/risk', riskRoutes);
v1Router.use('/health', healthRoutes);
v1Router.use('/developer', developerRoutes);
v1Router.use('/devices', devicesRoutes);
v1Router.use('/intelligence', intelligenceRoutes);
v1Router.use('/operations', operationsRoutes);
v1Router.use('/ai-control-plane', aiControlPlaneRoutes);
v1Router.use('/platform', platformRoutes);

app.use('/api/v1', v1Router);

// Fallback for older frontend calls during migration
app.use('/api', v1Router);

// Centralized Error Handler must be last
app.use(errorHandler);

// Export for Vercel and local server
module.exports = app;
