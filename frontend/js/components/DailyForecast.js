export const DailyForecast = {
    render(list) {
        const dailyMap = new Map();
        
        list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!dailyMap.has(date)) {
                dailyMap.set(date, {
                    dt: item.dt,
                    min: item.temp_min,
                    max: item.temp_max,
                    icon: item.weather.icon,
                    desc: item.weather.description,
                    pop: item.pop
                });
            } else {
                const existing = dailyMap.get(date);
                existing.min = Math.min(existing.min, item.temp_min);
                existing.max = Math.max(existing.max, item.temp_max);
                existing.pop = Math.max(existing.pop, item.pop); // max rain probability for the day
            }
        });

        const dailyListEl = document.getElementById('dailyList');
        dailyListEl.innerHTML = '';
        
        const days = Array.from(dailyMap.values()).slice(0, 5);
        const today = new Date().toLocaleDateString();

        days.forEach(day => {
            const dateObj = new Date(day.dt * 1000);
            const dayStr = dateObj.toLocaleDateString() === today ? 'Today' : dateObj.toLocaleDateString([], {weekday: 'short'});
            
            const div = document.createElement('div');
            div.className = 'daily-item';
            
            // Accessible toggle for details panel (expandable)
            div.innerHTML = `
                <div class="daily-summary">
                    <span class="daily-day">${dayStr}</span>
                    <span class="daily-desc">${day.desc}</span>
                    <img class="daily-icon" src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.desc}">
                    <div class="daily-temps">
                        <span>${Math.round(day.max)}°</span>
                        <span>${Math.round(day.min)}°</span>
                    </div>
                </div>
                <div class="daily-details" style="display: none;">
                    <span>Rain Prob: ${Math.round(day.pop * 100)}%</span>
                </div>
            `;
            
            div.addEventListener('click', () => {
                const details = div.querySelector('.daily-details');
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
            });

            dailyListEl.appendChild(div);
        });
    }
};
