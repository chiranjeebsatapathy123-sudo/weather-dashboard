/**
 * Scheduling Assistant
 * Upgrades BestTime by finding candidate windows using factual weather constraints.
 */
class SchedulingAssistant {
    
    findCandidateWindows(taskDurationHours, timeWindowRange, weatherConstraints, forecastList) {
        const candidates = [];
        const { start, end } = timeWindowRange;

        // Factual scan over forecast list
        for (let i = 0; i < forecastList.length; i++) {
            const forecast = forecastList[i];
            const forecastTime = new Date(forecast.timestamp);

            if (forecastTime >= start && forecastTime <= end) {
                
                // Evaluate constraints
                let satisfies = true;
                const conflicts = [];
                
                if (weatherConstraints.max_rain && forecast.rain > weatherConstraints.max_rain) {
                    satisfies = false;
                    conflicts.push(`Rainfall (${forecast.rain}mm) exceeds max (${weatherConstraints.max_rain}mm)`);
                }
                
                if (weatherConstraints.max_wind && forecast.wind > weatherConstraints.max_wind) {
                    satisfies = false;
                    conflicts.push(`Wind (${forecast.wind}mph) exceeds max (${weatherConstraints.max_wind}mph)`);
                }

                if (satisfies) {
                    candidates.push({
                        window_start: forecastTime,
                        window_end: new Date(forecastTime.getTime() + (taskDurationHours * 3600000)),
                        weather_evidence: {
                            rain: forecast.rain,
                            wind: forecast.wind,
                            temp: forecast.temp
                        },
                        explanation: `Satisfies constraints based on currently available forecast data.`
                    });
                }
            }
        }

        return candidates;
    }
}

module.exports = new SchedulingAssistant();
