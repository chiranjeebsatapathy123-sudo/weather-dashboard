export const CompareLocations = {
    async addCompareCity(api, city) {
        try {
            const data = await api.get(`/weather/current?city=${encodeURIComponent(city)}`);
            this.renderCard(data);
        } catch (e) {
            alert(`Could not fetch weather for ${city}`);
        }
    },
    
    renderCard(data) {
        const grid = document.getElementById('compareGrid');
        if (!grid || !data || !data.location) return;

        const cityName = data.location.name || 'Unknown';
        const existing = Array.from(grid.querySelectorAll('h3')).map(h => h.textContent.toLowerCase());
        if (existing.includes(cityName.toLowerCase())) {
            alert(`${cityName} is already in the comparison grid.`);
            return;
        }

        const temp = data.temperature !== null && data.temperature !== undefined ? `${Math.round(data.temperature)}°C` : '--';
        const feels = data.feelsLike !== null && data.feelsLike !== undefined ? `${Math.round(data.feelsLike)}°C` : '--';
        const humidity = data.humidity !== null && data.humidity !== undefined ? `${data.humidity}%` : '--';
        const windSpeed = data.wind && data.wind.speed !== null && data.wind.speed !== undefined ? `${Math.round(data.wind.speed * 3.6)} km/h` : '--';
        const rain = data.precipitation !== null && data.precipitation !== undefined ? `${data.precipitation} mm` : '0 mm';
        const icon = data.condition && data.condition.icon ? `https://openweathermap.org/img/wn/${data.condition.icon}@2x.png` : '';

        const col = document.createElement('div');
        col.className = 'compare-col';
        col.innerHTML = `
            <h3>${cityName}</h3>
            ${icon ? `<img src="${icon}" alt="${data.condition?.description || 'Weather'}" style="width:64px; align-self:center;">` : ''}
            <div class="compare-stat"><span>Temp</span> <span>${temp}</span></div>
            <div class="compare-stat"><span>Feels Like</span> <span>${feels}</span></div>
            <div class="compare-stat"><span>Humidity</span> <span>${humidity}</span></div>
            <div class="compare-stat"><span>Wind</span> <span>${windSpeed}</span></div>
            <div class="compare-stat"><span>Rain</span> <span>${rain}</span></div>
            <button class="nav-btn" style="width:auto; align-self:center; margin-top:10px; color:var(--danger)" onclick="this.parentElement.remove()">Remove</button>
        `;
        grid.appendChild(col);
    }
};
