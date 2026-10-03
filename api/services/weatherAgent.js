/**
 * Weather Agent Architecture
 * Controlled autonomy for the AI Assistant. It can only execute registered, deterministic tools.
 */

const { getActiveEvents } = require('./eventEngine');

// Safe, registered tools the Agent can call
const tools = {
    getWeatherEvents: () => {
        const events = getActiveEvents();
        if (events.length === 0) return "No active weather events detected.";
        return events.map(e => `${e.location}: ${e.event_type} (${e.status}) - ${e.explanation}`).join(" | ");
    }
};

module.exports = {
    executeAgent: (intent, userPreferences) => {
        try {
            switch (intent) {
                case 'CHECK_EVENTS':
                    return tools.getWeatherEvents();
                case 'SUMMARIZE_LOCATIONS':
                    return "Summary of monitored locations requires integration with multi-location snapshot store.";
                default:
                    return "Intent not mapped to an active WeatherAgent tool.";
            }
        } catch (error) {
            return "Agent tool execution failed.";
        }
    }
};
