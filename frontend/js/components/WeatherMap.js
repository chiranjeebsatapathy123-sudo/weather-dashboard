let mapInstance = null;
let markerInstance = null;

export const WeatherMap = {
    async render(lat, lon, cityName) {
        const container = document.getElementById('weatherMap');
        if (!container || !window.L) return;

        // Delay slightly to ensure container is fully visible if switching tabs
        setTimeout(() => {
            if (!mapInstance) {
                mapInstance = L.map('weatherMap').setView([lat, lon], 10);
                
                // Use standard OpenStreetMap tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(mapInstance);
                
                // Add dark mode styling via CSS filter if desired, or use a dark tile provider
                // We'll stick to default OSM for reliability
            } else {
                mapInstance.setView([lat, lon], 10);
            }

            if (markerInstance) {
                mapInstance.removeLayer(markerInstance);
            }

            markerInstance = L.marker([lat, lon]).addTo(mapInstance);
            markerInstance.bindPopup(`<b>${cityName}</b>`).openPopup();
            
            // Fix map sizing issues if container was hidden
            mapInstance.invalidateSize();
        }, 300);
    }
};
