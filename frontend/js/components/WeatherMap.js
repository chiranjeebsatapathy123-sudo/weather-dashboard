let mapInstance = null;
let markerInstance = null;

export const WeatherMap = {
    render(lat, lon, cityName) {
        if (!window.L) return; // Ensure Leaflet is loaded
        
        const container = document.getElementById('weatherMap');
        if (!container) return;

        // Leaflet struggles with rendering inside hidden display:none containers.
        // We delay slightly to allow container to become visible in the DOM.
        setTimeout(() => {
            if (!mapInstance) {
                mapInstance = L.map('weatherMap').setView([lat, lon], 10);
                
                // Add standard OpenStreetMap tiles
                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
                }).addTo(mapInstance);
                
                // Optional: Weather overlay tiles could be added here if provider supported them without API keys in frontend.
                // e.g. OpenWeatherMap Precipitation Layer (Requires frontend API key, which we avoid, so we stick to markers)
            } else {
                mapInstance.setView([lat, lon], 10);
            }

            if (markerInstance) {
                mapInstance.removeLayer(markerInstance);
            }

            markerInstance = L.marker([lat, lon]).addTo(mapInstance)
                .bindPopup(`<b>${cityName}</b><br>Location set.`)
                .openPopup();
                
            mapInstance.invalidateSize();
        }, 300);
    }
};
