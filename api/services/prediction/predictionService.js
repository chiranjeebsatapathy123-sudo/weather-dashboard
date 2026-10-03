/**
 * Detects trends and changes in forecasts by comparing new data 
 * against previously cached "snapshots".
 * Simulated for Phase 6 since we use in-memory snapshot comparison for now.
 */
let memorySnapshots = {};

const detectForecastChanges = (city, newForecast) => {
    if (!newForecast || !newForecast.list) return null;
    
    const key = city.toLowerCase();
    const prev = memorySnapshots[key];
    
    // Save current as snapshot for next time
    memorySnapshots[key] = newForecast.list[0];

    if (!prev) return null; // No previous snapshot to compare
    
    const curr = newForecast.list[0];
    const changes = [];

    // Compare POP
    if (Math.abs(curr.pop - prev.pop) > 0.2) {
        changes.push(`Rain probability changed from ${Math.round(prev.pop*100)}% to ${Math.round(curr.pop*100)}%.`);
    }

    // Compare Temp
    if (Math.abs(curr.temp - prev.temp) > 3) {
        changes.push(`Temperature forecast changed from ${Math.round(prev.temp)}°C to ${Math.round(curr.temp)}°C.`);
    }

    if (changes.length > 0) {
        return {
            detected: true,
            summary: "WeatherOS detected a significant forecast change.",
            details: changes
        };
    }

    return null;
};

module.exports = {
    detectForecastChanges
};
