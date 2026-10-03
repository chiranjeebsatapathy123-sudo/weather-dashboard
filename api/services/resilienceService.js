/**
 * Resilience Service
 * Actively tracks external dependencies and enforces degraded modes during outages.
 */

const logger = require("../utils/logger");

const dependencies = {
    DATABASE: { status: 'OPERATIONAL', last_check: Date.now() },
    WEATHER_API: { status: 'OPERATIONAL', last_check: Date.now() },
    AI_PROVIDER: { status: 'OPERATIONAL', last_check: Date.now() }
};

module.exports = {
    /**
     * Updates the health status of a core platform dependency.
     */
    reportDependencyHealth: (dependencyName, isHealthy) => {
        if (dependencies[dependencyName]) {
            const previousStatus = dependencies[dependencyName].status;
            const newStatus = isHealthy ? 'OPERATIONAL' : 'OUTAGE';
            
            if (previousStatus !== newStatus) {
                logger.warn(`Resilience Engine: Dependency [${dependencyName}] changed from ${previousStatus} to ${newStatus}`);
                dependencies[dependencyName].status = newStatus;
            }
            dependencies[dependencyName].last_check = Date.now();
        }
    },

    /**
     * Checks if a dependency is available. Used to trigger fallback logic in controllers.
     */
    isAvailable: (dependencyName) => {
        const dep = dependencies[dependencyName];
        if (!dep) return false;
        return dep.status === 'OPERATIONAL';
    },

    /**
     * Returns the global system health dashboard.
     */
    getSystemStatus: () => {
        let allHealthy = true;
        for (const key of Object.keys(dependencies)) {
            if (dependencies[key].status !== 'OPERATIONAL') {
                allHealthy = false;
            }
        }

        return {
            platform_status: allHealthy ? 'ALL_SYSTEMS_NOMINAL' : 'DEGRADED_PERFORMANCE',
            dependencies: dependencies
        };
    }
};
