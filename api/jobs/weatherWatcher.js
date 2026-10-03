/**
 * Weather Watcher Background Job
 * Simulates a serverless CRON or background worker that processes locations offline.
 */

const { evaluateSnapshot } = require('../services/eventEngine');
const { shouldNotify } = require('../services/alertPolicyEngine');
const { deliver } = require('../services/notificationProvider');

// Mocked DB of locations to monitor
const monitoredLocations = ['New York', 'London', 'Tokyo'];

// Mock function for weather provider fetch
async function fetchLatestSnapshot(location) {
    // In production, this calls weatherService.js
    // For architecture mock, return synthetic data
    return { pop: Math.random() }; // Random rain probability
}

module.exports = {
    runJob: async () => {
        console.log(`[JOB] Starting WeatherWatcher job at ${new Date().toISOString()}`);
        
        for (const location of monitoredLocations) {
            try {
                const snapshot = await fetchLatestSnapshot(location);
                const generatedEvents = evaluateSnapshot(location, snapshot, null);

                for (const event of generatedEvents) {
                    if (event.status === 'DETECTED' || event.status === 'RESOLVED') {
                        const policyDecision = shouldNotify(event, { quietHours: { enabled: false }});
                        
                        if (policyDecision.notify) {
                            await deliver(event, ['IN_APP']);
                            console.log(`[JOB] Notification delivered for ${event.event_id} (${event.status})`);
                        } else {
                            console.log(`[JOB] Notification suppressed: ${policyDecision.reason}`);
                        }
                    }
                }
            } catch (error) {
                console.error(`[JOB] Failed to process location ${location}:`, error.message);
            }
        }
        console.log(`[JOB] WeatherWatcher job completed.`);
    }
};
