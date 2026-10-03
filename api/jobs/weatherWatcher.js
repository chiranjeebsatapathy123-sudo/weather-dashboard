/**
 * Weather Watcher Background Job
 * Simulates a serverless CRON or background worker that processes locations offline.
 */

const { evaluateSnapshot } = require('../services/eventEngine');
const { shouldNotify } = require('../services/alertPolicyEngine');
const { deliver } = require('../services/notificationProvider');
const { executeQuery } = require('../db/database');
const { fetchCurrentWeather } = require('../services/weatherService');

module.exports = {
    runJob: async () => {
        console.log(`[JOB] Starting WeatherWatcher job at ${new Date().toISOString()}`);
        
        let monitoredLocations = [];
        try {
            const result = await executeQuery(async (db) => {
                return await db`SELECT DISTINCT city FROM favorites`;
            });
            monitoredLocations = result.map(r => r.city);
        } catch (error) {
            console.error(`[JOB] Failed to fetch monitored locations:`, error.message);
            return;
        }
        
        if (monitoredLocations.length === 0) {
            console.log(`[JOB] No locations to monitor. Job completed.`);
            return;
        }

        for (const location of monitoredLocations) {
            try {
                // Fetch real weather data
                const weatherData = await fetchCurrentWeather(location);
                
                const snapshot = {
                    temperature: weatherData.temperature,
                    wind_speed: weatherData.wind.speed,
                    pop: weatherData.precipitation > 0 ? 1 : 0
                };
                
                const generatedEvents = await evaluateSnapshot(location, snapshot, null);

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
