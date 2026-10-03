export const WeatherMetrics = {
    render(data) {
        document.getElementById('valHumidity').textContent = `${data.humidity}%`;
        
        const deg = data.wind.deg;
        let dir = "N";
        if (deg >= 22.5 && deg < 67.5) dir = "NE";
        else if (deg >= 67.5 && deg < 112.5) dir = "E";
        else if (deg >= 112.5 && deg < 157.5) dir = "SE";
        else if (deg >= 157.5 && deg < 202.5) dir = "S";
        else if (deg >= 202.5 && deg < 247.5) dir = "SW";
        else if (deg >= 247.5 && deg < 292.5) dir = "W";
        else if (deg >= 292.5 && deg < 337.5) dir = "NW";

        document.getElementById('valWind').textContent = `${Math.round(data.wind.speed * 3.6)} km/h ${dir}`;
        document.getElementById('valPressure').textContent = `${data.pressure} hPa`;
        document.getElementById('valVisibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        document.getElementById('valClouds').textContent = `${data.clouds}%`;

        if (data.sunrise && data.sunset) {
            document.getElementById('valSunrise').textContent = new Date(data.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            document.getElementById('valSunset').textContent = new Date(data.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else {
            document.getElementById('valSunrise').textContent = '--';
            document.getElementById('valSunset').textContent = '--';
        }

        const aqiVal = document.getElementById('valAqi');
        if (aqiVal) {
            if (data.airQuality) {
                const aqiMap = {1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Very Poor'};
                aqiVal.textContent = `${data.airQuality.index} - ${aqiMap[data.airQuality.index] || 'Unknown'}`;
            } else {
                aqiVal.textContent = 'N/A';
            }
        }
        
        const uvVal = document.getElementById('valUv');
        if (uvVal) {
            // OpenWeather free API doesn't provide UV natively without OneCall, keeping N/A
            uvVal.textContent = 'N/A';
        }
    }
};
