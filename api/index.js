const express = require('express');
const setupSecurity = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');
const apiCache = require('./middleware/cache');

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
v1Router.use('/weather', apiCache(600), weatherRoutes);
v1Router.use('/forecast', apiCache(600), forecastRoutes);
v1Router.use('/insights', apiCache(600), insightsRoutes);
v1Router.use('/ai', aiRoutes);
v1Router.use('/history', historyRoutes);
v1Router.use('/favorites', favoritesRoutes);
v1Router.use('/locations', locationsRoutes);
v1Router.use('/alerts', apiCache(300), alertsRoutes);
v1Router.use('/risk', apiCache(300), riskRoutes);
v1Router.use('/health', healthRoutes);
v1Router.use('/developer', developerRoutes);
v1Router.use('/devices', devicesRoutes);
v1Router.use('/intelligence', intelligenceRoutes);
v1Router.use('/operations', operationsRoutes);
v1Router.use('/ai-control-plane', aiControlPlaneRoutes);
v1Router.use('/platform', platformRoutes);

// Real-time Push Alerts (Server-Sent Events)
v1Router.get('/stream/alerts', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send initial ping
    res.write('data: {"message": "Connected to WeatherOS Real-time Alerts"}\n\n');
    
    // Simulate pushing a random critical alert periodically for demo
    const intervalId = setInterval(() => {
        const mockAlerts = [
            { event: "Lightning Strike Detected", desc: "A lightning strike was detected 5km from your location." },
            { event: "Air Quality Drop", desc: "AQI just dropped to 150 (Unhealthy)." },
            { event: "Precipitation Warning", desc: "Sudden rain expected in your area in 10 minutes." }
        ];
        const randomAlert = mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
        res.write(`data: ${JSON.stringify(randomAlert)}\n\n`);
    }, 45000); // every 45s
    
    req.on('close', () => {
        clearInterval(intervalId);
    });
});

app.use('/api/v1', v1Router);

// Fallback for older frontend calls during migration
app.use('/api', v1Router);

// Centralized Error Handler must be last
app.use(errorHandler);

// Export for Vercel and local server
module.exports = app;
