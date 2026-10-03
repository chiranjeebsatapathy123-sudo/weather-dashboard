export const BestTime = {
    render(current, forecast) {
        const bestTimeEl = document.getElementById('bestTimePanel');
        if (!bestTimeEl) return;
        
        if (!forecast || !forecast.list) {
            bestTimeEl.innerHTML = '<p>Best time calculation unavailable.</p>';
            return;
        }

        // Deterministic scoring logic: 
        // We want hours with low POP (rain), comfortable temps (15-25), low wind
        let bestScore = -999;
        let bestHour = null;

        const next12h = forecast.list.slice(0, 4); // 4 * 3h = 12h
        
        next12h.forEach(item => {
            let score = 100;
            // Penalty for rain
            score -= (item.pop * 100);
            
            // Penalty for extreme temps
            if (item.temp > 28) score -= (item.temp - 28) * 5;
            if (item.temp < 10) score -= (10 - item.temp) * 5;
            
            // Penalty for wind
            if (item.wind.speed > 8) score -= (item.wind.speed - 8) * 2;

            if (score > bestScore) {
                bestScore = score;
                bestHour = item;
            }
        });

        if (bestHour && bestScore > 50) {
            const timeStr = new Date(bestHour.dt * 1000).toLocaleTimeString([], {hour: '2-digit'});
            bestTimeEl.innerHTML = `
                <h4>Outdoor Activity</h4>
                <p class="best-window">Best window: <strong>${timeStr}</strong></p>
                <div class="best-reasons">
                    <span>${bestHour.pop === 0 ? '✓ No rain expected' : '⚠ Low rain probability'}</span>
                    <span>✓ Comfortable temp (${Math.round(bestHour.temp)}°C)</span>
                </div>
            `;
        } else {
            bestTimeEl.innerHTML = `
                <h4>Outdoor Activity</h4>
                <p>Conditions are generally poor for outdoor activities today.</p>
            `;
        }
    }
};
