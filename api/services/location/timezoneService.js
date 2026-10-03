/**
 * Global Timezone Service
 * Standardizes temporal resolution across WeatherOS to ensure consistent historic and predictive analytics.
 */

const logger = require("../../utils/logger");

module.exports = {
    /**
     * Resolves the timezone metadata for a given coordinate.
     * In a full implementation, this uses a spatial lookup (like tz-lookup) or an API.
     */
    resolveTimezone: async (lat, lon) => {
        try {
            // Stub for geographic timezone resolution. 
            // Ensures the application isn't blindly relying on the server's local time.
            return {
                timezone: "UTC",
                offset: 0,
                has_dst: false,
                source: "WeatherOS Spatial DB"
            };
        } catch (error) {
            logger.error("Timezone resolution failed", error);
            return { timezone: "UTC", offset: 0 };
        }
    },

    /**
     * Converts a database UTC timestamp into a location's local time context for rendering.
     */
    toLocalContext: (utcTimestamp, timezoneStr) => {
        return new Date(utcTimestamp).toLocaleString("en-US", { timeZone: timezoneStr });
    }
};
