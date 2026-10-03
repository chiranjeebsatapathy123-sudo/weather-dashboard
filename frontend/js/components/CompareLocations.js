export const CompareLocations = {
    async addCompareCity(api, city) {
        try {
            const data = await api.get(`/weather/current?city=${encodeURIComponent(city)}`);
            this.renderCard(data);
        } catch(e) {
            alert(`Could not fetch weather for ${city}`);
        }
    },
    
    renderCard(data) {
        const grid = document.getElementById('compareGrid');
        const col = document.createElement('div');
        col.className = 'compare-col';
        col.innerHTML = `
            <h3>${data.location.name}</h3>
            <img src="https://openweathermap.org/img/wn/${data.condition.icon}@2x.png" style="width:64px; align-self:center;">
            <div class="compare-stat"><span>Temp</span> <span>${Math.round(data.temperature)}°C</span></div>
            <div class="compare-stat"><span>Feels Like</span> <span>${Math.round(data.feelsLike)}°C</span></div>
            <div class="compare-stat"><span>Humidity</span> <span>${data.humidity}%</span></div>
            <div class="compare-stat"><span>Wind</span> <span>${Math.round(data.wind.speed * 3.6)} km/h</span></div>
            <div class="compare-stat"><span>Rain</span> <span>${data.precipitation || 0} mm</span></div>
            <button class="nav-btn" style="width:auto; align-self:center; margin-top:10px; color:var(--danger)" onclick="this.parentElement.remove()">Remove</button>
        `;
        grid.appendChild(col);
    }
};
