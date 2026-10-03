/**
 * Forecast Change Intelligence
 * Deterministically analyzes shifts in weather prediction between snapshots.
 */

module.exports = {
    detectChange: (previousSnapshot, currentSnapshot) => {
        if (!previousSnapshot || !currentSnapshot) return null;

        const changes = [];
        
        // Temperature Shift
        if (Math.abs(previousSnapshot.temp - currentSnapshot.temp) >= 2) {
            changes.push({
                variable: "temperature",
                previous: previousSnapshot.temp,
                current: currentSnapshot.temp,
                diff: currentSnapshot.temp - previousSnapshot.temp,
                explanation: `Temperature forecast shifted by ${Math.abs(currentSnapshot.temp - previousSnapshot.temp)}°C.`
            });
        }

        // Precipitation Shift
        const prevPop = previousSnapshot.pop || 0;
        const currPop = currentSnapshot.pop || 0;
        
        if (Math.abs(prevPop - currPop) > 0.2) {
            changes.push({
                variable: "rain_probability",
                previous: prevPop * 100,
                current: currPop * 100,
                diff: (currPop - prevPop) * 100,
                explanation: `Rain probability changed significantly by ${Math.round(Math.abs(currPop - prevPop) * 100)} percentage points.`
            });
        }

        return changes;
    }
};
