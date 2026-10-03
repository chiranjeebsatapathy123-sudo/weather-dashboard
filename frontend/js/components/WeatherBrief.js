export const WeatherBrief = {
    render(weatherData, forecastData, riskData) {
        const container = document.getElementById('weatherBriefContent');
        if (!container || !weatherData) return;

        let briefHtml = `
            <div style="margin-bottom: 16px;">
                <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin-bottom: 8px;">Good Morning</h3>
                <div style="font-size: 15px; font-weight: 500;">
                    Expect ${weatherData.condition.description} with a high of ${Math.round(weatherData.tempHigh || weatherData.temperature)}°C today.
                </div>
            </div>
        `;

        // Identify key changes
        if (riskData && riskData.forecastChange) {
            briefHtml += `
            <div style="margin-bottom: 16px; border-left: 2px solid var(--accent, #3b82f6); padding-left: 12px;">
                <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin-bottom: 4px;">Key Changes</h3>
                <div style="font-size: 14px;">${riskData.forecastChange.explanation || 'Conditions are stable.'}</div>
            </div>
            `;
        }

        // Add wind or other significant factors
        if (weatherData.wind && weatherData.wind.speed > 20) {
            briefHtml += `
            <div style="margin-bottom: 16px; border-left: 2px solid var(--warning, #f59e0b); padding-left: 12px;">
                <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin-bottom: 4px;">Wind</h3>
                <div style="font-size: 14px;">Elevated winds at ${weatherData.wind.speed} km/h. Outdoor activities may be impacted.</div>
            </div>
            `;
        } else {
             briefHtml += `
            <div style="margin-bottom: 16px; border-left: 2px solid var(--success, #10b981); padding-left: 12px;">
                <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin-bottom: 4px;">Wind</h3>
                <div style="font-size: 14px;">Calm winds at ${weatherData.wind.speed} km/h.</div>
            </div>
            `;
        }

        // Add optimal windows from riskData
        if (riskData && riskData.optimalWindows && riskData.optimalWindows.length > 0) {
            const best = riskData.optimalWindows.filter(w => w.riskLevel === 'LOW').slice(0, 2);
            if (best.length > 0) {
                const windowStrings = best.map(w => {
                    const t = new Date(w.time);
                    return `${t.getHours().toString().padStart(2, '0')}:00`;
                }).join(' and ');
                
                briefHtml += `
                <div style="margin-top: 16px;">
                    <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin-bottom: 4px;">Best Windows</h3>
                    <div style="font-size: 14px;">Optimal conditions around ${windowStrings}.</div>
                </div>
                `;
            }
        }

        container.innerHTML = briefHtml;
    }
};
