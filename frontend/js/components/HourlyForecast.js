let hourlyChartInstance = null;

export const HourlyForecast = {
    render(forecastList, currentData) {
        const ctx = document.getElementById('hourlyChart').getContext('2d');
        const timelineEl = document.getElementById('hourlyTimeline');
        if (timelineEl) timelineEl.innerHTML = '';
        
        const labels = [];
        const temps = [];
        const pops = [];
        
        forecastList.forEach((item, index) => {
            const dateObj = new Date(item.dt * 1000);
            const timeStr = index === 0 ? 'NOW' : dateObj.toLocaleTimeString([], {hour: '2-digit'});
            labels.push(timeStr);
            temps.push(Math.round(item.temp));
            pops.push(Math.round(item.pop * 100)); // Probability of Precipitation

            if (timelineEl) {
                const div = document.createElement('div');
                div.className = `hourly-item ${index === 0 ? 'current' : ''}`;
                div.innerHTML = `
                    <span class="time">${timeStr}</span>
                    <img src="https://openweathermap.org/img/wn/${item.weather.icon}.png" alt="icon">
                    <span class="temp">${Math.round(item.temp)}°</span>
                    <span class="pop"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> ${Math.round(item.pop * 100)}%</span>
                `;
                timelineEl.appendChild(div);
            }
        });

        const isDark = document.body.getAttribute('data-theme') !== 'light';
        const textColor = isDark ? '#f8fafc' : '#0f172a';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

        if (hourlyChartInstance) {
            hourlyChartInstance.destroy();
        }

        hourlyChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temps,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#3b82f6',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: textColor } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 2 } }
                }
            }
        });
        
        window.addEventListener('resize', () => {
             if(hourlyChartInstance) hourlyChartInstance.resize();
        });
    }
};
